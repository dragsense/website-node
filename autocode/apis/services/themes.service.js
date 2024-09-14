const ApiError = require('../../utils/api-error');
const fs = require('fs');
const fsExtra = require('fs-extra');
const path = require('path');

const themeDir = path.resolve(process.cwd(), 'private', 'temp');

/**
 * Install a theme
 * @param {Object} themesBody
 * @returns {Promise<String>}
 */
const installTheme = async (themesBody) => {
  const { themeId, projectId, url } = themesBody;

  // Ensure backup directory exists
  if (!fs.existsSync(themeDir)) fs.mkdirSync(themeDir, { recursive: true });

  const destinationDir = path.join(themeDir, themeId);

  // Check if theme already exists and remove it
  if (fs.existsSync(destinationDir)) {
    fsExtra.removeSync(destinationDir); // Remove the existing theme folder
  }

  // Define the path for the downloaded zip file
  const zipFilePath = path.join(themeDir, `${themeId}.zip`);

  // Check if the zip file already exists and remove it
  if (fs.existsSync(zipFilePath)) {
    fs.unlinkSync(zipFilePath); // Remove the existing zip file
  }

  try {
    // Construct the download URL
    const themeUrl = `${url}/api/projects/${projectId}/themes/${themeId}`;
    // Use fetch to download the ZIP file
    const response = await fetch(themeUrl);
    
    if (!response.ok) {
      throw new ApiError(500, `Failed to download theme, status code: ${response.status}`);
    }

    // Ensure the response is read as binary
    const buffer = await response.arrayBuffer();

    // Write the buffer to the file (as binary)
    await new Promise((resolve, reject) => {
      fs.writeFile(zipFilePath, Buffer.from(buffer), (err) => {
        if (err) {
          return reject(new ApiError(500, `Failed to write zip file: ${err.message}`));
        }
        resolve();
      });
    });

    console.log(`Theme ${themeId} downloaded and saved to ${zipFilePath}`);
    return destinationDir;

  } catch (error) {
    throw new ApiError(500, `Failed to install theme: ${error.message}`);
  }
};

module.exports = {
  installTheme
};
