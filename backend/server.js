import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";

// Routers
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import employerRouter from "./routes/employerRoute.js";
import commandeRouter from './routes/commandeRoute.js';

// Importez les routes fournisseur avec la syntaxe ES
import fournisseurRoutes from './routes/fournisseurRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
    app.use('/api/commandes', commandeRouter);
    
    // Routes fournisseur
    app.use('/api/fournisseurs', fournisseurRoutes);
    
    // Servir les fichiers statiques (pour les images)
    app.use('/uploads', express.static('uploads'));

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
