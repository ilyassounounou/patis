import { Commande } from '../models/CommandeModel.js';

// Function to generate a unique random code (6 alphanumeric characters)
const generateCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

// Create a new command
const createCommande = async (req, res) => {
  try {
    const { clientPhone, description, items, avance = 0 } = req.body;
    
    // Calculate total
    const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const reste = total - avance;
    
    // Generate unique code
    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      code = generateCode();
      const existingCommande = await Commande.findOne({ code });
      if (!existingCommande) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ 
        success: false, 
        message: 'Impossible de générer un code unique après plusieurs tentatives' 
      });
    }

    const commande = new Commande({
      code,
      clientPhone,
      description,
      items,
      total,
      avance,
      reste
    });

    await commande.save();
    res.status(201).json({ success: true, commande });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get command by code
const getCommandeByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    // Validate code format
    if (!code || code.length !== 6 || !/^[A-Z0-9]{6}$/.test(code)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Le code doit contenir exactement 6 caractères alphanumériques' 
      });
    }
    
    const commande = await Commande.findOne({ code: code.toUpperCase() });
    
    if (!commande) {
      return res.status(404).json({ 
        success: false, 
        message: 'Commande introuvable avec le code: ' + code 
      });
    }
    
    res.status(200).json({ success: true, commande });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all commands
const getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, commandes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update command status
const updateCommandeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const commande = await Commande.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );
    
    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }
    
    res.status(200).json({ success: true, commande });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update command advance payment
const updateCommandeAvance = async (req, res) => {
  try {
    const { id } = req.params;
    const { avance } = req.body;
    
    const commande = await Commande.findById(id);
    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }
    
    if (avance > commande.total) {
      return res.status(400).json({ 
        success: false, 
        message: 'L\'avance ne peut pas dépasser le total' 
      });
    }
    
    commande.avance = avance;
    commande.reste = commande.total - avance;
    await commande.save();
    
    res.status(200).json({ success: true, commande });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete command
const deleteCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await Commande.findByIdAndDelete(id);
    
    if (!commande) {
      return res.status(404).json({ success: false, message: 'Commande introuvable' });
    }
    
    res.status(200).json({ 
      success: true, 
      message: 'Commande supprimée avec succès' 
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  createCommande,
  getCommandeByCode,
  getAllCommandes,
  updateCommandeStatus,
  updateCommandeAvance,
  deleteCommande
};