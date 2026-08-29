import React, { useState } from 'react'

export default function LoginPage({ onLogin }) {
  const [leaderId, setLeaderId] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!leaderId.trim() || !password.trim()) {
      setError('Enter your Dindi leader ID and password to continue.')
      return
    }
    onLogin()
  }

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Dindi leader login">
        <div className="login-intro">
          <div className="login-brand"><i className="fa-solid fa-om" aria-hidden="true" /> Wari Portal</div>
          <div>
            <h1>Lead with clarity.</h1>
            <p>Coordinate your Dindi, request resources, and keep every Warkari supported on the route.</p>
          </div>
          <span className="login-badge">Dindi leader access</span>
        </div>
        <div className="login-form-panel">
          <form className="login-form" onSubmit={handleSubmit}>
            <h2>Welcome back</h2>
            <p>Sign in to open the Dindi leader dashboard.</p>
            <label className="login-field">Dindi leader ID
              <input value={leaderId} onChange={(event) => setLeaderId(event.target.value)} placeholder="e.g. DINDI-104" autoComplete="username" />
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