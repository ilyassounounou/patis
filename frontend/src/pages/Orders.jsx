import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";
import { FaPrint, FaShoppingCart, FaCheckCircle, FaClock, FaTimesCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const Orders = () => {
  const { backendUrl, token, currency, addToCart } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [sendingToCart, setSendingToCart] = useState(false);
  const [sentOrderId, setSentOrderId] = useState(null);
  const location = useLocation();

  // Load user orders
  const loadOrderData = async () => {
    try {
      if (!token) return;

      const response = await axios.post(
        `${backendUrl}/api/orders/userorders`,
        {},
        { headers: { token } }
      );

      if (response.data.success) {
        setOrderData(response.data.orders.reverse());
      }
    } catch (error) {
      console.error("Erreur de chargement:", error);
    }
  };

  // Generate ESC/POS commands for the receipt
  const generateEscPosCommands = (order) => {
    // Arabic text alignment (right-to-left)
    let commands = [];
    
    // Initialize printer
    commands.push('\x1B@'); // Initialize printer
    commands.push('\x1B\x74\x08'); // Set code page to Arabic (CP864)
    
    // Set alignment center for header
    commands.push('\x1B\x61\x01'); // Center alignment
    
    // Print header (double height and width)
    commands.push('\x1B\x21\x30'); // Double height and width
    commands.push('فاتورة شراء\n');
    commands.push('\x1B\x21\x00'); // Reset text size
    
    // Store information
    commands.push('مخبزنا اللذيذ\n');
    commands.push('123 شارع المخبز، المدينة\n');
    commands.push('الهاتف: 0987383883\n');
    commands.push('\n');
    
    // Order information
    commands.push('\x1B\x61\x02'); // Right alignment
    commands.push(`التاريخ: ${new Date(order.createdAt).toLocaleDateString('ar-EG')}\n`);
    commands.push(`الوقت: ${new Date(order.createdAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}\n`);
    commands.push(`رقم الفاتورة: ${order._id.slice(-6)}\n`);
    commands.push('------------------------------\n');
    
    // Items header
    commands.push('\x1B\x21\x08'); // Emphasized
    commands.push('الصنف                الكمية    السعر\n');
    commands.push('\x1B\x21\x00'); // Reset text size
    commands.push('------------------------------\n');
    
    // Items
    order.items.forEach(item => {
      const name = item.name.length > 16 ? item.name.substring(0, 13) + '...' : item.name;
      const quantity = item.quantity.toString().padStart(2);
      const price = item.price.toFixed(2).padStart(6);
      commands.push(`${name.padEnd(20)} ${quantity}      ${price}\n`);
    });
    
    // Total
    commands.push('\n');
    commands.push('\x1B\x21\x08'); // Emphasized
    commands.push(`المجموع: ${order.amount.toFixed(2).padStart(10)}\n`);
    commands.push('\x1B\x21\x00'); // Reset text size
    
    // Footer
    commands.push('\n');
    commands.push('شكراً لكم على زيارتكم\n');
    commands.push('نتمنى لكم يوماً سعيداً\n');
    
    // Cut paper (feed and cut)
    commands.push('\n\n\n\x1D\x56\x41\x10'); // Feed and cut
    
    return commands.join('');
  };

  const printToThermalPrinter = async (order) => {
    setIsPrinting(true);
    try {
      const escPosCommands = generateEscPosCommands(order);
      
      // Try WebUSB API first
      if ('usb' in navigator) {
        try {
          const device = await navigator.usb.requestDevice({
            filters: [
              { vendorId: 0x0416 }, // Common thermal printer vendor ID
              { vendorId: 0x0FE6 }, // Another common vendor ID
              { vendorId: 0x067B }  // Prolific vendor ID
            ]
          });
          
          await device.open();
          await device.selectConfiguration(1);
          await device.claimInterface(0);
          
          // Convert commands to Uint8Array
          const encoder = new TextEncoder();
          const data = encoder.encode(escPosCommands);
          
          await device.transferOut(1, data);
          await device.close();
          return;
        } catch (error) {
          console.log('WebUSB error:', error);
        }
      }
      
      // Fallback to server-side printing
      try {
        const response = await axios.post(
          `${backendUrl}/api/print`,
          { commands: escPosCommands },
          { headers: { token } }
        );
        
        if (!response.data.success) {
          throw new Error(response.data.message || 'فشل في الطباعة');
        }
      } catch (serverError) {
        console.error('Server printing error:', serverError);
        // Final fallback to browser print dialog
        setSelectedOrder(order);
      }
    } catch (error) {
      console.error('Printing error:', error);
      // Fallback to browser print
      setSelectedOrder(order);
    } finally {
      setIsPrinting(false);
    }
  };

  const handlePrintInvoice = (order) => {
    // 1️⃣ Récupérer les achats existants
    const existingPurchases = JSON.parse(localStorage.getItem("purchases")) || [];

    // 2️⃣ Ajouter la nouvelle commande
    existingPurchases.push(order);

    // 3️⃣ Sauvegarder à nouveau dans localStorage
    localStorage.setItem("purchases", JSON.stringify(existingPurchases));

    // 4️⃣ Lancer l'impression
    printToThermalPrinter(order);
  };

const handleSendToCart = async (order) => {
  setSendingToCart(true);
  setSentOrderId(order._id);
  
  try {
    // Add each item from the order to the cart
    for (const item of order.items) {
      await addToCart(item.productId || item._id, item.quantity);
    }
    
    // Show success for 2 seconds
    setTimeout(() => {
      setSendingToCart(false);
      setSentOrderId(null);
    }, 2000);
  } catch (error) {
    console.error("Error sending to cart:", error);
    setSendingToCart(false);
    setSentOrderId(null);
  }
};


  // Auto print when order is selected (fallback)
  useEffect(() => {
    if (selectedOrder) {
      const timeout = setTimeout(() => {
        window.print();
        setSelectedOrder(null);
      }, 800);
      return () => clearTimeout(timeout);
    }
  }, [selectedOrder]);

  useEffect(() => {
    if (location.state?.newOrder) {
      setOrderData([location.state.newOrder]);
    } else {
      loadOrderData();
    }
  }, [token, location.state]);

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      completed: {
        icon: <FaCheckCircle className="text-green-500" />,
        bg: "bg-green-100",
        text: "text-green-800",
        label: "مكتمل"
      },
      pending: {
        icon: <FaClock className="text-yellow-500" />,
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        label: "قيد الانتظار"
      },
      cancelled: {
        icon: <FaTimesCircle className="text-red-500" />,
        bg: "bg-red-100",
        text: "text-red-800",
        label: "ملغى"
      }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${config.bg} ${config.text}`}>
        {config.icon}
        {config.label}
      </span>
    );
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">سجل الطلبات</h1>
          <p className="text-gray-600">استعرض وإدارة جميع طلباتك السابقة</p>
        </div>

        {orderData.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">لا توجد طلبات سابقة</h3>
            <p className="text-gray-500">لم تقم بأي طلبات حتى الآن</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orderData.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">
                      الطلب #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-blue-100 text-sm mt-1">
                      {new Date(order.createdAt).toLocaleDateString('ar-EG')} -{" "}
                      {new Date(order.createdAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <StatusBadge status={order.status} />
                </div>

                <div className="p-5">
                  <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الصنف</th>
                          <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">الكمية</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">السعر</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">المجموع</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.items.map((item, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition-colors duration-150">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <img
                                  src={
                                    Array.isArray(item.image)
                                      ? item.image[0]
                                      : item.image || "/no-image.png"
                                  }
                                  alt={item.name}
                                  className="w-12 h-12 rounded-lg object-cover mr-3 hide-on-print shadow-sm"
                                />
                                <div className="text-right">
                                  <p className="text-sm font-medium text-gray-900">{item.name}</p>
                                  {item.description && (
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-1">{item.description}</p>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center whitespace-nowrap text-sm text-gray-500">
                              <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full">
                                {item.quantity}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-right whitespace-nowrap text-sm text-gray-500">
                              {currency} {item.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-4 text-right whitespace-nowrap text-sm font-medium text-gray-900">
                              {currency} {(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-5 border-t border-gray-200 gap-4">
                    <div className="text-xl font-bold text-gray-900">
                      الإجمالي: {currency} {order.amount.toFixed(2)}
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => handleSendToCart(order)}
                        disabled={sendingToCart && sentOrderId === order._id}
                        className={`flex items-center justify-center gap-2 ${
                          sendingToCart && sentOrderId === order._id 
                            ? 'bg-green-600' 
                            : 'bg-blue-600 hover:bg-blue-700'
                        } text-white px-5 py-2.5 rounded-lg transition-colors duration-200 font-medium`}
                       >
                        {sendingToCart && sentOrderId === order._id ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري الإضافة...
                          </>
                        ) : (
                          <>
                            <FaShoppingCart />
                            إضافة إلى السلة
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => handlePrintInvoice(order)}
                        disabled={isPrinting}
                        className={`flex items-center justify-center gap-2 ${
                          isPrinting ? 'bg-gray-400' : 'bg-gray-800 hover:bg-gray-900'
                        } text-white px-5 py-2.5 rounded-lg transition-colors duration-200 font-medium`}
                      >
                        {isPrinting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            جاري الطباعة...
                          </>
                        ) : (
                          <>
                            <FaPrint />
                            طباعة الفاتورة
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print styles for fallback printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-container, .print-container * {
            visibility: visible;
          }
          .print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Fallback print view */}
      {selectedOrder && (
        <div className="print-container hidden print:block p-8 bg-white">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">فاتورة شراء</h1>
            <p className="text-gray-600">مخبزنا اللذيذ</p>
            <p className="text-gray-600">123 شارع المخبز، المدينة</p>
            <p className="text-gray-600">الهاتف: 0987383883</p>
          </div>
          
          <div className="mb-6">
            <p><strong>رقم الفاتورة:</strong> #{selectedOrder._id.slice(-6).toUpperCase()}</p>
            <p><strong>التاريخ:</strong> {new Date(selectedOrder.createdAt).toLocaleDateString('ar-EG')}</p>
            <p><strong>الوقت:</strong> {new Date(selectedOrder.createdAt).toLocaleTimeString('ar-EG', {hour: '2-digit', minute:'2-digit'})}</p>
          </div>
          
          <table className="w-full border-collapse border border-gray-300 mb-6">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 p-2 text-right">الصنف</th>
                <th className="border border-gray-300 p-2 text-center">الكمية</th>
                <th className="border border-gray-300 p-2 text-right">السعر</th>
                <th className="border border-gray-300 p-2 text-right">المجموع</th>
              </tr>
            </thead>
            <tbody>
              {selectedOrder.items.map((item, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2 text-right">{item.name}</td>
                  <td className="border border-gray-300 p-2 text-center">{item.quantity}</td>
                  <td className="border border-gray-300 p-2 text-right">{currency} {item.price.toFixed(2)}</td>
                  <td className="border border-gray-300 p-2 text-right">{currency} {(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          
          <div className="text-xl font-bold text-right">
            الإجمالي: {currency} {selectedOrder.amount.toFixed(2)}
          </div>
          
          <div className="mt-8 text-center text-gray-600">
            <p>شكراً لكم على زيارتكم</p>
            <p>نتمنى لكم يوماً سعيداً</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;