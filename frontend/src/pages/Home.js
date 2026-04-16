import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../api/axios';

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/posts')
      .then(res => setPosts(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={styles.loading}>Loading posts...</div>;

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Latest Posts</h1>
      {posts.length === 0 ? (
        <p>No posts yet. Be the first to write one!</p>
      ) : (
        <div style={styles.grid}>
          {posts.map(post => (
            <Link to={`/posts/${post._id}`} key={post._id} style={styles.card}>
              {post.image && (
                <img 
                  src={`http://localhost:5000/uploads/${post.image}`} 
                  alt={post.title}
                  style={styles.cardImage}
                />
              )}
              <div style={styles.cardContent}>
                <h3>{post.title}</h3>
                <p>{post.body.substring(0, 150)}...</p>
                <div style={styles.cardFooter}>
                  <span>By {post.author?.name || 'Unknown'}</span>
                  <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem'
  },
  title: {
    fontSize: '2rem',
    marginBottom: '2rem',
    color: '#1a1a2e'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '2rem'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    textDecoration: 'none',
    color: 'inherit',
    transition: 'transform 0.2s'
  },
  cardImage: {
    width: '100%',
    height: '200px',
    objectFit: 'cover'
  },
  cardContent: {
    padding: '1rem'
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '1rem',
    fontSize: '0.8rem',
    color: '#666'
  }
};

export default HomePage;