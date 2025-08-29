// fournisseurRoutes.js
import express from 'express';
import {
  createFournisseur,
  getAllFournisseurs,
  getFournisseurById,
  updateFournisseur,
  toggleHiddenFournisseur,
  deleteFournisseur,
  addBonne,
  addImagesToBonne,
  addPaiement,
  getBonneImages,
  deleteBonneImage,
  getBonneDetails
} from '../controllers/fournisseurController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// Routes pour les fournisseurs
router.post('/', upload.array('bonneImages'), createFournisseur);
router.get('/', getAllFournisseurs);
router.get('/:id', getFournisseurById);
router.put('/:id', upload.array('bonneImages'), updateFournisseur);
router.patch('/:id/toggle-hidden', toggleHiddenFournisseur);
router.delete('/:id', deleteFournisseur);

// Routes pour les bonnes
router.post('/:id/bonne', upload.array('images'), addBonne);
router.post('/:id/bonne/:bonneId/images', upload.array('images'), addImagesToBonne);
router.post('/:id/paiement', addPaiement);

// Routes pour les images
router.get('/:id/bonne/:bonneId/images', getBonneImages);
router.delete('/:id/bonne/:bonneId/images/:imageName', deleteBonneImage);
router.get('/:id/bonne/:bonneId', getBonneDetails);

export default router;