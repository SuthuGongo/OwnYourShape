import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import './Account.css';

const RECAPTCHA_KEY = process.env.REACT_APP_RECAPTCHA_KEY || '6LdvUogsAAAAAKrOeiwe4FclibOubnh_u2ngbVxJ';

export default function Account() {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode]       = useState('login'); // login | signup | forgot | reset
  const [step, setStep]       = useState(1);        // signup: 1=info, 2=pin, 3=password
  const [captcha, setCaptcha] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]         = useState({ text: '', type: '' });

  // Login fields
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  // Register fields
  const [regForm, setRegForm] = useState({ firstName: '', lastName: '', email: '', pin: '', password: '' });
  // Forgot fields
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotPin, setForgotPin]     = useState('');
  const [newPassword, setNewPassword] = useState('');

  const setError   = (t) => setMsg({ text: t, type: 'error' });
  const setSuccess = (t) => setMsg({ text: t, type: 'success' });
  const clearMsg   = ()  => setMsg({ text: '', type: '' });

  const switchMode = (m) => { setMode(m); setStep(1); clearMsg(); };

  /* ── LOGIN ── */
  const handleLogin = async (e) => {
    e.preventDefault(); clearMsg();
    if (!captcha) { setError('Please complete the CAPTCHA.'); return; }
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      navigate('/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally { setLoading(false); }
  };

  /* ── REGISTER ── */
  const handleSendPin = async (e) => {
    e.preventDefault(); clearMsg();
    if (!regForm.firstName || !regForm.lastName || !regForm.email) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      await API.post('/users/send-verification/', { email: regForm.email });
      setSuccess('Verification PIN sent to your email.');
      setStep(2);
    } catch (err) { setError(err.response?.data?.error || 'Failed to send PIN.'); }
    finally { setLoading(false); }
  };

  const handleVerifyPin = async (e) => {
    e.preventDefault(); clearMsg();
    if (!regForm.pin) { setError('Please enter your PIN.'); return; }
    setLoading(true);
    try {
      await API.post('/users/verify-pin/', { email: regForm.email, pin: regForm.pin });
      setSuccess('Email verified. Now set your password.');
      setStep(3);
    } catch (err) { setError(err.response?.data?.error || 'Invalid PIN.'); }
    finally { setLoading(false); }
  };

  const handleCreateAccount = async (e) => {
    e.preventDefault(); clearMsg();
    if (!regForm.password || regForm.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    setLoading(true);
    try {
      await register({ first_name: regForm.firstName, last_name: regForm.lastName, email: regForm.email, password: regForm.password, pin: regForm.pin });
      navigate('/profile');
    } catch (err) { setError(err.response?.data?.error || 'Failed to create account.'); }
    finally { setLoading(false); }
  };

  /* ── FORGOT ── */
  const handleForgotPin = async (e) => {
    e.preventDefault(); clearMsg();
    if (!forgotEmail) { setError('Please enter your email.'); return; }
    setLoading(true);
    try {
      await API.post('/users/send-recovery-pin/', { email: forgotEmail });
      setSuccess('Recovery PIN sent to your email.');
      setStep(2);
    } catch (err) { setError(err.response?.data?.error || 'Failed to send PIN.'); }
    finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault(); clearMsg();
    if (!forgotPin || newPassword.length < 8) { setError('Enter PIN and a password (8+ chars).'); return; }
    setLoading(true);
    try {
      await API.post('/users/reset-password/', { email: forgotEmail, pin: forgotPin, new_password: newPassword });
      setSuccess('Password reset! You can now log in.');
      setTimeout(() => switchMode('login'), 1500);
    } catch (err) { setError(err.response?.data?.error || 'Failed to reset.'); }
    finally { setLoading(false); }
  };

  const stepLabel = () => {
    if (mode === 'login')  return 'Welcome back';
    if (mode === 'forgot') return step === 1 ? 'Forgot password' : 'Reset password';
    return step === 1 ? 'Create account' : step === 2 ? 'Verify email' : 'Set password';
  };

  return (
    <>
      <Header />
      <div className="account-page">
        <div className="account-shell">
          <Link to="/" className="account-brand">
            <span className="account-brand__name">Own Your Shape</span>
            <span className="account-brand__sub"> Gymwear &amp; Swimwear</span>
          </Link>

          <h1 className="account-heading">{stepLabel()}</h1>

          {/* ── LOGIN ── */}
          {mode === 'login' && (
            <form className="account-form" onSubmit={handleLogin} noValidate>
              <div className="field">
                <label className="field__label">Email</label>
                <input className="field__input" type="email" placeholder="you@example.com" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
              </div>
              <div className="field">
                <label className="field__label">Password</label>
                <input className="field__input" type="password" placeholder="••••••••" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
              </div>
              <ReCAPTCHA sitekey={RECAPTCHA_KEY} onChange={setCaptcha} />
              <button className="btn-primary account-submit" type="submit" disabled={loading || !captcha}>
                {loading ? 'Logging in…' : 'Log In'}
              </button>
              {msg.text && <p className={msg.type === 'success' ? 'api-success' : 'api-error'}>{msg.text}</p>}
              <div className="account-links">
                <button type="button" className="account-text-btn" onClick={() => switchMode('forgot')}>Forgot password?</button>
                <button type="button" className="account-text-btn" onClick={() => switchMode('signup')}>Create account →</button>
              </div>
            </form>
          )}

          {/* ── SIGNUP ── */}
          {mode === 'signup' && step === 1 && (
            <form className="account-form" onSubmit={handleSendPin} noValidate>
              <div className="account-field-row">
                <div className="field">
                  <label className="field__label">First name</label>
                  <input className="field__input" placeholder="Jane" value={regForm.firstName} onChange={(e) => setRegForm({ ...regForm, firstName: e.target.value })} required />
                </div>
                <div className="field">
                  <label className="field__label">Last name</label>
                  <input className="field__input" placeholder="Doe" value={regForm.lastName} onChange={(e) => setRegForm({ ...regForm, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="field">
                <label className="field__label">Email</label>
                <input className="field__input" type="email" placeholder="you@example.com" value={regForm.email} onChange={(e) => setRegForm({ ...regForm, email: e.target.value })} required />
              </div>
              <button className="btn-primary account-submit" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send Verification PIN'}</button>
              {msg.text && <p className={msg.type === 'success' ? 'api-success' : 'api-error'}>{msg.text}</p>}
              <button type="button" className="account-text-btn" onClick={() => switchMode('login')}>← Back to Log In</button>
            </form>
          )}
          {mode === 'signup' && step === 2 && (
            <form className="account-form" onSubmit={handleVerifyPin} noValidate>
              <p className="account-hint">We sent a PIN to <strong>{regForm.email}</strong></p>
              <div className="field">
                <label className="field__label">Verification PIN</label>
                <input className="field__input" placeholder="Enter PIN" value={regForm.pin} onChange={(e) => setRegForm({ ...regForm, pin: e.target.value })} required />
              </div>
              <button className="btn-primary account-submit" type="submit" disabled={loading}>{loading ? 'Verifying…' : 'Verify PIN'}</button>
              {msg.text && <p className={msg.type === 'success' ? 'api-success' : 'api-error'}>{msg.text}</p>}
            </form>
          )}
          {mode === 'signup' && step === 3 && (
            <form className="account-form" onSubmit={handleCreateAccount} noValidate>
              <div className="field">
                <label className="field__label">Choose a password</label>
                <input className="field__input" type="password" placeholder="Min. 8 characters" value={regForm.password} onChange={(e) => setRegForm({ ...regForm, password: e.target.value })} required />
              </div>
              <button className="btn-primary account-submit" type="submit" disabled={loading}>{loading ? 'Creating…' : 'Create Account'}</button>
              {msg.text && <p className={msg.type === 'success' ? 'api-success' : 'api-error'}>{msg.text}</p>}
            </form>
          )}

          {/* ── FORGOT ── */}
          {mode === 'forgot' && step === 1 && (
            <form className="account-form" onSubmit={handleForgotPin} noValidate>
              <div className="field">
                <label className="field__label">Email address</label>
                <input className="field__input" type="email" placeholder="you@example.com" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} required />
              </div>
              <button className="btn-primary account-submit" type="submit" disabled={loading}>{loading ? 'Sending…' : 'Send Recovery PIN'}</button>
              {msg.text && <p className={msg.type === 'success' ? 'api-success' : 'api-error'}>{msg.text}</p>}
              <button type="button" className="account-text-btn" onClick={() => switchMode('login')}>← Back to Log In</button>
            </form>
          )}
          {mode === 'forgot' && step === 2 && (
            <form className="account-form" onSubmit={handleResetPassword} noValidate>
              <div className="field">
                <label className="field__label">PIN</label>
                <input className="field__input" placeholder="Enter PIN" value={forgotPin} onChange={(e) => setForgotPin(e.target.value)} required />
              </div>
              <div className="field">
                <label className="field__label">New password</label>
                <input className="field__input" type="password" placeholder="Min. 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
              </div>
              <button className="btn-primary account-submit" type="submit" disabled={loading}>{loading ? 'Resetting…' : 'Reset Password'}</button>
              {msg.text && <p className={msg.type === 'success' ? 'api-success' : 'api-error'}>{msg.text}</p>}
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}