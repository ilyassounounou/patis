import React, { useEffect, useState } from "react";
import axios from "axios";

const EmployerPage = () => {
  const [articles, setArticles] = useState([{ name: "", price: "" }]);
  const [totalArticles, setTotalArticles] = useState(0);
  const [employers, setEmployers] = useState([]);
  const [advances, setAdvances] = useState([{ name: "", advance: "", salary: 0, remaining: 0, date: "" }]);

  // ✅ Load data from localStorage & fetch employers
  useEffect(() => {
    // Load articles from localStorage
    const savedArticles = localStorage.getItem("articles");
    if (savedArticles) {
      try {
        const parsedArticles = JSON.parse(savedArticles);
        // Only set if we have valid data
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
        // Only set if we have valid data
        if (Array.isArray(parsedAdvances) && parsedAdvances.length > 0) {
          setAdvances(parsedAdvances);
        }
      } catch (error) {
        console.error("Error parsing advances from localStorage:", error);
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
    // Only save if we have at least one article with data
    const hasArticleData = articles.some(article => article.name || article.price);
    if (hasArticleData) {
      localStorage.setItem("articles", JSON.stringify(articles));
    }
  }, [articles]);

  // Save to localStorage whenever advances change
  useEffect(() => {
    // Only save if we have at least one advance with data
    const hasAdvanceData = advances.some(advance => advance.name || advance.advance);
    if (hasAdvanceData) {
      localStorage.setItem("advances", JSON.stringify(advances));
    }
  }, [advances]);

  // Total price calculation
  useEffect(() => {
    const total = articles.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0);
    setTotalArticles(total);
  }, [articles]);

  const handleArticleChange = (index, field, value) => {
    const updated = [...articles];
    updated[index][field] = value;
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
        
        // Calculate total advances for this employee
        const totalTaken = updated
          .filter(a => a.name === value && a.advance)
          .reduce((sum, a) => sum + (parseFloat(a.advance) || 0), 0);
        
        updated[index].remaining = emp.weeklySalary - totalTaken;
      }
    }

    if (field === "advance") {
      const selectedName = updated[index].name;
      if (selectedName) {
        // Calculate total advances for this employee
        const totalTaken = updated
          .filter(a => a.name === selectedName)
          .reduce((sum, a, idx2) => {
            const advanceValue = idx2 === index ? (parseFloat(value) || 0) : (parseFloat(a.advance) || 0);
            return sum + advanceValue;
          }, 0);
        
        // Find the employee to get their salary
        const emp = employers.find(e => e.fullName === selectedName);
        if (emp) {
          updated[index].remaining = emp.weeklySalary - totalTaken;
          updated[index].salary = emp.weeklySalary;
        }
        
        updated[index].date = new Date().toLocaleString();
      }
    }

    setAdvances(updated);
  };

  const addAdvanceRow = () => {
    setAdvances([...advances, { name: "", advance: "", salary: 0, remaining: 0, date: "" }]);
  };

  const addArticleRow = () => {
    setArticles([...articles, { name: "", price: "" }]);
  };

  const clearArticles = () => {
    if (window.confirm("هل أنت متأكد من مسح جميع المواد؟")) {
      setArticles([{ name: "", price: "" }]);
      localStorage.removeItem("articles");
    }
  };

  const clearAdvances = () => {
    if (window.confirm("هل أنت متأكد من مسح جميع السلف؟")) {
      setAdvances([{ name: "", advance: "", salary: 0, remaining: 0, date: "" }]);
      localStorage.removeItem("advances");
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-xl font-bold mb-4">📦 المواد المستعملة</h2>
      <table className="border w-full mb-4">
        <thead>
          <tr>
            <th className="border p-2">المادة</th>
            <th className="border p-2">السعر</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((item, idx) => (
            <tr key={idx}>
              <td className="border p-2">
                <input
                  type="text"
                  value={item.name}
                  onChange={e => handleArticleChange(idx, "name", e.target.value)}
                  className="border p-1 w-full"
                  placeholder="اسم المادة"
                />
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={item.price}
                  onChange={e => handleArticleChange(idx, "price", e.target.value)}
                  className="border p-1 w-full"
                  placeholder="السعر"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2 mb-2">
        <button onClick={addArticleRow} className="bg-blue-500 text-white px-4 py-2 rounded">➕ إضافة مادة</button>
        <button onClick={clearArticles} className="bg-red-500 text-white px-4 py-2 rounded">🗑 مسح المواد</button>
      </div>
      <div className="mt-2 font-bold">الإجمالي: {totalArticles} درهم</div>

      <hr className="my-6" />

      <h2 className="text-xl font-bold mb-4">💵 السلف للموظفين</h2>
      <table className="border w-full mb-4">
        <thead>
          <tr>
            <th className="border p-2">اسم الموظف</th>
            <th className="border p-2">السلفة</th>
            <th className="border p-2">الراتب</th>
            <th className="border p-2">الباقي</th>
            <th className="border p-2">التاريخ</th>
          </tr>
        </thead>
        <tbody>
          {advances.map((item, idx) => (
            <tr key={idx}>
              <td className="border p-2">
                <select
                  value={item.name}
                  onChange={e => handleAdvanceChange(idx, "name", e.target.value)}
                  className="border p-1 w-full"
                >
                  <option value="">اختر موظف</option>
                  {employers.map(emp => <option key={emp._id} value={emp.fullName}>{emp.fullName}</option>)}
                </select>
              </td>
              <td className="border p-2">
                <input
                  type="number"
                  value={item.advance}
                  onChange={e => handleAdvanceChange(idx, "advance", e.target.value)}
                  className="border p-1 w-full"
                  placeholder="المبلغ"
                />
              </td>
              <td className="border p-2">{item.salary} درهم</td>
              <td className="border p-2">{item.remaining} درهم</td>
              <td className="border p-2">{item.date || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex gap-2">
        <button onClick={addAdvanceRow} className="bg-green-500 text-white px-4 py-2 rounded">➕ إضافة سلفة</button>
        <button onClick={clearAdvances} className="bg-red-500 text-white px-4 py-2 rounded">🗑 مسح السلف</button>
      </div>
    </div>
  );
};

export default EmployerPage;