import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { toast } from "react-toastify";

import { FaHeart } from "react-icons/fa6";
import { TbShoppingBagPlus } from "react-icons/tb";
import ProductDescription from "../components/ProductDescription";
import RelatedProducts from "../components/RelatedProducts";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, isLoggedIn } = useContext(ShopContext);

  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (products.length > 0) {
      const selectedProduct = products.find((item) => item._id === productId);
      if (selectedProduct) {
        setProduct(selectedProduct);
      } else {
        setProduct(null);
      }
    }
  }, [productId, products]);

  if (!product) {
    return <div className="text-center py-10">...جارٍ التحميل أو المنتج غير موجود</div>;
  }

  const handleAddToCart = () => {
    if (!isLoggedIn) {
      toast.error("يرجى تسجيل الدخول أولاً");
      return;
    }
    addToCart(product._id);
    toast.success("تمت إضافة المنتج إلى السلة بنجاح!");
  };

  return (
    <div>
      <div className="max-padd-container">
        {/* PRODUCT DATA */}
        <div className="flex gap-10 flex-col xl:flex-row rounded-2xl p-3 mb-6">
          {/* IMAGE */}
          <div className="max-w-[477px]">
            <img
              src={typeof product.image === "string" && product.image ? product.image : "/placeholder.png"}
              alt={product.name || "منتج"}
              className="rounded-xl w-full object-cover"
            />
          </div>

          {/* PRODUCT INFO */}
          <div className="flex-[1.5] rounded-2xl px-5 py-3 bg-primary">
            <h3 className="h3 leading-none">{product.name || "منتج"}</h3>

            {/* التقييم والسعر */}
            <div className="flex items-baseline gap-x-5">
              <div className="flex items-center gap-x-2 text-secondary">
                <span className="medium-14">(123)</span>
              </div>
            </div>

            <h4 className="h4 my-2">
              {currency}
              {Number(product.price).toFixed(2)}
            </h4>

            {/* أزرار الإضافة للحقيبة والميزة المفضلة */}
            <div className="flex items-center gap-x-4">
              <button
                onClick={handleAddToCart}
                className="btn-secondary !rounded-lg sm:w-1/2 flexCenter gap-x-2 capitalize"
              >
                أضف إلى السلة <TbShoppingBagPlus />
              </button>

              <button className="btn-white !rounded-lg !py-3.5" aria-label="أضف إلى المفضلة">
                <FaHeart />
              </button>
            </div>

            <hr className="my-3 w-2/3" />
          </div>
        </div>

        {/* باقي الأقسام */}
        <ProductDescription />

        <RelatedProducts category={product.category} />
      </div>
    </div>
  );
};

export default Product;
