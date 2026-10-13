import { useState } from 'react'
import { ArrowLeft, Compass, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react'
import { getApiMessage, loginUser, registerUser } from '../api/users'

export default function AuthPage({ initialMode = 'login', onBack, onAuthenticated }) {
  const [mode, setMode] = useState(initialMode)
  const [form, setForm] = useState({ displayName: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const update = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }))

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const user = mode === 'register' ? await registerUser(form) : await loginUser(form)
      onAuthenticated(user)
    } catch (requestError) {
      setError(getApiMessage(requestError, mode === 'register' ? 'We could not create your account.' : 'We could not sign you in.'))
    } finally {
      setSubmitting(false)
    }
  }

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
  }

  return (
    <main className="auth-page">
      <button className="auth-back" type="button" onClick={onBack}>
        <ArrowLeft size={18} /> Back to map
      </button>

      <section className="auth-card" aria-labelledby="auth-title">
        <div className="auth-brand">
          <span className="brand__mark"><Compass size={22} strokeWidth={2.3} /></span>
          <span className="brand__name">Geo<span>Explore</span></span>
        </div>
        <p className="auth-kicker">Your travel journal</p>
        <h1 id="auth-title">{mode === 'register' ? 'Start your collection.' : 'Welcome back.'}</h1>
        <p className="auth-copy">
          {mode === 'register'
            ? 'Create an account to save places and keep every travel note together.'
            : 'Sign in to revisit saved places and share what you discover.'}
        </p>

        <div className="auth-tabs" role="tablist" aria-label="Account options">
          <button type="button" className={mode === 'login' ? 'auth-tab auth-tab--active' : 'auth-tab'} onClick={() => switchMode('login')}>Sign in</button>
          <button type="button" className={mode === 'register' ? 'auth-tab auth-tab--active' : 'auth-tab'} onClick={() => switchMode('register')}>Create account</button>
        </div>

        <form className="auth-form" onSubmit={submit}>
          {mode === 'register' && (
            <label>
              <span>Name</span>
              <div><UserRound size={18} /><input value={form.displayName} onChange={update('displayName')} autoComplete="name" placeholder="How should we call you?" required minLength="2" maxLength="80" /></div>
            </label>
          )}
          <label>
            <span>Email</span>
            <div><Mail size={18} /><input type="email" value={form.email} onChange={update('email')} autoComplete="email" placeholder="you@example.com" required /></div>
          </label>
          <label>
            <span>Password</span>
            <div>
              <LockKeyhole size={18} />
              <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} placeholder={mode === 'register' ? 'At least 8 characters' : 'Your password'} required minLength={mode === 'register' ? 8 : undefined} />
              <button className="password-toggle" type="button" onClick={() => setShowPassword((shown) => !shown)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </label>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Just a moment…' : mode === 'register' ? 'Create my account' : 'Sign in'}
          </button>
        </form>
      </section>

      <aside className="auth-visual" aria-hidden="true">
        <div className="auth-visual__orb auth-visual__orb--one" />
        <div className="auth-visual__orb auth-visual__orb--two" />
        <div className="auth-visual__quote">
          <span>01 / Remember</span>
          <strong>Keep the places that make you want to pack a bag.</strong>
        </div>
      </aside>
    </main>
  )
}
