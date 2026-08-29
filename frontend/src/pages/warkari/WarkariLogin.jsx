import React, { useState } from 'react'
import './warkari.css'

export default function LoginPage({ onLogin }) {
  const [warkariId, setWarkariId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!warkariId.trim() || !password.trim()) {
      setError('Enter your Warkari ID and password to continue.')
      return
    }
    onLogin()
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Warkari login">
        <div className="login-intro">
          <div className="login-brand"><i className="fa-solid fa-om" aria-hidden="true" /> Wari Portal</div>
          <div>
            <h1>Your journey, supported.</h1>
            <p>Stay connected to the palkhi route, essential services, and help along the way.</p>
          </div>
          <span className="login-badge">Warkari access</span>
        </div>
        <div className="login-form-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Welcome back</h2>
            <p>Sign in to open your personal Warkari dashboard.</p>
            <label className="login-field">Warkari ID
              <input value={warkariId} onChange={(event) => setWarkariId(event.target.value)} placeholder="e.g. Wari-2026-8891" autoComplete="username" />
            </label>
            <label className="login-field">Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" autoComplete="current-password" />
            </label>
            {error && <p className="login-error" role="alert">{error}</p>}
            <button className="login-submit" type="submit"><i className="fa-solid fa-arrow-right-to-bracket" aria-hidden="true" /> Open dashboard</button>
          </form>
        </div>
      </section>
    </main>
  )
}