const fs = require("fs");
const path = require("path");
const multer = require("multer");

const uploadFolder = path.join(__dirname, "../../uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function destination(req, file, cb) {
    cb(null, uploadFolder);
  },
  filename: function filename(req, file, cb) {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1000000)}`;
    cb(null, `${uniqueName}${path.extname(file.originalname)}`);
  }
});

function fileFilter(req, file, cb) {
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "application/pdf"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
    return;
  }

  cb(new Error("Only PNG, JPG, JPEG, and PDF files are allowed."));
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

module.exports = upload;
