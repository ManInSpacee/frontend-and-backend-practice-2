import React, { useEffect, useState } from "react";
import "./StorePage.scss";
import ProductModal from "../components/ProductModal.jsx";
import { api } from '../api/index.js'
import CardItem from "../components/CardItem.jsx";

export default function StorePage({ user, onLogout }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.getProducts();
      setProducts(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (id, product) => {
    try {
      if (id) {
        await api.updateProduct(id, product);
      } else {
        await api.createProduct(product)
      }

      await fetchProducts();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  }

  const handleDelete = async (id) => {
    const isConfirmed = confirm("Удалить");

    if(!isConfirmed) return;

    try {
      await api.deleteProduct(id);
      await fetchProducts();
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  }

  return (
    <div className="page">
      <header className="header">
        <div className="page-container header__container">
          <h3 className="header__title">Shop</h3>
          <div className="header__actions">
            <span className="header__user">{user.email}</span>
            <button className="logout-btn" onClick={onLogout}>Выйти</button>
            <button className="create-product-btn" onClick={() => {
              setSelectedProduct(null);
              setIsModalOpen(true);
            }}>Создать</button>
          </div>
        </div>
      </header>
      <main className="main">
        <div className="page-container">
          {loading ? (
            <p>Загрузка...</p>
          ) : (
            <div className="products-grid">
              {products.map((product) => (
                <CardItem
                  key={product.id}
                  product={product}
                  onEdit={() => handleEditClick(product)}
                  onDelete={() => handleDelete(product.id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Edit"
        initialData={selectedProduct}
        onSave={handleSave}
      />
    </div>
  );
}
