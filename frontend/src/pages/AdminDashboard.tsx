import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', height: '100vh', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', minHeight: '80vh', position: 'relative' }}>
        
        <div style={{ position: 'relative', width: '300px' }}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#cccccc',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              textAlign: 'left',
              fontWeight: '500'
            }}
          >
            {isOpen ? '▲ Закрыть меню' : '▼ Выберите раздел'}
          </button>

          {isOpen && (
            <ul style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              width: '100%',
              margin: '5px 0 0 0',
              padding: 0,
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              listStyle: 'none',
              boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
              zIndex: 10
            }}>
              <li 
                onClick={() => navigate('/admin/users')}
                style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #ccc' }}
              >
                Пользователи
              </li>
              <li style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #ccc' }}>
                Журнал аудита
              </li>
              <li 
                onClick={() => navigate('/candidates')}
                style={{ padding: '12px', cursor: 'pointer' }}
              >
                Кандидаты
              </li>
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
