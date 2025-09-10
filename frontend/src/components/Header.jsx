import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { FaBars, FaTimes } from "react-icons/fa";
import { ShopContext } from "../context/ShopContext";

const Header = () => {
  const [menuOpened, setMenuOpened] = useState(false);
  const navigate = useNavigate();
  const { getCartCount } = useContext(ShopContext);

  const toggleMenu = () => setMenuOpened((prev) => !prev);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <>
      <style>{`
        .header {
          width: 100%;
          background: #fff;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          position: relative;
          z-index: 100;
        }

        .header-container {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
        }

        .logo {
          font-size: 22px;
          font-weight: bold;
          color: #ff9800;
          text-decoration: none;
        }

        .menu {
          display: none;
        }

        .menu.open {
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          right: 0;
          width: 220px;
          height: 100vh;
          background: #fff;
          padding: 20px;
          box-shadow: -2px 0 6px rgba(0,0,0,0.1);
        }

        @media (min-width: 1024px) {
          .menu {
            display: flex !important;
            flex-direction: row;
            position: static;
            height: auto;
            width: auto;
            box-shadow: none;
            padding: 0;
          }
        }

        .cart {
          position: relative;
          padding: 6px 14px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-weight: 500;
          cursor: pointer;
          font-size: 14px;
          text-decoration: none;
          color: #333;
        }

        .cart-badge {
          position: absolute;
          top: -6px;
          right: -6px;
          background: #ff5722;
          color: #fff;
          font-size: 12px;
          font-weight: bold;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .menu-btn {
          font-size: 20px;
          cursor: pointer;
          color: #333;
          background: none;
          border: none;
        }

        @media (min-width: 1024px) {
          .menu-btn {
            display: none;
          }
        }
      `}</style>

      <header className="header">
        <div className="header-container">
          {/* LOGO */}
          <Link to={"collection"} className="logo">
            L'ami Doree
          </Link>

          {/* NAVBAR */}
          <div className={`menu ${menuOpened ? "open" : ""}`}>
            <Navbar onClick={() => setMenuOpened(false)} />
          </div>

          {/* CART + MENU BUTTON */}
          <div className="flex items-center gap-4">
            <Link to={"/cart"} className="cart">
              Cart
              <span className="cart-badge">{getCartCount()}</span>
            </Link>

            <button onClick={toggleMenu} className="menu-btn">
              {menuOpened ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
