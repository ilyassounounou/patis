import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { FaShoppingCart, FaSync, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";

const Achat = () => {
  const { currency, backendUrl } = useContext(ShopContext);
  const [purchases, setPurchases] = useState([]);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    loadPurchases();
  }, []);

  // Load purchases from localStorage and sync with admin
  const loadPurchases = () => {
    const stored = JSON.parse(localStorage.getItem("purchases")) || [];
    setPurchases(stored);
  };

  // Sync purchases with admin orders
  const syncWithAdmin = async () => {
    setSyncing(true);
    try {
      // Get all purchase IDs
      const purchaseIds = purchases.map(p => p._id).filter(id => id);
      
      if (purchaseIds.length === 0) {
        setSyncing(false);
        return;
      }
      
      // Check which orders still exist in admin
      const response = await fetch(`${backendUrl}/api/orders/check-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ orderIds: purchaseIds })
      });
      
      if (response.ok) {
        const data = await response.json();
        const existingOrderIds = data.existingOrders || [];
        
        // Filter out purchases that don't exist in admin anymore
        const updatedPurchases = purchases.filter(p => 
          !p._id || existingOrderIds.includes(p._id)
        );
        
        setPurchases(updatedPurchases);
        localStorage.setItem("purchases", JSON.stringify(updatedPurchases));
      }
    } catch (error) {
      console.error("Error syncing with admin:", error);
    } finally {
      setSyncing(false);
    }
  };

  // Calculate total of all purchases
  const totalAllPurchases = purchases.reduce((sum, order) => sum + (order.amount || 0), 0);

  // Function to get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return { 
          bg: "bg-green-100", 
          text: "text-green-800", 
          label: "مكتمل",
          icon: <FaCheckCircle className="text-green-500" />
        };
      case "pending":
        return { 
          bg: "bg-yellow-100", 
          text: "text-yellow-800", 
          label: "قيد الانتظار",
          icon: <FaClock className="text-yellow-500" />
        };
      case "cancelled":
        return { 
          bg: "bg-red-100", 
          text: "text-red-800", 
          label: "ملغي",
          icon: <FaTimesCircle className="text-red-500" />
        };
      default:
        return { 
          bg: "bg-blue-100", 
          text: "text-blue-800", 
          label: "تم الشراء",
          icon: <FaCheckCircle className="text-blue-500" />
        };
    }
  };

  // Function to format date in Western numerals (20/08/25 20:23)
  const formatDateWestern = (dateString) => {
    const date = new Date(dateString);
    
    // Get date components
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">سجل المشتريات</h1>
          <p className="text-gray-600">استعرض جميع عمليات الشراء السابقة</p>
        </div>

        {purchases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md mx-auto">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FaShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد مشتريات بعد</h3>
            <p className="text-gray-500">سيظهر تاريخ مشترياتك هنا عند إتمام أول عملية شراء</p>
          </div>
        ) : (
          <>
            {/* Header with Stats and Sync Button */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-700 mb-2">
                  إحصائيات المشتريات
                </h3>
                <div className="flex flex-wrap gap-4">
                  <div className="bg-blue-50 px-4 py-2 rounded-lg">
                    <span className="text-sm text-gray-600">عدد العمليات:</span>
                    <span className="block text-lg font-bold text-blue-600">{purchases.length}</span>
                  </div>
                  <div className="bg-green-50 px-4 py-2 rounded-lg">
                    <span className="text-sm text-gray-600">إجمالي المشتريات:</span>
                    <span className="block text-lg font-bold text-green-600">
                      {currency} {totalAllPurchases.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={syncWithAdmin}
                disabled={syncing}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  syncing 
                    ? 'bg-gray-300 text-gray-500' 
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {syncing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري المزامنة...
                  </>
                ) : (
                  <>
                    <FaSync />
                    مزامنة مع الإدارة
                  </>
                )}
              </button>
            </div>

            {/* Purchase Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {purchases.map((order, index) => {
                const statusStyle = getStatusStyle(order.status);
                return (
                  <div key={order._id || index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col">
                    {/* Card Header */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          {statusStyle.icon}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                            {statusStyle.label}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500 bg-white px-2 py-1 rounded-md shadow-sm">
                          #{order._id?.slice(-6).toUpperCase() || index + 1}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 font-mono dir-ltr text-left">
                        {formatDateWestern(order.createdAt)}
                      </p>
                    </div>

                    {/* Items List */}
                    <div className="p-5 flex-grow">
                      <h4 className="font-medium text-gray-700 mb-3 text-sm border-b pb-2">المنتجات المشتراة:</h4>
                      <div className="space-y-3 max-h-40 overflow-y-auto">
                        {order.items.map((item, i) => (
                          <div key={i} className="text-sm py-2 border-b border-gray-100 last:border-b-0">
                            <div className="flex justify-between items-start mb-1">
                              <span className="font-medium text-gray-700 truncate max-w-[60%]">{item.name}</span>
                              <span className="text-gray-500 flex-shrink-0">
                                {currency} {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-gray-400">
                              <span>{item.quantity} × {currency} {item.price.toFixed(2)}</span>
                              <span>المجموع</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Order Total */}
                    <div className="p-5 bg-gray-50 border-t border-gray-100">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-700">المجموع الكلي:</span>
                        <span className="text-lg font-bold text-indigo-600">
                          {currency} {order.amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total of all purchases */}
            <div className="bg-white p-6 rounded-xl shadow-sm mt-10 border border-gray-200 flex justify-between items-center">
              <div className="text-lg font-bold text-gray-700">
                إجمالي قيمة جميع المشتريات:
              </div>
              <div className="text-xl font-bold text-indigo-600">
                {currency} {totalAllPurchases.toFixed(2)}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Achat;