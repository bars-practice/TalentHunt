import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Candidate {
  id: number;
  date: string;
  fio: string;
  level: string;
  status: 'Принят' | 'Отклонен';
  isDeleted: boolean;
}

export default function Candidates() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: 1, date: '30.06.2026 10:10:10', fio: 'Иванов Иван Иванович', level: 'Джун', status: 'Отклонен', isDeleted: false },
    { id: 2, date: '29.06.2026 11:11:11', fio: 'Петров Петр Петрович', level: 'Миддл', status: 'Принят', isDeleted: false },
  ]);

  const handleDelete = (id: number) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, isDeleted: true } : c));
  };

  const handleRestore = (id: number) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, isDeleted: false } : c));
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', height: '100vh', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', minHeight: '80vh' }}>
        
        <div style={{ position: 'relative', width: '250px', marginBottom: '30px' }}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            style={{ width: '100%', padding: '10px 15px', backgroundColor: '#cccccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', textAlign: 'left', fontWeight: '500' }}
          >
            {isOpen ? '▲ Кандидаты' : '▼ Кандидаты'}
          </button>

          {isOpen && (
            <ul style={{ position: 'absolute', top: '100%', left: 0, width: '100%', margin: '5px 0 0 0', padding: 0, backgroundColor: '#e0e0e0', borderRadius: '4px', listStyle: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
              <li onClick={() => { setIsOpen(false); navigate('/admin/users'); }} style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #ccc' }}>Пользователи</li>
              <li onClick={() => { setIsOpen(false); navigate('/admin/audit'); }} style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #ccc' }}>Журнал аудита</li>
              <li style={{ padding: '12px', backgroundColor: '#d0d0d0', fontWeight: 'bold' }}>Кандидаты</li>
            </ul>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#d9d9d9', textAlign: 'center' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #555' }}>
              <th style={{ padding: '15px', borderRight: '1px solid #555', width: '10%' }}>ID</th>
              <th style={{ padding: '15px', borderRight: '1px solid #555', width: '20%' }}>Дата</th>
              <th style={{ padding: '15px', borderRight: '1px solid #555', width: '35%' }}>ФИО</th>
              <th style={{ padding: '15px', borderRight: '1px solid #555', width: '15%' }}>Отклик</th>
              <th style={{ padding: '15px', borderRight: '1px solid #555', width: '10%' }}>Статус</th>
              <th style={{ padding: '15px', width: '10%' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid #555', textDecoration: c.isDeleted || c.status === 'Отклонен' ? 'line-through' : 'none', opacity: c.isDeleted ? 0.6 : 1 }}>
                <td style={{ padding: '15px', borderRight: '1px solid #555' }}>{c.id}</td>
                <td style={{ padding: '15px', borderRight: '1px solid #555', whiteSpace: 'nowrap' }}>{c.date}</td>
                <td style={{ padding: '15px', borderRight: '1px solid #555', textAlign: 'left' }}>{c.fio}</td>
                <td style={{ padding: '15px', borderRight: '1px solid #555' }}>{c.level}</td>
                <td style={{ padding: '15px', borderRight: '1px solid #555' }}>{c.status}</td>
                <td style={{ padding: '15px' }}>
                  {c.isDeleted ? (
                    <span onClick={() => handleRestore(c.id)} style={{ cursor: 'pointer', fontSize: '18px' }} title="Восстановить">🔄</span>
                  ) : (
                    <span onClick={() => handleDelete(c.id)} style={{ cursor: 'pointer', color: 'red', fontSize: '18px' }} title="Удалить">🗑️</span>
                  )}
                </td>
              </tr>
            ))}
            <tr>
              <td style={{ padding: '15px', borderRight: '1px solid #555' }}>...</td>
              <td style={{ padding: '15px', borderRight: '1px solid #555' }}>...</td>
              <td style={{ padding: '15px', borderRight: '1px solid #555' }}>...</td>
              <td style={{ padding: '15px', borderRight: '1px solid #555' }}>...</td>
              <td style={{ padding: '15px', borderRight: '1px solid #555' }}>...</td>
              <td style={{ padding: '15px' }}>...</td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
}
