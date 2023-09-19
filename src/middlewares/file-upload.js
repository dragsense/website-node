const multer = require('multer');
const fs = require('fs');
const path = require('path');

const publicDir = path.resolve(__dirname, '../', 'public/static/uploads');

const uploadFile = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      
      if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
      }
   
      cb(null, publicDir);
    },
    filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }),
});

module.exports = uploadFile;