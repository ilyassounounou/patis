import React, { useContext, useEffect, useState } from "react";
import Search from "../components/Search";
import { ShopContext } from "../context/ShopContext";
import Item from "../components/Item";

const Collection = () => {
  const { products, search, addToCart, cartItems, currency } = useContext(ShopContext);
  const [category, setCategory] = useState([]);
  const [sortType, setSortType] = useState("relevant");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedProducts, setSelectedProducts] = useState({});
  const [added, setAdded] = useState(false);
  // الحلويات التقليدية المغربية
  const [traditionalSweets, setTraditionalSweets] = useState([
    { id: 1, name: "حلوة السابلية", basePrice: 90, selectedWeight: "1kg", quantity: 1 },
    { id: 2, name: "حلوة اللوز", basePrice: 150, selectedWeight: "1kg", quantity: 1 },
    { id: 3, name: "الكعبة", basePrice: 170, selectedWeight: "1kg", quantity: 1 },
    { id: 4, name: "فقاص برستيج", basePrice: 170, selectedWeight: "1kg", quantity: 1 }
  ]);
  const [selectedTraditionalSweets, setSelectedTraditionalSweets] = useState({});

  useEffect(() => {
    const storedSelected = localStorage.getItem("selectedProducts");
    if (storedSelected) {
      setSelectedProducts(JSON.parse(storedSelected));
    }
    
    const storedTraditional = localStorage.getItem("selectedTraditionalSweets");
    if (storedTraditional) {
      setSelectedTraditionalSweets(JSON.parse(storedTraditional));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedProducts", JSON.stringify(selectedProducts));
    localStorage.setItem("selectedTraditionalSweets", JSON.stringify(selectedTraditionalSweets));
  }, [selectedProducts, selectedTraditionalSweets]);

  const toggleFilter = (value, setState) => {
    setState((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  const applyFilter = () => {
    let filtered = [...products];

    if (search) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category.length) {
      filtered = filtered.filter((product) =>
        category.includes(product.category)
      );
    }

    return filtered;
  };

  const applySorting = (productList) => {
    const sortedList = [...productList];
    switch (sortType) {
      case "low":
        return sortedList.sort((a, b) => a.price - b.price);
      case "high":
        return sortedList.sort((a, b) => b.price - a.price);
      default:
        return sortedList;
    }
  };

  useEffect(() => {
    const filtered = applyFilter();
    const sorted = applySorting(filtered);
    setFilteredProducts(sorted);
    setCurrentPage(1);
  }, [category, sortType, products, search]);

  const getPaginatedProducts = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  const handleAddAllToCart = () => {
    Object.entries(selectedProducts).forEach(([productId, qty]) => {
      if (!cartItems[productId]) {
        addToCart(productId, qty);
      }
    });
    
    Object.entries(selectedTraditionalSweets).forEach(([sweetId, details]) => {
      const sweet = traditionalSweets.find(s => s.id.toString() === sweetId);
      if (sweet && !cartItems[`traditional_${sweetId}`]) {
        // إضافة الحلوى التقليدية إلى السلة
        addToCart(`traditional_${sweetId}`, details.quantity, {
          name: sweet.name,
          price: calculateSweetPrice(sweet.basePrice, details.selectedWeight),
          weight: details.selectedWeight
        });
      }
    });
    
    setAdded(true);
  };

  const getTotalAmount = () => {
    const regularProductsTotal = Object.entries(selectedProducts).reduce((total, [productId, qty]) => {
      const product = products.find(p => p._id === productId);
      return product ? total + product.price * qty : total;
    }, 0);
    
    const traditionalSweetsTotal = Object.entries(selectedTraditionalSweets).reduce((total, [sweetId, details]) => {
      const sweet = traditionalSweets.find(s => s.id.toString() === sweetId);
      if (sweet) {
        return total + (calculateSweetPrice(sweet.basePrice, details.selectedWeight) * details.quantity);
      }
      return total;
    }, 0);
    
    return regularProductsTotal + traditionalSweetsTotal;
  };

  // حساب سعر الحلوى بناءً على الوزن المختار
  const calculateSweetPrice = (basePrice, weight) => {
    const weightFactors = {
      "500g": 0.5,
      "700g": 0.7,
      "1kg": 1,
      "1.5kg": 1.5,
      "2kg": 2,
      "2.5kg": 2.5
    };
    
    return basePrice * (weightFactors[weight] || 1);
  };

  // تحديث اختيار الحلوى التقليدية
  const updateTraditionalSweetSelection = (sweetId, weight, quantity) => {
    setSelectedTraditionalSweets(prev => ({
      ...prev,
      [sweetId]: { selectedWeight: weight, quantity: parseInt(quantity) || 1 }
    }));
  };

  const totalAmount = getTotalAmount();

  return (
    <div className="container mx-auto px-4 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* FILTERS */}
        <aside className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white rounded-xl shadow">
            <Search />
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h5 className="text-lg font-semibold text-gray-800 mb-4">الفئات</h5>
            <div className="space-y-2 text-sm text-gray-600">
              {["حلويات", "مملحات", "معجنات", "مشروبات"].map((cat) => (
                <label key={cat} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    value={cat}
                    checked={category.includes(cat)}
                    onChange={() => toggleFilter(cat, setCategory)}
                    className="accent-blue-600"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-5">
            <h5 className="text-lg font-semibold text-gray-800 mb-4">الترتيب حسب</h5>
            <select
              onChange={(e) => setSortType(e.target.value)}
              value={sortType}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="relevant">الافتراضي</option>
              <option value="low">السعر: من الأقل إلى الأعلى</option>
              <option value="high">السعر: من الأعلى إلى الأقل</option>
            </select>
          </div>
        </aside>

        {/* PRODUCTS SECTION */}
        <section className="w-full lg:w-3/4">
          {/* قسم الحلويات التقليدية المغربية */}
          <div className="mb-10 bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">الحلويات المغربية التقليدية</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {traditionalSweets.map(sweet => (
                <div key={sweet.id} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{sweet.name}</h3>
                  <p className="text-gray-600 mb-3">السعر الأساسي: {sweet.basePrice} {currency} للكيلوغرام</p>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">اختر الوزن:</label>
                    <select
                      value={selectedTraditionalSweets[sweet.id]?.selectedWeight || "1kg"}
                      onChange={(e) => updateTraditionalSweetSelection(sweet.id, e.target.value, selectedTraditionalSweets[sweet.id]?.quantity || 1)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    >
                      <option value="500g">500 جرام</option>
                      <option value="700g">700 جرام</option>
                      <option value="1kg">1 كيلوغرام</option>
                      <option value="1.5kg">1.5 كيلوغرام</option>
                      <option value="2kg">2 كيلوغرام</option>
                      <option value="2.5kg">2.5 كيلوغرام</option>
                    </select>
                  </div>
                  
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">الكمية:</label>
                    <input
                      type="number"
                      min="1"
                      value={selectedTraditionalSweets[sweet.id]?.quantity || 1}
                      onChange={(e) => updateTraditionalSweetSelection(sweet.id, selectedTraditionalSweets[sweet.id]?.selectedWeight || "1kg", e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                    />
                  </div>
                  
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-semibold text-lg text-blue-600">
                      الإجمالي: {calculateSweetPrice(sweet.basePrice, selectedTraditionalSweets[sweet.id]?.selectedWeight || "1kg") * (selectedTraditionalSweets[sweet.id]?.quantity || 1)} {currency}
                    </span>
                    <button
                      onClick={() => updateTraditionalSweetSelection(sweet.id, selectedTraditionalSweets[sweet.id]?.selectedWeight || "1kg", selectedTraditionalSweets[sweet.id]?.quantity || 1)}
                      className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm font-medium"
                    >
                      تأكيد الاختيار
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {getPaginatedProducts().length > 0 ? (
              getPaginatedProducts().map((product) => (
                <Item
                  key={product._id}
                  product={product}
                  selectedProducts={selectedProducts}
                  setSelectedProducts={setSelectedProducts}
                  currency={currency}
                />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                لا توجد منتجات تطابق الفلاتر المحددة.
              </p>
            )}
          </div>

          {/* زر الإضافة */}
          {(Object.keys(selectedProducts).length > 0 || Object.keys(selectedTraditionalSweets).length > 0) && (
            <div className="mt-10 text-center space-y-4 sticky bottom-4 bg-white p-4 rounded-xl shadow-lg">
              <p className="text-lg font-semibold">
                المجموع الكلي: {totalAmount.toFixed(2)} {currency}
              </p>
              <button
                onClick={handleAddAllToCart}
                disabled={added}
                className={`px-6 py-3 rounded text-lg font-semibold w-full transition ${
                  added
                    ? "bg-green-600 text-white cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {added ? "تمت الإضافة ✅" : "أضف كل المنتجات المحددة إلى السلة"}
              </button>
            </div>
          )}

          {/* Pagination */}
          <div className="flex justify-center items-center flex-wrap gap-2 mt-10">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className={`px-4 py-2 rounded-md shadow text-sm font-medium ${
                currentPage === 1
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white hover:bg-blue-50 text-blue-600"
              }`}
            >
              السابق
            </button>

            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-2 text-sm rounded-md ${
                  currentPage === index + 1
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {index + 1}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className={`px-4 py-2 rounded-md shadow text-sm font-medium ${
                currentPage === totalPages
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-white hover:bg-blue-50 text-blue-600"
              }`}
            >
              التالي
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Collection;