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
    { id: 1, name: "حلوة السابلية", basePrice: 90 },
    { id: 2, name: "حلوة اللوز", basePrice: 150 },
    { id: 3, name: "الكعبة", basePrice: 170 },
    { id: 4, name: "فقاص برستيج", basePrice: 170 }
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

  // دالة لحساب السعر من الوزن بالجرام
  const calculateSweetPrice = (basePrice, weightInput) => {
    if (!weightInput) return 0;
    
    // استخراج الرقم من المدخل (إزالة أي أحرف غير رقمية)
    const weightValue = parseFloat(weightInput.replace(/[^\d.]/g, ''));
    
    if (isNaN(weightValue) || weightValue <= 0) return 0;
    
    // حساب السعر بناءً على الوزن بالجرام
    return (weightValue / 1000) * basePrice;
  };

  // تحديث اختيار الحلوى التقليدية
  const updateTraditionalSweetSelection = (sweetId, weightInput, quantity) => {
    setSelectedTraditionalSweets(prev => ({
      ...prev,
      [sweetId]: { 
        selectedWeight: weightInput, 
        quantity: parseInt(quantity) || 1 
      }
    }));
  };

  // باقي الدوال كما هي
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
        const price = calculateSweetPrice(sweet.basePrice, details.selectedWeight || "0");
        addToCart(`traditional_${sweetId}`, details.quantity, {
          name: `${sweet.name} (${details.selectedWeight})`,
          price: price,
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
        const price = calculateSweetPrice(sweet.basePrice, details.selectedWeight || "0");
        return total + (price * details.quantity);
      }
      return total;
    }, 0);
    
    return regularProductsTotal + traditionalSweetsTotal;
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
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              الحلويات المغربية التقليدية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {traditionalSweets.map((sweet) => {
                const selectedSweet = selectedTraditionalSweets[sweet.id] || {
                  selectedWeight: "",
                  quantity: 1
                };
                
                const price = calculateSweetPrice(sweet.basePrice, selectedSweet.selectedWeight || "0");
                const totalPrice = price * selectedSweet.quantity;
                
                return (
                  <div key={sweet.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {sweet.name}
                    </h3>
                    <p className="text-gray-600 mb-3">
                      السعر الأساسي: {sweet.basePrice} {currency} للكيلوغرام
                    </p>

                    {/* إدخال الوزن الحر */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        أدخل الوزن (بالجرام):
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="مثال: 500 لـ نصف كيلو"
                        value={selectedSweet.selectedWeight}
                        onChange={(e) => {
                          // السماح فقط بالأرقام والنقاط
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          updateTraditionalSweetSelection(
                            sweet.id,
                            value,
                            selectedSweet.quantity
                          );
                        }}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        أدخل الوزن بالجرام (مثال: 500 لنصف كيلو، 1000 لكيلو)
                      </p>
                    </div>

                    {/* إدخال الكمية */}
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الكمية:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={selectedSweet.quantity}
                        onChange={(e) =>
                          updateTraditionalSweetSelection(
                            sweet.id,
                            selectedSweet.selectedWeight,
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                      />
                    </div>

                    {/* المجموع */}
                    <div className="flex justify-between items-center mt-4">
                      <span className="font-semibold text-lg text-blue-600">
                        الإجمالي: {totalPrice.toFixed(2)} {currency}
                      </span>
                      <button
                        onClick={() => {
                          // تأكيد الاختيار
                          updateTraditionalSweetSelection(
                            sweet.id,
                            selectedSweet.selectedWeight,
                            selectedSweet.quantity
                          );
                          
                          // عرض رسالة تأكيد
                          alert(`تم اختيار ${selectedSweet.quantity} × ${sweet.name} بوزن ${selectedSweet.selectedWeight} جرام`);
                        }}
                        className="bg-blue-100 text-blue-600 px-3 py-1 rounded text-sm font-medium"
                      >
                        تأكيد الاختيار
                      </button>
                    </div>
                    
                    {/* أمثلة توضيحية */}
                    <div className="mt-3 text-xs text-gray-500">
                      <p>أمثلة:</p>
                      <ul className="list-disc mr-4">
                        <li>244 جرام ≈ 22 {currency}</li>
                        <li>333 جرام ≈ 30 {currency}</li>
                        <li>500 جرام = 45 {currency}</li>
                        <li>1000 جرام = 90 {currency}</li>
                      </ul>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* باقي المحتوى */}
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