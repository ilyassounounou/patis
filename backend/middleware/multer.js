import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// تأكد من وجود مجلد "uploads" في المسار الصحيح
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, uploadDir); // يتم حفظ الصور في مجلد "uploads"
  },
  filename: function (req, file, callback) {
    // استخدام نفس تنسيق الاسم الذي يتوقعه المتحكم (controller)
    const imageName = `bonne_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    callback(null, imageName); // اسم فريد لكل صورة يتطابق مع توقعات المتحكم
  },
});

// Filtrer les fichiers pour n'accepter que les images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Seules les images sont autorisées!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Limite de 5MB
  }
});

export default upload;