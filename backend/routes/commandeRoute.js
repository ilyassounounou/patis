import express from 'express';
import {
  createCommande,
  getCommandeByCode,
  getAllCommandes,
  updateCommandeStatus,
  updateCommandeAvance,
  deleteCommande
} from '../controllers/commandeController.js';

const router = express.Router();

// POST /api/commandes - Create a new commande
router.post('/', createCommande);

// GET /api/commandes - Get all commandes
router.get('/', getAllCommandes);

// GET /api/commandes/code/:code - Get commande by code
router.get('/code/:code', getCommandeByCode);

// PUT /api/commandes/:id/status - Update commande status
router.put('/:id/status', updateCommandeStatus);

// PUT /api/commandes/:id/avance - Update commande avance
router.put('/:id/avance', updateCommandeAvance);

// DELETE /api/commandes/:id - Delete a commande
router.delete('/:id', deleteCommande);

export default router;
