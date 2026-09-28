import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { createMockToken } from '../utils/jwt';
import {
  BookOpen,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  Shield,
  Sparkles,
} from 'lucide-react';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await API.post('/auth/login', { username, password });
      login(response.data.token);
      addToast(`Welcome back, ${username}!`, 'success');
      navigate('/');
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        addToast(serverMsg, 'error');
      } else {
        const role = username.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';
        const mockToken = createMockToken(username, role);
        login(mockToken);
        addToast(`Signed in as ${username} (${role} Demo Session)!`, 'success');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (uname, pwd) => {
    setUsername(uname);
    setPassword(pwd);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <BookOpen size={24} />
          </div>
          <h2 className="auth-title">Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your Ohara account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  color: 'var(--text-dim)',
                  display: 'flex',
                  alignItems: 'center',
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-submit-auth"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <LogIn size={18} />
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>
        <div className="demo-credentials-box">
          <div className="demo-title">
            <Sparkles size={14} color="var(--primary)" />
            <span>Quick Test Credentials</span>
          </div>
          <p style={{ margin: 0 }}>Click to auto-fill sample accounts:</p>
          <div>
            <button
              type="button"
              className="demo-btn-pill"
              onClick={() => handleQuickFill('admin', 'admin123')}
            >
              <Shield size={12} style={{ display: 'inline', marginRight: '3px' }} />
              Admin User
            </button>
            <button
              type="button"
              className="demo-btn-pill"
              onClick={() => handleQuickFill('reader', 'reader123')}
            >
              <User size={12} style={{ display: 'inline', marginRight: '3px' }} />
              Member User
            </button>
          </div>
        </div>
        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;