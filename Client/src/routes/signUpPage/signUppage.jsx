import './signUppage.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signuppage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      const data = await response.json();
      setLoading(false);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }

      setMessage({ text: 'Account created successfully! Redirecting...', type: 'success' });
      setTimeout(() => navigate('/sign-in'), 2000);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    }
  };

  return (
    <div className='signuppage'>
      <form onSubmit={handleSignUp}>
        <h2>Sign Up</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Signing Up...' : 'Sign Up'}
        </button>
        {message.text && <p className={message.type}>{message.text}</p>}
        <p>
          Already have an account?{' '}
          <span
            onClick={() => navigate('/sign-in')}
            style={{ cursor: 'pointer', color: '#2575fc', fontWeight: 'bold' }}
          >
            Sign In
          </span>
        </p>
      </form>
    </div>
  );
};

export default Signuppage;
