import { NavLink } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';

const BADGES = { user: 'Покупатель', seller: 'Продавец', admin: 'Администратор' };

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">⚙</span>
        <span className="navbar-title">PC Parts</span>
      </div>
      {user && (
        <nav className="navbar-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Каталог</NavLink>
          {user.role === 'admin' && (
            <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>Пользователи</NavLink>
          )}
          <div className="navbar-user">
            <span className="user-name">{user.first_name}</span>
            <span className={`role-badge role-${user.role}`}>{BADGES[user.role]}</span>
          </div>
          <button className="btn-logout" onClick={logout}>Выйти</button>
        </nav>
      )}
    </header>
  );
}
