import { useEffect, useState } from 'react';
import api from '../api/axios.js';
import { useAuth } from '../store/AuthContext.jsx';

const CATEGORY_ICONS = {
  'Процессор': '🔲',
  'Видеокарта': '🖥',
  'Материнская плата': '🔌',
  'Оперативная память': '💾',
  'SSD накопитель': '💿',
  'Блок питания': '⚡',
  'Корпус': '📦',
};

const emptyForm = { name: '', category: 'Процессор', description: '', price: '', stock: '' };

export default function CatalogPage() {
  const { user } = useAuth();
  const role = user?.role;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = async () => {
    const { data } = await api.get('/products');
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const categories = [...new Set(products.map(p => p.category))];

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleEdit = (p) => {
    setForm({ name: p.name, category: p.category, description: p.description, price: p.price, stock: p.stock });
    setEditId(p.id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить товар?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const payload = { ...form, price: Number(form.price), stock: Number(form.stock) };
      if (editId) {
        await api.put(`/products/${editId}`, payload);
      } else {
        await api.post('/products', payload);
      }
      setForm(emptyForm);
      setEditId(null);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка');
    }
  };

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
    setError('');
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Каталог комплектующих</h1>
          <p className="page-subtitle">{filtered.length} товаров</p>
        </div>
        {(role === 'seller' || role === 'admin') && (
          <button className="btn-primary" onClick={openAdd}>+ Добавить товар</button>
        )}
      </div>

      <div className="filters">
        <input
          className="form-input search-input"
          placeholder="Поиск по названию или описанию..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <div className="category-filters">
          <button className={`cat-btn ${!categoryFilter ? 'active' : ''}`} onClick={() => setCategoryFilter('')}>Все</button>
          {categories.map(cat => (
            <button key={cat} className={`cat-btn ${categoryFilter === cat ? 'active' : ''}`} onClick={() => setCategoryFilter(cat)}>
              {CATEGORY_ICONS[cat]} {cat}
            </button>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="product-form-card">
          <h3 className="form-title">{editId ? 'Редактировать товар' : 'Новый товар'}</h3>
          <form onSubmit={handleSubmit} className="product-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Название</label>
                <input className="form-input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Категория</label>
                <select className="form-input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {['Процессор', 'Видеокарта', 'Материнская плата', 'Оперативная память', 'SSD накопитель', 'Блок питания', 'Корпус'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Описание</label>
              <input className="form-input" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Цена (₽)</label>
                <input className="form-input" type="number" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Количество</label>
                <input className="form-input" type="number" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
              </div>
            </div>
            {error && <p className="form-error">{error}</p>}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button className="btn-primary" type="submit">{editId ? 'Сохранить' : 'Добавить'}</button>
              <button className="btn-secondary" type="button" onClick={() => setShowForm(false)}>Отмена</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Загрузка...</div>
      ) : (
        <div className="products-grid">
          {filtered.map(p => (
            <div key={p.id} className="product-card">
              <div className="product-card-icon">{CATEGORY_ICONS[p.category] || '📦'}</div>
              <div className="product-card-body">
                <span className="product-category">{p.category}</span>
                <h3 className="product-name">{p.name}</h3>
                <p className="product-desc">{p.description}</p>
                <div className="product-footer">
                  <span className="product-price">{p.price.toLocaleString()} ₽</span>
                  <span className="product-stock">{p.stock} шт.</span>
                </div>
                {(role === 'seller' || role === 'admin') && (
                  <div className="product-actions">
                    <button className="btn-edit" onClick={() => handleEdit(p)}>Редактировать</button>
                    {role === 'admin' && (
                      <button className="btn-delete" onClick={() => handleDelete(p.id)}>Удалить</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
