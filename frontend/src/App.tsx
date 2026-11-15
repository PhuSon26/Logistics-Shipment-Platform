import { useCallback, useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  Activity, Bell, Check, ChevronDown, ChevronLeft, ChevronRight,
  CircleHelp, ClipboardList, Clock3, Command, LayoutDashboard, LogOut,
  MapPin, MapPinned, Menu, MoreHorizontal, Package, Plus, RefreshCw,
  Search, Settings, ShieldCheck, Truck, Users, X, ArrowUpRight,
  Eye, EyeOff, LockKeyhole, Mail, ArrowRight, Trash2, Pencil, Filter,
  TrendingUp, Warehouse, CircleAlert, CheckCircle2, LoaderCircle
} from 'lucide-react'
import './styles.css'

type Row = Record<string, unknown> & { id?: number | string }
type UserProfile = { id: number; email: string; role: string; createdAt: string }
type AuthResponse = { accessToken: string; tokenType: string; expiresIn: number }
type Field = { key: string; label: string; type?: string; required?: boolean; placeholder?: string; options?: string[] }
type Module = { key: string; label: string; singular: string; endpoint: string; icon: typeof Users; description: string; fields: Field[]; searchable: string[] }

const API = '/api'
const TOKEN_KEY = 'fleetflow_access_token'
const modules: Module[] = [
  { key: 'customers', label: 'Customers', singular: 'Customer', endpoint: '/customers', icon: Users, description: 'Manage shippers, consignees and customer contact information.', searchable: ['fullName','email','phone','address'], fields: [
    { key: 'fullName', label: 'Full name', required: true, placeholder: 'e.g. Nguyen Van An' },
    { key: 'email', label: 'Email address', type: 'email', required: true, placeholder: 'name@company.com' },
    { key: 'phone', label: 'Phone number', required: true, placeholder: '+84 90 123 4567' },
    { key: 'address', label: 'Address', required: true, placeholder: 'Street, city, country' },
  ] },
  { key: 'orders', label: 'Orders', singular: 'Shipment order', endpoint: '/orders', icon: ClipboardList, description: 'Create and manage transportation requests from pickup to delivery.', searchable: ['id','customerId','originAddress','destinationAddress','packageDescription','status'], fields: [
    { key: 'customerId', label: 'Customer ID', type: 'number', required: true, placeholder: 'Customer record ID' },
    { key: 'originAddress', label: 'Pickup address', required: true, placeholder: 'Full pickup address' },
    { key: 'destinationAddress', label: 'Delivery address', required: true, placeholder: 'Full delivery address' },
    { key: 'packageDescription', label: 'Package description', required: true, placeholder: 'Package type, weight, dimensions...' },
    { key: 'status', label: 'Order status', type: 'select', options: ['PENDING','CONFIRMED','PROCESSING','IN_TRANSIT','DELIVERED','CANCELLED'] },
  ] },
  { key: 'warehouses', label: 'Warehouses', singular: 'Warehouse', endpoint: '/warehouses', icon: Warehouse, description: 'Maintain warehouse locations and available storage capacity.', searchable: ['name','address','capacity'], fields: [
    { key: 'name', label: 'Warehouse name', required: true, placeholder: 'e.g. Ho Chi Minh Distribution Center' },
    { key: 'address', label: 'Address', required: true, placeholder: 'Warehouse street address' },
    { key: 'capacity', label: 'Capacity', type: 'number', required: true, placeholder: '1000' },
  ] },
  { key: 'shipments', label: 'Shipments', singular: 'Shipment', endpoint: '/shipments', icon: Truck, description: 'Coordinate carriers, shipment assignments and delivery progress.', searchable: ['id','orderId','trackingCode','carrier','status'], fields: [
    { key: 'orderId', label: 'Order ID', type: 'number', required: true, placeholder: 'Related order ID' },
    { key: 'trackingCode', label: 'Tracking code', required: true, placeholder: 'FF-2026-00001' },
    { key: 'carrier', label: 'Carrier', required: true, placeholder: 'FleetFlow Express' },
    { key: 'status', label: 'Shipment status', type: 'select', options: ['CREATED','PICKED_UP','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','FAILED'] },
  ] },
  { key: 'tracking', label: 'Tracking', singular: 'Tracking event', endpoint: '/tracking', icon: MapPinned, description: 'Record shipment milestones and make tracking history available.', searchable: ['trackingCode','location','status','details'], fields: [
    { key: 'trackingCode', label: 'Tracking code', required: true, placeholder: 'FF-2026-00001' },
    { key: 'location', label: 'Current location', required: true, placeholder: 'Bien Hoa, Dong Nai' },
    { key: 'status', label: 'Event status', type: 'select', required: true, options: ['ORDER_CREATED','PICKED_UP','ARRIVED_AT_WAREHOUSE','IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','EXCEPTION'] },
    { key: 'details', label: 'Event details', placeholder: 'Additional delivery information' },
  ] },
  { key: 'notifications', label: 'Notifications', singular: 'Notification', endpoint: '/notifications', icon: Bell, description: 'Review operational notifications and delivery communications.', searchable: ['recipient','channel','message','status'], fields: [
    { key: 'recipient', label: 'Recipient', required: true, placeholder: 'Email or phone number' },
    { key: 'channel', label: 'Channel', type: 'select', required: true, options: ['EMAIL','SMS','PUSH','IN_APP'] },
    { key: 'message', label: 'Message', required: true, placeholder: 'Notification content' },
    { key: 'status', label: 'Status', type: 'select', options: ['PENDING','SENT','FAILED'] },
  ] },
]

async function apiRequest<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers)
  headers.set('Accept', 'application/json')
  if (options.body) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)
  const response = await fetch(`${API}${path}`, { ...options, headers })
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try { const body = await response.json(); message = body.message || body.error || body.detail || message } catch { /* non-JSON response */ }
    throw new Error(message)
  }
  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}
const titleCase = (value: string) => value.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase())
const displayValue = (value: unknown) => value == null || value === '' ? 'â€”' : typeof value === 'object' ? JSON.stringify(value) : String(value)
const dateValue = (value: unknown) => { if (!value) return 'â€”'; const date = new Date(String(value)); return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString() }
const statusClass = (value: unknown) => String(value ?? '').toLowerCase().replace(/_/g, '-')

export default function App() {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<UserProfile | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [authMode, setAuthMode] = useState<'login'|'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')
  const [active, setActive] = useState('overview')
  const [records, setRecords] = useState<Row[]>([])
  const [allData, setAllData] = useState<Record<string, Row[]>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [form, setForm] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [notice, setNotice] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<Row | null>(null)
  const current = modules.find(item => item.key === active)
  const isAdmin = user?.role === 'ADMIN'
  const canCreate = !!current && (isAdmin || current.key !== 'notifications')

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); setRecords([]); setAllData({}); setActive('overview'); setPassword(''); setConfirmPassword('')
  }, [])

  useEffect(() => {
    let cancelled = false
    async function restore() {
      if (!token) { setAuthReady(true); return }
      try { const profile = await apiRequest<UserProfile>('/users/me', {}, token); if (!cancelled) setUser(profile) }
      catch { if (!cancelled) { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null) } }
      finally { if (!cancelled) setAuthReady(true) }
    }
    void restore(); return () => { cancelled = true }
  }, [token])

  async function handleAuthSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setAuthError('')
    if (password.length < 8) { setAuthError('Password must contain at least 8 characters.'); return }
    if (authMode === 'register' && password !== confirmPassword) { setAuthError('Passwords do not match.'); return }
    setAuthLoading(true)
    try {
      const result = await apiRequest<AuthResponse>(authMode === 'login' ? '/auth/login' : '/auth/register', { method: 'POST', body: JSON.stringify({ email: email.trim().toLowerCase(), password }) })
      localStorage.setItem(TOKEN_KEY, result.accessToken); setToken(result.accessToken)
      const profile = await apiRequest<UserProfile>('/users/me', {}, result.accessToken)
      setUser(profile); setActive('overview'); setPassword(''); setConfirmPassword('')
    } catch (err) { localStorage.removeItem(TOKEN_KEY); setToken(null); setUser(null); setAuthError(err instanceof Error ? err.message : 'Authentication failed.') }
    finally { setAuthLoading(false) }
  }

  const loadModule = useCallback(async (module: Module) => {
    if (!token) return
    setLoading(true); setError('')
    try { const data = await apiRequest<Row[]>(module.endpoint, {}, token); setRecords(Array.isArray(data) ? data : []) }
    catch (err) { if (err instanceof Error && err.message.includes('(401)')) logout(); else { setError(err instanceof Error ? err.message : 'Unable to load records.'); setRecords([]) } }
    finally { setLoading(false) }
  }, [token, logout])

  const loadOverview = useCallback(async () => {
    if (!token) return
    setLoading(true); setError('')
    const results = await Promise.all(modules.map(async module => {
      try { const data = await apiRequest<Row[]>(module.endpoint, {}, token); return [module.key, Array.isArray(data) ? data : []] as const }
      catch (err) { if (err instanceof Error && err.message.includes('(401)')) logout(); return [module.key, []] as const }
    }))
    setAllData(Object.fromEntries(results)); setLoading(false)
  }, [token, logout])

  useEffect(() => { if (!user) return; if (active === 'overview') void loadOverview(); else if (current) void loadModule(current) }, [user, active, current, loadModule, loadOverview])

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term || !current) return records
    return records.filter(row => current.searchable.some(key => String(row[key] ?? '').toLowerCase().includes(term)))
  }, [records, query, current])

  function openCreate() { setEditing(null); setForm(Object.fromEntries((current?.fields ?? []).map(field => [field.key, field.type === 'select' ? field.options?.[0] ?? '' : '']))); setModalOpen(true) }
  function openEdit(row: Row) { setEditing(row); setForm(Object.fromEntries((current?.fields ?? []).map(field => [field.key, String(row[field.key] ?? '')]))); setModalOpen(true) }
  async function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!current || !token) return
    setSaving(true)
    const payload: Record<string, unknown> = {}
    current.fields.forEach(field => { const value = form[field.key]; if (value !== '') payload[field.key] = field.type === 'number' ? Number(value) : value })
    try {
      await apiRequest(editing ? `${current.endpoint}/${editing.id}` : current.endpoint, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(payload) }, token)
      setModalOpen(false); setNotice(`${current.singular} ${editing ? 'updated' : 'created'} successfully.`); await loadModule(current)
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to save record.') }
    finally { setSaving(false) }
  }
  async function deleteRecord() {
    if (!current || !token || !confirmDelete) return
    try { await apiRequest(`${current.endpoint}/${confirmDelete.id}`, { method: 'DELETE' }, token); setConfirmDelete(null); setNotice(`${current.singular} deleted.`); await loadModule(current) }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to delete record.'); setConfirmDelete(null) }
  }
  useEffect(() => { if (!notice) return; const id = window.setTimeout(() => setNotice(''), 3200); return () => window.clearTimeout(id) }, [notice])

  if (!authReady) return <div className="boot-screen"><div className="boot-mark"><Package /></div><LoaderCircle className="spin" size={20}/><span>Preparing your FleetFlow workspace</span></div>

  if (!user || !token) return <div className="auth-page">
    <div className="auth-art"><div className="auth-brand"><span className="brand-symbol"><Package size={22}/></span><span><b>FleetFlow</b><small>LOGISTICS CLOUD</small></span></div>
      <div className="art-content"><div className="eyebrow light"><span className="pulse-dot"/> THE OPERATIONS PLATFORM</div><h1>Move goods.<br/><em>Move business.</em></h1><p>One connected workspace for every shipment, warehouse and delivery milestone.</p>
        <div className="art-stats"><div><b>360Â°</b><span>Shipment visibility</span></div><div><b>24/7</b><span>Operations control</span></div><div><b>1</b><span>Unified workspace</span></div></div>
      </div><div className="art-bottom"><span>BUILT FOR MODERN LOGISTICS</span><span>Â© 2026 FleetFlow</span></div><div className="art-orbit orbit-a"/><div className="art-orbit orbit-b"/><div className="art-grid"/></div>
    <div className="auth-panel"><div className="auth-card"><div className="mobile-brand"><span className="brand-symbol"><Package size={20}/></span><b>FleetFlow</b></div><div className="auth-kicker">{authMode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</div><h2>{authMode === 'login' ? 'Sign in to your account' : 'Create your workspace account'}</h2><p className="auth-sub">{authMode === 'login' ? 'Enter your details to access your operations dashboard.' : 'Register to start managing your logistics operations.'}</p>
      <div className="auth-switcher"><button className={authMode === 'login' ? 'active' : ''} onClick={() => {setAuthMode('login');setAuthError('')}}>Sign in</button><button className={authMode === 'register' ? 'active' : ''} onClick={() => {setAuthMode('register');setAuthError('')}}>Create account</button></div>
      <form onSubmit={handleAuthSubmit} className="auth-form"><label htmlFor="email">Email address</label><div className="field-wrap"><Mail size={17}/><input id="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required/></div>
        <label htmlFor="password">Password</label><div className="field-wrap"><LockKeyhole size={17}/><input id="password" type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} autoComplete={authMode==='login'?'current-password':'new-password'} required/><button type="button" className="reveal" onClick={()=>setShowPassword(v=>!v)} aria-label="Toggle password visibility">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div>
        {authMode==='register' && <><label htmlFor="confirm">Confirm password</label><div className="field-wrap"><LockKeyhole size={17}/><input id="confirm" type={showPassword?'text':'password'} value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="Re-enter your password" minLength={8} required/></div></>}
        {authError && <div className="inline-error"><CircleAlert size={16}/>{authError}</div>}<button className="primary-btn auth-submit" disabled={authLoading}>{authLoading?'Please waitâ€¦':authMode==='login'?'Sign in to FleetFlow':'Create account'}{!authLoading&&<ArrowRight size={17}/>}</button>
      </form><div className="auth-foot"><ShieldCheck size={16}/> Protected with JWT authentication</div></div><div className="auth-panel-foot">Need help? Contact your system administrator</div></div>
  </div>

  const totalOrders = allData.orders?.length ?? 0
  const activeShipments = (allData.shipments ?? []).filter(row => !['DELIVERED','CANCELLED','FAILED'].includes(String(row.status ?? '').toUpperCase())).length
  const delivered = (allData.shipments ?? []).filter(row => String(row.status ?? '').toUpperCase() === 'DELIVERED').length
  const recentOrders = [...(allData.orders ?? [])].sort((a,b)=>String(b.createdAt??'').localeCompare(String(a.createdAt??''))).slice(0,5)

  return <div className="app-shell">
    {sidebarOpen && <button className="sidebar-scrim" onClick={()=>setSidebarOpen(false)} aria-label="Close navigation"/>}
    <aside className={`sidebar ${sidebarOpen?'sidebar-open':''}`}><div className="sidebar-brand"><span className="brand-symbol"><Package size={21}/></span><span><b>FleetFlow</b><small>LOGISTICS CLOUD</small></span><button className="mobile-close" onClick={()=>setSidebarOpen(false)}><X size={18}/></button></div>
      <div className="workspace-switch"><div className="workspace-avatar">FF</div><div><b>FleetFlow Logistics</b><small>Local workspace</small></div><ChevronDown size={15}/></div>
      <div className="nav-section-label">WORKSPACE</div><button className={`nav-link ${active==='overview'?'active':''}`} onClick={()=>{setActive('overview');setSidebarOpen(false)}}><LayoutDashboard size={18}/>Overview</button>
      <div className="nav-section-label nav-gap">OPERATIONS</div>{modules.map(item=><button key={item.key} className={`nav-link ${active===item.key?'active':''}`} onClick={()=>{setActive(item.key);setQuery('');setSidebarOpen(false)}}><item.icon size={18}/>{item.label}{item.key==='orders'&&<span className="nav-count">{allData.orders?.length ?? ''}</span>}</button>)}
      <div className="sidebar-spacer"/><div className="sidebar-health"><div className="health-icon"><Activity size={17}/></div><div><b>System status</b><small><span className="pulse-dot green"/> Local environment</small></div><span className="health-check"><Check size={14}/></span></div>
      <div className="sidebar-user"><div className="user-avatar">{user.email.slice(0,1).toUpperCase()}</div><div className="user-meta"><b>{user.email.split('@')[0]}</b><small>{user.role || 'USER'}</small></div><button onClick={logout} title="Sign out"><LogOut size={17}/></button></div>
    </aside>
    <main className="main-area"><header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={()=>setSidebarOpen(true)}><Menu size={20}/></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14}/><b>{active==='overview'?'Overview':current?.label}</b></div></div><div className="topbar-right"><div className="environment-pill"><span className="pulse-dot green"/> DEVELOPMENT</div><button className="icon-button" title="Help"><CircleHelp size={18}/></button><button className="notification-button" title="Notifications"><Bell size={18}/><i/></button><div className="topbar-divider"/><div className="top-user"><div className="user-avatar small">{user.email.slice(0,1).toUpperCase()}</div><div><b>{user.email.split('@')[0]}</b><small>{user.role}</small></div></div></div></header>
      <div className="page-content">
        {notice && <div className="toast"><CheckCircle2 size={17}/>{notice}<button onClick={()=>setNotice('')}><X size={15}/></button></div>}
        {active==='overview' ? <>
          <div className="page-heading"><div><div className="eyebrow">MONDAY, NOVEMBER 15, 2026 <span className="heading-dot"/> OPERATIONS CENTER</div><h1>Good day, {user.email.split('@')[0]} <span className="wave">âœ¦</span></h1><p>Hereâ€™s whatâ€™s happening across your logistics network today.</p></div><button className="outline-btn" onClick={()=>void loadOverview()}><RefreshCw size={16}/> Refresh data</button></div>
          {error && <div className="inline-error page-error"><CircleAlert size={16}/>{error}</div>}
          <div className="stats-grid"><MetricCard icon={<ClipboardList/>} label="Total orders" value={loading?'â€¦':String(totalOrders)} note="All registered orders" tone="blue"/><MetricCard icon={<Truck/>} label="Active shipments" value={loading?'â€¦':String(activeShipments)} note="Currently in progress" tone="violet"/><MetricCard icon={<Users/>} label="Total customers" value={loading?'â€¦':String(allData.customers?.length??0)} note="Registered customers" tone="orange"/><MetricCard icon={<CheckCircle2/>} label="Delivered shipments" value={loading?'â€¦':String(delivered)} note="Successfully delivered" tone="green"/></div>
          <div className="overview-grid"><section className="surface recent-surface"><div className="surface-heading"><div><h2>Recent orders</h2><p>Latest shipment requests across your network</p></div><button className="text-link" onClick={()=>setActive('orders')}>View all <ArrowUpRight size={15}/></button></div>
            {loading?<div className="loading-state"><LoaderCircle className="spin"/>Loading operations dataâ€¦</div>:recentOrders.length===0?<div className="empty-state"><div className="empty-icon"><ClipboardList size={23}/></div><b>No orders yet</b><p>Create your first shipment order to see it here.</p><button className="primary-btn small-btn" onClick={()=>setActive('orders')}><Plus size={16}/> Go to orders</button></div>:<div className="recent-list">{recentOrders.map((row,i)=><div className="recent-row" key={String(row.id??i)}><div className="order-icon"><Package size={18}/></div><div className="recent-main"><b>Order #{row.id}</b><span>{displayValue(row.packageDescription)}</span></div><div className="recent-route"><MapPin size={13}/><span>{displayValue(row.originAddress)} <ArrowRight size={12}/> {displayValue(row.destinationAddress)}</span></div><Status value={row.status}/><span className="recent-date">{dateValue(row.createdAt)}</span></div>)}</div>}
          </section><section className="surface services-surface"><div className="surface-heading"><div><h2>Service overview</h2><p>Your logistics modules at a glance</p></div><span className="service-count">08 MODULES</span></div><div className="service-list">{[{name:'API Gateway',detail:'Unified API entry point',icon:Command,key:'gateway'},...modules.map(m=>({name:m.label,detail:m.description,icon:m.icon,key:m.key}))].map((item,i)=><button className="service-row" key={item.key} onClick={()=>item.key!=='gateway'&&setActive(item.key)}><span className="service-icon"><item.icon size={17}/></span><span className="service-copy"><b>{item.name}</b><small>{item.detail}</small></span><span className="service-state"><i/>Configured</span>{i>0&&<ChevronRight size={15}/>}</button>)}</div></section></div>
          <div className="bottom-banner"><div className="banner-icon"><TrendingUp size={21}/></div><div><b>Keep your operations moving</b><span>Manage customers, coordinate shipments and monitor every delivery from one place.</span></div><button onClick={()=>setActive('orders')}>Manage orders <ArrowRight size={15}/></button></div>
        </> : current ? <>
          <div className="page-heading module-heading"><div><div className="eyebrow">OPERATIONS <span className="heading-dot"/> {current.label.toUpperCase()}</div><h1>{current.label}</h1><p>{current.description}</p></div>{canCreate && <button className="primary-btn" onClick={openCreate}><Plus size={17}/> Create {current.singular}</button>}</div>
          <div className="module-summary"><div className="summary-icon"><current.icon size={20}/></div><div><span>Total {current.label.toLowerCase()}</span><b>{loading?'â€”':records.length}</b></div><div className="summary-divider"/><div className="summary-description"><b>Manage your {current.label.toLowerCase()}</b><span>View, search, create, update and remove records.</span></div><div className="summary-action"><button className="outline-btn" onClick={()=>void loadModule(current)}><RefreshCw size={15}/> Refresh</button></div></div>
          <section className="surface data-surface"><div className="data-toolbar"><div><h2>All {current.label.toLowerCase()}</h2><p>{filtered.length} {filtered.length===1?'record':'records'} found</p></div><div className="table-actions"><div className="search-box"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder={`Search ${current.label.toLowerCase()}â€¦`}/>{query&&<button onClick={()=>setQuery('')}><X size={14}/></button>}</div><button className="filter-btn" title="Filter records"><Filter size={16}/><span>Filter</span></button></div></div>
            {error?<div className="error-state"><CircleAlert size={22}/><b>Unable to load records</b><span>{error}</span><button className="outline-btn" onClick={()=>void loadModule(current)}><RefreshCw size={15}/> Try again</button></div>:loading?<div className="loading-state"><LoaderCircle className="spin"/>Loading recordsâ€¦</div>:filtered.length===0?<div className="empty-state"><div className="empty-icon"><current.icon size={23}/></div><b>{query?'No matching records':'Nothing here yet'}</b><p>{query?'Try another search term.':`Create your first ${current.singular.toLowerCase()} to get started.`}</p>{!query&&canCreate&&<button className="primary-btn small-btn" onClick={openCreate}><Plus size={16}/> Create {current.singular}</button>}</div>:<div className="table-scroll"><table className="records-table"><thead><tr><th className="id-col">ID</th>{current.fields.map(field=><th key={field.key}>{field.label}</th>)}<th>Created</th><th className="action-col">Actions</th></tr></thead><tbody>{filtered.map((row,i)=><tr key={String(row.id??i)}><td className="id-cell">#{row.id??'â€”'}</td>{current.fields.map(field=><td key={field.key}>{field.key==='status'?<Status value={row[field.key]}/>:field.key==='trackingCode'?<span className="tracking-code">{displayValue(row[field.key])}</span>:<span className={field.key.toLowerCase().includes('address')?'address-cell':''}>{displayValue(row[field.key])}</span>}</td>)}<td className="date-cell">{dateValue(row.createdAt)}</td><td><div className="row-actions">{isAdmin&&<><button title="Edit record" onClick={()=>openEdit(row)}><Pencil size={15}/></button><button title="Delete record" className="danger-action" onClick={()=>setConfirmDelete(row)}><Trash2 size={15}/></button></>}</div></td></tr>)}</tbody></table></div>}
            <div className="table-footer"><span>Showing <b>{filtered.length}</b> of <b>{records.length}</b> records</span><span className="pagination"><button disabled><ChevronLeft size={15}/></button><b>1</b><button disabled><ChevronRight size={15}/></button></span></div>
          </section>
        </> : null}
        <footer className="page-footer"><span>Â© 2026 FleetFlow Logistics Platform</span><span><span className="pulse-dot green"/> All systems operational <i/> API Gateway :8080</span></footer>
      </div>
    </main>
    {modalOpen&&current&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModalOpen(false)}}><section className="modal-card"><div className="modal-heading"><div><div className="eyebrow">{editing?'UPDATE RECORD':'NEW RECORD'}</div><h2>{editing?`Edit ${current.singular}`:`Create ${current.singular}`}</h2><p>Enter the information below. Fields marked with * are required.</p></div><button className="icon-button" onClick={()=>setModalOpen(false)}><X size={19}/></button></div><form onSubmit={saveRecord}><div className="modal-fields">{current.fields.map(field=><label className="form-field" key={field.key}><span>{field.label}{field.required&&<i> *</i>}</span>{field.type==='select'?<select value={form[field.key]??''} onChange={e=>setForm(v=>({...v,[field.key]:e.target.value}))}>{(field.options??[]).map(option=><option key={option} value={option}>{titleCase(option.replace(/_/g,' '))}</option>)}</select>:field.key==='details'||field.key==='message'||field.key.toLowerCase().includes('address')||field.key==='packageDescription'?<textarea rows={3} value={form[field.key]??''} onChange={e=>setForm(v=>({...v,[field.key]:e.target.value}))} placeholder={field.placeholder} required={field.required}/>:<input type={field.type??'text'} min={field.type==='number'?0:undefined} value={form[field.key]??''} onChange={e=>setForm(v=>({...v,[field.key]:e.target.value}))} placeholder={field.placeholder} required={field.required}/>}</label>)}</div><div className="modal-actions"><button type="button" className="outline-btn" onClick={()=>setModalOpen(false)}>Cancel</button><button className="primary-btn" disabled={saving}>{saving?<LoaderCircle className="spin" size={16}/>:<Check size={16}/>} {saving?'Savingâ€¦':editing?'Save changes':`Create ${current.singular}`}</button></div></form></section></div>}
    {confirmDelete&&current&&<div className="modal-backdrop"><section className="confirm-card"><div className="confirm-icon"><Trash2 size={21}/></div><h2>Delete this {current.singular.toLowerCase()}?</h2><p>This action cannot be undone. The record will be permanently removed.</p><div className="modal-actions"><button className="outline-btn" onClick={()=>setConfirmDelete(null)}>Cancel</button><button className="danger-btn" onClick={()=>void deleteRecord()}>Delete record</button></div></section></div>}
  </div>
}

function MetricCard({icon,label,value,note,tone}:{icon:React.ReactNode;label:string;value:string;note:string;tone:string}){return <div className="metric-card"><div className="metric-top"><span>{label}</span><i className={`metric-icon ${tone}`}>{icon}</i></div><strong>{value}</strong><small>{note}</small></div>}
function Status({value}:{value:unknown}){const text=String(value??'UNKNOWN');return <span className={`status-badge ${statusClass(text)}`}><i/>{titleCase(text.replace(/_/g,' '))}</span>}

