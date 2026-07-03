import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface LogEntry {
  id: number;
  date: string;
  fio: string;
  role: string;
  action: string;
}

export default function AuditLog() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const [logs] = useState<LogEntry[]>([
    { id: 1, date: '29.06.2026 11:11:11', fio: 'Иванов Иван Иванович', role: 'HR отдела ...', action: 'Добавил кандидата *ID*' },
    { id: 2, date: '30.06.2026 10:10:10', fio: 'Петров Петр Петрович', role: 'Решала', action: 'Отказал кандидату *ID*' },
  ]);

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', height: '100vh', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', minHeight: '80vh' }}>
        
        <div style={{ position: 'relative', width: '250px', marginBottom: '30px' }}>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            style={{
              width: '100%',
              padding: '10px 15px',
              backgroundColor: '#cccccc',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px',
              textAlign: 'left',
              fontWeight: '500'
            }}
          >
            {isOpen ? '▲ Журнал аудита' : '▼ Журнал аудита'}
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
                onClick={() => { setIsOpen(false); navigate('/admin/users'); }}
                style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #ccc' }}
              >
                Пользователи
              </li>
              <li 
                style={{ padding: '12px', backgroundColor: '#d0d0d0', fontWeight: 'bold', borderBottom: '1px solid #ccc' }}
              >
                Журнал аудита
              </li>
              <li 
                onClick={() => { setIsOpen(false); navigate('/candidates'); }}
                style={{ padding: '12px', cursor: 'pointer' }}
              >
                Кандидаты
              </li>
            </ul>
          )}
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#d9d9d9', textAlign: 'center' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #555' }}>
              <th style={{ padding: '15px', borderRight: '1px solid #555', width: '20%' }}>Дата</th>
              <th style={{ padding: '15px', borderRight: '1px solid #555', width: '30%' }}>ФИО</th>
              <th style={{ padding: '15px', borderRight: '1px solid #555', width: '20%' }}>Должность</th>
              <th style={{ padding: '15px', width: '30%' }}>Действие</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} style={{ borderBottom: '1px solid #555' }}>
                <td style={{ padding: '15px', borderRight: '1px solid #555', whiteSpace: 'nowrap' }}>{log.date}</td>
                <td style={{ padding: '15px', borderRight: '1px solid #555', textAlign: 'left' }}>{log.fio}</td>
                <td style={{ padding: '15px', borderRight: '1px solid #555' }}>{log.role}</td>
                <td style={{ padding: '15px', textAlign: 'left' }}>{log.action}</td>
              </tr>
            ))}
            <tr>
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
