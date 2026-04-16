import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>📝 TheFolio</Link>
        
        <div style={styles.links}>
          <Link to="/home" style={styles.link}>Home</Link>
          
          {user ? (
            <>
              <Link to="/create-post" style={styles.link}>New Post</Link>
              <Link to="/profile" style={styles.link}>Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={styles.link}>Admin</Link>
              )}
              <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
              <span style={styles.userName}>👤 {user.name}</span>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.link}>Login</Link>
              <Link to="/register" style={styles.link}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    backgroundColor: '#1a1a2e',
    padding: '1rem 2rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logo: {
    color: '#e94560',
    fontSize: '1.5rem',
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  links: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center'
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1rem'
  },
  logoutBtn: {
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  userName: {
    color: '#e94560',
    fontSize: '0.9rem'
  }
};

export default Navbar;