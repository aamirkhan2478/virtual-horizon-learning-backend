const multer = require("multer");

const FILE_TYPE_MAP = {
  "application/pdf": "pdf",
  "video/mp4": "mp4",
  "video/x-flv": "flv",
  "video/3gpp": "3gp",
  "video/quicktime": "mov",
  "video/x-msvideo": "avi",
  "video/x-ms-wmv": "wmv",
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: function (_req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Invalid file type");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, "public/uploads");
  },
  filename: function (_req, file, cb) {
    console.log(file);
    const fileName = file.originalname.split(" ").join("-");
    const convertedFileName = fileName.toLowerCase().split(".");
    const nameBeforeDot = convertedFileName[0];
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${nameBeforeDot}-${Date.now()}.${extension}`);
  },
});

const upload = multer({ storage: storage });

module.exports = upload;
