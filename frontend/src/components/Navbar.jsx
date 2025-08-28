import React from "react";
import { NavLink } from "react-router-dom";

const Navbar = ({ containerStyles = "", onClick }) => {
  const navLinks = [
    { path: "/collection", title: "المنتجات" },
    { path: "/blog", title: "المدونة" },
    { path: "/achat", title: "المشتريات" },
    { path: "/commandes", title: "الطلبات" }, 
    { path: "/employer", title: "الموظفين" },
    { path: "/fournisseurs", title: "الموردين" }, // ➕ الرابط الجديد
  ];

  return (
    <nav className={`flex gap-4 ${containerStyles}`}>
      {navLinks.map((link) => (
        <NavLink
          key={link.title}
          to={link.path}
          aria-label={`اذهب إلى ${link.title}`}
          className={({ isActive }) =>
            `px-4 py-2 rounded-full transition-all duration-200 ${
              isActive
                ? "text-primary font-semibold bg-gray-100"
                : "text-black hover:text-primary"
            }`
          }
          onClick={onClick}
        >
          {link.title}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
