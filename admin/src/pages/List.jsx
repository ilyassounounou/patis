import axios from "axios";
import React, { useEffect, useState } from "react";
import { backend_url, currency } from "../App";
import { toast } from "react-toastify";
import { TbTrash } from "react-icons/tb";
import { FaEdit } from "react-icons/fa";

const List = ({ token }) => {
  const [list, setList] = useState([]);

  const fetchList = async () => {
    try {
      const response = await axios.get(backend_url + "/api/product/list");
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backend_url + "/api/product/remove",
        { id },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="px-4 sm:px-8 sm:mt-14">
      <h2 className="text-2xl font-bold mb-6">📦 Product List</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
     {list.map((item) => (
  <div
    key={item._id}
    className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr] items-center gap-4 p-3 bg-white rounded-xl shadow hover:shadow-lg transition"
  >
    {/* Product Image */}
    <img
      src={item.image}
      alt={item.name}
      className="w-16 h-16 object-cover rounded-xl border"
    />

    {/* Product Name */}
    <h5 className="text-sm font-semibold truncate">{item.name}</h5>

    {/* Category */}
    <p className="text-xs text-gray-600">{item.category}</p>

    {/* Price */}
    <div className="text-sm font-bold text-green-600">
      {currency}{item.price}
    </div>

    {/* Actions */}
    <div className="flex items-center gap-3 justify-end">
      {/* Edit Button */}
      <button
        onClick={() => console.log("Edit product", item._id)}
        className="px-3 py-1 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
      >
        Edit
      </button>

      {/* Delete Button */}
      <TbTrash
        onClick={() => removeProduct(item._id)}
        className="cursor-pointer text-red-500 text-lg hover:text-red-700 transition"
      />
    </div>
  </div>
))}

      </div>
    </div>
  );
};

export default List;
