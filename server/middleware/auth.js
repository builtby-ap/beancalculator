const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "myanmar-bean-trade-secret-key-2026";

/** Express middleware — verifies JWT token from Authorization header */
function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "အကောင့်ဝင်ရန် လိုအပ်ပါသည်" });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username }
    next();
  } catch (err) {
    return res.status(401).json({ error: "အကောင့်ဝင်ချိန် ကုန်ဆုံးသွားပါပြီ။ ပြန်ဝင်ပါ" });
  }
}

/** Generate a JWT for the given user */
function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "7d" });
}

module.exports = { authMiddleware, generateToken, JWT_SECRET };
