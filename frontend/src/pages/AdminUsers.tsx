import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: number;
  login: string;
  fio: string;
  role: string;
}

export default function AdminUsers() {
  const navigate = useNavigate();
  const [isOpenMenu, setIsOpenMenu] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<'table' | 'add' | 'edit'>('table');

  const [users, setUsers] = useState<User[]>([
    { id: 1, login: 'IIIvanovich', fio: 'Иванов Иван Иванович', role: 'HR' },
    { id: 2, login: 'PPPetrovich', fio: 'Петров Петр Петрович', role: 'Решала' },
  ]);

  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  const [newFio, setNewFio] = useState('');
  const [newRole, setNewRole] = useState('HR');
  const [newLogin, setNewLogin] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFio || !newLogin || !newPassword) {
      alert('Пожалуйста, заполните все обязательные поля!');
      return;
    }

    const newUser: User = {
      id: users.length + 1,
      login: newLogin,
      fio: newFio,
      role: newRole,
    };

    setUsers([...users, newUser]);
    setCurrentScreen('table');
    clearForm();
  };

  const handleEditClick = (user: User) => {
    setEditingUserId(user.id);
    setNewFio(user.fio);
    setNewRole(user.role);
    setNewLogin(user.login);
    setNewPassword('********'); 
    setCurrentScreen('edit');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setUsers(users.map(u => u.id === editingUserId ? { ...u, fio: newFio, role: newRole, login: newLogin } : u));
    setCurrentScreen('table');
    clearForm();
  };

  const handleDeleteClick = (id: number) => {
    if (confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      setUsers(users.filter(user => user.id !== id));
    }
  };

  const clearForm = () => {
    setNewFio('');
    setNewRole('HR');
    setNewLogin('');
    setNewPassword('');
    setEditingUserId(null);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', minHeight: '100vh', boxSizing: 'border-box' }}>
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', minHeight: '80vh' }}>
        
        {currentScreen === 'table' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              
              <div style={{ position: 'relative', width: '250px' }}>
                <button 
                  onClick={() => setIsOpenMenu(!isOpenMenu)}
                  style={{ width: '100%', padding: '10px 15px', backgroundColor: '#cccccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px', textAlign: 'left', fontWeight: '500' }}
                >
                  {isOpenMenu ? '▲ Пользователи' : '▼ Пользователи'}
                </button>
                {isOpenMenu && (
                  <ul style={{ position: 'absolute', top: '100%', left: 0, width: '100%', margin: '5px 0 0 0', padding: 0, backgroundColor: '#e0e0e0', borderRadius: '4px', listStyle: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 10 }}>
                    <li style={{ padding: '12px', backgroundColor: '#d0d0d0', fontWeight: 'bold', borderBottom: '1px solid #ccc' }}>
                      Пользователи
                    </li>
                    <li 
                      onClick={() => { setIsOpenMenu(false); navigate('/admin/audit'); }}
                      style={{ padding: '12px', cursor: 'pointer', borderBottom: '1px solid #ccc' }}
                    >
                      Журнал аудита
                    </li>
                    <li 
                      onClick={() => { setIsOpenMenu(false); navigate('/candidates'); }}
                      style={{ padding: '12px', cursor: 'pointer' }}
                    >
                      Кандидаты
                    </li>
                  </ul>
                )}
              </div>
              
              <button 
                onClick={() => { clearForm(); setCurrentScreen('add'); }}
                style={{ padding: '10px 30px', backgroundColor: '#cccccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}
              >
                Добавить
              </button>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: '#d9d9d9', textAlign: 'center' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #555' }}>
                  <th style={{ padding: '15px', borderRight: '1px solid #555', width: '20%' }}>Логин</th>
                  <th style={{ padding: '15px', borderRight: '1px solid #555', width: '45%' }}>ФИО</th>
                  <th style={{ padding: '15px', borderRight: '1px solid #555', width: '25%' }}>Должность</th>
                  <th style={{ padding: '15px', width: '10%' }}>Действия</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #555' }}>
                    <td style={{ padding: '15px', borderRight: '1px solid #555' }}>{user.login}</td>
                    <td style={{ padding: '15px', borderRight: '1px solid #555', textAlign: 'left' }}>{user.fio}</td>
                    <td style={{ padding: '15px', borderRight: '1px solid #555' }}>{user.role}</td>
                    <td style={{ padding: '15px', gap: '15px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <span onClick={() => handleEditClick(user)} style={{ cursor: 'pointer', fontSize: '18px' }} title="Редактировать">✏️</span>
                      <span onClick={() => handleDeleteClick(user.id)} style={{ cursor: 'pointer', color: 'red', fontSize: '18px' }} title="Удалить">🗑️</span>
                    </td>
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
        )}

        {(currentScreen === 'add' || currentScreen === 'edit') && (
          <form onSubmit={currentScreen === 'add' ? handleCreateUser : handleSaveEdit}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
              <div style={{ padding: '10px 20px', backgroundColor: '#cccccc', borderRadius: '4px', fontWeight: '500' }}>
                {currentScreen === 'add' ? 'Добавление пользователя' : 'Редактирование прав пользователя'}
              </div>
              <button 
                type="button"
                onClick={() => setCurrentScreen('table')}
                style={{ padding: '10px 30px', backgroundColor: '#cccccc', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
              >
                Назад
              </button>
            </div>

            <div style={{ display: 'flex', gap: '40px' }}>
              
              <div style={{ flex: 1, backgroundColor: '#d9d9d9', padding: '20px', borderRadius: '4px', minHeight: '300px' }}>
                <h3 style={{ margin: '0 0 20px 0', textAlign: 'center', fontWeight: 'normal' }}>Разрешения</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ transform: 'scale(1.3)' }} defaultChecked={newRole === 'HR'} /> Доступ к кандидатам
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ transform: 'scale(1.3)' }} /> Управление матрицами
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" defaultChecked style={{ transform: 'scale(1.3)' }} /> Просмотр журнала
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ transform: 'scale(1.3)' }} defaultChecked={newRole === 'Решала'} /> Вынесение решений
                  </label>
                </div>
              </div>

              <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input 
                  type="text" 
                  placeholder="ФИО" 
                  value={newFio}
                  onChange={(e) => setNewFio(e.target.value)}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px', fontSize: '15px', boxSizing: 'border-box' }}
                />

                <select 
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  style={{ width: '100%', padding: '12px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px', fontSize: '15px', boxSizing: 'border-box', cursor: 'pointer' }}
                >
                  <option value="HR">HR</option>
                  <option value="Решала">Решала</option>
                </select>

                <input 
                  type="text" 
                  placeholder="Логин" 
                  value={newLogin}
                  onChange={(e) => setNewLogin(e.target.value)}
                style={{ width: '100%', padding: '12px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px', fontSize: '15px', boxSizing: 'border-box' }}
              />

                <input 
                    type="password" 
                    placeholder="Новый пароль (оставьте пустым, если не хотите менять)" 
                    value={newPassword === '********' ? '' : newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '12px', backgroundColor: '#e0e0e0', border: 'none', borderRadius: '4px', fontSize: '15px', boxSizing: 'border-box' }}
              />


              <button 
                type="submit" 
                style={{ padding: '12px', backgroundColor: '#cccccc', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '15px', marginTop: '10px', fontWeight: '500' }}
              >
                Применить
              </button>
            </div>

          </div>
        </form>
      )}

    </div>
  </div>
);
}
