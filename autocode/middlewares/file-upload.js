const multer = require('multer');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../', 'public/static/uploads');

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
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
      }
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath);
      }

      cb(null, uploadPath);
    },
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }),
});

module.exports = uploadFile;