const { executeCommand } = require('./utils')
const path = require('path')
const fs = require('fs')
const { default: mongoose, pluralize } = require('mongoose')

/**
 * Fetches slugs from a Mongoose model.
 * @param {mongoose.Model} Model - The Mongoose model to query.
 * @returns {Promise<string[]>} - A promise that resolves with an array of slugs.
 */
async function fetchSlugs(Model) {
    const docs = await Model.find({})
    return docs.map((doc) => {
        const modelName = pluralize(doc.slug.toLowerCase())
        return modelName
    })
}

/**
 * Takes a snapshot of the MongoDB database, exporting specific collections as JSON files.
 * @param {string} snapshotPath - The path where the backup will be saved.
 * @param {string} MONGO_URI - The MongoDB URI.
 * @param {boolean} isCollectionsEntries - Whether to include collections from the 'AC_Collection' model.
 * @param {boolean} isFormsEntries - Whether to include collections from the 'AC_Form' model.
 */
async function takeSnapshot(snapshotPath, MONGO_URI, isCollectionsEntries = false, isFormsEntries = false) {
    try {
        // Create a directory for backups if it doesn't exist
        if (!fs.existsSync(snapshotPath)) {
            fs.mkdirSync(snapshotPath, { recursive: true })
        }

        // Base collections array
        let collections = ['ac_pages', 'ac_collections', 'ac_forms', 'ac_components', 'ac_layouts', 'ac_medias']

        // Connect to MongoDB
        // Include additional collections based on provided flags
        if (isCollectionsEntries) {
            const CollectionModel = mongoose.model('AC_Collection')
            const collectionSlugs = await fetchSlugs(CollectionModel)
            collections.push(...collectionSlugs)
        }

        if (isFormsEntries) {
            const FormModel = mongoose.model('AC_Form')
            const formSlugs = await fetchSlugs(FormModel)
            collections.push(...formSlugs)
        }

        // Iterate over each collection to export them individually
        for (const collection of collections) {
            const collectionBackupPath = path.join(snapshotPath, `${collection}.json`)
            const command = `mongoexport --uri="${MONGO_URI}" --collection="${collection}" --out="${collectionBackupPath}"`

            console.log('Executing command:', command)

            await executeCommand(command) // Backup for each collection
        }

        console.log('Database collections backed up successfully.')
    } catch (error) {
        const simplifiedErrorMessage = simplifyErrorMessage(error.message)

        console.error('Error during database backup:', simplifiedErrorMessage)
        throw new Error('Database backup failed: ' + simplifiedErrorMessage)
    }
}

/**
 * Restores the MongoDB database from the provided snapshot path.
 * @param {string} snapshotPath - The path of the backup directory to restore from.
 * @param {string} MONGO_URI - The MongoDB URI.
 */
async function restoreSnapshot(snapshotPath, MONGO_URI) {
    try {
        // Read all files in the snapshot directory
        const files = fs.readdirSync(snapshotPath)

        // Filter out JSON files
        const collectionFiles = files.filter((file) => path.extname(file) === '.json')

        if (collectionFiles.length === 0) {
            console.warn('No JSON backup files found in the snapshot directory.')
            return
        }

        // Iterate over each JSON file to restore collections
        for (const file of collectionFiles) {
            const collection = path.basename(file, '.json') // Extract collection name from filename
            const collectionBackupPath = path.join(snapshotPath, file)

            const command = `mongoimport --uri="${MONGO_URI}" --collection="${collection}" --file="${collectionBackupPath}" --mode=upsert`

            console.log('Executing command:', command)

            await executeCommand(command) // Restore for each collection
        }

        console.log('Database restored successfully.')
    } catch (error) {
        const simplifiedErrorMessage = simplifyErrorMessage(error.message)

        console.error('Error during database restore:', simplifiedErrorMessage)
        throw new Error('Database restore failed: ' + simplifiedErrorMessage)
    }
}

/**
 * Simplifies MongoDB command error messages to make them cleaner for user-facing logs.
 * @param {string} fullErrorMessage - The full error message from the command.
 * @returns {string} - A simplified error message.
 */
function simplifyErrorMessage(fullErrorMessage) {
    const errorPatterns = [
        {
            pattern: /E11000 duplicate key error collection:\s(.+)\sindex:\s(.+)\sdup key:\s\{(.+)\}/,
            message: (match) =>
                `Duplicate key error in collection "${match[1]}" on index "${
                    match[2]
                }" with duplicate key {${match[3].trim()}}`,
        },
        { pattern: /failed to connect to.*on first connect/i, message: 'Database connection error' },
        { pattern: /permission denied/i, message: 'Permission error' },
    ]

    // Loop over known patterns and return formatted message if matched
    for (const { pattern, message } of errorPatterns) {
        const match = fullErrorMessage.match(pattern)
        if (match) {
            return typeof message === 'function' ? message(match) : message
        }
    }

    // Fallback to a shortened version of the full error message (up to the first sentence)
    return fullErrorMessage.split('\n')[0]
}

module.exports = {
    takeSnapshot,
    restoreSnapshot,
}
