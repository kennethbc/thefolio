// backend/server.js - Complete with Contact Messages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB Connected to thefolio database');
});

mongoose.connection.on('error', (err) => {
  console.log('❌ MongoDB Connection Error:', err);
});

// Create uploads folders if they don't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
if (!fs.existsSync('uploads/profile')) {
  fs.mkdirSync('uploads/profile');
}
if (!fs.existsSync('uploads/posts')) {
  fs.mkdirSync('uploads/posts');
}

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'profilePic') {
      cb(null, 'uploads/profile/');
    } else if (file.fieldname === 'media') {
      cb(null, 'uploads/posts/');
    } else {
      cb(null, 'uploads/');
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// File filter for images and videos
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const imageExts = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp'];
  const videoExts = ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.mpeg', '.mpg'];
  
  const isImage = imageExts.includes(ext) || file.mimetype.startsWith('image/');
  const isVideo = videoExts.includes(ext) || file.mimetype.startsWith('video/');
  
  if (isImage || isVideo) {
    cb(null, true);
  } else {
    cb(new Error(`Only images and videos are allowed. You uploaded: ${file.originalname}`));
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }
});

// Models
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'member' },
  isActive: { type: Boolean, default: true },
  bio: { type: String, default: '' },
  profilePic: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

const PostSchema = new mongoose.Schema({
  content: { type: String, required: true },
  media: { type: String, default: '' },
  mediaType: { type: String, default: 'text' },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

const CommentSchema = new mongoose.Schema({
  content: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  createdAt: { type: Date, default: Date.now }
});

// Contact Message Schema
const ContactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, default: 'unread' }, // unread, read, replied
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model('Post', PostSchema);
const Comment = mongoose.model('Comment', CommentSchema);
const ContactMessage = mongoose.model('ContactMessage', ContactMessageSchema);

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access denied' });
  }

  jwt.verify(token, 'your_secret_key', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// ============= AUTH ROUTES =============

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: 'member'
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(400).json({ message: 'Account is deactivated' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      'your_secret_key',
      { expiresIn: '7d' }
    );

    res.json({
      token: `Bearer ${token}`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bio: user.bio || '',
        profilePic: user.profilePic || ''
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get Profile
app.get('/api/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update Profile with Profile Picture Upload
app.put('/api/profile', authenticateToken, (req, res, next) => {
  upload.single('profilePic')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    try {
      const { name, bio } = req.body;
      const updateData = { name, bio };
      
      if (req.file) {
        updateData.profilePic = `/uploads/profile/${req.file.filename}`;
      }
      
      const user = await User.findByIdAndUpdate(
        req.user.id,
        updateData,
        { new: true }
      ).select('-password');
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
});

// ============= POST ROUTES =============

// Get all posts
app.get('/api/posts', async (req, res) => {
  try {
    const posts = await Post.find()
      .populate('author', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create post with file upload
app.post('/api/posts', authenticateToken, (req, res, next) => {
  upload.single('media')(req, res, async (err) => {
    if (err) {
      console.error('Multer error:', err);
      return res.status(400).json({ message: err.message });
    }
    
    try {
      const { content, mediaType } = req.body;
      let media = '';
      let finalMediaType = mediaType || 'text';
      
      if (req.file) {
        media = `/uploads/posts/${req.file.filename}`;
        if (req.file.mimetype.startsWith('image/')) {
          finalMediaType = 'image';
        } else if (req.file.mimetype.startsWith('video/')) {
          finalMediaType = 'video';
        }
      }
      
      const post = new Post({
        content,
        media,
        mediaType: finalMediaType,
        author: req.user.id
      });
      await post.save();
      await post.populate('author', 'name profilePic');
      res.status(201).json(post);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ message: error.message });
    }
  });
});

// Delete post
app.delete('/api/posts/:id', authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (req.user.role !== 'admin' && post.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (post.media) {
      const filePath = path.join(__dirname, post.media);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Comment.deleteMany({ post: req.params.id });
    await post.deleteOne();
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============= COMMENT ROUTES =============

// Get comments for a post
app.get('/api/comments/:postId', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.postId })
      .populate('author', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create comment
app.post('/api/comments/:postId', authenticateToken, async (req, res) => {
  try {
    const { content } = req.body;
    const comment = new Comment({
      content,
      author: req.user.id,
      post: req.params.postId
    });
    await comment.save();
    await comment.populate('author', 'name profilePic');
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete comment
app.delete('/api/comments/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    if (req.user.role !== 'admin' && comment.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await comment.deleteOne();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============= CONTACT MESSAGES ROUTES =============

// Submit contact message (for guests and members)
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    const contactMessage = new ContactMessage({
      name,
      email,
      message,
      status: 'unread'
    });
    
    await contactMessage.save();
    console.log(`New contact message from ${name} (${email})`);
    res.status(201).json({ message: 'Message sent successfully!' });
  } catch (error) {
    console.error('Error saving contact message:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all contact messages (admin only)
app.get('/api/admin/contact-messages', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update message status (admin only)
app.put('/api/admin/contact-messages/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const { status } = req.body;
    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete message (admin only)
app.delete('/api/admin/contact-messages/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ============= ADMIN ROUTES =============

// Get all users (admin only)
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user status (admin only)
app.put('/api/users/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: 'User status updated', user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create default admin user if none exists
const createDefaultAdmin = async () => {
  try {
    console.log('🔍 Checking for existing admin user...');
    
    // Check muna kung may admin
    const adminExists = await User.findOne({ email: 'admin@thefolio.com' });
    
    if (adminExists) {
      console.log('✅ Admin user already exists!');
      console.log('📧 Email: admin@thefolio.com');
      console.log('🔑 Password: admin123');
      return;
    }
    
    console.log('📝 Creating new admin user...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new User({
      name: 'Admin User',
      email: 'admin@thefolio.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true,
      bio: 'Hot Wheels Administrator'
    });
    
    await admin.save();
    console.log('✅ Default admin user created successfully!');
    console.log('📧 Email: admin@thefolio.com');
    console.log('🔑 Password: admin123');
    
    // Verify na na-save
    const verifyAdmin = await User.findOne({ email: 'admin@thefolio.com' });
    if (verifyAdmin) {
      console.log('✅ Verification: Admin found in database');
    } else {
      console.log('❌ Verification: Admin NOT found in database');
    }
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// Initialize admin user
createDefaultAdmin();