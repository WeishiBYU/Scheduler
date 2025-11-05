import React from 'react';
import './Login.css';
import { useNavigate } from 'react-router-dom';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  React.useEffect(() => {
    const checkLogin = async () => {
      try {
      const res = await fetch('api/user/me');
      if (res.ok) {
      navigate('/profile');
      }
    } catch (error) {
      console.error('Error checking login status:', error);
    }
  };

  checkLogin();

}, []);

  async function handleLogin() {
    const res = await fetch('api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    await res.json();
    if (res.ok) {
      navigate('/profile');
    } else {
      alert('Authentication failed');
    }
  }

  async function handleRegister() {
    const res = await fetch('api/auth/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    await res.json();
    if (res.ok) {
      navigate('/profile');
    } else {
      alert('Authentication failed');
    }
  }



  return (
    <div>
      <h1>Login</h1>
      <div>
        <label>Email:</label>
        <input type='text' onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <label>Password:</label>
        <input type='password' onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <button type='submit' disabled={!(email && password)} onClick={handleLogin}>
        Login
      </button>
      <button type='button' disabled={!(email && password)} onClick={handleRegister}>
        Register
      </button>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = React.useState('');

  React.useEffect(() => {
    (async () => {
      const res = await fetch('api/user/me');
      const data = await res.json();
      setUserInfo(data);
    })();
  }, []);

  function handleLogout() {
    fetch('api/auth/logout', {
      method: 'DELETE',
    });
    navigate('/');
  }
  
  return (
    <div>
      <h1>Profile</h1>
      <div>Logged in as: {userInfo.email}</div>
      <div>API Key: {userInfo.apiKey}</div>
      <button type='button' onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export { Login, Profile };