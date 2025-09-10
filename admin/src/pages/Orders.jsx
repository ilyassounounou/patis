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
  FiCalendar,
  FiDollarSign,
  FiShoppingCart,
  FiRefreshCw
} from "react-icons/fi";

const Orders = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

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
      setSyncing(true);
      
      // First delete from admin
      const response = await axios.delete(
        `${backend_url}/api/orders/delete/${orderId}`,
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("Order deleted successfully");
        
        // Now sync with user's purchase history
        try {
          await axios.post(
            `${backend_url}/api/orders/sync-user-purchases`,
            { orderId },
            { headers: { token } }
          );
          toast.info("User purchase history updated");
        } catch (syncError) {
          console.warn("Could not sync with user purchases:", syncError.message);
          // Continue even if sync fails
        }
        
        fetchAllOrders(); // Refresh the orders list
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSyncing(false);
    }
  };

  const syncAllPurchases = async () => {
    try {
      setSyncing(true);
      const response = await axios.post(
        `${backend_url}/api/orders/sync-all-purchases`,
        { orderIds: orders.map(order => order._id) },
        { headers: { token } }
      );
      
      if (response.data.success) {
        toast.success("All user purchases synchronized");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSyncing(false);
    }
  };

  const statusHandler = async (event, orderId) => {
    try {
      const response = await axios.post(
        backend_url + "/api/orders/status",
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
      case "Order Placed": return "border-l-blue-500 bg-blue-50";
      case "Packing": return "border-l-yellow-500 bg-yellow-50";
      case "Shipped": return "border-l-orange-500 bg-orange-50";
      case "Out for Delivery": return "border-l-purple-500 bg-purple-50";
      case "Delivered": return "border-l-green-500 bg-green-50";
      default: return "border-l-gray-500 bg-gray-50";
    }
  };

  const getStatusTextColor = (status) => {
    switch (status) {
      case "Order Placed": return "text-blue-700";
      case "Packing": return "text-yellow-700";
      case "Shipped": return "text-orange-700";
      case "Out for Delivery": return "text-purple-700";
      case "Delivered": return "text-green-700";
      default: return "text-gray-700";
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <FiShoppingCart className="text-blue-600" />
              Orders Management
            </h1>
            <p className="text-gray-600 mt-2">Manage and track all customer orders</p>
          </div>
          
          <button
            onClick={syncAllPurchases}
            disabled={syncing || orders.length === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              syncing || orders.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {syncing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Syncing...
              </>
            ) : (
              <>
                <FiRefreshCw size={16} />
                Sync All Purchases
              </>
            )}
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-200">
            <FiPackage className="mx-auto text-6xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-600">No orders found</h3>
            <p className="text-gray-500 mt-2">Orders will appear here once they are placed.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className={`bg-white rounded-xl shadow-sm border-l-4 ${getStatusColor(order.status)} p-5 hover:shadow-md transition-all duration-300 border border-gray-200`}
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="text-sm font-semibold text-gray-700">
                      Order #{order._id.slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteOrder(order._id)}
                    disabled={syncing}
                    className={`p-2 rounded-lg transition-colors ${
                      syncing 
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                    }`}
                    title="Delete order"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                {/* Customer Info */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <FiUser size={12} /> Customer
                  </h4>
                  <div className="text-sm text-gray-700">
                    <div className="flex items-center gap-1 mb-1">
                      <FiUser size={14} />
                      <span>{order.user?.name || "Unknown Customer"}</span>
                    </div>
                    {order.address && (
                      <>
                        <div className="flex items-center gap-1 mb-1">
                          <FiMapPin size={14} />
                          <span className="truncate">{order.address}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <FiPhone size={14} />
                          <span>{order.phone || "No phone provided"}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
                    <FiPackage size={12} /> Order Items
                  </h4>
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm p-2 bg-white rounded-md border border-gray-100">
                        <div className="flex-1">
                          <span className="font-medium text-gray-800 block truncate">{item.name}</span>
                          <span className="text-gray-500 text-xs">Qty: {item.quantity}</span>
                        </div>
                        <span className="text-gray-900 font-medium whitespace-nowrap">
                          {currency}
                          {(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Details */}
                <div className="space-y-2 text-sm mb-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1">
                      <FiDollarSign size={14} /> Total Amount:
                    </span>
                    <span className="font-semibold text-gray-900">
                      {currency}
                      {order.amount?.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1">
                      <FiCalendar size={14} /> Date:
                    </span>
                    <span className="text-gray-700">
                      {new Date(order.date || order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1">
                      <FiCreditCard size={14} /> Payment:
                    </span>
                    <span className="text-gray-700 capitalize">
                      {order.paymentMethod || "Unknown"}
                    </span>
                  </div>
                </div>

                {/* Status Selector */}
                <div className="mt-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">
                    Update Status
                  </label>
                  <select
                    className={`w-full p-2 border rounded-md text-sm ${getStatusTextColor(order.status)}`}
                    value={order.status}
                    onChange={(e) => statusHandler(e, order._id)}
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
