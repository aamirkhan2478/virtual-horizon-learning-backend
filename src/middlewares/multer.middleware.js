const multer = require("multer");
const fs = require("fs");
const path = require("path");

// File type map
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

// Multer storage
const storage = multer.diskStorage({
  destination: function (_req, file, cb) {
    // Check if file type is valid
    const isValid = FILE_TYPE_MAP[file.mimetype];

    // Set upload error if file type is invalid
    let uploadError = new Error("Invalid file type");

    // Set upload error to null if file type is valid
    if (isValid) {
      uploadError = null;
    }

    // Create the uploads folder
    const uploadFolder = path.join(__dirname, "../../public/uploads");
    fs.mkdirSync(uploadFolder, { recursive: true }); // Create the folder if it doesn't exist
    cb(uploadError, uploadFolder); // Set the uploads folder as the destination
  },
  filename: function (_req, file, cb) {
    // Get the file name
    const fileName = file.originalname.split(" ").join("-");

    // Convert the file name to lowercase and split it by dot
    const convertedFileName = fileName.toLowerCase().split(".");

    // Get the name before the dot and the file extension
    const nameBeforeDot = convertedFileName[0];

    // Get the file extension
    const extension = FILE_TYPE_MAP[file.mimetype];

    // Set the file name
    cb(null, `${nameBeforeDot}-${Date.now()}.${extension}`);
  },
});

// Multer upload
const upload = multer({ storage: storage });

// Export the upload
module.exports = upload;
