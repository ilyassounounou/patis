import Fournisseur from '../models/Fournisseur.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer un fournisseur avec plusieurs images
export const createFournisseur = async (req, res) => {
  try {
    const { fullName, phone, category } = req.body;
    
    const fournisseur = new Fournisseur({
      fullName,
      phone,
      category,
      isHidden: req.body.isHidden || false
    });

    // Gérer plusieurs images
    if (req.files && req.files.bonneImages) {
      const images = Array.isArray(req.files.bonneImages) ? req.files.bonneImages : [req.files.bonneImages];
      
      for (const image of images) {
        const imageName = `bonne_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(image.name)}`;
        const imagePath = path.join(__dirname, '../uploads', imageName);
        
        await image.mv(imagePath);
        
        fournisseur.bonnes.push({
          amount: req.body.amount || 0,
          images: [imageName],
          date: new Date(),
          description: req.body.description || ''
        });
      }
      
      // Calculer le total des bonnes d'achat
      fournisseur.totalBonnesAchat = fournisseur.bonnes.reduce((sum, bonne) => sum + bonne.amount, 0);
    }

    await fournisseur.save();
    res.status(201).json(fournisseur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Récupérer tous les fournisseurs
export const getAllFournisseurs = async (req, res) => {
  try {
    const fournisseurs = await Fournisseur.find().sort({ createdAt: -1 });
    
    // Add full image URLs to each bonne
    const fournisseursWithImageUrls = fournisseurs.map(fournisseur => {
      const bonnesWithUrls = fournisseur.bonnes.map(bonne => ({
        ...bonne.toObject(),
        images: bonne.images.map(image => ({
          filename: image,
          url: `${req.protocol}://${req.get('host')}/uploads/${image}`
        }))
      }));
      
      return {
        ...fournisseur.toObject(),
        bonnes: bonnesWithUrls
      };
    });
    
    res.json(fournisseursWithImageUrls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer un fournisseur par ID
export const getFournisseurById = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }
    
    // Add full image URLs to each bonne
    const bonnesWithUrls = fournisseur.bonnes.map(bonne => ({
      ...bonne.toObject(),
      images: bonne.images.map(image => ({
        filename: image,
        url: `${req.protocol}://${req.get('host')}/uploads/${image}`
      }))
    }));
    
    const fournisseurWithUrls = {
      ...fournisseur.toObject(),
      bonnes: bonnesWithUrls
    };
    
    res.json(fournisseurWithUrls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un fournisseur
export const updateFournisseur = async (req, res) => {
  try {
    const { fullName, phone, category, isHidden } = req.body;
    
    const fournisseur = await Fournisseur.findById(req.params.id);
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    fournisseur.fullName = fullName || fournisseur.fullName;
    fournisseur.phone = phone || fournisseur.phone;
    fournisseur.category = category || fournisseur.category;
    fournisseur.isHidden = isHidden !== undefined ? isHidden : fournisseur.isHidden;

    // Ajouter de nouvelles images si fournies
    if (req.files && req.files.bonneImages) {
      const images = Array.isArray(req.files.bonneImages) ? req.files.bonneImages : [req.files.bonneImages];
      
      for (const image of images) {
        const imageName = `bonne_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(image.name)}`;
        const imagePath = path.join(__dirname, '../uploads', imageName);
        
        await image.mv(imagePath);
        
        fournisseur.bonnes.push({
          amount: req.body.amount || 0,
          images: [imageName],
          date: new Date(),
          description: req.body.description || ''
        });
      }
      
      // Recalculer le total des bonnes d'achat
      fournisseur.totalBonnesAchat = fournisseur.bonnes.reduce((sum, bonne) => sum + bonne.amount, 0);
    }

    await fournisseur.save();
    
    // Return with image URLs
    const bonnesWithUrls = fournisseur.bonnes.map(bonne => ({
      ...bonne.toObject(),
      images: bonne.images.map(image => ({
        filename: image,
        url: `${req.protocol}://${req.get('host')}/uploads/${image}`
      }))
    }));
    
    const fournisseurWithUrls = {
      ...fournisseur.toObject(),
      bonnes: bonnesWithUrls
    };
    
    res.json(fournisseurWithUrls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Basculer l'état masqué d'un fournisseur
export const toggleHiddenFournisseur = async (req, res) => {
  try {
    const { isHidden } = req.body;
    const fournisseur = await Fournisseur.findById(req.params.id);
    
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    fournisseur.isHidden = isHidden;
    await fournisseur.save();
    
    res.json(fournisseur);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer un fournisseur
export const deleteFournisseur = async (req, res) => {
  try {
    const fournisseur = await Fournisseur.findById(req.params.id);
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    // Supprimer les images associées
    for (const bonne of fournisseur.bonnes) {
      if (bonne.images && bonne.images.length > 0) {
        for (const imageName of bonne.images) {
          const imagePath = path.join(__dirname, '../uploads', imageName);
          if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
          }
        }
      }
    }

    await Fournisseur.findByIdAndDelete(req.params.id);
    res.json({ message: 'Fournisseur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Ajouter une bonne d'achat avec plusieurs images
export const addBonne = async (req, res) => {
  try {
    const { amount, date, description } = req.body;
    const fournisseur = await Fournisseur.findById(req.params.id);
    
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    const bonneAmount = parseFloat(amount) || 0;
    const nouvelleBonne = {
      amount: bonneAmount,
      date: date ? new Date(date) : new Date(),
      description: description || '',
      images: []
    };

    // Gérer plusieurs images
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      
      for (const image of images) {
        const imageName = `bonne_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(image.name)}`;
        const imagePath = path.join(__dirname, '../uploads', imageName);
        
        await image.mv(imagePath);
        nouvelleBonne.images.push(imageName);
      }
    }

    fournisseur.totalBonnesAchat += bonneAmount;
    fournisseur.bonnes.push(nouvelleBonne);

    await fournisseur.save();
    
    // Return with image URLs
    const bonnesWithUrls = fournisseur.bonnes.map(bonne => ({
      ...bonne.toObject(),
      images: bonne.images.map(image => ({
        filename: image,
        url: `${req.protocol}://${req.get('host')}/uploads/${image}`
      }))
    }));
    
    const fournisseurWithUrls = {
      ...fournisseur.toObject(),
      bonnes: bonnesWithUrls
    };
    
    res.json(fournisseurWithUrls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Ajouter des images à une bonne existante
export const addImagesToBonne = async (req, res) => {
  try {
    const { bonneId } = req.params;
    const fournisseur = await Fournisseur.findById(req.params.id);
    
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    const bonne = fournisseur.bonnes.id(bonneId);
    if (!bonne) {
      return res.status(404).json({ message: 'Bonne non trouvée' });
    }

    // Gérer plusieurs images
    if (req.files && req.files.images) {
      const images = Array.isArray(req.files.images) ? req.files.images : [req.files.images];
      
      for (const image of images) {
        const imageName = `bonne_${Date.now()}_${Math.random().toString(36).substring(7)}${path.extname(image.name)}`;
        const imagePath = path.join(__dirname, '../uploads', imageName);
        
        await image.mv(imagePath);
        bonne.images.push(imageName);
      }
    }

    await fournisseur.save();
    
    // Return with image URLs
    const bonnesWithUrls = fournisseur.bonnes.map(bonne => ({
      ...bonne.toObject(),
      images: bonne.images.map(image => ({
        filename: image,
        url: `${req.protocol}://${req.get('host')}/uploads/${image}`
      }))
    }));
    
    const fournisseurWithUrls = {
      ...fournisseur.toObject(),
      bonnes: bonnesWithUrls
    };
    
    res.json(fournisseurWithUrls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Enregistrer un paiement
export const addPaiement = async (req, res) => {
  try {
    const { amount, bonneId, description } = req.body;
    const fournisseur = await Fournisseur.findById(req.params.id);
    
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    const paymentAmount = parseFloat(amount);
    fournisseur.bonnesPayer += paymentAmount;
    
    // Si une bonne spécifique est ciblée
    if (bonneId) {
      const bonne = fournisseur.bonnes.id(bonneId);
      if (bonne) {
        const needed = bonne.amount - (bonne.paidAmount || 0);
        const pay = Math.min(needed, paymentAmount);
        
        bonne.paidAmount = (bonne.paidAmount || 0) + pay;
        if (bonne.paidAmount >= bonne.amount) {
          bonne.isPaid = true;
        }
      }
    } else {
      // Paiement général (ancienne logique)
      let remainingPayment = paymentAmount;
      for (let bonne of fournisseur.bonnes) {
        if (remainingPayment <= 0) break;
        
        if (!bonne.isPaid) {
          const needed = bonne.amount - (bonne.paidAmount || 0);
          const pay = Math.min(needed, remainingPayment);
          
          bonne.paidAmount = (bonne.paidAmount || 0) + pay;
          if (bonne.paidAmount >= bonne.amount) {
            bonne.isPaid = true;
          }
          
          remainingPayment -= pay;
        }
      }
    }

    fournisseur.paiements.push({
      amount: paymentAmount,
      date: new Date(),
      description: description || ''
    });

    await fournisseur.save();
    
    // Return with image URLs
    const bonnesWithUrls = fournisseur.bonnes.map(bonne => ({
      ...bonne.toObject(),
      images: bonne.images.map(image => ({
        filename: image,
        url: `${req.protocol}://${req.get('host')}/uploads/${image}`
      }))
    }));
    
    const fournisseurWithUrls = {
      ...fournisseur.toObject(),
      bonnes: bonnesWithUrls
    };
    
    res.json(fournisseurWithUrls);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir les images d'une bonne
export const getBonneImages = async (req, res) => {
  try {
    const { id, bonneId } = req.params;
    const fournisseur = await Fournisseur.findById(id);
    
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    const bonne = fournisseur.bonnes.id(bonneId);
    if (!bonne) {
      return res.status(404).json({ message: 'Bonne non trouvée' });
    }

    // Return images with full URLs
    const imagesWithUrls = bonne.images.map(image => ({
      filename: image,
      url: `${req.protocol}://${req.get('host')}/uploads/${image}`
    }));

    res.json({ 
      images: imagesWithUrls,
      description: bonne.description || ''
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Supprimer une image d'une bonne
export const deleteBonneImage = async (req, res) => {
  try {
    const { id, bonneId, imageName } = req.params;
    const fournisseur = await Fournisseur.findById(id);
    
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    const bonne = fournisseur.bonnes.id(bonneId);
    if (!bonne) {
      return res.status(404).json({ message: 'Bonne non trouvée' });
    }

    // Supprimer l'image du tableau
    bonne.images = bonne.images.filter(img => img !== imageName);

    // Supprimer le fichier physique
    const imagePath = path.join(__dirname, '../uploads', imageName);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    await fournisseur.save();
    res.json({ message: 'Image supprimée avec succès' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtenir les détails d'une bonne
export const getBonneDetails = async (req, res) => {
  try {
    const { id, bonneId } = req.params;
    const fournisseur = await Fournisseur.findById(id);
    
    if (!fournisseur) {
      return res.status(404).json({ message: 'Fournisseur non trouvé' });
    }

    const bonne = fournisseur.bonnes.id(bonneId);
    if (!bonne) {
      return res.status(404).json({ message: 'Bonne non trouvée' });
    }

    // Generate full URLs for images
    const imagesWithUrls = bonne.images.map(image => ({
      filename: image,
      url: `${req.protocol}://${req.get('host')}/uploads/${image}`
    }));

    res.json({
      _id: bonne._id,
      amount: bonne.amount,
      description: bonne.description || '',
      date: bonne.date,
      isPaid: bonne.isPaid || false,
      paidAmount: bonne.paidAmount || 0,
      images: imagesWithUrls // Return images with URLs
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};