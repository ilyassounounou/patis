// routes/employerRoute.js
import express from "express";
import {
  addEmployer,
  getAllEmployers,
  deleteEmployer,
} from "../controllers/employerController.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();

/**
 * NOTE:
 *  - POST /api/employers      => protected (admin only)
 *  - DELETE /api/employers/:id => protected (admin only)
 *  - GET   /api/employers      => public (مفتوح حتى تتمكن صفحة EmployerPage من جلب أسماء الموظفين)
 */

// ➕ Ajouter un employé  (admin only)
router.post("/", adminAuth, addEmployer);

// 📜 Liste des employés  (PUBLIC)
router.get("/", getAllEmployers);

// 🗑 Supprimer un employé (admin only)
router.delete("/:id", adminAuth, deleteEmployer);

export default router;
