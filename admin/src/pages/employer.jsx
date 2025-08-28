import React, { useState, useEffect } from "react";
import axios from "axios";
import { backend_url } from "../App";
import { toast } from "react-toastify";
import { TbTrash } from "react-icons/tb";

const Employer = ({ token }) => {
  const [employers, setEmployers] = useState([]);
  const [formData, setFormData] = useState({
    fullName: "",
    cin: "",
    birthDate: "",
    jobCategory: "Boulanger",
    weeklySalary: ""
  });

  const fetchEmployers = async () => {
    try {
      const res = await axios.get(`${backend_url}/api/employers`, {
        headers: { token }
      });
      if (res.data.success) {
        setEmployers(res.data.employers);
      }
    } catch {
      toast.error("خطأ أثناء جلب الموظفين");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${backend_url}/api/employers`, formData, {
        headers: { token }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setFormData({
          fullName: "",
          cin: "",
          birthDate: "",
          jobCategory: "Boulanger",
          weeklySalary: ""
        });
        fetchEmployers();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "خطأ في الإضافة");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل تريد حذف هذا الموظف ؟")) return;
    try {
      const res = await axios.delete(`${backend_url}/api/employers/${id}`, {
        headers: { token }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchEmployers();
      }
    } catch {
      toast.error("خطأ في الحذف");
    }
  };

  useEffect(() => {
    fetchEmployers();
  }, []);

  return (
    <div className="px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">👨‍🍳 إدارة الموظفين</h1>

      {/* Ajouter */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input required className="border p-2 rounded" placeholder="الاسم الكامل"
          value={formData.fullName} onChange={e => setFormData({...formData, fullName:e.target.value})} />
        <input required className="border p-2 rounded" placeholder="CIN"
          value={formData.cin} onChange={e => setFormData({...formData, cin:e.target.value})} />
        <input required type="date" className="border p-2 rounded"
          value={formData.birthDate} onChange={e => setFormData({...formData, birthDate:e.target.value})} />
        <select className="border p-2 rounded"
          value={formData.jobCategory} onChange={e => setFormData({...formData, jobCategory:e.target.value})}>
          <option value="Boulanger">Boulanger</option>
          <option value="Pâtissier">Pâtissier</option>
          <option value="Plongeur">Plongeur</option>
          <option value="Vendeur">Vendeur</option>
          <option value="Manager">Manager</option>
        </select>
        <input required type="number" className="border p-2 rounded" placeholder="Salaire (DH)"
          value={formData.weeklySalary} onChange={e => setFormData({...formData, weeklySalary:e.target.value})} />

        <button type="submit" className="col-span-full bg-blue-600 text-white rounded py-2 mt-2">
          ➕ إضافة موظف
        </button>
      </form>

      {/* Liste */}
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">📋 قائمة الموظفين</h2>
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="border p-2">الاسم</th>
              <th className="border p-2">CIN</th>
              <th className="border p-2">العمر</th>
              <th className="border p-2">المنصب</th>
              <th className="border p-2">الراتب</th>
              <th className="border p-2">حذف</th>
            </tr>
          </thead>
          <tbody>
            {employers.map((emp) => (
              <tr key={emp._id}>
                <td className="border p-2">{emp.fullName}</td>
                <td className="border p-2">{emp.cin}</td>
                <td className="border p-2">{emp.age}</td>
                <td className="border p-2">{emp.jobCategory}</td>
                <td className="border p-2">{emp.weeklySalary} DH</td>
                <td className="border p-2 text-center">
                  <button onClick={() => handleDelete(emp._id)}><TbTrash className="text-red-600" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Employer;
