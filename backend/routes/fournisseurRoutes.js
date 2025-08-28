import express from 'express';
import {
  createFournisseur,
  getAllFournisseurs,
  updateFournisseur,
  deleteFournisseur,
  addBonne,
  addImagesToBonne,
  addPaiement,
  getBonneImages,
  deleteBonneImage,
  getBonneDetails // AJOUTEZ CET IMPORT
} from '../controllers/fournisseurController.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.get('/', getAllFournisseurs);
router.post('/', upload.array('bonneImages', 10), createFournisseur);
router.put('/:id', upload.array('bonneImages', 10), updateFournisseur);
router.delete('/:id', deleteFournisseur);
router.post('/:id/bonne', upload.array('images', 10), addBonne);
router.post('/:id/bonne/:bonneId/images', upload.array('images', 10), addImagesToBonne);
router.post('/:id/paiement', addPaiement);
router.get('/:id/bonne/:bonneId/images', getBonneImages);
router.delete('/:id/bonne/:bonneId/images/:imageName', deleteBonneImage);
router.get('/:id/bonne/:bonneId', getBonneDetails); // AJOUTEZ CETTE ROUTE

export default router;