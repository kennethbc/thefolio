import React, { useState, useEffect } from 'react';
import API from '../api/axios';

const AdminPage = () => {
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState('users');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, postsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/posts')
      ]);
      setUsers(usersRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id) => {
    try {
      const { data } = await API.put(`/admin/users/${id}/status`);
      setUsers(users.map(u => u._id === id ? data.user : u));
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const removePost = async (id) => {
    if (!window.confirm('Remove this post?')) return;
    try {
      await API.put(`/admin/posts/${id}/remove`);
      setPosts(posts.map(p => p._id === id ? { ...p, status: 'removed' } : p));
    } catch (err) {
      alert('Failed to remove post');
    }
  };

  if (loading) return <div style={styles.loading}>Loading admin dashboard...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Admin Dashboard</h1>
      
      <div style={styles.tabs}>
        <button
          onClick={() => setTab('users')}
          style={{ ...styles.tab, ...(tab === 'users' ? styles.activeTab : {}) }}
        >
          Members ({users.length})
        </button>
        <button
          onClick={() => setTab('posts')}
          style={{ ...styles.tab, ...(tab === 'posts' ? styles.activeTab : {}) }}
        >
          All Posts ({posts.length})
        </button>
      </div>

      {tab === 'users' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span style={{
                      ...styles.statusBadge,
                      ...(user.status === 'active' ? styles.active : styles.inactive)
                    }}>
                      {user.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => toggleStatus(user._id)}
                      style={user.status === 'active' ? styles.dangerBtn : styles.successBtn}
                    >
                      {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'posts' && (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {posts.map(post => (
                <tr key={post._id}>
                  <td>{post.title}</td>
                  <td>{post.author?.name || 'Unknown'}</td>
                  <td>
                    <span style={{
                      ...styles.statusBadge,
                      ...(post.status === 'published' ? styles.active : styles.removed)
                    }}>
                      {post.status}
                    </span>
                  </td>
                  <td>
                    {post.status === 'published' && (
                      <button
                        onClick={() => removePost(post._id)}
                        style={styles.dangerBtn}
                      >
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '2rem auto',
    padding: '0 1rem'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#1a1a2e'
  },
  tabs: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '2rem',
    borderBottom: '2px solid #eee'
  },
  tab: {
    padding: '0.75rem 1.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '1rem',
    cursor: 'pointer',
    color: '#666'
  },
  activeTab: {
    color: '#e94560',
    borderBottom: '2px solid #e94560',
    marginBottom: '-2px'
  },
  tableContainer: {
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  statusBadge: {
    padding: '0.25rem 0.5rem',
    borderRadius: '4px',
    fontSize: '0.85rem',
    textTransform: 'capitalize'
  },
  active: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32'
  },
  inactive: {
    backgroundColor: '#ffebee',
    color: '#c62828'
  },
  removed: {
    backgroundColor: '#ffebee',
    color: '#c62828'
  },
  dangerBtn: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  successBtn: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#4caf50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  loading: {
    textAlign: 'center',
    marginTop: '2rem',
    fontSize: '1.2rem'
  }
};

export default AdminPage;