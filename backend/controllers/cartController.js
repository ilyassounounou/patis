import userModel from "../models/userModel.js";

// Helper function for error handling
const handleError = (res, error, context) => {
  console.error(`Error in ${context}:`, error);
  return res.status(500).json({ 
    success: false, 
    message: error.message || `Error processing ${context}` 
  });
};

// Validate cart item data
const validateCartData = (data) => {
  const { userId, itemId, color } = data;
  
  if (!userId || !itemId || !color) {
    throw new Error("Missing required cart fields (userId, itemId, color)");
  }
  
  if (typeof color !== 'string') {
    throw new Error("Color must be a string");
  }
};

// CONTROLLER FUNCTION FOR ADDING PRODUCT TO USER CART
const addToCart = async (req, res) => {
  try {
    const { userId, itemId, color } = req.body;
    
    // Validate input
    validateCartData(req.body);

    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Initialize cartData if it doesn't exist
    const cartData = user.cartData || {};

    // Update cart data
    if (!cartData[itemId]) {
      cartData[itemId] = {};
    }

    if (!cartData[itemId][color]) {
      cartData[itemId][color] = 0;
    }

    cartData[itemId][color] += 1;

    await userModel.findByIdAndUpdate(
      userId, 
      { cartData },
      { new: true, runValidators: true }
    );

    return res.json({ 
      success: true, 
      message: "Added to Cart",
      cartData 
    });

  } catch (error) {
    return handleError(res, error, "addToCart");
  }
};

// CONTROLLER FUNCTION FOR UPDATING USER CART
const updateCart = async (req, res) => {
  try {
    const { userId, itemId, color, quantity } = req.body;

    // Validate input
    if (!userId || !itemId || !color || quantity === undefined) {
      throw new Error("Missing required fields (userId, itemId, color, quantity)");
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 0) {
      throw new Error("Quantity must be a positive number");
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const cartData = user.cartData || {};

    // Check if item exists in cart
    if (!cartData[itemId] || !cartData[itemId][color]) {
      throw new Error("Item not found in cart");
    }

    // Update quantity (0 will remove the item)
    if (parsedQuantity === 0) {
      delete cartData[itemId][color];
      // Remove item completely if no colors left
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    } else {
      cartData[itemId][color] = parsedQuantity;
    }

    await userModel.findByIdAndUpdate(
      userId, 
      { cartData },
      { new: true, runValidators: true }
    );

    return res.json({ 
      success: true, 
      message: "Cart Updated",
      cartData 
    });

  } catch (error) {
    return handleError(res, error, "updateCart");
  }
};

// CONTROLLER FUNCTION FOR GETTING USER CART DATA
const getUserCart = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      throw new Error("User ID is required");
    }

    const user = await userModel.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    // Return empty object if no cart data exists
    const cartData = user.cartData || {};

    return res.json({ 
      success: true, 
      cartData 
    });

  } catch (error) {
    return handleError(res, error, "getUserCart");
  }
};

export { addToCart, updateCart, getUserCart };