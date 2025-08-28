import mongoose from "mongoose";

const employerSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Le nom complet est requis"]
  },
  cin: {
    type: String,
    required: [true, "Le CIN est requis"],
    unique: true
  },
  birthDate: {
    type: Date,
    required: [true, "La date de naissance est requise"]
  },
  age: {
    type: Number
  },
  jobCategory: {
    type: String,
    enum: ['Boulanger', 'Pâtissier', 'Plongeur', 'Vendeur', 'Manager'],
    required: [true, "La catégorie de travail est requise"]
  },
  weeklySalary: {
    type: Number,
    required: [true, "Le salaire hebdomadaire est requis"]
  },
  hireDate: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Calcul automatique de l'âge avant sauvegarde
employerSchema.pre('save', function(next) {
  const today = new Date();
  const birthDate = new Date(this.birthDate);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  this.age = age;
  next();
});

const Employer = mongoose.model('Employer', employerSchema);
export default Employer;
