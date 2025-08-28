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

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const onSubmitHandler = useCallback(
    async (e) => {
      e.preventDefault();
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
          toast.success(response.data.message);
          setName("");
          setPrice("10");
          setCategory("حلويات");
          setImage(null);
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            "حدث خطأ أثناء إضافة المنتج"
        );
      }
    },
    [name, price, category, image, token]
  );

  return (
    <div className="px-2 sm:px-8 mt-2 sm:mt-14 pb-16">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-y-3 medium-14 lg:w-[777px]"
      >
        {/* الاسم */}
        <div className="w-full">
          <h5 className="h5">اسم المنتج</h5>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            type="text"
            placeholder="مثال: كرواسون"
            className="px-3 py-1.5 ring-1 ring-slate-900/10 rounded bg-white mt-1 w-full max-w-lg"
          />
        </div>

        {/* السعر */}
        <div className="w-full">
          <h5 className="h5">السعر بالدرهم</h5>
          <input
            onChange={(e) => setPrice(e.target.value)}
            value={price}
            type="number"
            placeholder="10"
            className="px-3 py-2 bg-white rounded max-w-24 ring-1 ring-slate-900/5"
          />
        </div>

        {/* التصنيف */}
        <div className="w-full">
          <h5 className="h5">تصنيف المنتج</h5>
          <select
            onChange={(e) => setCategory(e.target.value)}
            value={category}
            className="max-w-40 px-3 py-2 text-gray-30 ring-1 ring-slate-900/5 bg-white rounded"
          >
            <option value="حلويات">حلويات</option>
            <option value="مملحات">مملحات</option>
            <option value="مشروبات">مشروبات</option>
            <option value="معجنات">معجنات</option>
          </select>
        </div>

        {/* الصورة */}
        <div className="pt-2">
          <h5 className="h5 mb-2">صورة المنتج</h5>
          <label htmlFor="image">
            <img
              src={image ? URL.createObjectURL(image) : upload_icon}
              alt=""
              className="w-20 h-20 aspect-square object-cover ring-1 ring-slate-900/5 rounded-lg"
            />
            <input
              onChange={handleImageChange}
              type="file"
              id="image"
              hidden
            />
          </label>
        </div>

        {/* زر الإضافة */}
        <button type="submit" className="btn-dark mt-3 max-w-44 sm:w-full">
          إضافة المنتج
        </button>
      </form>
    </div>
  );
};

export default Add;
