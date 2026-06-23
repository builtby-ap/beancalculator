import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Beans
export const getBeans = () => api.get("/beans").then((r) => r.data);
export const addBean = (data) => api.post("/beans", data).then((r) => r.data);
export const updateBean = (id, data) => api.put(`/beans/${id}`, data).then((r) => r.data);
export const deleteBean = (id) => api.delete(`/beans/${id}`).then((r) => r.data);

// Transactions
export const getTransactions = () => api.get("/transactions").then((r) => r.data);
export const addTransaction = (data) => api.post("/transactions", data).then((r) => r.data);
export const updateTransaction = (id, data) => api.put(`/transactions/${id}`, data).then((r) => r.data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`).then((r) => r.data);

// Summary
export const getSummary = () => api.get("/transactions/summary").then((r) => r.data);

// Invoice
export const calculateInvoice = (data) => api.post("/invoice/calculate", data).then((r) => r.data);
export const getInvoices = () => api.get("/invoice").then((r) => r.data);
export const getInvoice = (id) => api.get(`/invoice/${id}`).then((r) => r.data);

export default api;
