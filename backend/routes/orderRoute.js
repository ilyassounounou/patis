import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import { 
  allOrders, 
  placeOrder, 
  placeOrderStripe, 
  updateStatus, 
  userOrders, 
  verifyStripe 
} from "../controllers/orderController.js";
import Order from "../models/orderModel.js";

const orderRouter = express.Router();

// ADMIN ROUTES
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);

// ✅ حذف طلب معين
orderRouter.delete("/delete/:id", adminAuth, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "الطلب غير موجود" });
    }
    res.json({ success: true, message: "تم حذف الطلب بنجاح" });
  } catch (err) {
    res.status(500).json({ success: false, message: "خطأ في الخادم" });
  }
});

// USER ROUTES
orderRouter.post('/place', placeOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.post('/verifyStripe', authUser, verifyStripe);

export default orderRouter;
