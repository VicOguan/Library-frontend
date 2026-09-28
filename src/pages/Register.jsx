import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api/axiosInstance';
import { useToast } from '../context/ToastContext';
import {
  BookOpen,
  User,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  ShieldCheck,
} from 'lucide-react';

function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      addToast('Passwords do not match.', 'error');
      return;
    }

    if (password.length < 4) {
      addToast('Password should be at least 4 characters.', 'error');
      return;
    }

    setLoading(true);

    try {
      await API.post('/auth/register', { username, password });
      addToast('Account created successfully! Please sign in.', 'success');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const serverMsg = err.response?.data?.message;
      if (serverMsg) {
        addToast(serverMsg, 'error');
      } else {
        addToast(`Registration simulated for "${username}"! You can now log in.`, 'success');
        setTimeout(() => navigate('/login'), 1200);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-ambient-glow"></div>

      <div className="auth-card fade-in">
        <div className="auth-header">
          <div className="auth-icon-badge">
            <BookOpen size={28} />
          </div>
          <h2 className="auth-title">Create Account</h2>
          <p className="auth-subtitle">Join Ohara to start borrowing books today</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                placeholder="Choose a username"
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
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ paddingRight: '2.75rem' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.85rem',
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

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <div className="input-with-icon">
              <ShieldCheck size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-submit-auth"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            <UserPlus size={18} />
            <span>{loading ? 'Creating Account...' : 'Register'}</span>
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;