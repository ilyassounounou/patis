import React, { createContext, useEffect, useState, useCallback } from "react";
import axios from "axios";

export const ShopContext = createContext();

const ShopContextProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState({});
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const currency = "درهم";

  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

  // Authentication functions
  const login = useCallback((newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("token");
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`);
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        throw new Error(response.data.message || "Failed to fetch products");
      }
    } catch (error) {
      setError(error.message || "Network error occurred");
      console.error("Fetch products error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  // Cart operations
  const getCartTypesCount = useCallback(() => {
    return Object.keys(cartItems).filter(key => cartItems[key] > 0).length;
  }, [cartItems]);

  const getCartCount = useCallback(() => {
    return Object.values(cartItems).reduce((acc, qty) => {
      // Si c'est un objet (produit traditionnel), on ajoute la quantité
      if (typeof qty === 'object' && qty.quantity) {
        return acc + qty.quantity;
      }
      // Sinon, c'est un nombre (produit normal)
      return acc + qty;
    }, 0);
  }, [cartItems]);

  const addToCart = useCallback((itemId, quantity = 1, productData = null) => {
    setCartItems(prev => {
      // Si des données produit sont fournies (pour les produits traditionnels)
      if (productData && typeof productData === 'object') {
        return {
          ...prev,
          [itemId]: {
            ...productData,
            quantity: (prev[itemId]?.quantity || 0) + quantity
          }
        };
      }
      
      // Pour les produits normaux
      return {
        ...prev,
        [itemId]: (prev[itemId] || 0) + quantity,
      };
    });
  }, []);

  const updateQuantity = useCallback((itemId, quantity) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      
      // Si c'est un produit traditionnel (objet)
      if (newCart[itemId] && typeof newCart[itemId] === 'object') {
        if (quantity <= 0) {
          delete newCart[itemId];
        } else {
          newCart[itemId] = {
            ...newCart[itemId],
            quantity: quantity
          };
        }
      } else {
        // Produit normal (nombre)
        if (quantity <= 0) {
          delete newCart[itemId];
        } else {
          newCart[itemId] = quantity;
        }
      }
      
      return newCart;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems({});
  }, []);

  const getCartAmount = useCallback(() => {
    return Object.entries(cartItems).reduce((total, [itemId, itemData]) => {
      // Si c'est un produit traditionnel (objet avec price et quantity)
      if (typeof itemData === 'object' && itemData.price !== undefined && itemData.quantity !== undefined) {
        return total + (itemData.quantity * itemData.price);
      }
      
      // Si c'est un produit normal
      const product = products.find(p => p._id === itemId);
      if (product && typeof itemData === 'number') {
        return total + (itemData * product.price);
      }
      
      return total;
    }, 0);
  }, [cartItems, products]);

  // Fonction pour ajouter un produit traditionnel
  const addTraditionalSweet = useCallback((sweetData) => {
    const itemId = `traditional_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    addToCart(itemId, 1, sweetData);
    return itemId;
  }, [addToCart]);

  // Fonction pour vérifier si un item est un produit traditionnel
  const isTraditionalItem = useCallback((itemId) => {
    return itemId.startsWith('traditional_');
  }, []);

  // Fonction pour obtenir les détails d'un produit traditionnel
  const getTraditionalItemDetails = useCallback((itemId) => {
    return cartItems[itemId];
  }, [cartItems]);

  // Create order - use correct API path '/api/order/place'
  const createOrder = useCallback(async (orderData) => {
    if (!token) throw new Error("Authentication required");
    
    try {
      const response = await axios.post(
        `${backendUrl}/api/order/place`,
        orderData,
        { headers: { token } }
      );
      return response.data;
    } catch (error) {
      console.error("Create order error:", error.response?.data || error.message);
      throw error;
    }
  }, [backendUrl, token]);

  // Persistence cart in localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (e) {
        console.error("Cart parse error:", e);
        localStorage.removeItem("cartItems");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("cartItems", JSON.stringify(cartItems));
  }, [cartItems]);

  // Initial products fetch
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return (
    <ShopContext.Provider
      value={{
        products,
        cartItems,
        search,
        isLoading,
        error,
        token,
        currency,
        backendUrl,
        setSearch,
        login,
        logout,
        fetchProducts,
        addToCart,
        addTraditionalSweet, // Nouvelle fonction
        updateQuantity,
        clearCart,
        getCartCount,
        getCartTypesCount,
        getCartAmount,
        createOrder,
        isTraditionalItem, // Nouvelle fonction
        getTraditionalItemDetails, // Nouvelle fonction
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;