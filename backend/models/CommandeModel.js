import mongoose from 'mongoose';

const commandeSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    index: true // Add index for faster searches
  },
  clientPhone: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  items: [{
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    quantity: {
      type: Number,
      required: true
    }
  }],
  total: {
    type: Number,
    required: true
  },
  avance: {
    type: Number,
    default: 0,
    min: 0
  },
  reste: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Generate unique code before saving
commandeSchema.pre('save', async function(next) {
  // Only generate code for new documents
  if (this.isNew && !this.code) {
    const generateCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return code;
    };

    let code;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    // Keep generating codes until we find a unique one or reach max attempts
    while (!isUnique && attempts < maxAttempts) {
      code = generateCode();
      
      try {
        // Check if code already exists
        const existingCommande = await mongoose.model('Commande').findOne({ code });
        if (!existingCommande) {
          isUnique = true;
        }
      } catch (err) {
        return next(err);
      }
      
      attempts++;
    }

    if (!isUnique) {
      return next(new Error('Could not generate a unique code after multiple attempts'));
    }

    this.code = code;
  }
  next();
});

// Calculate reste before saving
commandeSchema.pre('save', function(next) {
  this.reste = this.total - this.avance;
  next();
});

// Create and export the model
const Commande = mongoose.model('Commande', commandeSchema);
export { Commande };