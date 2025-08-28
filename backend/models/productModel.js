// backend/models/productModel.js

import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },         // اسم المنتج
  price: { type: Number, required: true },        // الثمن بالدرهم
  image: { type: String },                        // صورة رمزية بسيطة (اختياري)
  category: { type: String, required: true },     // التصنيف: مثل "حلويات"، "معجنات"، "مشروبات"
  createdAt: { type: Date, default: Date.now }    // تاريخ الإضافة
});

const productModel = mongoose.models.Product || mongoose.model("Product", productSchema);

export default productModel;
