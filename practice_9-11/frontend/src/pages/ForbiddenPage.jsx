import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const navigate = useNavigate();
  return (
    <div className="error-page">
      <h1 className="error-code">403</h1>
      <p className="error-msg">Доступ запрещён</p>
      <button className="btn-primary" onClick={() => navigate('/')}>На главную</button>
    </div>
  );
}