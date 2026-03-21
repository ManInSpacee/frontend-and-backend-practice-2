import { useEffect, useState } from 'react';
import api from '../api/axios.js';

const ROLE_LABELS = { user: 'Покупатель', seller: 'Продавец', admin: 'Администратор' };

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await api.get('/users');
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id, role) => {
    await api.put(`/users/${id}`, { role });
    load();
  };

  const handleBlock = async (id, blocked) => {
    await api.put(`/users/${id}`, { blocked });
    load();
  };

  if (loading) return <div className="loading">Загрузка...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Пользователи</h1>
          <p className="page-subtitle">{users.length} аккаунтов</p>
        </div>
      </div>
      <div className="users-table-wrap">
        <table className="users-table">
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className={u.blocked ? 'row-blocked' : ''}>
                <td>{u.first_name} {u.last_name}</td>
                <td>{u.email}</td>
                <td>
                  <select
                    className="role-select"
                    value={u.role}
                    onChange={e => handleRoleChange(u.id, e.target.value)}
                  >
                    <option value="user">Покупатель</option>
                    <option value="seller">Продавец</option>
                    <option value="admin">Администратор</option>
                  </select>
                </td>
                <td>
                  <span className={`status-badge ${u.blocked ? 'status-blocked' : 'status-active'}`}>
                    {u.blocked ? 'Заблокирован' : 'Активен'}
                  </span>
                </td>
                <td>
                  <button
                    className={u.blocked ? 'btn-unblock' : 'btn-block'}
                    onClick={() => handleBlock(u.id, !u.blocked)}
                  >
                    {u.blocked ? 'Разблокировать' : 'Заблокировать'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}