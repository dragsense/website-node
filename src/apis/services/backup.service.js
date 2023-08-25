const { Backup } = require('../models');

const httpStatus = require('http-status')

const ApiError = require('../../utils/api-error')

const { takeSnapshot, restoreSnapshot } = require('../../utils/mongoSnap');

var fs = require('fs');
var fs_Extra = require('fs-extra');
var path = require('path');
const dataDir = path.resolve(__dirname, '..', 'data');
const backupDir = path.resolve(__dirname, '..', 'backups');
const publicDir = path.resolve(__dirname, '../..', 'public');
const env = require("../../configs/env");
const AdmZip = require('adm-zip');


const create = async (destinationDir) => {
    fs.mkdirSync(destinationDir, { recursive: true });

    if (!fs.existsSync(dataDir)) {
        fs.rmSync(destinationDir, { recursive: true });
        throw new ApiError(httpStatus.NOT_FOUND, 'Data folder not found.');
    }

    fs.mkdirSync(path.join(destinationDir, 'data'), { recursive: true });
    await fs_Extra.copy(dataDir, path.join(destinationDir, 'data'));

    fs.mkdirSync(path.join(destinationDir, 'static'), { recursive: true });

    if (!fs.existsSync(path.join(publicDir, 'static'))) {
        fs.rmSync(destinationDir, { recursive: true });
        throw new ApiError(httpStatus.NOT_FOUND, 'Static folder not found.');
    }

    await fs_Extra.copy(path.join(publicDir, 'static'), path.join(destinationDir, 'static'));

    try {
        await takeSnapshot(path.join(destinationDir, `${env.database.name}.tar`)); // backup
    } catch (e) {
        fs.rmSync(destinationDir, { recursive: true });
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message || 'Database backup failed.');
    }


    const zip = new AdmZip();
    zip.addLocalFolder(destinationDir);
    const zipContent = zip.toBuffer();

    fs.writeFileSync(`${destinationDir}.zip`, zipContent);
    fs.rmSync(destinationDir, { recursive: true });

};

const install = async (destinationDir) => {


    const backupZipPath = `${destinationDir}.zip`;
    const zip = new AdmZip(backupZipPath);
    zip.extractAllTo(destinationDir, true);


    try {
        const snapshotPath = path.join(destinationDir, `${env.database.name}.tar`);
        await restoreSnapshot(snapshotPath);
    } catch (e) {
        fs.rmSync(destinationDir, { recursive: true });
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message || 'Database restore failed.');
    }


    if (!fs.existsSync(dataDir))
        fs.mkdirSync(dataDir, { recursive: true });

    let dest = path.join(destinationDir, 'data');
    if (fs.existsSync(dest))
        await fs_Extra.copy(dest, dataDir);


    const staticDir = path.join(publicDir, 'static');
    if (!fs.existsSync(staticDir))
        fs.mkdirSync(staticDir, { recursive: true });

    dest = path.join(destinationDir, 'static')

    if (fs.existsSync(dest))
        await fs_Extra.copy(dest, staticDir);

   fs.rmSync(destinationDir, { recursive: true });


};


/**
 * Create a backup
 * @param {Object} backupBody
 * @returns {Promise<Backup>}
 */
const createBackup = async (backupBody) => {
    const { _id } = backupBody;

    if (!fs.existsSync(backupDir))
        fs.mkdirSync(backupDir, { recursive: true });

    const destinationDir = path.join(backupDir, _id);

    if (fs.existsSync(destinationDir)) {
        throw new ApiError(httpStatus.CONFLICT, 'Backup folder already exists.');
    }

    await create(destinationDir);

    return { status: true };
};


/**
 * Update a backup
 * @param {String} id
 * @param {Object} backupBody
 * @returns {Promise<Backup>}
 */
const updateBackup = async (_id, backupBody) => {

    const destinationDir = path.join(backupDir, _id);
    if (!fs.existsSync(destinationDir + ".zip")) {
        throw new ApiError(httpStatus.CONFLICT, 'Backup folder not found.');
    }

    await create(destinationDir);

    return { status: true };

};

/**
 * Get Backups
 * @returns {Promise<Backups>}
 */
const installBackup = async (_id) => {

    const destinationDir = path.join(backupDir, _id);
    if (!fs.existsSync(destinationDir + ".zip")) {
        throw new ApiError(httpStatus.CONFLICT, 'Backup folder not found.');
    }

    await install(destinationDir);

    return { status: true };

};

/**
 * Delete a backup
 * @param {String} id
 * @returns {Promise<Backup>}
 */
const getBackup = async (_id) => {

    const destinationDir = path.join(backupDir, _id);
    if (!fs.existsSync(destinationDir + ".zip")) {
        throw new ApiError(httpStatus.CONFLICT, 'Backup folder not found.');
    }

    const folderPath = `${destinationDir}.zip`;
    return folderPath;
};


/**
 * Delete a backup
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteBackup = async (_id) => {

    const destinationDir = `${backupDir}/${_id}`;

    if (!fs.existsSync(`${destinationDir}.zip`)) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Backup Folder not found.')
    }

    fs.rmSync(`${destinationDir}.zip`, { recursive: true });

    return { status: true };

}

module.exports = {
    installBackup,
    getBackup,
    deleteBackup,
    updateBackup,
    createBackup
}