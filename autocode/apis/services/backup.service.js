const { Backup } = require('../models');

const httpStatus = require('http-status')

const ApiError = require('../../utils/api-error')

const { takeSnapshot, restoreSnapshot } = require('../../utils/mongoSnap');

var fs = require('fs');
var fs_Extra = require('fs-extra');
var path = require('path');



const dataDir = path.resolve(process.cwd(), 'private', 'data');
const backupDir = path.resolve(process.cwd(), 'private','backups');
const publicDir = path.resolve(process.cwd(), 'public');

const env = require("../../configs/env");
const AdmZip = require('adm-zip');


// Function to create directory and copy files
const createDirectoryAndCopyFiles = async (destinationDir, sourceDir, dirName) => {
    const dirPath = path.join(destinationDir, dirName);
    fs.mkdirSync(dirPath, { recursive: true });

    if (!fs.existsSync(sourceDir)) {
        fs.rmSync(destinationDir, { recursive: true });
        throw new ApiError(httpStatus.NOT_FOUND, `${dirName} folder not found.`);
    }

    await fs_Extra.copy(sourceDir, dirPath);
};

// Function to take snapshot
const takeSnapshotAndHandleError = async (destinationDir) => {
    try {
        await takeSnapshot(path.join(destinationDir, `${env.database.name}.tar`)); // backup
    } catch (e) {
        fs.rmSync(destinationDir, { recursive: true });
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message || 'Database backup failed.');
    }
};

// Function to create zip
const createZipAndCleanUp = (destinationDir) => {
    const zip = new AdmZip();
    zip.addLocalFolder(destinationDir);
    const zipContent = zip.toBuffer();

    fs.writeFileSync(`${destinationDir}.zip`, zipContent);
    fs.rmSync(destinationDir, { recursive: true });
};

const create = async (destinationDir) => {
    fs.mkdirSync(destinationDir, { recursive: true });

    // Create data directory and copy files
    await createDirectoryAndCopyFiles(destinationDir, dataDir, 'data');

    // Create static directory and copy files
    await createDirectoryAndCopyFiles(destinationDir, path.join(publicDir, 'static'), 'static');

    // Take snapshot and handle error
    await takeSnapshotAndHandleError(destinationDir);

    // Create zip and clean up
    createZipAndCleanUp(destinationDir);
};

// Function to extract zip
const extractZip = (destinationDir) => {
    const backupZipPath = `${destinationDir}.zip`;
    const zip = new AdmZip(backupZipPath);
    zip.extractAllTo(destinationDir, true);
};

// Function to restore snapshot
const restoreSnapshotAndHandleError = async (destinationDir) => {
    try {
        const snapshotPath = path.join(destinationDir, `${env.database.name}.tar`);
        await restoreSnapshot(snapshotPath);
    } catch (e) {
        fs.rmSync(destinationDir, { recursive: true });
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message || 'Database restore failed.');
    }
};

// Function to copy directory
const copyDirectory = async (destinationDir, dirName, targetDir) => {
    if (!fs.existsSync(targetDir))
        fs.mkdirSync(targetDir, { recursive: true });

    const dest = path.join(destinationDir, dirName);
    if (fs.existsSync(dest))
        await fs_Extra.copy(dest, targetDir);
};

// Function to install backup
const install = async (destinationDir) => {
    // Extract zip
    extractZip(destinationDir);

    // Restore snapshot and handle error
    await restoreSnapshotAndHandleError(destinationDir);

    // Copy data directory
    await copyDirectory(destinationDir, 'data', dataDir);

    // Copy static directory
    await copyDirectory(destinationDir, 'static', path.join(publicDir, 'static'));

    // Clean up
    fs.rmSync(destinationDir, { recursive: true });
};

/**
 * Create a backup
 * @param {Object} backupBody
 * @returns {Promise<Backup>}
 */
const createBackup = async (backupBody) => {
    const { _id } = backupBody;

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir))
        fs.mkdirSync(backupDir, { recursive: true });

    const destinationDir = path.join(backupDir, _id);

    // Check if backup folder already exists
    if (fs.existsSync(destinationDir)) {
        throw new ApiError(httpStatus.CONFLICT, 'Backup folder already exists.');
    }

    // Create backup
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
    // Check if backup folder exists
    if (!fs.existsSync(destinationDir + ".zip")) {
        throw new ApiError(httpStatus.CONFLICT, 'Backup folder not found.');
    }

    // Update backup
    await create(destinationDir);

    return { status: true };

};

/**
 * Install Backups
 * @returns {Promise<Backups>}
 */
const installBackup = async (_id) => {

    const destinationDir = path.join(backupDir, _id);
    // Check if backup folder exists
    if (!fs.existsSync(destinationDir + ".zip")) {
        throw new ApiError(httpStatus.CONFLICT, 'Backup folder not found.');
    }

    // Install backup
    await install(destinationDir);

    return { status: true };

};

/**
 * Get a backup
 * @param {String} id
 * @returns {Promise<Backup>}
 */
const getBackup = async (_id) => {

    const destinationDir = path.join(backupDir, _id);
    // Check if backup folder exists
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

    // Check if backup folder exists
    if (!fs.existsSync(`${destinationDir}.zip`)) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Backup Folder not found.')
    }

    // Delete backup
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