const multer = require('multer');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(process.cwd(), 'public/static/uploads');
const allowedTypes = ['images', 'videos', 'audios', 'fonts', 'docs'];

const uploadFile = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      const type = req.query.type;
      if (!allowedTypes.includes(type)) {
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
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }),
});




module.exports = uploadFile;