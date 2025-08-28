import mongoose from 'mongoose';

// models/Fournisseur.js
const bonneSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  images: {  // Changé de 'image' à 'images' (tableau)
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    default: Date.now
  },
  isPaid: {
    type: Boolean,
    default: false
  },
  paidAmount: {
    type: Number,
    default: 0
  }
});

const paiementSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {  // Ajout du champ description pour les paiements aussi
    type: String,
    default: ''
  }
});

const fournisseurSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['emballage', 'fruits', 'légumes', 'viande', 'produits laitiers', 'autres']
  },
  totalBonnesAchat: {
    type: Number,
    default: 0
  },
  bonnesPayer: {
    type: Number,
    default: 0
  },
  isHidden: {
    type: Boolean,
    default: false
  },
  bonnes: [bonneSchema],
  paiements: [paiementSchema]
}, {
  timestamps: true
});

export default mongoose.model('Fournisseur', fournisseurSchema);