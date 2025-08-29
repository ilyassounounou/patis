import React, { useEffect, useState, useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { FaTrash, FaEdit, FaShoppingCart, FaSearch } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Achat = () => {
  const { currency, setCartItems } = useContext(ShopContext);
  const [purchases, setPurchases] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPurchases, setFilteredPurchases] = useState([]);
  const navigate = useNavigate();

  // Confirmation code required for deletions
  const CONFIRMATION_CODE = "9090";

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("purchases")) || [];
    setPurchases(stored);
    setFilteredPurchases(stored);
  }, []);

  // Filter purchases based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredPurchases(purchases);
    } else {
      const filtered = purchases.filter(order => {
        const orderId = order._id?.toUpperCase() || "";
        return orderId.includes(searchQuery.toUpperCase());
      });
      setFilteredPurchases(filtered);
    }
  }, [searchQuery, purchases]);

  // ✅ Calculate total of all purchases
  const totalAllPurchases = filteredPurchases.reduce((sum, order) => sum + (order.amount || 0), 0);

  // Function to get status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "completed":
        return { bg: "bg-green-100", text: "text-green-800", label: "مكتمل" };
      case "pending":
        return { bg: "bg-yellow-100", text: "text-yellow-800", label: "قيد الانتظار" };
      case "cancelled":
        return { bg: "bg-red-100", text: "text-red-800", label: "ملغي" };
      default:
        return { bg: "bg-blue-100", text: "text-blue-800", label: "تم الشراء" };
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

  // Function to delete a purchase
  const deletePurchase = (index) => {
    if (confirmationCode !== CONFIRMATION_CODE) {
      alert("كود التأكيد غير صحيح");
      return;
    }
    
    const updatedPurchases = purchases.filter((_, i) => i !== index);
    setPurchases(updatedPurchases);
    localStorage.setItem("purchases", JSON.stringify(updatedPurchases));
    setShowDeleteConfirm(null);
    setConfirmationCode("");
  };

  // Function to delete all purchases
  const deleteAllPurchases = () => {
    if (confirmationCode !== CONFIRMATION_CODE) {
      alert("كود التأكيد غير صحيح");
      return;
    }
    
    setPurchases([]);
    localStorage.removeItem("purchases");
    setShowDeleteConfirm(null);
    setConfirmationCode("");
  };

  // Function to modify a purchase (redirect to cart with items)
  const modifyPurchase = (order) => {
    // Prepare items for the cart
    const cartItems = order.items.map(item => ({
      id: item.id || item._id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));
    
    // Set items to cart context
    setCartItems(cartItems);
    
    // Redirect to cart page
    navigate("/cart");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-padd-container py-10">
        <Title title1={"قائمة"} title2={"المشتريات"} titleStyles={"pb-6"} />

        {/* Search Bar */}
        {purchases.length > 0 && (
          <div className="mb-6 relative">
            <div className="relative max-w-md mx-auto">
              <input
                type="text"
                placeholder="ابحث برمز الطلب (مثال: #7B8413)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <FaSearch className="absolute left-3 top-3 text-gray-400" />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm !== null && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                {showDeleteConfirm === "all" 
                  ? "هل تريد حذف جميع المشتريات؟" 
                  : "هل تريد حذف هذه العملية؟"}
              </h3>
              <p className="text-gray-600 mb-4">
                {showDeleteConfirm === "all" 
                  ? "سيتم حذف جميع سجل المشتريات ولا يمكن التراجع عن هذا الإجراء." 
                  : "سيتم حذف هذه العملية من سجل المشتريات ولا يمكن التراجع عن هذا الإجراء."}
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  أدخل كود التأكيد (9090)
                </label>
                <input
                  type="password"
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="أدخل الكود هنا"
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(null);
                    setConfirmationCode("");
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={() => showDeleteConfirm === "all" 
                    ? deleteAllPurchases() 
                    : deletePurchase(showDeleteConfirm)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  تأكيد الحذف
                </button>
              </div>
            </div>
          </div>
        )}

        {purchases.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <FaShoppingCart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg">لا توجد مشتريات بعد</p>
            <p className="text-gray-400 mt-2">سيظهر تاريخ مشترياتك هنا عند إتمام أول عملية شراء</p>
          </div>
        ) : (
          <>
            {/* Action Buttons */}
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-700">
                عدد العمليات: {filteredPurchases.length}
                {searchQuery && ` (نتائج البحث)`}
              </h3>
              <button
                onClick={() => setShowDeleteConfirm("all")}
                className="flex items-center gap-2 bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors"
              >
                <FaTrash /> حذف الكل
              </button>
            </div>

            {filteredPurchases.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                <FaSearch className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">لا توجد نتائج للبحث</p>
                <p className="text-gray-400 mt-2">لم يتم العثور على أي طلب بالرمز المدخل</p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  عرض جميع الطلبات
                </button>
              </div>
            ) : (
              <>
                {/* Purchase Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                  {filteredPurchases.map((order, index) => {
                    const statusStyle = getStatusStyle(order.status);
                    return (
                      <div key={order._id || index} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col">
                        {/* Card Header */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                              {statusStyle.label}
                            </span>
                            <span className="text-xs text-gray-500">
                              #{order._id?.slice(-6).toUpperCase() || index + 1}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 font-mono">
                            {formatDateWestern(order.createdAt)}
                          </p>
                        </div>

                        {/* Items List */}
                        <div className="p-4 flex-grow">
                          <h4 className="font-medium text-gray-700 mb-2 text-sm">المنتجات المشتراة:</h4>
                          <div className="space-y-3 max-h-40 overflow-y-auto">
                            {order.items.map((item, i) => (
                              <div key={i} className="text-sm py-1 border-b border-gray-100 last:border-b-0">
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

                        {/* Order Total and Actions */}
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-medium text-gray-700">المجموع:</span>
                            <span className="text-lg font-bold text-indigo-600">
                              {currency} {order.amount.toFixed(2)}
                            </span>
                          </div>
                          
                          <div className="flex gap-2">
                            <button
                              onClick={() => modifyPurchase(order)}
                              className="flex-1 flex items-center justify-center gap-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              <FaEdit className="text-sm" /> تعديل
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(index)}
                              className="flex items-center justify-center w-10 h-10 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Total of all purchases */}
                <div className="bg-white p-6 rounded-xl shadow-sm mt-10 border border-gray-200 flex justify-between items-center">
                  <div className="text-lg font-bold text-gray-700">
                    إجمالي جميع المشتريات:
                  </div>
                  <div className="text-xl font-bold text-indigo-600">
                    {currency} {totalAllPurchases.toFixed(2)}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Achat;