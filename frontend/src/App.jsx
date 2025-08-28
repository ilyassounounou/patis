import React, { useEffect } from 'react';
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";

// Components
import Header from './components/Header';

// Pages
import Collection from './pages/Collection';
import Product from './pages/Product';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Verify from './pages/Verify';
import SettingsPage from "./pages/SettingsPage";
import Achat from "./pages/achat";
import Employer from "./pages/employer";
import Commandes from './pages/Commandes';


// Theme logic
import { useThemeStore } from './store/useThemeStore';
import { THEMES } from './constants';

const App = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    // إزالة جميع الثيمات
    THEMES.forEach(t => document.documentElement.classList.remove(t));
    // تطبيق الثيم المختار
    document.documentElement.classList.add(theme);
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return (
    <main className="overflow-hidden text-tertiary">
      <ToastContainer />
      <Header />
      <Routes>
        <Route path="/collection" element={<Collection />} />
        <Route path="/product/:productId" element={<Product />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/achat" element={<Achat />} />
        <Route path="/employer" element={<Employer />} /> 
        <Route path="/commandes" element={<Commandes />} />
       
      </Routes>
    </main>
  );
};

export default App;
