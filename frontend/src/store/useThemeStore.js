// ➤ تأكد من أن اسم الملف هو useThemeStore.js وليس usethemestote.js
import { create } from "zustand";

export const useThemeStore = create((set) => ({
  // نقرأ الثيم من localStorage مرة واحدة عند التحميل
  theme: localStorage.getItem("chat-theme") || "coffee",
  setTheme: (theme) => {
    localStorage.setItem("chat-theme", theme);
    set({ theme });
  },
}));
