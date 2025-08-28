import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [
      {
        productId: { type: String, required: true },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true }
        // ✅ تم حذف image من هنا
      },
    ],
    amount: { type: Number, required: true },
    address: { type: mongoose.Schema.Types.Mixed, required: true },
    status: { type: String, default: "Order Placed", required: true },
    paymentMethod: { type: String, required: true },
    payment: { type: Boolean, default: false, required: true },
  },
  { timestamps: true } // createdAt & updatedAt
);

const orderModel =
  mongoose.models.order || mongoose.model("order", orderSchema);

export default orderModel;
