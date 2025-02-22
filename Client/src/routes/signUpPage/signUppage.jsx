import './signUppage.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Signuppage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Registration failed');
      }

      alert('Account created successfully!');
      navigate('/sign-in');
    } catch (err) {
      setError(err.message);
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
        <button type="submit">Sign Up</button>
        {error && <p className="error">{error}</p>}
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
