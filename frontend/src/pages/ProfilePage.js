import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ProfilePage = () => {
  const { user, updateProfile, changePassword } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [pic, setPic] = useState(null);
  const [curPw, setCurPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const handleProfile = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    const fd = new FormData();
    fd.append('name', name);
    fd.append('bio', bio);
    if (pic) fd.append('profilePic', pic);
    try {
      await updateProfile(fd);
      setMsg('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating profile');
    }
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    setMsg('');
    setError('');
    try {
      await changePassword(curPw, newPw);
      setMsg('Password changed successfully!');
      setCurPw('');
      setNewPw('');
    } catch (err) {
      setError(err.response?.data?.message || 'Error changing password');
    }
  };

  const picSrc = user?.profilePic
    ? `http://localhost:5000/uploads/${user.profilePic}`
    : 'https://via.placeholder.com/150?text=Profile';

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>My Profile</h2>
        <img src={picSrc} alt="Profile" style={styles.avatar} />
        
        {msg && <div style={styles.success}>{msg}</div>}
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleProfile}>
          <h3>Edit Profile</h3>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Display name"
            style={styles.input}
          />
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Short bio..."
            rows={3}
            style={styles.textarea}
          />
          <label style={styles.label}>Change Profile Picture:</label>
          <input
            type="file"
            accept="image/*"
            onChange={e => setPic(e.target.files[0])}
            style={styles.fileInput}
          />
          <button type="submit" style={styles.button}>Save Profile</button>
        </form>
        
        <hr style={styles.hr} />
        
        <form onSubmit={handlePassword}>
          <h3>Change Password</h3>
          <input
            type="password"
            placeholder="Current password"
            value={curPw}
            onChange={e => setCurPw(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="New password (min 6 chars)"
            value={newPw}
            onChange={e => setNewPw(e.target.value)}
            required
            minLength="6"
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Change Password</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    margin: '2rem auto',
    padding: '0 1rem'
  },
  card: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  avatar: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    margin: '1rem auto',
    display: 'block'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit'
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer'
  },
  success: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  error: {
    backgroundColor: '#ffebee',
    color: '#c62828',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold'
  },
  fileInput: {
    marginBottom: '1rem',
    display: 'block'
  },
  hr: {
    margin: '2rem 0',
    border: 'none',
    borderTop: '1px solid #eee'
  }
};

export default ProfilePage;