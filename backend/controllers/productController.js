import { v2 as cloudinary } from "cloudinary";
import productModel from "../models/productModel.js";

// ➕ إضافة منتج
const addProduct = async (req, res) => {
  try {
    const { name, price, category } = req.body;
    const imageFile = req.file;

    let imageUrl;

    if (imageFile) {
      const result = await cloudinary.uploader.upload(imageFile.path, {
        resource_type: "image",
      });
      imageUrl = result.secure_url;
    } else {
      // صورة افتراضية إن لم تُرفع صورة
      imageUrl = "https://via.placeholder.com/150";
    }

    const productData = {
      name,
      price,
      category,
      image: imageUrl,
    };

    const product = new productModel(productData);
    await product.save();

    res.json({ success: true, message: "تمت إضافة المنتج بنجاح" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// 🗑️ حذف منتج
const removeProduct = async (req, res) => {
  try {
    await productModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "تم حذف المنتج" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// 📦 عرض جميع المنتجات
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// 🔍 عرض منتج واحد
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;
    const product = await productModel.findById(productId);
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export { addProduct, removeProduct, listProducts, singleProduct };
