
import { useCallback, useEffect, useState, type FormEvent, type ReactNode } from 'react'
import {
  Activity, Boxes, ClipboardList, MapPinned, Package, Truck, Users,
  Bell, RefreshCw, Search, Eye, EyeOff, LockKeyhole, Mail,
  ArrowRight, LogOut, ShieldCheck
} from 'lucide-react'

const API = '/api'
const TOKEN_KEY = 'logistics_access_token'

type Row = Record<string, unknown>

type UserProfile = {
  id: number
  email: string
  role: string
  createdAt: string
}

type AuthResponse = {
  accessToken: string
  tokenType: string
  expiresIn: number
}

const modules = [
  { key: 'customers', label: 'Customers', icon: Users, endpoint: '/api/customers' },
  { key: 'orders', label: 'Orders', icon: ClipboardList, endpoint: '/api/orders' },
  { key: 'warehouses', label: 'Warehouses', icon: Boxes, endpoint: '/api/warehouses' },
  { key: 'shipments', label: 'Shipments', icon: Truck, endpoint: '/api/shipments' },
  { key: 'tracking', label: 'Tracking', icon: MapPinned, endpoint: '/api/tracking' },
  { key: 'notifications', label: 'Notifications', icon: Bell, endpoint: '/api/notifications' },
]

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')

  if (options.body) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(`${API}${path}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      message = body.message || body.error || message
    } catch {
      // Keep the HTTP status message when the response is not JSON.
    }
    throw new Error(message)
  }

  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<UserProfile | null>(null)
  const [authReady, setAuthReady] = useState(false)

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const [active, setActive] = useState('overview')
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const current = modules.find(item => item.key === active)

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setRows([])
    setActive('overview')
    setPassword('')
    setConfirmPassword('')
    setAuthError('')
    setAuthMode('login')
  }, [])

  // Restore the session and verify the saved JWT with the backend.
  useEffect(() => {
    let cancelled = false

    async function restoreSession() {
      if (!token) {
        setAuthReady(true)
        return
      }

      try {
        const profile = await apiRequest<UserProfile>('/users/me', {}, token)
        if (!cancelled) setUser(profile)
      } catch {
        if (!cancelled) {
          localStorage.removeItem(TOKEN_KEY)
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setAuthReady(true)
      }
    }

    void restoreSession()
    return () => { cancelled = true }
  }, [token])

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setAuthError('')

    const normalizedEmail = email.trim().toLowerCase()

    if (!normalizedEmail) {
      setAuthError('Please enter your email address.')
      return
    }

    if (password.length < 8) {
      setAuthError('Password must contain at least 8 characters.')
      return
    }

    if (authMode === 'register' && password !== confirmPassword) {
      setAuthError('Passwords do not match.')
      return
    }

    setAuthLoading(true)

    try {
      const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register'

      const result = await apiRequest<AuthResponse>(endpoint, {
        method: 'POST',
        body: JSON.stringify({
          email: normalizedEmail,
          password,
        }),
      })

      localStorage.setItem(TOKEN_KEY, result.accessToken)
      setToken(result.accessToken)

      const profile = await apiRequest<UserProfile>('/users/me', {}, result.accessToken)
      setUser(profile)
      setActive('overview')
      setPassword('')
      setConfirmPassword('')
    } catch (err) {
      localStorage.removeItem(TOKEN_KEY)
      setToken(null)
      setUser(null)
      setAuthError(err instanceof Error ? err.message : 'Authentication failed.')
    } finally {
      setAuthLoading(false)
    }
  }

  const load = useCallback(async () => {
    if (!token || !current) return

    setLoading(true)
    setError('')

    try {
      const data = await apiRequest<Row[]>(current.endpoint.replace('/api', ''), {}, token)
      setRows(Array.isArray(data) ? data : [])
    } catch (err) {
      if (err instanceof Error && err.message.includes('(401)')) {
        logout()
        return
      }
      setError(err instanceof Error ? err.message : 'Unable to load data.')
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [token, current, logout])

  useEffect(() => {
    if (user && active !== 'overview') void load()
    else setRows([])
  }, [user, active, load])

  if (!authReady) {
    return (
      <div className="auth-loading">
        <div className="loading-brand"><Package size={24} /></div>
        <span>Preparing your workspace...</span>
      </div>
    )
  }

  if (!user || !token) {
    return (
      <div className="auth-page">
        <div className="auth-decoration auth-decoration-one" />
        <div className="auth-decoration auth-decoration-two" />

        <section className="auth-brand-panel">
          <div className="auth-brand">
            <div className="brand-mark"><Package size={23} /></div>
            <div>
              <b>FleetFlow</b>
              <small>LOGISTICS PLATFORM</small>
            </div>
          </div>

          <div className="auth-brand-content">
            <div className="brand-tag"><Activity size={14} /> LOGISTICS CONTROL CENTER</div>
            <h1>Move your logistics operations forward.</h1>
            <p>
              One workspace to manage customers, orders, warehouses,
              shipments and real-time tracking.
            </p>

            <div className="brand-feature">
              <span><ShieldCheck size={18} /></span>
              <div><b>Secure access</b><small>JWT-based authentication</small></div>
            </div>
            <div className="brand-feature">
              <span><Activity size={18} /></span>
              <div><b>Unified workspace</b><small>Your logistics operations in one place</small></div>
            </div>
          </div>

          <div className="auth-brand-footer">© 2026 FleetFlow · Logistics Management</div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-container">
            <div className="mobile-auth-brand">
              <div className="brand-mark"><Package size={21} /></div>
              <b>FleetFlow</b>
            </div>

            <div className="auth-heading">
              <span className="auth-eyebrow">
                {authMode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}
              </span>
              <h2>{authMode === 'login' ? 'Sign in to your account' : 'Create your account'}</h2>
              <p>
                {authMode === 'login'
                  ? 'Enter your credentials to access your workspace.'
                  : 'Create an account to start managing your operations.'}
              </p>
            </div>

            <div className="auth-tabs">
              <button
                type="button"
                className={authMode === 'login' ? 'active' : ''}
                onClick={() => { setAuthMode('login'); setAuthError('') }}
              >
                Sign in
              </button>
              <button
                type="button"
                className={authMode === 'register' ? 'active' : ''}
                onClick={() => { setAuthMode('register'); setAuthError('') }}
              >
                Create account
              </button>
            </div>

            <form className="auth-form" onSubmit={handleAuthSubmit}>
              <label htmlFor="email">Email address</label>
              <div className="input-wrap">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </div>

              <div className="password-label">
                <label htmlFor="password">Password</label>
                {authMode === 'login' && <span>At least 8 characters</span>}
              </div>
              <div className="input-wrap">
                <LockKeyhole size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                  minLength={8}
                  required
                />
                <button
                  className="password-toggle"
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(value => !value)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {authMode === 'register' && (
                <>
                  <label htmlFor="confirmPassword">Confirm password</label>
                  <div className="input-wrap">
                    <LockKeyhole size={18} />
                    <input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Re-enter your password"
                      value={confirmPassword}
                      onChange={event => setConfirmPassword(event.target.value)}
                      autoComplete="new-password"
                      minLength={8}
                      required
                    />
                  </div>
                </>
              )}

              {authError && <div className="auth-error">{authError}</div>}

              <button className="auth-submit" type="submit" disabled={authLoading}>
                {authLoading
                  ? 'Please wait...'
                  : authMode === 'login' ? 'Sign in to workspace' : 'Create account'}
                {!authLoading && <ArrowRight size={17} />}
              </button>
            </form>

            <div className="auth-switch">
              {authMode === 'login' ? (
                <>Don't have an account? <button onClick={() => { setAuthMode('register'); setAuthError('') }}>Create one</button></>
              ) : (
                <>Already have an account? <button onClick={() => { setAuthMode('login'); setAuthError('') }}>Sign in</button></>
              )}
            </div>

            <div className="auth-security">
              <ShieldCheck size={15} />
              Your connection is protected with secure authentication.
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Package size={21} /></div>
          <div><b>FleetFlow</b><small>LOGISTICS PLATFORM</small></div>
        </div>

        <div className="nav-label">WORKSPACE</div>

        <button
          className={`nav-item ${active === 'overview' ? 'selected' : ''}`}
          onClick={() => setActive('overview')}
        >
          <Activity size={18} /> Overview
        </button>

        {modules.map(item => (
          <button
            key={item.key}
            className={`nav-item ${active === item.key ? 'selected' : ''}`}
            onClick={() => setActive(item.key)}
          >
            <item.icon size={18} /> {item.label}
          </button>
        ))}

        <div className="sidebar-bottom">
          <span className="online-dot" /> Local environment
          <small>Development</small>
        </div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <span className="crumb">Workspace / </span>
            <b>{active === 'overview' ? 'Overview' : current?.label}</b>
          </div>

          <div className="profile">
            <div className="profile-info">
              <b>{user.email}</b>
              <small>{user.role}</small>
            </div>
            <span className="avatar">{user.email.slice(0, 1).toUpperCase()}</span>
            <button className="logout-button" onClick={logout} title="Sign out">
              <LogOut size={17} />
              <span>Sign out</span>
            </button>
          </div>
        </header>

        <section className="content">
          <div className="heading-row">
            <div>
              <p className="eyebrow">OPERATIONS CENTER</p>
              <h1>{active === 'overview' ? 'Logistics overview' : current?.label}</h1>
              <p className="subtitle">Manage your logistics operations from one place.</p>
            </div>
            {active !== 'overview' && (
              <button className="refresh" onClick={() => void load()}>
                <RefreshCw size={16} /> Refresh
              </button>
            )}
          </div>

          <div className="stat-grid">
            <Stat icon={<ClipboardList />} label="Total orders" value="—" hint="Connect order analytics" />
            <Stat icon={<Truck />} label="Active shipments" value="—" hint="Connect shipment analytics" />
            <Stat icon={<Users />} label="Customers" value="—" hint="Connect customer analytics" />
            <Stat icon={<Activity />} label="Platform status" value="MVP" hint="Local development" />
          </div>

          <div className="panel">
            <div className="panel-head">
              <div>
                <h2>{active === 'overview' ? 'Service modules' : `${current?.label} records`}</h2>
                <p>Live data retrieved from the backend API through API Gateway.</p>
              </div>
              <div className="search"><Search size={16} /><span>API-connected view</span></div>
            </div>

            {active === 'overview' ? (
              <div className="module-grid">
                {modules.map(item => (
                  <button className="module-card" key={item.key} onClick={() => setActive(item.key)}>
                    <item.icon />
                    <b>{item.label}</b>
                    <span>{item.endpoint}</span>
                  </button>
                ))}
              </div>
            ) : loading ? (
              <div className="empty">Loading records…</div>
            ) : error ? (
              <div className="error">
                Could not load data: {error}
                <p>Make sure Docker Compose services are running.</p>
              </div>
            ) : rows.length === 0 ? (
              <div className="empty">No records yet. The API returned an empty list.</div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>{Object.keys(rows[0]).map(key => <th key={key}>{key}</th>)}</tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={String(row.id ?? index)}>
                        {Object.values(row).map((value, cellIndex) => (
                          <td key={cellIndex}>{String(value ?? '—')}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="footer-note">
            <span className="online-dot" /> FleetFlow MVP · React + Spring Boot microservices · API Gateway :8080
          </div>
        </section>
      </main>
    </div>
  )
}

function Stat({ icon, label, value, hint }: {
  icon: ReactNode
  label: string
  value: string
  hint: string
}) {
  return (
    <div className="stat">
      <div className="stat-top"><span>{label}</span><i>{icon}</i></div>
      <strong>{value}</strong>
      <small>{hint}</small>
    </div>
  )
}
