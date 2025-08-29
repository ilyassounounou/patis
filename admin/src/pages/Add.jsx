import React, { useCallback, useState } from "react";
import upload_icon from "../assets/upload_icon.png";
import axios from "axios";
import { backend_url } from "../App";
import { toast } from "react-toastify";

const Add = ({ token }) => {
  const [image, setImage] = useState(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("10");
  const [category, setCategory] = useState("حلويات");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const onSubmitHandler = useCallback(
    async (e) => {
      e.preventDefault();
      setIsSubmitting(true);
      
      try {
        const formData = new FormData();
        formData.append("name", name);
        formData.append("price", price);
        formData.append("category", category);
        if (image) formData.append("image", image);

        const response = await axios.post(
          `${backend_url}/api/product/add`,
          formData,
          { headers: { token } }
        );

        if (response.data.success) {
          toast.success(response.data.message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
          setName("");
          setPrice("10");
          setCategory("حلويات");
          setImage(null);
        } else {
          toast.error(response.data.message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          });
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "حدث خطأ أثناء إضافة المنتج",
          {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, price, category, image, token]
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900">إضافة منتج جديد</h2>
            <p className="mt-2 text-gray-600">املأ المعلومات أدناه لإضافة منتج جديد إلى المتجر</p>
          </div>
          
          <form onSubmit={onSubmitHandler} className="space-y-6">
            {/* الاسم */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                اسم المنتج
              </label>
              <input
                id="name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                type="text"
                placeholder="مثال: كرواسون"
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                required
              />
            </div>

            {/* السعر */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                السعر بالدرهم
              </label>
              <div className="relative w-32">
                <input
                  id="price"
                  onChange={(e) => setPrice(e.target.value)}
                  value={price}
                  type="number"
                  min="1"
                  step="0.5"
                  className="block w-full pl-3 pr-10 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  required
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">درهم</span>
                </div>
              </div>
            </div>

            {/* التصنيف */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                تصنيف المنتج
              </label>
              <select
                id="category"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
              >
                <option value="حلويات">حلويات</option>
                <option value="مملحات">مملحات</option>
                <option value="مشروبات">مشروبات</option>
                <option value="معجنات">معجنات</option>
              </select>
            </div>

            {/* الصورة */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                صورة المنتج
              </label>
              <label htmlFor="image" className="cursor-pointer">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 transition duration-200 flex items-center justify-center overflow-hidden">
                      {image ? (
                        <img
                          src={URL.createObjectURL(image)}
                          alt="Product preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="text-center p-4">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-500 mt-1 block">اضغط للرفع</span>
                        </div>
                      )}
                    </div>
                    {image && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setImage(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <div className="text-gray-500 text-sm">
                    <p>الصيغ المدعومة: JPG, PNG</p>
                    <p>الحجم الأقصى: 5MB</p>
                  </div>
                </div>
                <input
                  onChange={handleImageChange}
                  type="file"
                  id="image"
                  accept="image/*"
                  className="hidden"
                />
              </label>
            </div>

            {/* زر الإضافة */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    جاري الإضافة...
                  </span>
                ) : (
                  "إضافة المنتج"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Add;