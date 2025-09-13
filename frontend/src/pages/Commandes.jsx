import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FaSearch,
  FaPrint,
  FaPlus,
  FaTrash,
  FaMoneyBillWave,
  FaCheckCircle,
} from "react-icons/fa";

const Commandes = () => {
  const [searchCode, setSearchCode] = useState("");
  const [commande, setCommande] = useState(null);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientPhone: "",
    description: "",
    avance: 0,
    items: [{ name: "", price: 0, quantity: 1 }],
  });
  const [generatedCode, setGeneratedCode] = useState("");
  const [deleteConfirmationCode, setDeleteConfirmationCode] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [commandeToDelete, setCommandeToDelete] = useState(null);

  const API_URL = "http://localhost:4000/api/commandes";
  const DELETE_CONFIRMATION_CODE = "2003"; // Code de confirmation pour la suppression

  // Fetch all commandes on component mount
  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const { data } = await axios.get(API_URL);
        setCommandes(data.commandes || []);
      } catch (err) {
        console.error("Error fetching commandes", err);
        setError("فشل في تحميل الطلبات");
      }
    };
    fetchCommandes();
  }, []);

  // Generate unique code (6 alphanumeric characters)
  const generateUniqueCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let code = "";
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedCode(code);
    return code;
  };

  // Function to update avance for a commande
  const updateAvanceForCommande = async (commandeId, totalAmount) => {
    try {
      setLoading(true);
      const { data } = await axios.put(`${API_URL}/${commandeId}/avance`, {
        avance: totalAmount,
      });
      // Update the specific commande in the list
      setCommandes((prevCommandes) =>
        prevCommandes.map((cmd) => (cmd._id === commandeId ? data.commande : cmd))
      );
      showSuccess("تم تحديث حالة الدفع بنجاح");
    } catch (err) {
      setError("خطأ في تحديث حالة الدفع");
    } finally {
      setLoading(false);
    }
  };

  // Function to confirm and delete a commande
  const confirmDeleteCommande = (commandeId) => {
    setCommandeToDelete(commandeId);
    setShowDeleteModal(true);
  };

  // Function to delete a commande after confirmation
  const deleteCommande = async () => {
    if (deleteConfirmationCode !== DELETE_CONFIRMATION_CODE) {
      setError("رمز التأكيد غير صحيح");
      return;
    }

    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${commandeToDelete}`);
      // Remove the commande from the list
      setCommandes((prevCommandes) =>
        prevCommandes.filter((cmd) => cmd._id !== commandeToDelete)
      );
      // If the deleted commande is currently displayed, clear it
      if (commande && commande._id === commandeToDelete) {
        setCommande(null);
      }
      showSuccess("تم حذف الطلب بنجاح");
      setShowDeleteModal(false);
      setDeleteConfirmationCode("");
      setCommandeToDelete(null);
    } catch (err) {
      setError("خطأ في حذف الطلب");
    } finally {
      setLoading(false);
    }
  };

  // Show success message
  const showSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  // Search commande by code
  const searchCommande = async () => {
    if (!searchCode.trim()) {
      setError("الرجاء إدخال رمز الطلب");
      return;
    }
    // Validate code format
    if (searchCode.length !== 6 || !/^[A-Z0-9]{6}$/.test(searchCode)) {
      setError("الرمز يجب أن يكون 6 أحرف وأرقام فقط (مثال: AWEGSL)");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { data } = await axios.get(`${API_URL}/code/${searchCode}`);
      setCommande(data.commande);
      setError("");
    } catch (err) {
      setError("لم يتم العثور على الطلب");
      setCommande(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "avance" ? Number(value) : value,
    }));
  };

  // Handle item input changes
  const handleItemChange = (index, e) => {
    const { name, value } = e.target;
    const items = [...formData.items];
    items[index][name] = name === "name" ? value : Number(value);
    setFormData((prev) => ({
      ...prev,
      items,
    }));
  };

  // Add new item
  const addItemField = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", price: 0, quantity: 1 }],
    }));
  };

  // Remove item
  const removeItemField = (index) => {
    if (formData.items.length > 1) {
      const items = formData.items.filter((_, i) => i !== index);
      setFormData((prev) => ({
        ...prev,
        items,
      }));
    }
  };

  // Calculate total
  const calculateTotal = () => {
    return formData.items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  // Calculate reste
  const calculateReste = () => {
    const total = calculateTotal();
    return total - formData.avance;
  };

  // Submit new commande
  const submitCommande = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const total = calculateTotal();
      const reste = calculateReste();
      const { data } = await axios.post(API_URL, {
        clientPhone: formData.clientPhone,
        description: formData.description,
        items: formData.items,
        total,
        avance: formData.avance,
        reste,
      });
      setCommande(data.commande);
      setSearchCode(data.commande.code);
      setShowForm(false);
      setFormData({
        clientPhone: "",
        description: "",
        avance: 0,
        items: [{ name: "", price: 0, quantity: 1 }],
      });
      // Refresh all commandes
      const all = await axios.get(API_URL);
      setCommandes(all.data.commandes || []);
      showSuccess(`تم إنشاء الطلب بنجاح! الرمز: ${data.commande.code}`);
    } catch (err) {
      setError("خطأ في إنشاء الطلب");
    } finally {
      setLoading(false);
    }
  };

  // Update advance
  const updateAvance = async (newAvance) => {
    try {
      const { data } = await axios.put(`${API_URL}/${commande._id}/avance`, {
        avance: newAvance,
      });
      setCommande(data.commande);
      showSuccess("تم تحديث الدفعة المقدمة بنجاح");
    } catch (err) {
      setError("خطأ في تحديث الدفعة");
    }
  };

  // Print commande
  const printCommande = () => {
    window.print();
  };

  // Status text
  const getStatusText = (status) => {
    const statuses = {
      pending: "قيد الانتظار",
      preparing: "قيد التحضير",
      ready: "جاهز",
      completed: "مكتمل",
      cancelled: "ملغي",
    };
    return statuses[status] || status;
  };

  // Format date to DD/MM/YY HH:mm
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = String(d.getFullYear()).slice(-2);
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-800">نظام إدارة الطلبات</h1>
          <p className="text-gray-600 mt-2">إدارة طلبات المخبز بسهولة وكفاءة</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fadeIn">
            <FaCheckCircle className="text-xl" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-xl font-bold text-red-600 mb-4">تأكيد الحذف</h3>
              <p className="mb-4">يرجى إدخال رمز التأكيد <strong>2003</strong> لحذف هذا الطلب</p>
              <input
                type="password"
                value={deleteConfirmationCode}
                onChange={(e) => setDeleteConfirmationCode(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg mb-4"
                placeholder="أدخل رمز التأكيد"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmationCode("");
                    setCommandeToDelete(null);
                  }}
                  className="px-4 py-2 bg-gray-300 rounded-lg"
                >
                  إلغاء
                </button>
                <button
                  onClick={deleteCommande}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg"
                >
                  تأكيد الحذف
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Search Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
          <h2 className="text-2xl font-bold text-blue-700 mb-4">البحث عن طلب</h2>
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="ابحث برمز الطلب (مثال: AWEGSL)"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && searchCommande()}
                maxLength={6}
              />
            </div>
            <button
              onClick={searchCommande}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <FaSearch /> {loading ? "جاري البحث..." : "بحث"}
            </button>
            <button
              onClick={() => {
                setShowForm(!showForm);
                setGeneratedCode(generateUniqueCode());
              }}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <FaPlus /> {showForm ? "إلغاء" : "طلب جديد"}
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            الرمز مكون من 6 أحرف إنجليزية وأرقام (مثال: AWEGSL)
          </p>
          {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
        </div>

        {/* New Command Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-2xl font-bold text-blue-700">إنشاء طلب جديد</h3>
              <div className="bg-blue-100 text-blue-800 px-4 py-2 rounded-lg">
                <span className="font-medium">الرمز المولد: </span>
                <span className="font-mono font-bold">{generatedCode}</span>
              </div>
            </div>
            <form onSubmit={submitCommande}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    name="clientPhone"
                    value={formData.clientPhone}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف (اختياري)
                  </label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="وصف الطلب"
                  />
                </div>
              </div>
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-700">المنتجات *</label>
                  <button
                    type="button"
                    onClick={addItemField}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                  >
                    <FaPlus /> إضافة منتج
                  </button>
                </div>
                {formData.items.map((item, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2 items-end"
                  >
                    <div className="md:col-span-5">
                      <input
                        type="text"
                        name="name"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, e)}
                        required
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="اسم المنتج"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="number"
                        name="price"
                        value={item.price}
                        onChange={(e) => handleItemChange(index, e)}
                        required
                        min="0"
                        step="0.01"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="السعر"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <input
                        type="number"
                        name="quantity"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, e)}
                        required
                        min="1"
                        className="w-full p-2 border border-gray-300 rounded-lg"
                        placeholder="الكمية"
                      />
                    </div>
                    <div className="md:col-span-2 flex gap-2">
                      <span className="flex-1 p-2 bg-gray-100 rounded-lg">
                        DH {(item.price * item.quantity).toFixed(2)}
                      </span>
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemField(index)}
                          className="p-2 text-red-600 hover:text-red-800"
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدفعة المقدمة
                  </label>
                  <input
                    type="number"
                    name="avance"
                    value={formData.avance}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    max={calculateTotal()}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="المبلغ المدفوع"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <span className="text-sm text-gray-600">المجموع:</span>
                  <span className="text-lg font-bold">DH {calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex flex-col justify-end">
                  <span className="text-sm text-gray-600">الباقي:</span>
                  <span
                    className={`text-lg font-bold ${
                      calculateReste() > 0 ? "text-orange-600" : "text-green-600"
                    }`}
                  >
                    DH {calculateReste().toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="flex justify-end border-t pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? "جاري الحفظ..." : "حفظ الطلب"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Command Display */}
        {commande && (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden print:shadow-none">
            {/* Command Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                  <h2 className="text-2xl font-bold">فاتورة الطلب</h2>
                  <p className="text-blue-100">مخبزنا اللذيذ</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono bg-white text-blue-800 px-3 py-1 rounded-md inline-block">
                    {commande.code}
                  </p>
                  <p className="text-blue-100 mt-2">{formatDate(commande.createdAt)}</p>
                </div>
              </div>
            </div>

            {/* Client Information */}
            <div className="p-6 border-b">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-gray-700">معلومات العميل</h3>
                  <p className="text-gray-600">الهاتف: {commande.clientPhone}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700">حالة الطلب</h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      commande.status === "completed"
                        ? "bg-green-100 text-green-800"
                        : commande.status === "preparing"
                        ? "bg-yellow-100 text-yellow-800"
                        : commande.status === "ready"
                        ? "bg-blue-100 text-blue-800"
                        : commande.status === "cancelled"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {getStatusText(commande.status)}
                  </span>
                </div>
              </div>
              {commande.description && (
                <div className="mt-4">
                  <h3 className="font-semibold text-gray-700">الوصف</h3>
                  <p className="text-gray-600">{commande.description}</p>
                </div>
              )}
            </div>

            {/* Items List */}
            <div className="p-6">
              <h3 className="font-semibold text-gray-700 mb-4">المنتجات</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right pb-2">المنتج</th>
                      <th className="text-center pb-2">الكمية</th>
                      <th className="text-right pb-2">السعر</th>
                      <th className="text-right pb-2">المجموع</th>
                    </tr>
                  </thead>
                  <tbody>
                    {commande.items.map((item, index) => (
                      <tr key={index} className="border-b">
                        <td className="py-3 text-right">{item.name}</td>
                        <td className="py-3 text-center">{item.quantity}</td>
                        <td className="py-3 text-right">DH {item.price.toFixed(2)}</td>
                        <td className="py-3 text-right">
                          DH {(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="p-6 border-t border-b">
              <h3 className="font-semibold text-gray-700 mb-4">ملخص الدفع</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMoneyBillWave className="text-blue-600" />
                    <span className="font-semibold">المجموع</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-700">
                    DH {commande.total.toFixed(2)}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMoneyBillWave className="text-green-600" />
                    <span className="font-semibold">الدفعة المقدمة</span>
                  </div>
                  <p className="text-2xl font-bold text-green-700">
                    DH {commande.avance.toFixed(2)}
                  </p>
                  <div className="mt-2 hide-on-print">
                    <input
                      type="number"
                      value={commande.avance}
                      onChange={(e) => updateAvance(Number(e.target.value))}
                      min="0"
                      max={commande.total}
                      step="0.01"
                      className="w-full p-2 border border-gray-300 rounded-lg text-sm"
                      placeholder="تعديل الدفعة"
                    />
                  </div>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <FaMoneyBillWave className="text-orange-600" />
                    <span className="font-semibold">الباقي</span>
                  </div>
                  <p className="text-2xl font-bold text-orange-700">
                    DH {commande.reste.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 bg-gray-50">
              <div className="flex justify-between items-center">
                <div className="text-lg font-bold">
                  الحالة: {commande.reste === 0 ? "مدفوع بالكامل" : "مدفوع جزئياً"}
                </div>
                <button
                  onClick={printCommande}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 hide-on-print"
                >
                  <FaPrint /> طباعة
                </button>
              </div>
            </div>
          </div>
        )}

        {/* All Commandes List */}
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-6 text-blue-800 border-b-2 border-blue-200 pb-2">
            كل الطلبات
          </h2>
          {commandes.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-lg shadow">
              <p className="text-gray-500 text-lg">لا توجد طلبات</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {commandes.map((cmd) => (
                <div
                  key={cmd._id}
                  className={`bg-white rounded-xl shadow-md overflow-hidden border transition-all duration-300 hover:shadow-lg ${
                    cmd.reste === 0 ? "border-green-400" : "border-gray-200"
                  }`}
                >
                  {/* Invoice Header */}
                  <div
                    className={`p-4 text-white ${
                      cmd.reste === 0
                        ? "bg-gradient-to-r from-green-600 to-green-800"
                        : "bg-gradient-to-r from-blue-600 to-blue-800"
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm">فاتورة الطلب</h3>
                        <p className="text-xs opacity-90">مخبزنا اللذيذ</p>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-xs font-mono px-2 py-1 rounded-md ${
                            cmd.reste === 0
                              ? "bg-green-100 text-green-800"
                              : "bg-white text-blue-800"
                          }`}
                        >
                          {cmd.code}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Status Badge */}
                  <div
                    className={`py-2 px-4 text-center ${
                      cmd.reste === 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <span className="text-xs font-semibold">
                      {cmd.reste === 0 ? "تم الدفع بالكامل" : "لم يتم الدفع بالكامل"}
                    </span>
                  </div>

                  {/* Invoice Body */}
                  <div className="p-4">
                    {/* Client Info */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-500">الهاتف:</span>
                        <span className="text-sm font-medium">{cmd.clientPhone}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">التاريخ:</span>
                        <span className="text-xs">{formatDate(cmd.createdAt)}</span>
                      </div>
                    </div>

                    {/* Description */}
                    {cmd.description && (
                      <div className="mb-4">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">الوصف:</span>
                        </div>
                        <p className="text-xs text-gray-700 mt-1 truncate">{cmd.description}</p>
                      </div>
                    )}

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${
                          cmd.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : cmd.status === "preparing"
                            ? "bg-yellow-100 text-yellow-800"
                            : cmd.status === "ready"
                            ? "bg-blue-100 text-blue-800"
                            : cmd.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {getStatusText(cmd.status)}
                      </span>
                    </div>

                    {/* Items List */}
                    <div className="mb-4">
                      <h4 className="text-xs font-semibold text-gray-700 mb-2 border-b pb-1">
                        المنتجات
                      </h4>
                      {Array.isArray(cmd.items) && cmd.items.length > 0 ? (
                        <div className="space-y-1">
                          {cmd.items.slice(0, 3).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-xs">
                              <span className="truncate max-w-[60%]">{item.name}</span>
                              <span>
                                {item.quantity} × {item.price} د.م
                              </span>
                            </div>
                          ))}
                          {cmd.items.length > 3 && (
                            <div className="text-xs text-gray-500 text-center pt-1">
                              + {cmd.items.length - 3} منتجات أخرى
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400">لا توجد منتجات</p>
                      )}
                    </div>

                    {/* Payment Summary */}
                    <div
                      className={`p-3 rounded-lg ${
                        cmd.reste === 0 ? "bg-green-50" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">المجموع:</span>
                        <span className="text-sm font-bold">{cmd.total?.toFixed(2)} د.م</span>
                      </div>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-gray-600">الدفعة:</span>
                        <span className="text-sm font-medium text-green-600">
                          {cmd.avance?.toFixed(2)} د.م
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-600">الباقي:</span>
                        <span
                          className={`text-sm font-bold ${
                            cmd.reste > 0 ? "text-orange-600" : "text-green-600"
                          }`}
                        >
                          {cmd.reste?.toFixed(2)} د.م
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between mt-3 space-x-2">
                      <button
                        onClick={() => {
                          setSearchCode(cmd.code);
                          searchCommande();
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-medium py-2 rounded-lg transition-colors"
                      >
                        عرض التفاصيل
                      </button>
                      <button
                        onClick={() => {
                          // Mark as paid functionality
                          if (cmd.reste > 0) {
                            updateAvanceForCommande(cmd._id, cmd.total);
                          }
                        }}
                        className={`px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                          cmd.reste === 0
                            ? "bg-green-100 text-green-800 cursor-default"
                            : "bg-orange-100 hover:bg-orange-200 text-orange-800"
                        }`}
                        disabled={cmd.reste === 0}
                        title={cmd.reste === 0 ? "تم الدفع بالكامل" : "标记为已支付"}
                      >
                        {cmd.reste === 0 ? "✓" : "دفع"}
                      </button>
                      <button
                        onClick={() => confirmDeleteCommande(cmd._id)}
                        className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 text-xs font-medium rounded-lg transition-colors"
                        title="حذف الطلب"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>
        {`
          @media print {
            .hide-on-print {
              display: none !important;
            }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s;
          }
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Commandes;