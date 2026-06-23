const express = require("express");
const cors = require("cors");
const beansRouter = require("./routes/beans");
const transactionsRouter = require("./routes/transactions");
const invoiceRouter = require("./routes/invoice");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/beans", beansRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/invoice", invoiceRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
