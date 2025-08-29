import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import authUser from "../middleware/auth.js";
import { 
  allOrders, 
  placeOrder, 
  placeOrderStripe, 
  updateStatus, 
  userOrders, 
  verifyStripe,
  deleteOrder
} from "../controllers/orderController.js";

const orderRouter = express.Router();

// ADMIN ROUTES
orderRouter.post('/list', adminAuth, allOrders);
orderRouter.post('/status', adminAuth, updateStatus);
orderRouter.delete('/delete/:orderId', adminAuth, deleteOrder);

// USER ROUTES
orderRouter.post('/place', placeOrder);
orderRouter.post('/stripe', authUser, placeOrderStripe);
orderRouter.post('/userorders', authUser, userOrders);
orderRouter.post('/verifyStripe', authUser, verifyStripe);

export default orderRouter;