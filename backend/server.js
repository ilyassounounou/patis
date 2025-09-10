import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer"; // Import multer for error handling

// Routers
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import employerRouter from "./routes/employerRoute.js";
import commandeRouter from "./routes/commandeRoute.js";
import fournisseurRoutes from "./routes/fournisseurRoutes.js";

const app = express();
const port = process.env.PORT || 4000;

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  
  // Handle file filter errors
  if (err.message === 'Seules les images sont autorisées!') {
    return res.status(400).json({ message: err.message });
  }
  
  next(err);
};

// Connect to DB and Cloudinary before starting the server
const startServer = async () => {
  try {
    await connectDB();
    connectCloudinary();

    // API Routes
    app.use("/api/user", userRouter);
    app.use("/api/product", productRouter);
    app.use("/api/cart", cartRouter);
    app.use("/api/orders", orderRouter);
    app.use("/api/employers", employerRouter);
    app.use("/api/commandes", commandeRouter);
    app.use("/api/fournisseurs", fournisseurRoutes);

    // Servir les fichiers statiques (images uploadées)
    app.use("/uploads", express.static(path.join(__dirname, "uploads")));

    // Global error handler
    app.use((err, req, res, next) => {
      console.error('Error:', err);
      res.status(500).json({ 
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    });

    app.get("/", (req, res) => {
      res.send("✅ API Working...");
    });

    app.listen(port, () => {
      console.log(`🚀 Server is running on PORT: ${port}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();