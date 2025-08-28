// middleware/adminAuth.js
import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    const { token } = req.headers;
    if (!token) {
      return res.json({ success: false, message: "Not Authorized. Login again." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // نتحقق أن التوكن يساوي email + password الخاصة بالـ admin
    // (نفس المنطق الذي كنت تستعمله)
    if (decoded !== process.env.ADMIN_EMAIL + process.env.ADMIN_PASS) {
      return res.json({ success: false, message: "Not Authorized. Login again." });
    }

    next();
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export default adminAuth;
