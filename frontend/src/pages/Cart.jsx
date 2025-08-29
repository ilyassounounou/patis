// ✅ Cart.jsx (fixed version)
import React, { useContext, useEffect, useState } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link, useNavigate } from "react-router-dom";
import CartTotal from "../components/CartTotal";
import axios from "axios";

const Cart = () => {
  const {
    cartItems,
    products,
    updateQuantity,
    currency,
    getCartAmount,
    backendUrl,
    token,
    clearCart,
    user
  } = useContext(ShopContext);

  const [cartProducts, setCartProducts] = useState([]);
  const [traditionalSweets, setTraditionalSweets] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const navigate = useNavigate();

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("ar-MA", {
      minimumFractionDigits: 2,
    }).format(amount) + " " + currency;
  };

useEffect(() => {
  const updatedCartProducts = [];
  const updatedTraditionalSweets = [];
  let total = 0;

  Object.keys(cartItems).forEach((itemId) => {
    if (itemId.startsWith("traditional_")) {
      const sweetId = itemId.replace("traditional_", "");
      const sweetDetails = cartItems[itemId];

      const sweetTotal = (sweetDetails.price || 0) * (sweetDetails.quantity || 1);

      updatedTraditionalSweets.push({
        id: itemId,
        name: sweetDetails.name || "حلوى تقليدية",
        price: sweetDetails.price || 0,
        quantity: sweetDetails.quantity || 1,
        weight: sweetDetails.weight || "1kg",
        total: sweetTotal,
        image: "/traditional-sweets.jpg",
      });

      total += sweetTotal;
    } else {
      const product = products.find((p) => p._id === itemId);
      if (product) {
        const productTotal = product.price * cartItems[itemId];
        updatedCartProducts.push({
          ...product,
          quantity: cartItems[itemId],
          total: productTotal,
        });

        total += productTotal;
      }
    }
  });

  setCartProducts(updatedCartProducts);
  setTraditionalSweets(updatedTraditionalSweets);
  setTotalAmount(total); // ✅ now sums both
}, [cartItems, products]);


  const handleRemove = (productId) => {
    updateQuantity(productId, 0);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    const quantity = Math.max(1, Math.min(99, parseInt(newQuantity) || 1));
    updateQuantity(productId, quantity);
  };

  const handlePlaceOrder = async () => {
    if (cartProducts.length === 0 && traditionalSweets.length === 0) return;
    setIsPlacingOrder(true);

    try {
      // تحضير عناصر الطلب (المنتجات العادية)
      const orderItems = cartProducts.map(product => ({
        productId: product._id,
        name: product.name,
        quantity: product.quantity,
        price: product.price,
        image: Array.isArray(product.image) ? product.image[0] : product.image || "/no-image.png",
      }));

      // إضافة الحلويات التقليدية إلى الطلب
      traditionalSweets.forEach(sweet => {
        orderItems.push({
          productId: sweet.id,
          name: `${sweet.name} (${sweet.weight})`,
          quantity: sweet.quantity,
          price: sweet.price,
          image: sweet.image,
          isTraditional: true
        });
      });

      const response = await axios.post(
        `${backendUrl}/api/orders/place`,
        {
          items: orderItems,
          amount: totalAmount,
          address: "no-address",
        },
        {
          headers: {
            token,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        clearCart();
        navigate("/orders", { state: { newOrder: response.data.orderData } });
      } else {
        throw new Error(response.data.message || "Failed to place order");
      }
    } catch (error) {
      console.error("Order Error:", error.response?.data || error.message);
      alert(`خطأ في تقديم الطلب: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (cartProducts.length === 0 && traditionalSweets.length === 0) {
    return (
      <div className="max-padd-container py-10 text-center">
        <h2 className="bold-24 mb-4">سلتك فارغة</h2>
        <Link to="/collection" className="btn-dark inline-block">
          متابعة التسوق
        </Link>
      </div>
    );
  }

  return (
    <div className="max-padd-container py-10">
      <h2 className="bold-24 mb-10">عربة التسوق</h2>
      
      <div className="flex flex-col lg:flex-row gap-10">
        {/* عرض المنتجات */}
        <div className="flex-1">
          {/* عرض الحلويات التقليدية إذا كانت موجودة */}
          {traditionalSweets.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-4">الحلويات المغربية التقليدية</h3>
              {traditionalSweets.map((sweet) => (
                <div key={sweet.id} className="flex flex-col sm:flex-row gap-4 border-b py-6">
                  <div className="w-full sm:w-1/4">
                    <img
                      src={sweet.image}
                      alt={sweet.name}
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="medium-16 mb-1">{sweet.name} - {sweet.weight}</h3>
                      <button
                        onClick={() => handleRemove(sweet.id)}
                        className="text-red-600 hover:text-red-800 text-sm transition"
                      >
                        × إزالة
                      </button>
                    </div>
                    <p className="text-gray-600 mb-2">حلويات تقليدية</p>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="bold-16">الكمية:</span>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={sweet.quantity}
                        onChange={(e) => handleQuantityChange(sweet.id, e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-center"
                      />
                    </div>
                    <p className="text-gray-700">سعر الوحدة: {formatPrice(sweet.price)}</p>
                    <p className="bold-18 mt-2">الإجمالي: {formatPrice(sweet.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* عرض المنتجات العادية إذا كانت موجودة */}
          {cartProducts.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">المنتجات العادية</h3>
              {cartProducts.map((product) => (
                <div key={product._id} className="flex flex-col sm:flex-row gap-4 border-b py-6">
                  <div className="w-full sm:w-1/4">
                    <img
                      src={Array.isArray(product.image) ? product.image[0] : product.image || "/no-image.png"}
                      alt={product.name}
                      className="w-full h-auto object-cover rounded-lg"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="medium-16 mb-1">{product.name}</h3>
                      <button
                        onClick={() => handleRemove(product._id)}
                        className="text-red-600 hover:text-red-800 text-sm transition"
                      >
                        × إزالة
                      </button>
                    </div>
                    <p className="text-gray-600 mb-2">{product.category}</p>
                    <div className="flex items-center gap-4 mb-3">
                      <span className="bold-16">الكمية:</span>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={product.quantity}
                        onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                        className="w-16 px-2 py-1 border rounded text-center"
                      />
                    </div>
                    <p className="text-gray-700">سعر الوحدة: {formatPrice(product.price)}</p>
                    <p className="bold-18 mt-2">الإجمالي: {formatPrice(product.total)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* عرض الإجمالي وأزرار الطلب (تظهر دائماً إذا كانت هناك أي منتجات) */}
        {(cartProducts.length > 0 || traditionalSweets.length > 0) && (
          <div className="lg:w-1/3">
            <CartTotal total={totalAmount} />
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className={`btn-dark w-full mt-6 text-center block py-3 ${isPlacingOrder ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {isPlacingOrder ? "جاري معالجة الطلب..." : "إتمام الطلب"}
            </button>
            <Link to="/collection" className="btn-outline w-full mt-4 text-center block py-3">
              متابعة التسوق
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;