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
    <div className="px-4 sm:px-8 py-8">
      <h2 className="text-2xl font-bold mb-6">📦 Product List</h2>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((item) => (
          <div
            key={item._id}
            className="flex flex-col bg-white rounded-xl shadow-md hover:shadow-lg transition overflow-hidden"
          >
            {/* Product Image */}
            <div className="h-48 w-full flex items-center justify-center bg-gray-100 p-4">
              <img
                src={item.image}
                alt={item.name}
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Product Details */}
            <div className="p-4 flex flex-col flex-grow">
              <h5 className="text-sm font-semibold mb-1 line-clamp-2 h-10">
                {item.name}
              </h5>
              <p className="text-xs text-gray-600 mb-2">{item.category}</p>
              
              <div className="mt-auto flex items-center justify-between">
                {/* Price */}
                <div className="text-sm font-bold text-green-600">
                  {currency}
                  {item.price}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  {/* Edit Button */}
                  <button
                    onClick={() => console.log("Edit product", item._id)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-full transition"
                  >
                    <FaEdit className="text-lg" />
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => removeProduct(item._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition"
                  >
                    <TbTrash className="text-lg" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default List;