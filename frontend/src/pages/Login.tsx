import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

    const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (login.trim() && password.trim()) {
      if (login.toLowerCase() === 'admin') {
        navigate('/admin');
      } else {
        navigate('/candidates');
      }
    } else {
      alert('Пожалуйста, заполните все поля');
    }
  };


  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      backgroundColor: '#f5f5f5',
      fontFamily: 'sans-serif'
    }}>
      <form onSubmit={handleSignIn} style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        width: '320px',
        boxSizing: 'border-box'
      }}>
        
        <div style={{
          width: '120px',
          height: '120px',
          backgroundColor: '#d9d9d9',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#555',
          fontSize: '14px',
          marginBottom: '30px',
          borderRadius: '4px'
        }}>
          логотип
        </div>

        {/* Поле Логин */}
        <input 
          type="text" 
          placeholder="Логин" 
          value={login}
          onChange={(e) => setLogin(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            marginBottom: '15px',
            border: 'none',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }} 
        />
        
        {/* Поле Пароль */}
        <input 
          type="password" 
          placeholder="Пароль" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px',
            marginBottom: '25px',
            border: 'none',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }} 
        />

        {/* Кнопка Войти */}
        <button type="submit" style={{
          padding: '10px 30px',
          border: 'none',
          backgroundColor: '#cccccc',
          color: '#333',
          fontSize: '14px',
          borderRadius: '4px',
          cursor: 'pointer',
          fontWeight: '500',
          transition: 'background-color 0.2s'
        }}>
          Войти
        </button>

      </form>
    </div>
  );
}
