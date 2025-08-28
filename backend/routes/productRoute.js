import express from "express";
import {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

// ✅ استعمل single بدلاً من fields لأنك ترفع صورة واحدة فقط
productRouter.post("/add", adminAuth, upload.single("image"), addProduct);

// 🔧 باقي المسارات
productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post("/single", singleProduct);
productRouter.get("/list", listProducts);

export default productRouter;
