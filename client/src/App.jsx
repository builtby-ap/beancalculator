import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import BeanTypes from "./pages/BeanTypes";
import Calculator from "./pages/Calculator";
import InvoiceHistory from "./pages/InvoiceHistory";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/invoices" element={<InvoiceHistory />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/beans" element={<BeanTypes />} />
      </Routes>
    </Layout>
  );
}
