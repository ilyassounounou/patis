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

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'Fichier trop volumineux. Maximum 5MB autorisé.' });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ message: 'Trop de fichiers envoyés.' });
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({ message: 'Champ de fichier inattendu.' });
    }
  }
  next(err);
};

// Routes pour les fournisseurs
router.post('/', upload.array('bonneImages'), handleMulterError, createFournisseur);
router.get('/', getAllFournisseurs);
router.get('/:id', getFournisseurById);
router.put('/:id', upload.array('bonneImages'), handleMulterError, updateFournisseur);
router.patch('/:id/toggle-hidden', toggleHiddenFournisseur);
router.delete('/:id', deleteFournisseur);

// Routes pour les bonnes
router.post('/:id/bonne', upload.array('images'), handleMulterError, addBonne);
router.post('/:id/bonne/:bonneId/images', upload.array('images'), handleMulterError, addImagesToBonne);
router.post('/:id/paiement', addPaiement);

// Routes pour les images
router.get('/:id/bonne/:bonneId/images', getBonneImages);
router.delete('/:id/bonne/:bonneId/images/:imageName', deleteBonneImage);
router.get('/:id/bonne/:bonneId', getBonneDetails);

export default router;