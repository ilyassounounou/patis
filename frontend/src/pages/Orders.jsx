import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import axios from "axios";
import Title from "../components/Title";
import { FaPrint } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [orderData, setOrderData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isPrinting, setIsPrinting] = useState(false);
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
  
  // Print to thermal printer
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

  // 4️⃣ Lancer l’impression
  printInvoice(order);
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-padd-container py-10">
        <Title
          title1={"Historique"}
          title2={"des Commandes"}
          title1Styles={"text-2xl"}
          titleStyles={"pb-6"}
        />

        {orderData.length === 0 ? (
          <p className="text-center text-gray-500 py-10">لا توجد طلبات سابقة</p>
        ) : (
          <div className="space-y-6">
            {orderData.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <div className="bg-primary p-4 flex justify-between items-center">
                  <div>
                    <h3 className="text-white font-bold">
                      Commande #{order._id.slice(-6).toUpperCase()}
                    </h3>
                    <p className="text-white text-sm">
                      {new Date(order.createdAt).toLocaleDateString()} -{" "}
                      {new Date(order.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      order.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : order.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="p-4">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">
                            الصنف
                          </th>
                          <th className="px-4 py-3 text-center text-xs text-gray-500 uppercase">
                            الكمية
                          </th>
                          <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">
                            السعر
                          </th>
                          <th className="px-4 py-3 text-right text-xs text-gray-500 uppercase">
                            المجموع
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {order.items.map((item, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3">
                              <div className="flex items-center">
                                <img
                                  src={
                                    Array.isArray(item.image)
                                      ? item.image[0]
                                      : item.image || "/no-image.png"
                                  }
                                  alt={item.name}
                                  className="w-10 h-10 rounded-md object-cover mr-3 hide-on-print"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">
                                    {item.name}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-3 text-right text-sm text-gray-500">
                              {currency} {item.price.toFixed(2)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-medium">
                              {currency} {(item.price * item.quantity).toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center mt-6 pt-4 border-t">
                    <div className="text-lg font-bold">
                      المجموع: {currency} {order.amount.toFixed(2)}
                    </div>
              <button
  onClick={() => handlePrintInvoice(order)}
  disabled={isPrinting}
  className={`flex items-center gap-2 ${isPrinting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 py-2 rounded-lg hide-on-print`}
>
  {isPrinting ? 'جاري الطباعة...' : (
    <>
      <FaPrint /> طباعة الفاتورة
    </>
  )}
</button>

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fallback print view */}
      {selectedOrder && (
        <div className="hidden print:block p-8">
          {/* ... (keep your existing print view as fallback) ... */}
        </div>
      )}
    </div>
  );
};

export default Orders;