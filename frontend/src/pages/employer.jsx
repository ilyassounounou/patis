import React, { useEffect, useState } from "react";
import axios from "axios";

const EmployerPage = () => {
  const [articles, setArticles] = useState([{ id: Date.now(), name: "", price: "", date: "", time: "" }]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [employers, setEmployers] = useState([]);
  const [advances, setAdvances] = useState([{ id: Date.now(), name: "", advance: "", salary: 0, remaining: 0, date: "", time: "" }]);
  const [absences, setAbsences] = useState([{ id: Date.now(), name: "", startDate: "", endDate: "", days: 0, reason: "", date: "", time: "" }]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [securityCode, setSecurityCode] = useState("");
  const [deleteAction, setDeleteAction] = useState(null);
  const [editAction, setEditAction] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [editingTable, setEditingTable] = useState("");

  // الحصول على التاريخ والوقت الحالي
  const getCurrentDateTime = () => {
    const now = new Date();
    const date = now.toLocaleDateString('ar-EG');
    const time = now.toLocaleTimeString('ar-EG');
    return { date, time };
  };

  // ✅ Load data from localStorage & fetch employers
  useEffect(() => {
    // Load articles from localStorage
    const savedArticles = localStorage.getItem("articles");
    if (savedArticles) {
      try {
        const parsedArticles = JSON.parse(savedArticles);
        if (Array.isArray(parsedArticles) && parsedArticles.length > 0) {
          setArticles(parsedArticles);
        }
      } catch (error) {
        console.error("Error parsing articles from localStorage:", error);
      }
    }

    // Load advances from localStorage
    const savedAdvances = localStorage.getItem("advances");
    if (savedAdvances) {
      try {
        const parsedAdvances = JSON.parse(savedAdvances);
        if (Array.isArray(parsedAdvances) && parsedAdvances.length > 0) {
          setAdvances(parsedAdvances);
        }
      } catch (error) {
        console.error("Error parsing advances from localStorage:", error);
      }
    }

    // Load absences from localStorage
    const savedAbsences = localStorage.getItem("absences");
    if (savedAbsences) {
      try {
        const parsedAbsences = JSON.parse(savedAbsences);
        if (Array.isArray(parsedAbsences) && parsedAbsences.length > 0) {
          setAbsences(parsedAbsences);
        }
      } catch (error) {
        console.error("Error parsing absences from localStorage:", error);
      }
    }

    // Fetch employers from API
    const fetchEmployers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/employers`);
        if (res.data.success) setEmployers(res.data.employers);
      } catch (err) {
        console.error("خطأ أثناء جلب الموظفين:", err);
      }
    };
    fetchEmployers();
  }, []);

  // Save to localStorage whenever articles change
  useEffect(() => {
    const hasArticleData = articles.some(article => article.name || article.price);
    if (hasArticleData) {
      localStorage.setItem("articles", JSON.stringify(articles));
    }
  }, [articles]);

  // Save to localStorage whenever advances change
  useEffect(() => {
    const hasAdvanceData = advances.some(advance => advance.name || advance.advance);
    if (hasAdvanceData) {
      localStorage.setItem("advances", JSON.stringify(advances));
    }
  }, [advances]);

  // Save to localStorage whenever absences change
  useEffect(() => {
    const hasAbsenceData = absences.some(absence => absence.name || absence.startDate);
    if (hasAbsenceData) {
      localStorage.setItem("absences", JSON.stringify(absences));
    }
  }, [absences]);

  // Total price calculation
  useEffect(() => {
    const total = articles.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    setTotalArticles(total);
  }, [articles]);

  const handleArticleChange = (index, field, value) => {
    const updated = [...articles];
    updated[index][field] = value;
    
    // إذا تم إدخال اسم أو سعر، إضافة التاريخ والوقت
    if ((field === "name" || field === "price") && value) {
      const { date, time } = getCurrentDateTime();
      updated[index].date = date;
      updated[index].time = time;
    }
    
    setArticles(updated);
  };

  const handleAdvanceChange = (index, field, value) => {
    const updated = [...advances];
    updated[index][field] = value;

    if (field === "name") {
      const emp = employers.find(e => e.fullName === value);
      if (emp) {
        updated[index].salary = emp.weeklySalary;
        updated[index].remaining = emp.weeklySalary;
        
        const totalTaken = updated
          .filter(a => a.name === value && a.advance)
          .reduce((sum, a) => sum + (parseFloat(a.advance) || 0), 0);
        
        updated[index].remaining = emp.weeklySalary - totalTaken;
      }
    }

    if (field === "advance") {
      const selectedName = updated[index].name;
      if (selectedName) {
        const totalTaken = updated
          .filter(a => a.name === selectedName)
          .reduce((sum, a, idx2) => {
            const advanceValue = idx2 === index ? (parseFloat(value) || 0) : (parseFloat(a.advance) || 0);
            return sum + advanceValue;
          }, 0);
        
        const emp = employers.find(e => e.fullName === selectedName);
        if (emp) {
          updated[index].remaining = emp.weeklySalary - totalTaken;
          updated[index].salary = emp.weeklySalary;
        }
        
        // إضافة التاريخ والوقت عند إدخال السلفة
        const { date, time } = getCurrentDateTime();
        updated[index].date = date;
        updated[index].time = time;
      }
    }

    setAdvances(updated);
  };

  const handleAbsenceChange = (index, field, value) => {
    const updated = [...absences];
    updated[index][field] = value;

    // Calculate days if startDate or endDate changes
    if ((field === "startDate" || field === "endDate") && updated[index].startDate && updated[index].endDate) {
      const start = new Date(updated[index].startDate);
      const end = new Date(updated[index].endDate);
      
      // Calculate difference in days (including both start and end)
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      updated[index].days = diffDays;
      
      // إضافة التاريخ والوقت عند إدخال تاريخ الغياب
      const { date, time } = getCurrentDateTime();
      updated[index].date = date;
      updated[index].time = time;
    }

    setAbsences(updated);
  };

  const addAdvanceRow = () => {
    setAdvances([...advances, { id: Date.now(), name: "", advance: "", salary: 0, remaining: 0, date: "", time: "" }]);
  };

  const addArticleRow = () => {
    setArticles([...articles, { id: Date.now(), name: "", price: "", date: "", time: "" }]);
  };

  const addAbsenceRow = () => {
    setAbsences([...absences, { id: Date.now(), name: "", startDate: "", endDate: "", days: 0, reason: "", date: "", time: "" }]);
  };

  const confirmDelete = (action, item, table) => {
    setDeleteAction(() => action);
    setEditingItem(item);
    setEditingTable(table);
    setShowDeleteModal(true);
    setSecurityCode("");
    setErrorMessage("");
  };

  const confirmEdit = (action, item, table) => {
    setEditAction(() => action);
    setEditingItem(item);
    setEditingTable(table);
    setShowEditModal(true);
    setSecurityCode("");
    setErrorMessage("");
  };

  const executeAction = (isDelete = false) => {
    if (securityCode === "2345") {
      if (isDelete) {
        deleteAction(editingItem, editingTable);
        setShowDeleteModal(false);
      } else {
        editAction(editingItem, editingTable);
        setShowEditModal(false);
        setSuccessMessage("تم حفظ التعديلات بنجاح!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
      setSecurityCode("");
      setEditingItem(null);
      setEditingTable("");
    } else {
      setErrorMessage("الكود غير صحيح. يرجى المحاولة مرة أخرى.");
    }
  };

  const saveItem = (item, table) => {
    // Make the item read-only by setting a flag
    const updatedItem = { ...item, isSaved: true };
    
    if (table === "articles") {
      const updatedArticles = articles.map(article => 
        article.id === item.id ? updatedItem : article
      );
      setArticles(updatedArticles);
      localStorage.setItem("articles", JSON.stringify(updatedArticles));
    } else if (table === "advances") {
      const updatedAdvances = advances.map(advance => 
        advance.id === item.id ? updatedItem : advance
      );
      setAdvances(updatedAdvances);
      localStorage.setItem("advances", JSON.stringify(updatedAdvances));
    } else if (table === "absences") {
      const updatedAbsences = absences.map(absence => 
        absence.id === item.id ? updatedItem : absence
      );
      setAbsences(updatedAbsences);
      localStorage.setItem("absences", JSON.stringify(updatedAbsences));
    }
    
    setSuccessMessage("تم حفظ العنصر بنجاح!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const editItem = (item, table) => {
    // Remove the saved flag to make it editable again
    const updatedItem = { ...item, isSaved: false };
    
    if (table === "articles") {
      const updatedArticles = articles.map(article => 
        article.id === item.id ? updatedItem : article
      );
      setArticles(updatedArticles);
    } else if (table === "advances") {
      const updatedAdvances = advances.map(advance => 
        advance.id === item.id ? updatedItem : advance
      );
      setAdvances(updatedAdvances);
    } else if (table === "absences") {
      const updatedAbsences = absences.map(absence => 
        absence.id === item.id ? updatedItem : absence
      );
      setAbsences(updatedAbsences);
    }
  };

  const deleteItem = (item, table) => {
    if (table === "articles") {
      const updatedArticles = articles.filter(article => article.id !== item.id);
      setArticles(updatedArticles.length > 0 ? updatedArticles : [{ id: Date.now(), name: "", price: "", date: "", time: "" }]);
      localStorage.setItem("articles", JSON.stringify(updatedArticles));
    } else if (table === "advances") {
      const updatedAdvances = advances.filter(advance => advance.id !== item.id);
      setAdvances(updatedAdvances.length > 0 ? updatedAdvances : [{ id: Date.now(), name: "", advance: "", salary: 0, remaining: 0, date: "", time: "" }]);
      localStorage.setItem("advances", JSON.stringify(updatedAdvances));
    } else if (table === "absences") {
      const updatedAbsences = absences.filter(absence => absence.id !== item.id);
      setAbsences(updatedAbsences.length > 0 ? updatedAbsences : [{ id: Date.now(), name: "", startDate: "", endDate: "", days: 0, reason: "", date: "", time: "" }]);
      localStorage.setItem("absences", JSON.stringify(updatedAbsences));
    }
    
    setSuccessMessage("تم حذف العنصر بنجاح!");
    setTimeout(() => setSuccessMessage(""), 3000);
  };

  const clearArticles = () => {
    setArticles([{ id: Date.now(), name: "", price: "", date: "", time: "" }]);
    localStorage.removeItem("articles");
  };

  const clearAdvances = () => {
    setAdvances([{ id: Date.now(), name: "", advance: "", salary: 0, remaining: 0, date: "", time: "" }]);
    localStorage.removeItem("advances");
  };

  const clearAbsences = () => {
    setAbsences([{ id: Date.now(), name: "", startDate: "", endDate: "", days: 0, reason: "", date: "", time: "" }]);
    localStorage.removeItem("absences");
  };

  // Calculate total absence days per employee
  const getTotalAbsenceDays = (employeeName) => {
    return absences
      .filter(absence => absence.name === employeeName && absence.days > 0)
      .reduce((total, absence) => total + absence.days, 0);
  };

  return (
    <div className="p-5 bg-gray-50 min-h-screen">
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold text-red-600 mb-4">تأكيد الحذف</h3>
            <p className="mb-4">يرجى إدخال الكود <span className="font-bold">2345</span> لتأكيد عملية الحذف:</p>
            <input
              type="password"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded mb-2"
              placeholder="أدخل الكود هنا"
            />
            {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                إلغاء
              </button>
              <button
                onClick={() => executeAction(true)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Confirmation Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-xl font-bold text-blue-600 mb-4">تأكيد التعديل</h3>
            <p className="mb-4">يرجى إدخال الكود <span className="font-bold">2345</span> لتأكيد عملية التعديل:</p>
            <input
              type="password"
              value={securityCode}
              onChange={(e) => setSecurityCode(e.target.value)}
              className="border border-gray-300 p-2 w-full rounded mb-2"
              placeholder="أدخل الكود هنا"
            />
            {errorMessage && <p className="text-red-500 mb-2">{errorMessage}</p>}
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowEditModal(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 transition"
              >
                إلغاء
              </button>
              <button
                onClick={() => executeAction(false)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                تأكيد التعديل
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50">
          {successMessage}
        </div>
      )}

      <h1 className="text-2xl font-bold text-center mb-8 text-gray-800">نظام إدارة الموظفين</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* المواد المستعملة */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-blue-700">📦 المواد المستعملة</h2>
            <div className="flex gap-2">
              <button onClick={addArticleRow} className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition">
                ➕ إضافة
              </button>
              <button onClick={() => confirmDelete(clearArticles, null, "articles")} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">
                🗑 مسح الكل
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-blue-100">
                  <th className="border border-blue-200 p-2 text-right">المادة</th>
                  <th className="border border-blue-200 p-2 text-right">السعر</th>
                  <th className="border border-blue-200 p-2 text-right">التاريخ</th>
                  <th className="border border-blue-200 p-2 text-right">الوقت</th>
                  <th className="border border-blue-200 p-2 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {articles.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-blue-50">
                    <td className="border border-blue-200 p-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={e => handleArticleChange(idx, "name", e.target.value)}
                        className="border border-gray-300 p-1 w-full rounded"
                        placeholder="اسم المادة"
                        readOnly={item.isSaved}
                      />
                    </td>
                    <td className="border border-blue-200 p-2">
                      <input
                        type="number"
                        value={item.price}
                        onChange={e => handleArticleChange(idx, "price", e.target.value)}
                        className="border border-gray-300 p-1 w-full rounded"
                        placeholder="السعر"
                        readOnly={item.isSaved}
                      />
                    </td>
                    <td className="border border-blue-200 p-2 text-center text-sm">{item.date || "-"}</td>
                    <td className="border border-blue-200 p-2 text-center text-sm">{item.time || "-"}</td>
                    <td className="border border-blue-200 p-2 text-center">
                      <div className="flex justify-center gap-1">
                        {!item.isSaved ? (
                          <button 
                            onClick={() => saveItem(item, "articles")}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition"
                          >
                            حفظ
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => confirmEdit(editItem, item, "articles")}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition"
                            >
                              تعديل
                            </button>
                            <button 
                              onClick={() => confirmDelete(deleteItem, item, "articles")}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
                            >
                              حذف
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 font-bold text-blue-800 text-center p-2 bg-blue-100 rounded">
            الإجمالي: {totalArticles} درهم
          </div>
        </div>

        {/* السلف للموظفين */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-green-700">💵 السلف للموظفين</h2>
            <div className="flex gap-2">
              <button onClick={addAdvanceRow} className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 transition">
                ➕ إضافة
              </button>
              <button onClick={() => confirmDelete(clearAdvances, null, "advances")} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">
                🗑 مسح الكل
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-green-100">
                  <th className="border border-green-200 p-2 text-right">اسم الموظف</th>
                  <th className="border border-green-200 p-2 text-right">السلفة</th>
                  <th className="border border-green-200 p-2 text-right">الباقي</th>
                  <th className="border border-green-200 p-2 text-right">التاريخ</th>
                  <th className="border border-green-200 p-2 text-right">الوقت</th>
                  <th className="border border-green-200 p-2 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {advances.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-green-50">
                    <td className="border border-green-200 p-2">
                      <select
                        value={item.name}
                        onChange={e => handleAdvanceChange(idx, "name", e.target.value)}
                        className="border border-gray-300 p-1 w-full rounded"
                        disabled={item.isSaved}
                      >
                        <option value="">اختر موظف</option>
                        {employers.map(emp => <option key={emp._id} value={emp.fullName}>{emp.fullName}</option>)}
                      </select>
                    </td>
                    <td className="border border-green-200 p-2">
                      <input
                        type="number"
                        value={item.advance}
                        onChange={e => handleAdvanceChange(idx, "advance", e.target.value)}
                        className="border border-gray-300 p-1 w-full rounded"
                        placeholder="المبلغ"
                        readOnly={item.isSaved}
                      />
                    </td>
                    <td className="border border-green-200 p-2 text-center">{item.remaining} درهم</td>
                    <td className="border border-green-200 p-2 text-center text-sm">{item.date || "-"}</td>
                    <td className="border border-green-200 p-2 text-center text-sm">{item.time || "-"}</td>
                    <td className="border border-green-200 p-2 text-center">
                      <div className="flex justify-center gap-1">
                        {!item.isSaved ? (
                          <button 
                            onClick={() => saveItem(item, "advances")}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition"
                          >
                            حفظ
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => confirmEdit(editItem, item, "advances")}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition"
                            >
                              تعديل
                            </button>
                            <button 
                              onClick={() => confirmDelete(deleteItem, item, "advances")}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
                            >
                              حذف
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* إدارة الغياب */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-purple-700">📅 إدارة الغياب</h2>
            <div className="flex gap-2">
              <button onClick={addAbsenceRow} className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600 transition">
                ➕ إضافة
              </button>
              <button onClick={() => confirmDelete(clearAbsences, null, "absences")} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition">
                🗑 مسح الكل
              </button>
            </div>
          </div>
          
          <div className="overflow-x-auto max-h-96">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-purple-100">
                  <th className="border border-purple-200 p-2 text-right">اسم الموظف</th>
                  <th className="border border-purple-200 p-2 text-right">من</th>
                  <th className="border border-purple-200 p-2 text-right">إلى</th>
                  <th className="border border-purple-200 p-2 text-right">الأيام</th>
                  <th className="border border-purple-200 p-2 text-right">التاريخ</th>
                  <th className="border border-purple-200 p-2 text-right">الوقت</th>
                  <th className="border border-purple-200 p-2 text-right">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {absences.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-purple-50">
                    <td className="border border-purple-200 p-2">
                      <select
                        value={item.name}
                        onChange={e => handleAbsenceChange(idx, "name", e.target.value)}
                        className="border border-gray-300 p-1 w-full rounded"
                        disabled={item.isSaved}
                      >
                        <option value="">اختر موظف</option>
                        {employers.map(emp => <option key={emp._id} value={emp.fullName}>{emp.fullName}</option>)}
                      </select>
                    </td>
                    <td className="border border-purple-200 p-2">
                      <input
                        type="date"
                        value={item.startDate}
                        onChange={e => handleAbsenceChange(idx, "startDate", e.target.value)}
                        className="border border-gray-300 p-1 w-full rounded"
                        readOnly={item.isSaved}
                      />
                    </td>
                    <td className="border border-purple-200 p-2">
                      <input
                        type="date"
                        value={item.endDate}
                        onChange={e => handleAbsenceChange(idx, "endDate", e.target.value)}
                        className="border border-gray-300 p-1 w-full rounded"
                        readOnly={item.isSaved}
                      />
                    </td>
                    <td className="border border-purple-200 p-2 text-center">{item.days} يوم</td>
                    <td className="border border-purple-200 p-2 text-center text-sm">{item.date || "-"}</td>
                    <td className="border border-purple-200 p-2 text-center text-sm">{item.time || "-"}</td>
                    <td className="border border-purple-200 p-2 text-center">
                      <div className="flex justify-center gap-1">
                        {!item.isSaved ? (
                          <button 
                            onClick={() => saveItem(item, "absences")}
                            className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 transition"
                          >
                            حفظ
                          </button>
                        ) : (
                          <>
                            <button 
                              onClick={() => confirmEdit(editItem, item, "absences")}
                              className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600 transition"
                            >
                              تعديل
                            </button>
                            <button 
                              onClick={() => confirmDelete(deleteItem, item, "absences")}
                              className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600 transition"
                            >
                              حذف
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* إجمالي أيام الغياب */}
      <div className="mt-8 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-lg font-bold text-gray-700 mb-4 text-center">📊 إجمالي أيام الغياب لكل موظف</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {employers.map(emp => (
            <div key={emp._id} className="bg-gray-100 p-3 rounded-lg shadow-sm text-center">
              <div className="font-bold text-gray-800">{emp.fullName}</div>
              <div className="text-blue-600 font-semibold">{getTotalAbsenceDays(emp.fullName)} يوم</div>
            </div>
          ))}
        </div>
      </div>

      {/* تاريخ ووقت النظام */}
      <div className="mt-4 text-center text-sm text-gray-500">
        آخر تحديث: {new Date().toLocaleString('ar-EG')}
      </div>
    </div>
  );
};

export default EmployerPage;