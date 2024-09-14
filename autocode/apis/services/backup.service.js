const dotenv = require('dotenv');
dotenv.config();

const httpStatus = require('http-status');
const ApiError = require('../../utils/api-error');
const { takeSnapshot, restoreSnapshot } = require('../../utils/mongoSnap');
const fs = require('fs');
const fs_Extra = require('fs-extra');
const path = require('path');
const AdmZip = require('adm-zip');

const dataDir = path.resolve(process.cwd(), 'private', 'data');
const backupDir = path.resolve(process.cwd(), 'private', 'backups');
const publicDir = path.resolve(process.cwd(), 'public');

// Function to create directory and copy files
const createDirectoryAndCopyFiles = async (destinationDir, sourceDir, dirName) => {
    const dirPath = path.join(destinationDir, dirName);
    fs.mkdirSync(dirPath, { recursive: true });

    if (!fs.existsSync(sourceDir)) {
        fs.rmSync(destinationDir, { recursive: true });
        throw new ApiError(httpStatus.NOT_FOUND, `${dirName} folder not found.`);
    }

    if (dirName === 'data') {
        await fs_Extra.copy(sourceDir, dirPath, {
            filter: (src) => !src.includes('setting.json'),
        });
    } else {
        await fs_Extra.copy(sourceDir, dirPath);
    }
};

// Function to take snapshot
const takeSnapshotAndHandleError = async (destinationDir, isCollectionsEntries, isFormsEntries) => {
    try {
        const MONGO_URI = process.env.DB_CONNECTION;
        const dirPath = path.join(destinationDir, 'database');
        await takeSnapshot(dirPath, MONGO_URI, isCollectionsEntries, isFormsEntries);
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

const create = async (destinationDir, isCollectionsEntries = false, isFormsEntries = false) => {
    fs.mkdirSync(destinationDir, { recursive: true });

    try {
        // Create data directory and copy files
        await createDirectoryAndCopyFiles(destinationDir, dataDir, 'data');

        // Create static directory and copy files
        await createDirectoryAndCopyFiles(destinationDir, path.join(publicDir, 'static'), 'static');

        // Take snapshot and handle error
        await takeSnapshotAndHandleError(destinationDir, isCollectionsEntries, isFormsEntries);

        // Create zip and clean up
        createZipAndCleanUp(destinationDir);
    } catch (error) {
        // Ensure cleanup if anything goes wrong during the backup process
        if (fs.existsSync(destinationDir)) {
            fs.rmSync(destinationDir, { recursive: true });
        }
        throw error;
    }
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
        const MONGO_URI = process.env.DB_CONNECTION;
        const dirPath = path.join(destinationDir, 'database');
        await restoreSnapshot(dirPath, MONGO_URI);
    } catch (e) {
        fs.rmSync(destinationDir, { recursive: true });
        throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, e?.message || 'Database restore failed.');
    }
};

// Function to copy directory
const copyDirectory = async (destinationDir, dirName, targetDir) => {
    if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
    const sourcePath = path.join(destinationDir, dirName);
    if (fs.existsSync(sourcePath)) await fs_Extra.copy(sourcePath, targetDir);
};

// Function to install backup
const install = async (destinationDir) => {
    try {
        // Extract zip
        extractZip(destinationDir);

        // Restore snapshot and handle error
        await restoreSnapshotAndHandleError(destinationDir);

        // Copy data directory
        await copyDirectory(destinationDir, 'data', dataDir);

        // Copy static directory
        await copyDirectory(destinationDir, 'static', path.join(publicDir, 'static'));
    } catch (error) {
        // Ensure cleanup if anything goes wrong during the restore process
        if (fs.existsSync(destinationDir)) {
            fs.rmSync(destinationDir, { recursive: true });
        }
        throw error;
    } finally {
        // Clean up the extracted directory regardless of success or failure
        if (fs.existsSync(destinationDir)) {
            fs.rmSync(destinationDir, { recursive: true });
        }
    }
};

/**
 * Create a backup
 * @param {Object} backupBody
 * @returns {Promise<Backup>}
 */
const createBackup = async (backupBody) => {
    const { _id, isCollectionsEntries, isFormsEntries } = backupBody;

    // Ensure backup directory exists
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

    const destinationDir = path.join(backupDir, _id);

    // Check if backup folder already exists
    if (fs.existsSync(destinationDir)) {
        throw new ApiError(httpStatus.CONFLICT, 'Backup folder already exists.');
    }

    // Create backup
    await create(destinationDir, isCollectionsEntries, isFormsEntries);

    return { status: true };
};

/**
 * Update a backup
 * @param {String} id
 * @param {Object} backupBody
 * @returns {Promise<Backup>}
 */
const updateBackup = async (_id, backupBody) => {

    const { isCollectionsEntries, isFormsEntries } = backupBody;

    console.log( isCollectionsEntries, isFormsEntries)
    const destinationDir = path.join(backupDir, _id);

    // Check if backup folder exists
    if (!fs.existsSync(destinationDir + '.zip')) {
        throw new ApiError(httpStatus.CONFLICT, 'Backup folder not found.');
    }

    // Update backup
    await create(destinationDir, isCollectionsEntries, isFormsEntries);

    return { status: true };
};

/**
 * Install Backups
 * @returns {Promise<Backups>}
 */
const installBackup = async (_id, themePath = null) => {
    let destinationDir = themePath ? themePath : path.join(backupDir, _id);

    // Check if backup folder exists
    if (!fs.existsSync(destinationDir + '.zip')) {
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
    if (!fs.existsSync(destinationDir + '.zip')) {
        throw new ApiError(httpStatus.CONFLICT, 'Backup folder not found.');
    }

    return `${destinationDir}.zip`;
};

/**
 * Delete a backup
 * @param {String} id
 * @returns {Promise<id>}
 */
const deleteBackup = async (_id) => {
    const destinationDir = path.join(backupDir, _id);

    // Check if backup folder exists
    if (!fs.existsSync(`${destinationDir}.zip`)) {
        throw new ApiError(httpStatus.NOT_FOUND, 'Backup Folder not found.');
    }

    // Delete backup
    fs.rmSync(`${destinationDir}.zip`, { recursive: true });

    return { status: true };
};

module.exports = {
    installBackup,
    getBackup,
    deleteBackup,
    updateBackup,
    createBackup,
};
