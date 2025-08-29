import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";

const STRIPE_CURRENCY = "pkr";
const DELIVERY_CHARGES = 10;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const handleError = (res, error, context) => {
  console.error(`Error in ${context}:`, error);
  return res.status(500).json({
    success: false,
    message: error.message || `Error processing ${context}`,
  });
};

// تحقق مبسط ومرن للبيانات المطلوبة
const validateOrderData = (data) => {
  const { items, amount, address } = data;

  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new Error("Order items must be a non-empty array");
  }
  if (typeof amount !== "number" || amount <= 0) {
    throw new Error("Amount must be a positive number");
  }
  if (!address || typeof address !== "string") {
    throw new Error("Address is required");
  }

  items.forEach((item, idx) => {
    if (!item.productId || typeof item.productId !== "string") {
      throw new Error(`Item at index ${idx} missing valid productId`);
    }
    if (typeof item.quantity !== "number" || item.quantity <= 0) {
      throw new Error(`Item at index ${idx} has invalid quantity`);
    }
  });
};

const placeOrder = async (req, res) => {
  try {
    let { userId, items, amount, address } = req.body;

    // إذا لم يكن userId موجود، اعتبره guest أو null
    if (!userId) userId = "guest";

    // تحقق من صحة البيانات
    validateOrderData({ items, amount, address });

    const orderData = {
      userId,
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price || 0,
        name: item.name || "Unknown",
      })),
      amount, // ممكن تضيف رسوم التوصيل هنا إذا تريد
      address,
      paymentMethod: "COD",
      payment: false,
      status: "Order Placed",
    };

    const newOrder = await orderModel.create(orderData);

    // يمكن تفريغ سلة المستخدم إذا كنت تحتفظ بها
    if (userId !== "guest") {
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
    }

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: newOrder._id,
      orderData: newOrder, // ✅ إرسال بيانات الطلب
    });

  } catch (error) {
    console.error("Error in placeOrder:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Error placing order",
    });
  }
};

// حذف طلب
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    const deletedOrder = await orderModel.findByIdAndDelete(orderId);
    
    if (!deletedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.json({
      success: true,
      message: "Order deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteOrder:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Error deleting order",
    });
  }
};

// عرض جميع الطلبات
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find().sort({ createdAt: -1 }).populate("userId", "name email");
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// تحديث الحالة
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    const validStatuses = [
      "Order Placed",
      "Packing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
    ];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderId, 
      { status }, 
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.json({ 
      success: true, 
      message: "Order status updated", 
      order: updatedOrder 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    validateOrderData({ items, amount, address });

    const orderData = {
      userId: userId || "guest",
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price || 0,
        name: item.name || "Unknown",
        image: item.image || "",
      })),
      amount: amount + DELIVERY_CHARGES,
      address,
      paymentMethod: "Stripe",
      payment: false,
      status: "Payment Pending",
    };

    const newOrder = await orderModel.create(orderData);

    const line_items = items.map((item) => ({
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: {
          name: item.name || "Unknown",
          metadata: { productId: item.productId },
        },
        unit_amount: Math.round((item.price || 0) * 100 * 277),
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: STRIPE_CURRENCY,
        product_data: { name: "Delivery charges" },
        unit_amount: Math.round(DELIVERY_CHARGES * 100 * 277),
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items,
      mode: "payment",
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      metadata: { orderId: newOrder._id.toString() },
    });

    return res.json({
      success: true,
      session_url: session.url,
      orderId: newOrder._id,
    });
  } catch (error) {
    return handleError(res, error, "placeOrderStripe");
  }
};

const verifyStripe = async (req, res) => {
  try {
    const { orderId, success } = req.body;

    if (!orderId) throw new Error("Order ID is required");

    if (success === "true") {
      const updatedOrder = await orderModel.findByIdAndUpdate(
        orderId,
        { payment: true, status: "Order Placed" },
        { new: true }
      );

      if (!updatedOrder) throw new Error("Order not found");

      if (updatedOrder.userId !== "guest") {
        await userModel.findByIdAndUpdate(updatedOrder.userId, { cartData: {} });
      }

      return res.json({ success: true, message: "Payment verified successfully" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false, message: "Payment failed, order cancelled" });
    }
  } catch (error) {
    return handleError(res, error, "verifyStripe");
  }
};

const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) throw new Error("User ID is required");

    const orders = await orderModel.find({ userId }).sort({ createdAt: -1 });

    return res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    return handleError(res, error, "userOrders");
  }
};

export {
  placeOrder,
  placeOrderStripe,
  allOrders,
  userOrders,
  updateStatus,
  verifyStripe,
  deleteOrder
};