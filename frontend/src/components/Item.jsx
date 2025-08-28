import React from "react";

const Item = ({ product, selectedProducts, setSelectedProducts, currency }) => {
  const qty = selectedProducts[product._id] || 0;

  const handleQtyChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setSelectedProducts((prev) => ({
      ...prev,
      [product._id]: value,
    }));
  };

  const imageSrc = Array.isArray(product.image)
    ? product.image[0]
    : product.image || "/no-image.png";

  return (
    <div className="bg-white p-4 rounded-lg shadow flex flex-col justify-between">
      <img
        src={imageSrc}
        alt={product.name}
        className="w-full h-40 object-cover rounded mb-4"
      />
      <h3 className="text-lg font-semibold mb-1">{product.name}</h3>
      <p className="text-gray-500 text-sm mb-1">{product.category}</p>
      <p className="font-bold text-primary mb-2">
        {product.price} {currency}
      </p>

      <input
        type="number"
        min="0"
        value={qty}
        onChange={handleQtyChange}
        className="border rounded px-2 py-1 text-sm mb-2"
        placeholder="الكمية"
      />

      <p className="text-sm text-gray-600">
        الإجمالي: {qty * product.price} {currency}
      </p>
    </div>
  );
};

export default Item;
