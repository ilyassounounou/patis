import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";

const CartTotal = () => {
  const { currency, getCartAmount } = useContext(ShopContext);
  const amount = getCartAmount();

  return (
    <section className="w-full bg-white rounded-xl shadow p-5">
      <h3 className="text-lg font-semibold mb-4">ملخص الطلب</h3>

      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-700">المجموع الفرعي:</span>
        <span className="font-medium">
          {currency} {amount.toFixed(2)}
        </span>
      </div>

      <hr className="my-2" />

      <div className="flex justify-between items-center">
        <span className="text-gray-900 font-semibold">الإجمالي:</span>
        <span className="text-lg font-bold">
          {currency} {amount.toFixed(2)}
        </span>
      </div>
    </section>
  );
};

export default CartTotal;
