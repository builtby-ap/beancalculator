const express = require("express");
const cors = require("cors");
const { authMiddleware } = require("./middleware/auth");
const authRouter = require("./routes/auth");
const beansRouter = require("./routes/beans");
const transactionsRouter = require("./routes/transactions");
const invoiceRouter = require("./routes/invoice");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Public route — authentication (login)
app.use("/api/auth", authRouter);

// Protected routes — require JWT
app.use("/api/beans", authMiddleware, beansRouter);
app.use("/api/transactions", authMiddleware, transactionsRouter);
app.use("/api/invoice", authMiddleware, invoiceRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
