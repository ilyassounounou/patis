import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = ({ containerStyles = "", onClick }) => {
  const navLinks = [
    { path: "/collection", title: "المنتجات" },
    { path: "/achat", title: "المشتريات" },
    { path: "/commandes", title: "الطلبات" },
    { path: "/employer", title: "الموظفين" },
    { path: "/fournisseurs", title: "الموردين" },
  ];

  return (
    <>
      <style>{`
        .navbar {
          display: flex;
          gap: 1rem;
          flex-direction: column;
        }

        @media (min-width: 1024px) {
          .navbar {
            flex-direction: row;
            align-items: center;
          }
        }

        .nav-link {
          padding: 8px 16px;
          border-radius: 20px;
          text-decoration: none;
          font-size: 15px;
          color: #333;
          transition: all 0.2s ease;
        }

        .nav-link:hover {
          background-color: #f1f1f1;
          color: #ff9800;
        }

        .nav-link.active {
          background-color: #ff9800;
          color: #fff;
          font-weight: bold;
        }
      `}</style>

      <nav className={`navbar ${containerStyles}`}>
        {navLinks.map((link) => (
          <NavLink
            key={link.title}
            to={link.path}
            aria-label={`اذهب إلى ${link.title}`}
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
            onClick={onClick}
          >
            {link.title}
          </NavLink>
        ))}
      </nav>
    </>
  );
};

export default Navbar;
