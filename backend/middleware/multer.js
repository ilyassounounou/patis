import multer from "multer";
import path from "path";
import fs from "fs";

// تأكد من وجود مجلد "uploads"
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadDir); // يتم حفظ الصور في مجلد "uploads"
  },
  filename: function (req, file, callback) {
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    callback(null, uniqueName + ext); // اسم فريد لكل صورة
  },
});

const upload = multer({ storage });

export default upload;
