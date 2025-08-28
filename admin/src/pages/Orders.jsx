import React, { useEffect, useState } from "react";
import axios from "axios";
import { backend_url, currency } from "../App";
import { toast } from "react-toastify";
import { 
  FiPackage, 
  FiTruck, 
  FiBox, 
  FiCheckCircle, 
  FiClock, 
  FiShoppingBag,
  FiTrash2,
  FiUser,
  FiMapPin,
  FiPhone,
  FiCreditCard,
  FiCalendar
} from "react-icons/fi";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllOrders = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await axios.post(
        backend_url + "/api/orders/list",
        {},
        { headers: { token } }
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const response = await axios.delete(`${backend_url}/api/order/delete/${orderId}`, {
        headers: { token },
      });
      if (response.data.success) {
        toast.success("Order deleted successfully");
        fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backend_url + "/api/order/status",
        { orderId, status: event.target.value },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Order status updated");
        fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Order Placed": return <FiShoppingBag className="text-blue-500" />;
      case "Packing": return <FiBox className="text-yellow-500" />;
      case "Shipped": return <FiTruck className="text-orange-500" />;
      case "Out for Delivery": return <FiPackage className="text-purple-500" />;
      case "Delivered": return <FiCheckCircle className="text-green-500" />;
      default: return <FiClock className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Order Placed": return "border-l-blue-500";
      case "Packing": return "border-l-yellow-500";
      case "Shipped": return "border-l-orange-500";
      case "Out for Delivery": return "border-l-purple-500";
      case "Delivered": return "border-l-green-500";
      default: return "border-l-gray-500";
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
          <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <FiPackage className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No orders found</h3>
            <p className="text-gray-500 mt-2">Orders will appear here once they are placed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${getStatusColor(order.status)} p-5 hover:shadow-md transition-shadow`}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-semibold text-gray-700">
                      #{order._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteOrder(order._id)}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete order"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                {/* Customer Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FiUser className="text-gray-400" />
                    <span className="text-gray-700">
                      {order.address?.firstName} {order.address?.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiPhone className="text-gray-400" />
                    <span className="text-gray-700">{order.address?.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <FiMapPin className="text-gray-400 mt-1" />
                    <span className="text-gray-700 line-clamp-2">
                      {order.address?.street}, {order.address?.city}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Items</h4>
                  <div className="space-y-1">
                    {order.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-700 truncate max-w-[60%]">
                          {item.name} × {item.quantity}
                        </span>
                        <span className="text-gray-900 font-medium">
                          {currency}
                          {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="text-xs text-gray-500 text-center pt-1">
                        + {order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Total Amount:</span>
                    <span className="font-semibold text-gray-900">
                      {currency}
                      {order.amount?.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Payment:</span>
                    <span className={`font-medium ${order.payment ? 'text-green-600' : 'text-orange-600'}`}>
                      {order.payment ? "Completed" : "Pending"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Method:</span>
                    <span className="text-gray-700 capitalize">{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Date:</span>
                    <span className="text-gray-700">
                      {new Date(order.date).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500 uppercase">Status</label>
                  <select
                    onChange={(event) => statusHandler(event, order._id)}
                    value={order.status}
                    className="w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="Order Placed">Order Placed</option>
                    <option value="Packing">Packing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out for Delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;