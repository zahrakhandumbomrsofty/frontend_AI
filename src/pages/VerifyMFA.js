// src/pages/VerifyMFA.js
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authVerifyMfa, authResendMfa } from '../services/api';

const VerifyMFA = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userId, setUserId] = useState(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');

  useEffect(() => {
    const incomingUserId = location.state?.userId;
    if (!incomingUserId) {
      // No context; go back to login
      navigate('/login', { replace: true });
      return;
    }
    setUserId(incomingUserId);
  }, [location.state, navigate]);

  const onVerify = async (e) => {
    e.preventDefault();
    if (!userId) return;
    setError('');
    setLoading(true);
    try {
      const { data } = await authVerifyMfa(userId, code);
      if (data?.access_token && data?.session_token) {
        // Persist tokens for ProtectedRoute
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('sessionToken', data.session_token);
        localStorage.setItem('user', JSON.stringify(data.user || {}));
        const target = location.state?.from || { pathname: '/' };
        navigate(target, { replace: true });
      } else {
        setError('Invalid server response');
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Verification failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!userId) return;
    setResendMsg('');
    setError('');
    try {
      await authResendMfa(userId);
      setResendMsg('Verification code sent. Check your email.');
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to resend code';
      setError(msg);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto' }}>
      <h2>Verify your sign-in</h2>
      <p>Enter the verification code sent to your email.</p>
      <form onSubmit={onVerify}>
        <div style={{ marginBottom: 12 }}>
          <label>Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            required
            style={{ width: '100%', padding: 8, letterSpacing: 2 }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        {resendMsg && <div style={{ color: 'green', marginBottom: 12 }}>{resendMsg}</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} style={{ padding: '8px 16px' }}>
            {loading ? 'Verifying...' : 'Verify'}
          </button>
          <button type="button" onClick={onResend} style={{ padding: '8px 16px' }}>
            Resend code
          </button>
        </div>
      </form>
    </div>
  );
};

export default VerifyMFA;
