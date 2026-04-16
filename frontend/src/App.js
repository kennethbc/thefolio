// App.js - Complete Fixed Version with Correct Text Direction
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './styles.css';

const API_URL = 'http://localhost:5001/api';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [postMedia, setPostMedia] = useState(null);
  const [postMediaType, setPostMediaType] = useState('text');
  const [profilePic, setProfilePic] = useState(null);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [profileData, setProfileData] = useState({ name: '', bio: '' });
  const [contactData, setContactData] = useState({ name: '', email: '', message: '' });
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode === 'true';
  });

  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Configure axios
  const token = localStorage.getItem('token');
  if (token) {
    axios.defaults.headers.common['Authorization'] = token;
  }

  // Fetch functions with useCallback
  const fetchPosts = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/posts`);
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  }, []);

  const fetchUserProfile = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/profile`);
      setUser(response.data);
      setProfileData({ name: response.data.name, bio: response.data.bio || '' });
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get(`${API_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }, []);

  const fetchContactMessages = useCallback(async () => {
    if (user?.role !== 'admin') return;
    try {
      const response = await axios.get(`${API_URL}/admin/contact-messages`);
      setContactMessages(response.data);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
    }
  }, [user?.role]);

  // Fetch data on load
  useEffect(() => {
    fetchPosts();
    if (token) {
      fetchUserProfile();
    }
  }, [token, fetchPosts, fetchUserProfile]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
      fetchContactMessages();
    }
  }, [user, fetchUsers, fetchContactMessages]);

  const fetchComments = async (postId) => {
    try {
      const response = await axios.get(`${API_URL}/comments/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error);
      return [];
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/login`, loginData);
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = token;
      setUser(user);
      setCurrentView('home');
      setShowPostForm(false);
      setLoginData({ email: '', password: '' });
    } catch (error) {
      alert('Login failed: ' + (error.response?.data?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_URL}/register`, registerData);
      alert('Registration successful! Please login.');
      setCurrentView('login');
      setRegisterData({ name: '', email: '', password: '' });
    } catch (error) {
      alert('Registration failed: ' + (error.response?.data?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    setCurrentView('home');
    setShowPostForm(false);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) {
      alert('Please write something to post');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', postContent);
      formData.append('mediaType', postMediaType);
      if (postMedia) {
        formData.append('media', postMedia);
      }
      
      await axios.post(`${API_URL}/posts`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setPostContent('');
      setPostMedia(null);
      setPostMediaType('text');
      fetchPosts();
      setShowPostForm(false);
      alert('Post created successfully!');
    } catch (error) {
      alert('Failed to create post: ' + (error.response?.data?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    try {
      await axios.delete(`${API_URL}/posts/${postId}`);
      fetchPosts();
      alert('Post deleted successfully!');
    } catch (error) {
      alert('Failed to delete post: ' + (error.response?.data?.message || 'Error'));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', profileData.name);
      formData.append('bio', profileData.bio);
      if (profilePic) {
        formData.append('profilePic', profilePic);
      }
      
      const response = await axios.put(`${API_URL}/profile`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUser(response.data);
      alert('Profile updated successfully!');
      setCurrentView('profile');
    } catch (error) {
      alert('Failed to update profile: ' + (error.response?.data?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const handleUserStatus = async (userId, currentStatus) => {
    try {
      await axios.put(`${API_URL}/users/${userId}/status`, { isActive: !currentStatus });
      fetchUsers();
      alert(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      alert('Failed to update user status');
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!contactData.name || !contactData.email || !contactData.message) {
      alert('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/contact`, contactData);
      alert('Message sent successfully! The admin will get back to you soon.');
      setContactData({ name: '', email: '', message: '' });
    } catch (error) {
      alert('Failed to send message: ' + (error.response?.data?.message || 'Error'));
    } finally {
      setLoading(false);
    }
  };

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      await axios.put(`${API_URL}/admin/contact-messages/${messageId}/status`, { status: newStatus });
      fetchContactMessages();
    } catch (error) {
      alert('Failed to update message status');
    }
  };

  const deleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    try {
      await axios.delete(`${API_URL}/admin/contact-messages/${messageId}`);
      fetchContactMessages();
      alert('Message deleted successfully');
    } catch (error) {
      alert('Failed to delete message');
    }
  };

  const handleMediaSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPostMedia(file);
      setPostMediaType(file.type.startsWith('image/') ? 'image' : 'video');
    }
  };

  const triggerFileInput = () => {
    document.getElementById('image-input').click();
  };

  // Reaction System
  const [postReactions, setPostReactions] = useState({});
  
  const handleReaction = (postId, reactionType) => {
    setPostReactions(prev => ({
      ...prev,
      [postId]: {
        type: reactionType,
        count: (prev[postId]?.count || 0) + 1
      }
    }));
  };

  const getReactionIcon = (reactionType) => {
    switch(reactionType) {
      case 'like': return '👍';
      case 'love': return '❤️';
      case 'haha': return '😂';
      case 'wow': return '😮';
      case 'sad': return '😢';
      case 'angry': return '😠';
      default: return '👍';
    }
  };

  // ============= CONSISTENT STYLES =============
  const cardStyle = {
    background: darkMode ? 'rgba(50,50,50,0.95)' : 'white',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    border: `1px solid ${darkMode ? '#444' : '#e0e0e0'}`
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    minHeight: 'calc(100vh - 200px)'
  };

  const sectionTitleStyle = {
    marginBottom: '20px',
    color: darkMode ? '#e4e6eb' : '#1a1a1a',
    fontSize: '24px',
    fontWeight: 'bold'
  };

  // Footer Component
  const Footer = () => (
    <footer style={{
      background: darkMode ? 'rgba(27,27,27,0.95)' : 'rgba(211, 47, 47, 0.9)',
      color: 'white',
      textAlign: 'center',
      padding: '15px',
      marginTop: 'auto',
      width: '100%'
    }}>
      <p>© 2026 Hot Wheels Blog | Passion for Collecting | All Rights Reserved</p>
    </footer>
  );

  // ============= NAVIGATION MENU =============
  const renderNav = () => {
    const navStyle = {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      padding: '10px 20px'
    };

    const buttonStyle = {
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      fontWeight: '500',
      transition: 'all 0.3s',
      border: 'none',
      background: 'transparent',
      color: darkMode ? '#e4e6eb' : '#1a1a1a'
    };

    const activeButtonStyle = {
      ...buttonStyle,
      background: '#ff3d00',
      color: 'white'
    };

    // GUEST MENU
    if (!user) {
      return (
        <header style={{ background: darkMode ? 'rgba(27,27,27,0.95)' : 'rgba(211, 47, 47, 0.95)' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img src="/images/Hot-Wheels-Emblem.png" alt="Hot Wheels" width="60" />
            <span>HOT WHEELS BLOG</span>
          </h1>
          <nav>
            <ul style={navStyle}>
              <li><button onClick={() => { setCurrentView('home'); setShowPostForm(false); }} style={currentView === 'home' ? activeButtonStyle : buttonStyle}>Home</button></li>
              <li><button onClick={() => setCurrentView('about')} style={currentView === 'about' ? activeButtonStyle : buttonStyle}>About</button></li>
              <li><button onClick={() => setCurrentView('contact')} style={currentView === 'contact' ? activeButtonStyle : buttonStyle}>Contact</button></li>
              <li><button onClick={() => setCurrentView('register')} style={currentView === 'register' ? activeButtonStyle : buttonStyle}>Register</button></li>
              <li><button onClick={() => setCurrentView('login')} style={currentView === 'login' ? activeButtonStyle : buttonStyle}>Login</button></li>
              <li><button onClick={toggleDarkMode} style={{ ...buttonStyle, fontSize: '20px' }}>{darkMode ? '☀️' : '🌙'}</button></li>
            </ul>
          </nav>
        </header>
      );
    } 
    // ADMIN MENU
    else if (user.role === 'admin') {
      const unreadCount = contactMessages.filter(m => m.status === 'unread').length;
      return (
        <header style={{ background: darkMode ? 'rgba(27,27,27,0.95)' : 'rgba(211, 47, 47, 0.95)' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img src="/images/Hot-Wheels-Emblem.png" alt="Hot Wheels" width="60" />
            <span>Hot Wheels Blog - Admin</span>
          </h1>
          <nav>
            <ul style={navStyle}>
              <li><button onClick={() => { setCurrentView('home'); setShowPostForm(false); }} style={currentView === 'home' ? activeButtonStyle : buttonStyle}>Home</button></li>
              <li><button onClick={() => setCurrentView('about')} style={currentView === 'about' ? activeButtonStyle : buttonStyle}>About</button></li>
              <li><button onClick={() => setCurrentView('profile')} style={currentView === 'profile' ? activeButtonStyle : buttonStyle}>Profile</button></li>
              <li><button onClick={() => setCurrentView('admin')} style={currentView === 'admin' ? activeButtonStyle : buttonStyle}>
                Admin Panel
                {unreadCount > 0 && (
                  <span style={{
                    backgroundColor: 'red',
                    color: 'white',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '12px',
                    marginLeft: '5px'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button></li>
              <li><button onClick={handleLogout} style={buttonStyle}>Logout</button></li>
              <li><button onClick={toggleDarkMode} style={{ ...buttonStyle, fontSize: '20px' }}>{darkMode ? '☀️' : '🌙'}</button></li>
              <li style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
                <span style={{ color: '#ff9800' }}>Welcome, {user.name} (Admin)</span>
              </li>
            </ul>
          </nav>
        </header>
      );
    } 
    // MEMBER MENU
    else {
      return (
        <header style={{ background: darkMode ? 'rgba(27,27,27,0.95)' : 'rgba(211, 47, 47, 0.95)' }}>
          <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img src="/images/Hot-Wheels-Emblem.png" alt="Hot Wheels" width="60" />
            <span>Hot Wheels Blog</span>
          </h1>
          <nav>
            <ul style={navStyle}>
              <li><button onClick={() => { setCurrentView('home'); setShowPostForm(false); }} style={currentView === 'home' ? activeButtonStyle : buttonStyle}>Home</button></li>
              <li><button onClick={() => setCurrentView('about')} style={currentView === 'about' ? activeButtonStyle : buttonStyle}>About</button></li>
              <li><button onClick={() => setCurrentView('contact')} style={currentView === 'contact' ? activeButtonStyle : buttonStyle}>Contact</button></li>
              <li><button onClick={() => setCurrentView('profile')} style={currentView === 'profile' ? activeButtonStyle : buttonStyle}>Profile</button></li>
              <li><button onClick={handleLogout} style={buttonStyle}>Logout</button></li>
              <li><button onClick={toggleDarkMode} style={{ ...buttonStyle, fontSize: '20px' }}>{darkMode ? '☀️' : '🌙'}</button></li>
              <li style={{ width: '100%', textAlign: 'center', marginTop: '10px' }}>
                <span style={{ color: '#ff9800' }}>Welcome, {user.name}</span>
              </li>
            </ul>
          </nav>
        </header>
      );
    }
  };

  // Facebook-style Create Post Box
  const CreatePostBox = () => (
    <div style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
        <img 
          src={user?.profilePic ? `http://localhost:5001${user.profilePic}` : `https://ui-avatars.com/api/?background=ff9800&color=fff&bold=true&size=50&name=${user?.name?.charAt(0)}`}
          alt="Profile"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
        <button
          onClick={() => setShowPostForm(!showPostForm)}
          style={{
            flex: 1,
            padding: '15px 20px',
            border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
            borderRadius: '30px',
            background: darkMode ? '#3a3a3a' : '#f0f2f5',
            textAlign: 'left',
            fontSize: '16px',
            color: darkMode ? '#e4e6eb' : '#65676b',
            cursor: 'pointer',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => e.target.style.background = darkMode ? '#4a4a4a' : '#e4e6e9'}
          onMouseLeave={(e) => e.target.style.background = darkMode ? '#3a3a3a' : '#f0f2f5'}
        >
          What's on your mind, {user?.name}?
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', borderTop: `1px solid ${darkMode ? '#444' : '#ddd'}`, paddingTop: '15px' }}>
        <button
          onClick={triggerFileInput}
          style={{
            flex: 1,
            padding: '10px',
            background: darkMode ? '#3a3a3a' : '#f0f2f5',
            color: darkMode ? '#e4e6eb' : '#65676b',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🖼️ Photo/Video
        </button>
        <input
          id="image-input"
          type="file"
          accept="image/*,video/*"
          style={{ display: 'none' }}
          onChange={handleMediaSelect}
        />
      </div>

      {showPostForm && (
        <form onSubmit={handleCreatePost} style={{ marginTop: '20px', borderTop: `1px solid ${darkMode ? '#444' : '#ddd'}`, paddingTop: '20px' }}>
          <textarea
  value={postContent}
  onChange={(e) => setPostContent(e.target.value)}
  placeholder={`What's on your mind, ${user?.name}?`}
  required
  rows="4"
  style={{
    width: '100%',
    padding: '12px',
    border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
    borderRadius: '8px',
    marginBottom: '15px',
    fontSize: '16px',
    fontFamily: 'inherit',
    resize: 'vertical',
    background: darkMode ? '#2a2a2a' : 'white',
    color: darkMode ? '#e4e6eb' : '#1a1a1a',
    direction: 'ltr !important',
    textAlign: 'left',
    unicodeBidi: 'normal',
    writingMode: 'horizontal-tb'
  }}
  autoFocus
/>
          
          {postMedia && (
            <div style={{ marginBottom: '15px', position: 'relative' }}>
              {postMedia.type.startsWith('image/') ? (
                <img 
                  src={URL.createObjectURL(postMedia)} 
                  alt="Preview" 
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px', 
                    objectFit: 'contain',
                    borderRadius: '8px'
                  }} 
                />
              ) : (
                <video 
                  src={URL.createObjectURL(postMedia)} 
                  controls 
                  style={{ 
                    width: '100%', 
                    maxHeight: '300px',
                    borderRadius: '8px'
                  }} 
                />
              )}
              <button
                type="button"
                onClick={() => setPostMedia(null)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(0,0,0,0.6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '30px',
                  height: '30px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                ✕
              </button>
            </div>
          )}
          
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => {
                setShowPostForm(false);
                setPostContent('');
                setPostMedia(null);
                setPostMediaType('text');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: darkMode ? '#4a4a4a' : '#e4e6e9',
                color: darkMode ? '#e4e6eb' : '#4b4f56',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#ff3d00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      )}
    </div>
  );

  // Individual Post Component - FIXED VERSION
  const PostCard = ({ post }) => {
    const [showReactions, setShowReactions] = useState(false);
    const [showCommentSection, setShowCommentSection] = useState(false);
    const [localComments, setLocalComments] = useState([]);
    const [localCommentText, setLocalCommentText] = useState('');

    // Load comments function - FIXED
    const loadComments = useCallback(async () => {
      const comments = await fetchComments(post._id);
      setLocalComments(comments);
    }, [post._id]);

    useEffect(() => {
      if (showCommentSection) {
        loadComments();
      }
    }, [showCommentSection, loadComments]);

    const addComment = async () => {
      if (!localCommentText.trim()) return;
      try {
        await axios.post(`${API_URL}/comments/${post._id}`, { content: localCommentText });
        setLocalCommentText('');
        loadComments();
      } catch (error) {
        alert('Failed to add comment');
      }
    };

    const deleteComment = async (commentId) => {
      if (!window.confirm('Delete this comment?')) return;
      try {
        await axios.delete(`${API_URL}/comments/${commentId}`);
        loadComments();
      } catch (error) {
        alert('Failed to delete comment');
      }
    };

    const reactions = ['like', 'love', 'haha', 'wow', 'sad', 'angry'];
    const reactionIcons = { like: '👍', love: '❤️', haha: '😂', wow: '😮', sad: '😢', angry: '😠' };

    return (
      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img 
              src={post.author?.profilePic ? `http://localhost:5001${post.author.profilePic}` : `https://ui-avatars.com/api/?background=ff9800&color=fff&bold=true&size=50&name=${post.author?.name?.charAt(0)}`}
              alt="Profile"
              style={{
                width: '50px',
                height: '50px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '16px', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>{post.author?.name}</div>
              <div style={{ fontSize: '12px', color: darkMode ? '#b0b3b8' : '#65676b' }}>
                {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </div>
          {(user?.role === 'admin' || (user && post.author?._id === user.id)) && (
            <button
              onClick={() => handleDeletePost(post._id)}
              style={{
                padding: '6px 12px',
                backgroundColor: '#e74c3c',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Delete
            </button>
          )}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <p style={{ lineHeight: '1.6', fontSize: '15px', color: darkMode ? '#e4e6eb' : '#1a1a1a', direction: 'ltr', textAlign: 'left' }}>{post.content}</p>
          
          {post.media && (
            <div style={{ marginTop: '15px' }}>
              {post.mediaType === 'image' ? (
                <img 
                  src={`http://localhost:5001${post.media}`} 
                  alt="Post content" 
                  style={{ 
                    width: '100%', 
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                  onClick={() => window.open(`http://localhost:5001${post.media}`, '_blank')}
                />
              ) : post.mediaType === 'video' && (
                <video 
                  src={`http://localhost:5001${post.media}`} 
                  controls 
                  style={{ width: '100%', borderRadius: '8px' }}
                />
              )}
            </div>
          )}
        </div>

        <div style={{ 
          borderTop: `1px solid ${darkMode ? '#444' : '#ddd'}`, 
          borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`,
          padding: '8px 0',
          display: 'flex',
          gap: '10px',
          marginBottom: '10px'
        }}>
          <div style={{ position: 'relative' }}>
            <button
              onMouseEnter={() => setShowReactions(true)}
              onMouseLeave={() => setShowReactions(false)}
              style={{
                padding: '8px 15px',
                background: 'none',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                color: darkMode ? '#b0b3b8' : '#65676b',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              {postReactions[post._id] ? getReactionIcon(postReactions[post._id].type) : '👍'} 
              {postReactions[post._id]?.count || 0} Like
            </button>
            
            {showReactions && (
              <div
                onMouseEnter={() => setShowReactions(true)}
                onMouseLeave={() => setShowReactions(false)}
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  left: '0',
                  background: darkMode ? '#3a3a3a' : 'white',
                  borderRadius: '30px',
                  boxShadow: '0 2px 12px rgba(0,0,0,0.2)',
                  padding: '8px',
                  display: 'flex',
                  gap: '5px',
                  zIndex: 1000
                }}
              >
                {reactions.map(react => (
                  <button
                    key={react}
                    onClick={() => handleReaction(post._id, react)}
                    style={{
                      fontSize: '24px',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '5px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {reactionIcons[react]}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <button
            onClick={() => setShowCommentSection(!showCommentSection)}
            style={{
              flex: 1,
              padding: '8px 15px',
              background: 'none',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 'bold',
              color: darkMode ? '#b0b3b8' : '#65676b'
            }}
          >
            💬 {localComments.length} Comment{localComments.length !== 1 ? 's' : ''}
          </button>
        </div>

        {showCommentSection && (
          <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: `1px solid ${darkMode ? '#444' : '#ddd'}` }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
              <img 
                src={user?.profilePic ? `http://localhost:5001${user.profilePic}` : `https://ui-avatars.com/api/?background=ff9800&color=fff&bold=true&size=40&name=${user?.name?.charAt(0)}`}
                alt="Profile"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
              <div style={{ flex: 1 }}>
                <textarea
                  value={localCommentText}
                  onChange={(e) => setLocalCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  rows="2"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    background: darkMode ? '#2a2a2a' : 'white',
                    color: darkMode ? '#e4e6eb' : '#1a1a1a',
                    direction: 'ltr',
                    textAlign: 'left'
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '5px' }}>
                  <button
                    onClick={addComment}
                    style={{
                      padding: '6px 15px',
                      backgroundColor: '#ff3d00',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    Comment
                  </button>
                </div>
              </div>
            </div>

            {localComments.length === 0 ? (
              <p style={{ textAlign: 'center', color: darkMode ? '#b0b3b8' : '#65676b', padding: '10px' }}>No comments yet. Be the first to comment!</p>
            ) : (
              localComments.map(comment => (
                <div key={comment._id} style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                  <img 
                    src={comment.author?.profilePic ? `http://localhost:5001${comment.author.profilePic}` : `https://ui-avatars.com/api/?background=ff9800&color=fff&bold=true&size=35&name=${comment.author?.name?.charAt(0)}`}
                    alt="Profile"
                    style={{
                      width: '35px',
                      height: '35px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{ flex: 1, background: darkMode ? '#3a3a3a' : '#f0f2f5', padding: '10px', borderRadius: '12px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '13px', marginBottom: '5px', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>{comment.author?.name}</div>
                    <div style={{ fontSize: '14px', color: darkMode ? '#e4e6eb' : '#1a1a1a', direction: 'ltr', textAlign: 'left' }}>{comment.content}</div>
                    <div style={{ fontSize: '11px', color: darkMode ? '#b0b3b8' : '#65676b', marginTop: '5px' }}>
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {(user?._id === comment.author?._id || user?.role === 'admin') && (
                    <button
                      onClick={() => deleteComment(comment._id)}
                      style={{
                        padding: '5px 10px',
                        backgroundColor: '#e74c3c',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '11px',
                        height: '30px'
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // Hero Section
  const HeroSection = () => (
    <div style={{
      ...cardStyle,
      textAlign: 'center',
      background: darkMode ? 'rgba(50,50,50,0.95)' : 'rgba(255,255,255,0.95)',
      marginBottom: '20px'
    }}>
      <h2 style={{ color: '#ff3d00', marginBottom: '15px' }}>Welcome to My Hot Wheels Blog</h2>
      <p style={{ marginBottom: '20px', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>
        Share your passion for collecting Hot Wheels cars, from rare finds to classic models!
      </p>
      <img 
        src="/images/collection.webp" 
        alt="A collection of Hot Wheels cars" 
        style={{ 
          width: '100%', 
          maxWidth: '500px', 
          borderRadius: '10px',
          margin: '0 auto'
        }} 
      />
    </div>
  );

  // Info Cards Section
  const InfoCards = () => (
    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '20px' }}>
      <div style={{ ...cardStyle, flex: 1 }}>
        <h4 style={{ color: '#ff3d00', marginBottom: '10px' }}>My Journey</h4>
        <p style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>How I started collecting Hot Wheels and tips for beginners.</p>
      </div>
      <div style={{ ...cardStyle, flex: 1 }}>
        <h4 style={{ color: '#ff3d00', marginBottom: '10px' }}>Resources</h4>
        <p style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Tools and sites for collectors to find rare cars.</p>
      </div>
      <div style={{ ...cardStyle, flex: 1 }}>
        <h4 style={{ color: '#ff3d00', marginBottom: '10px' }}>Join Me</h4>
        <p style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Be part of the Hot Wheels community!</p>
      </div>
    </div>
  );

  // Home Page
  const renderHome = () => (
    <div style={containerStyle}>
      <HeroSection />
      {user && <CreatePostBox />}
      
      <h2 style={sectionTitleStyle}>Latest Posts</h2>
      {posts.length === 0 ? (
        <div style={cardStyle}>
          <p style={{ textAlign: 'center', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>
            No posts yet. Be the first to create a post!
          </p>
        </div>
      ) : (
        posts.map(post => <PostCard key={post._id} post={post} />)
      )}
      
      <InfoCards />
    </div>
  );

  // Profile Page
  const renderProfile = () => (
    <div style={containerStyle}>
      <form onSubmit={handleUpdateProfile} style={cardStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#ff3d00' }}>My Profile</h2>
        
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <img 
            src={user?.profilePic ? `http://localhost:5001${user.profilePic}` : `https://ui-avatars.com/api/?background=ff9800&color=fff&bold=true&size=120&name=${user?.name?.charAt(0)}`}
            alt="Profile"
            style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid #ff9800'
            }}
          />
          <div style={{ marginTop: '10px' }}>
            <label style={{
              padding: '8px 16px',
              backgroundColor: '#ff9800',
              color: 'white',
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'inline-block'
            }}>
              Change Profile Picture
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setProfilePic(e.target.files[0])}
                style={{ display: 'none' }}
              />
            </label>
          </div>
          {profilePic && (
            <p style={{ fontSize: '12px', color: '#2ecc71', marginTop: '5px' }}>
              New photo selected: {profilePic.name}
            </p>
          )}
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Name:</label>
          <input
            type="text"
            value={profileData.name}
            onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
              borderRadius: '8px',
              fontSize: '14px',
              background: darkMode ? '#2a2a2a' : 'white',
              color: darkMode ? '#e4e6eb' : '#1a1a1a',
              direction: 'ltr'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Bio:</label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            rows="4"
            placeholder="Tell us about your Hot Wheels collection..."
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: 'inherit',
              background: darkMode ? '#2a2a2a' : 'white',
              color: darkMode ? '#e4e6eb' : '#1a1a1a',
              direction: 'ltr',
              textAlign: 'left'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Email: </label>
          <span style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>{user?.email}</span>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Role: </label>
          <span style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>{user?.role === 'admin' ? 'Administrator' : 'Member'}</span>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#ff3d00',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );

  // Admin Panel with Contact Messages Section
  const renderAdminPanel = () => {
    const displayMessages = showUnreadOnly 
      ? contactMessages.filter(m => m.status === 'unread')
      : contactMessages;

    return (
      <div style={containerStyle}>
        {/* User Management Section */}
        <div style={cardStyle}>
          <h2 style={{ color: '#ff3d00', marginBottom: '20px' }}>User Management</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: darkMode ? '#3a3a3a' : '#f0f2f5' }}>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(userItem => (
                  <tr key={userItem._id}>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>{userItem.name}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>{userItem.email}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>{userItem.role}</td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        backgroundColor: userItem.isActive ? '#2ecc71' : '#e74c3c',
                        color: 'white',
                        fontSize: '12px'
                      }}>
                        {userItem.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}` }}>
                      <button
                        onClick={() => handleUserStatus(userItem._id, userItem.isActive)}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: userItem.isActive ? '#e74c3c' : '#2ecc71',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        {userItem.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Messages Section */}
        <div style={cardStyle}>
          <h2 style={{ color: '#ff3d00', marginBottom: '20px' }}>
            📬 Contact Messages
            {contactMessages.filter(m => m.status === 'unread').length > 0 && (
              <span style={{
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '50%',
                padding: '2px 8px',
                fontSize: '14px',
                marginLeft: '10px'
              }}>
                {contactMessages.filter(m => m.status === 'unread').length} New
              </span>
            )}
          </h2>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => setShowUnreadOnly(false)}
              style={{
                padding: '8px 16px',
                backgroundColor: !showUnreadOnly ? '#ff3d00' : (darkMode ? '#3a3a3a' : '#e0e0e0'),
                color: !showUnreadOnly ? 'white' : (darkMode ? '#e4e6eb' : '#1a1a1a'),
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              All Messages ({contactMessages.length})
            </button>
            <button
              onClick={() => setShowUnreadOnly(true)}
              style={{
                padding: '8px 16px',
                backgroundColor: showUnreadOnly ? '#ff3d00' : (darkMode ? '#3a3a3a' : '#e0e0e0'),
                color: showUnreadOnly ? 'white' : (darkMode ? '#e4e6eb' : '#1a1a1a'),
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Unread ({contactMessages.filter(m => m.status === 'unread').length})
            </button>
          </div>
          
          {displayMessages.length === 0 ? (
            <p style={{ textAlign: 'center', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>
              {showUnreadOnly ? 'No unread messages.' : 'No messages yet.'}
            </p>
          ) : (
            displayMessages.map(message => (
              <div key={message._id} style={{
                ...cardStyle,
                marginBottom: '15px',
                borderLeft: `4px solid ${message.status === 'unread' ? '#ff3d00' : message.status === 'replied' ? '#2ecc71' : '#3498db'}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>{message.name}</strong>
                    <span style={{ marginLeft: '10px', fontSize: '12px', color: darkMode ? '#b0b3b8' : '#65676b' }}>
                      ({message.email})
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: darkMode ? '#b0b3b8' : '#65676b' }}>
                    {new Date(message.createdAt).toLocaleDateString()} at {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
                <p style={{ marginBottom: '15px', color: darkMode ? '#e4e6eb' : '#1a1a1a', direction: 'ltr', textAlign: 'left' }}>{message.message}</p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                  {message.status === 'unread' && (
                    <button
                      onClick={() => updateMessageStatus(message._id, 'read')}
                      style={{
                        padding: '5px 12px',
                        backgroundColor: '#3498db',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Mark as Read
                    </button>
                  )}
                  {message.status === 'read' && (
                    <button
                      onClick={() => updateMessageStatus(message._id, 'replied')}
                      style={{
                        padding: '5px 12px',
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Mark as Replied
                    </button>
                  )}
                  <button
                    onClick={() => deleteMessage(message._id)}
                    style={{
                      padding: '5px 12px',
                      backgroundColor: '#e74c3c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // About Page
  const renderAbout = () => (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ color: '#ff3d00', marginBottom: '15px' }}>What I Love About Hot Wheels</h2>
        <p style={{ lineHeight: '1.6', color: darkMode ? '#e4e6eb' : '#1a1a1a', direction: 'ltr', textAlign: 'left' }}>
          Collecting Hot Wheels brings joy to my life, especially discovering rare and unique cars. The craftsmanship and nostalgia make it a fun and memorable hobby.
        </p>
      </div>

      <div style={cardStyle}>
        <h2 style={{ color: '#ff3d00', marginBottom: '15px' }}>My Hot Wheels Journey</h2>
        <ol style={{ marginLeft: '20px', marginBottom: '20px', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>
          <li>First Hot Wheel: K.I.T.T</li>
          <li>Started collecting: December 27, 2025</li>
          <li>Finding nice cars to add to my collection</li>
          <li>Currently, I have 50 pieces in my room</li>
        </ol>
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ marginBottom: '15px', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>My Favorite Hot Wheels: "Formula 1" – One of the hardest to find!</h3>
          <img src="/images/f1.webp" alt="Hot Wheels Formula 1" width="200" style={{ borderRadius: '8px' }} />
        </div>
      </div>

      <div style={cardStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#ff3d00' }}>Hot Wheels Quiz!</h2>
        <QuizComponent />
      </div>

      <div style={cardStyle}>
        <h3 style={{ textAlign: 'center' }}>
          <strong>"Collecting Hot Wheels is not just about the cars, it's about the memories and connections you make along the way."</strong>
        </h3>
      </div>
    </div>
  );

  // Quiz Component
  const QuizComponent = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    const questions = [
      {
        question: "What year was Hot Wheels founded?",
        options: ["1968", "1975", "1982", "1990"],
        correct: 0
      },
      {
        question: "What was the first Hot Wheels car ever made?",
        options: ["Twin Mill", "Custom Camaro", "Sweet 16", "Bone Shaker"],
        correct: 1
      },
      {
        question: "Which company manufactures Hot Wheels?",
        options: ["Hasbro", "Lego", "Mattel", "Bandai"],
        correct: 2
      },
      {
        question: "What color is the famous 'Treasure Hunt' logo?",
        options: ["Red", "Blue", "Green", "Yellow"],
        correct: 0
      }
    ];

    const handleAnswer = (selectedIdx) => {
      setSelectedAnswer(selectedIdx);
    };

    const handleNext = () => {
      if (selectedAnswer === questions[currentQuestion].correct) {
        setScore(score + 1);
      }
      setSelectedAnswer(null);
      if (currentQuestion + 1 < questions.length) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        setShowResult(true);
      }
    };

    if (showResult) {
      return (
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#ff3d00', marginBottom: '10px' }}>Quiz Complete!</h3>
          <p style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Your score: {score} out of {questions.length}</p>
          <p style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>
            {score === questions.length ? "Perfect! You're a Hot Wheels expert!" : "Good try! Keep collecting!"}
          </p>
        </div>
      );
    }

    return (
      <div>
        <h3 style={{ marginBottom: '15px', textAlign: 'center', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>{questions[currentQuestion].question}</h3>
        <div style={{ marginBottom: '20px' }}>
          {questions[currentQuestion].options.map((option, idx) => (
            <div
              key={idx}
              onClick={() => handleAnswer(idx)}
              style={{
                padding: '12px 15px',
                margin: '8px 0',
                background: selectedAnswer === idx 
                  ? '#ff9800' 
                  : darkMode ? 'rgba(255,255,255,0.1)' : '#f4f4f4',
                color: selectedAnswer === idx ? 'white' : (darkMode ? '#e4e6eb' : '#1a1a1a'),
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.3s',
                textAlign: 'center',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                if (selectedAnswer !== idx) {
                  e.target.style.background = darkMode ? 'rgba(255,255,255,0.2)' : '#e0e0e0';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedAnswer !== idx) {
                  e.target.style.background = darkMode ? 'rgba(255,255,255,0.1)' : '#f4f4f4';
                }
              }}
            >
              {option}
            </div>
          ))}
        </div>
        <button
          onClick={handleNext}
          disabled={selectedAnswer === null}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: selectedAnswer === null ? '#ccc' : '#ff3d00',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: selectedAnswer === null ? 'default' : 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {currentQuestion + 1 === questions.length ? 'Finish' : 'Next'}
        </button>
      </div>
    );
  };

  // Contact Page - For Guests and Members
  const renderContact = () => {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <form onSubmit={handleContactSubmit}>
            <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#ff3d00' }}>Contact Us</h2>
            <p style={{ textAlign: 'center', marginBottom: '20px', color: darkMode ? '#e4e6eb' : '#666' }}>
              Have questions or feedback? Send us a message and we'll get back to you soon!
            </p>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Your Name:</label>
              <input
                type="text"
                value={contactData.name}
                onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#2a2a2a' : 'white',
                  color: darkMode ? '#e4e6eb' : '#1a1a1a',
                  direction: 'ltr'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Your Email:</label>
              <input
                type="email"
                value={contactData.email}
                onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#2a2a2a' : 'white',
                  color: darkMode ? '#e4e6eb' : '#1a1a1a',
                  direction: 'ltr'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Message:</label>
              <textarea
                rows="5"
                value={contactData.message}
                onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                required
                placeholder="Write your message here..."
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
                  borderRadius: '8px',
                  background: darkMode ? '#2a2a2a' : 'white',
                  color: darkMode ? '#e4e6eb' : '#1a1a1a',
                  fontFamily: 'inherit',
                  direction: 'ltr',
                  textAlign: 'left'
                }}
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#ff3d00',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Sending...' : 'Send Message'}
            </button>
            
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
              <h3 style={{ color: '#ff3d00', marginBottom: '10px' }}>Our Information</h3>
              <p style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>📧 Email: support@hotwheelsblog.com</p>
              <p style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>📞 Phone: (123) 456-7890</p>
              <p style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>📍 Address: 123 Hot Wheels Lane, Collector City, USA</p>
            </div>
          </form>
        </div>
        
        <div style={cardStyle}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>📍 Our Location</h2>
            <p style={{ color: darkMode ? '#e4e6eb' : '#666' }}>THIS MAP IS A PLACEHOLDER ONLY</p>
          </div>
          <img 
            src="/images/OIP (8).webp" 
            alt="Hot Wheels Map" 
            style={{ 
              width: '100%', 
              maxHeight: '200px', 
              objectFit: 'contain',
              borderRadius: '8px'
            }} 
          />
        </div>
        
        <div style={cardStyle}>
          <h2 style={{ color: '#ff3d00', marginBottom: '20px' }}>📚 Hot Wheels Resources</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: darkMode ? '#3a3a3a' : '#f0f2f5' }}>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Resource Name</th>
                <th style={{ padding: '12px', textAlign: 'left', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '10px', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Hot Wheels Official Website</td>
                <td style={{ padding: '10px', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Visit for the latest car releases and updates.</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Hot Wheels Collector's Guide</td>
                <td style={{ padding: '10px', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>A guide for collectors, including rarity and value of cars.</td>
              </tr>
              <tr>
                <td style={{ padding: '10px', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>eBay Hot Wheels Auctions</td>
                <td style={{ padding: '10px', borderBottom: `1px solid ${darkMode ? '#444' : '#ddd'}`, color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Find rare Hot Wheels on eBay for buying and selling.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Login Page
  const renderLogin = () => (
    <div style={containerStyle}>
      <form onSubmit={handleLogin} style={cardStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#ff3d00' }}>Login</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Email:</label>
          <input
            type="email"
            value={loginData.email}
            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
              borderRadius: '8px',
              background: darkMode ? '#2a2a2a' : 'white',
              color: darkMode ? '#e4e6eb' : '#1a1a1a',
              direction: 'ltr'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Password:</label>
          <input
            type="password"
            value={loginData.password}
            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
              borderRadius: '8px',
              background: darkMode ? '#2a2a2a' : 'white',
              color: darkMode ? '#e4e6eb' : '#1a1a1a',
              direction: 'ltr'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#ff3d00',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
        
        <p style={{ marginTop: '15px', textAlign: 'center', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>
          Don't have an account?{' '}
          <button
            onClick={() => setCurrentView('register')}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff9800',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Register here
          </button>
        </p>
      </form>
    </div>
  );

  // Register Page
  const renderRegister = () => (
    <div style={containerStyle}>
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img src="/images/hw.png" alt="Hot Wheels collection display" width="150" height="50" />
        <h3 style={{ color: darkMode ? '#e4e6eb' : '#1a1a1a', marginTop: '10px' }}>
          Sign up to receive updates, tips, and learning resources about Hot Wheels collecting.
        </h3>
      </div>
      
      <form onSubmit={handleRegister} style={cardStyle}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px', color: '#ff3d00' }}>Register</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Name:</label>
          <input
            type="text"
            value={registerData.name}
            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
              borderRadius: '8px',
              background: darkMode ? '#2a2a2a' : 'white',
              color: darkMode ? '#e4e6eb' : '#1a1a1a',
              direction: 'ltr'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Email:</label>
          <input
            type="email"
            value={registerData.email}
            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
              borderRadius: '8px',
              background: darkMode ? '#2a2a2a' : 'white',
              color: darkMode ? '#e4e6eb' : '#1a1a1a',
              direction: 'ltr'
            }}
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>Password:</label>
          <input
            type="password"
            value={registerData.password}
            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '10px',
              border: `1px solid ${darkMode ? '#555' : '#ddd'}`,
              borderRadius: '8px',
              background: darkMode ? '#2a2a2a' : 'white',
              color: darkMode ? '#e4e6eb' : '#1a1a1a',
              direction: 'ltr'
            }}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#ff3d00',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          {loading ? 'Registering...' : 'Register'}
        </button>
        
        <p style={{ marginTop: '15px', textAlign: 'center', color: darkMode ? '#e4e6eb' : '#1a1a1a' }}>
          Already have an account?{' '}
          <button
            onClick={() => setCurrentView('login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#ff9800',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Login here
          </button>
        </p>
      </form>
    </div>
  );

     // ... (lahat ng render functions)

  return (
    <>
      <style>{`
        * {
          direction: ltr !important;
          unicode-bidi: normal !important;
        }
        textarea, input, p {
          direction: ltr !important;
          unicode-bidi: normal !important;
          text-align: left !important;
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {renderNav()}
        <div style={{ flex: 1 }}>
          {currentView === 'home' && renderHome()}
          {currentView === 'about' && renderAbout()}
          {currentView === 'contact' && renderContact()}
          {currentView === 'profile' && renderProfile()}
          {currentView === 'admin' && user?.role === 'admin' && renderAdminPanel()}
          {currentView === 'login' && !user && renderLogin()}
          {currentView === 'register' && !user && renderRegister()}
        </div>
        <Footer />
      </div>
    </>
  );
}

export default App;