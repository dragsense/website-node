const multer = require('multer');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(process.cwd(), 'public/static/uploads');
const allowedTypes = ['images', 'videos', 'audios', 'fonts', 'docs'];


const types = [

  'image/apng',
  'image/avif',
  'image/gif',
  'image/jpeg',
  'image/png',
  'image/svg+xml',
  'image/webp',
  'image/vnd.microsoft.icon', 'video/x-msvideo', 'video/mpeg', 'video/mp4', 'video/ogg', 'video/3gpp2', 'video/3gpp', 'application/x-freearc',
  'application/octet-stream',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-fontobject',
  'application/gzip',
  'application/pdf',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/xml',
  'text/csv',
  'text/css',
  'text/html',
  'text/javascript',
  'audio/mpeg', 'audio/3gpp', 'audio/ogg', 'audio/3gpp2', 'audio/wav', 'audio/webm',
  'font/otf', 'font/ttf', 'font/woff', 'application/font-woff', 'font/woff2'

]

function isMimeTypeAllowed(mimetype) {
  return types.includes(mimetype);
}

const maxSize = 50 * 1024 * 1024; // 50MB in bytes

const uploadFile = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {

      const type = req.query.type || 'temp';
      if (!isMimeTypeAllowed(file.mimetype)) {
        const err = new Error('Invalid file type. Allowed types are: images, videos, audios, and fonts.');
        err.status = 400;
        return cb(err);
      }


      const uploadPath = path.join(publicDir, type);

      // Check if the 'public/static/uploads' directory exists
      if (!fs.existsSync(publicDir)) {
        // Create the 'public/static/uploads' directory if it doesn't exist
        fs.mkdirSync(publicDir, { recursive: true }, (err) => {
          if (err) {
            console.error('Error creating directory:', err);
          }
        });
      }

      // Check if the type-specific directory exists
      if (!fs.existsSync(uploadPath)) {
        // Create the type-specific directory if it doesn't exist
        fs.mkdirSync(uploadPath, { recursive: true }, (err) => {
          if (err) {
            console.error('Error creating directory:', err);
          }
        });
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const originalName = path.basename(file.originalname, path.extname(file.originalname));
      const dateTime = new Date().toISOString().slice(11,19).replace(/:/g, '');
      const newFileName = `${originalName}-${dateTime}${path.extname(file.originalname)}`;

      cb(null, newFileName);

    }
  }),
  limits: {
    fileSize: maxSize, // Set the maximum file size
  },
});




module.exports = uploadFile;