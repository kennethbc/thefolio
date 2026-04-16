import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

const PostPage = () => {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentBody, setCommentBody] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [id]);

  const fetchPost = async () => {
    try {
      const { data } = await API.get(`/posts/${id}`);
      setPost(data);
    } catch (err) {
      setError('Post not found');
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const { data } = await API.get(`/comments/${id}`);
      setComments(data);
    } catch (err) {
      console.error('Error fetching comments:', err);
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentBody.trim()) return;
    try {
      const { data } = await API.post(`/comments/${id}`, { body: commentBody });
      setComments([data, ...comments]);
      setCommentBody('');
    } catch (err) {
      alert('Failed to add comment');
    }
  };

  const deleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await API.delete(`/comments/${commentId}`);
      setComments(comments.filter(c => c._id !== commentId));
    } catch (err) {
      alert('Failed to delete comment');
    }
  };

  const deletePost = async () => {
    if (!window.confirm('Delete this post permanently?')) return;
    try {
      await API.delete(`/posts/${id}`);
      navigate('/home');
    } catch (err) {
      alert('Failed to delete post');
    }
  };

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (error) return <div style={styles.error}>{error}</div>;

  const canEdit = user && (user._id === post.author._id || user.role === 'admin');

  return (
    <div style={styles.container}>
      <article style={styles.post}>
        {post.image && (
          <img
            src={`http://localhost:5000/uploads/${post.image}`}
            alt={post.title}
            style={styles.coverImage}
          />
        )}
        <h1 style={styles.title}>{post.title}</h1>
        <div style={styles.meta}>
          <span>By {post.author?.name || 'Unknown'}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
          {canEdit && (
            <div style={styles.actions}>
              <Link to={`/edit-post/${id}`} style={styles.editBtn}>Edit</Link>
              <button onClick={deletePost} style={styles.deleteBtn}>Delete</button>
            </div>
          )}
        </div>
        <div style={styles.content}>
          {post.body.split('\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      </article>

      <div style={styles.commentsSection}>
        <h3>Comments ({comments.length})</h3>
        
        {user && (
          <form onSubmit={handleComment} style={styles.commentForm}>
            <textarea
              value={commentBody}
              onChange={e => setCommentBody(e.target.value)}
              placeholder="Write a comment..."
              rows={3}
              style={styles.commentInput}
              required
            />
            <button type="submit" style={styles.submitBtn}>Post Comment</button>
          </form>
        )}
        
        <div style={styles.commentsList}>
          {comments.length === 0 ? (
            <p>No comments yet. Be the first to comment!</p>
          ) : (
            comments.map(comment => (
              <div key={comment._id} style={styles.comment}>
                <div style={styles.commentHeader}>
                  <strong>{comment.author?.name || 'Unknown'}</strong>
                  <span>{new Date(comment.createdAt).toLocaleDateString()}</span>
                  {(user?._id === comment.author?._id || user?.role === 'admin') && (
                    <button
                      onClick={() => deleteComment(comment._id)}
                      style={styles.deleteCommentBtn}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p style={styles.commentBody}>{comment.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: '0 1rem'
  },
  post: {
    backgroundColor: 'white',
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  coverImage: {
    width: '100%',
    maxHeight: '400px',
    objectFit: 'cover'
  },
  title: {
    fontSize: '2rem',
    padding: '1.5rem 1.5rem 0.5rem',
    margin: 0
  },
  meta: {
    padding: '0 1.5rem 1rem',
    color: '#666',
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  actions: {
    marginLeft: 'auto',
    display: 'flex',
    gap: '0.5rem'
  },
  editBtn: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#4caf50',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
    fontSize: '0.9rem'
  },
  deleteBtn: {
    padding: '0.25rem 0.75rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  content: {
    padding: '1.5rem',
    lineHeight: '1.8',
    fontSize: '1.1rem'
  },
  commentsSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  commentForm: {
    marginBottom: '2rem'
  },
  commentInput: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    marginBottom: '0.5rem',
    fontFamily: 'inherit'
  },
  submitBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#e94560',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer'
  },
  commentsList: {
    marginTop: '1rem'
  },
  comment: {
    borderBottom: '1px solid #eee',
    padding: '1rem 0'
  },
  commentHeader: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
    marginBottom: '0.5rem',
    fontSize: '0.9rem',
    color: '#666'
  },
  commentBody: {
    margin: 0,
    lineHeight: '1.5'
  },
  deleteCommentBtn: {
    marginLeft: 'auto',
    padding: '0.2rem 0.5rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem'
  },
  loading: {
    textAlign: 'center',
    marginTop: '2rem'
  },
  error: {
    textAlign: 'center',
    marginTop: '2rem',
    color: '#f44336'
  }
};

export default PostPage;