import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
    "accept": "application/json",
  }
});

export const api = {
  // Auth
  register: async (data) => {
    const response = await apiClient.post("/auth/register", data);
    return response.data;
  },
  login: async (data) => {
    const response = await apiClient.post("/auth/login", data);
    return response.data;
  },

  // Products
  createProduct: async (product) => {
    const response = await apiClient.post("/products", product);
    return response.data;
  },
  getProducts: async () => {
    const response = await apiClient.get("/products");
    return response.data;
  },
  getProductById: async (id) => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },
  updateProduct: async (id, product) => {
    const token = localStorage.getItem('token');
    const response = await apiClient.put(`/products/${id}`, product, {
      headers: { Authorization: `Bearer ${token}`}
    });
    return response.data;
  },
  deleteProduct: async (id) => {
    const token = localStorage.getItem('token');
    const response = await apiClient.delete(`/products/${id}`, {
      headers: { Authorization: `Bearer ${token}`}
    });
    return response.data;
  }
}
