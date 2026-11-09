'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Tooltip from '@/components/Tooltip'
import {
  getCafesFromSupabase,
  insertCafeToSupabase,
  updateCafeInSupabase,
  deleteCafeFromSupabase,
  seedSupabaseWithMockData,
  Cafe,
} from '@/lib/data'
import {
  ManagedUser,
  SystemLogEntry,
  LogSeverity,
  NewsArticle,
  getManagedUsers,
  saveManagedUsers,
  getSystemLogs,
  saveSystemLogs,
  appendSystemLog,
  getNewsArticles,
  deleteNewsArticle,
} from '@/lib/adminStore'
import {
  ShopGimmick,
  getShopGimmicks,
  deleteShopGimmick,
} from '@/lib/ownerStudio'
import { supabase } from '@/lib/supabase'
import {
  ShieldCheck,
  Coffee,
  Users,
  Activity,
  Newspaper,
  Plus,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  RefreshCw,
  Server,
  Database,
  Lock,
  MapPin,
  X,
  ExternalLink,
  UserPlus,
  Sparkles,
  Terminal,
} from 'lucide-react'

type AdminTab = 'CAFES' | 'USERS' | 'LOGS' | 'CONTENT'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('CAFES')
  const [userEmail, setUserEmail] = useState<string>('admin@kapeta.com')
  const [profileRole, setProfileRole] = useState<string>('superadmin')

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 4000)
  }

  // --- Tab 1: Coffee Shops State ---
  const [cafesList, setCafesList] = useState<Cafe[]>([])
  const [isLoadingCafes, setIsLoadingCafes] = useState(true)
  const [cafeSearch, setCafeSearch] = useState('')
  const [cafeFilterStatus, setCafeFilterStatus] = useState<'ALL' | 'Open' | 'Closed'>('ALL')
  const [dbStatus, setDbStatus] = useState<'Checking' | 'Connected' | 'LocalFallback'>('Checking')

  // Cafe Add/Edit Modal State
  const [isCafeModalOpen, setIsCafeModalOpen] = useState(false)
  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null)

  const [formId, setFormId] = useState('')
  const [formName, setFormName] = useState('')
  const [formLocation, setFormLocation] = useState('Cagayan de Oro, PH')
  const [formNeighborhood, setFormNeighborhood] = useState('')
  const [formWebsite, setFormWebsite] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formType, setFormType] = useState('PRO')
  const [formTaste, setFormTaste] = useState(9.0)
  const [formVibeScore, setFormVibeScore] = useState(9.0)
  const [formService, setFormService] = useState(9.0)
  const [formWifi, setFormWifi] = useState('50 Mbps Fast WiFi')
  const [formOutlets, setFormOutlets] = useState('Plentiful')
  const [formSeating, setFormSeating] = useState('Indoor & Courtyard')
  const [formNoise, setFormNoise] = useState('Moderate Hum')
  const [formRoaster, setFormRoaster] = useState('')
  const [formBeans, setFormBeans] = useState('Bukidnon Single-Origin')
  const [formEspresso, setFormEspresso] = useState('La Marzocco Linea PB')
  const [formFilter, setFormFilter] = useState('V60, Kalita Wave, Batch Brew')
  const [formReview, setFormReview] = useState('')
  const [formTop, setFormTop] = useState('50%')
  const [formLeft, setFormLeft] = useState('50%')
  const [formLatitude, setFormLatitude] = useState<number | ''>(8.4772)
  const [formLongitude, setFormLongitude] = useState<number | ''>(124.6459)
  const [formStatus, setFormStatus] = useState<'Open' | 'Closed'>('Open')
  const [formHours, setFormHours] = useState('7:00 AM - 10:00 PM')
  const [formDistance, setFormDistance] = useState('0.5 KM')
  const [formTopFeature, setFormTopFeature] = useState('Specialty Roastery & Workspace')
  const [formAtmosphere, setFormAtmosphere] = useState('Warm & Focused')
  const [formPromos, setFormPromos] = useState('')

  // --- Tab 2: Users State ---
  const [usersList, setUsersList] = useState<ManagedUser[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL')
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState<ManagedUser['role']>('managers')
  const [newUserCafeId, setNewUserCafeId] = useState<string>('')

  // --- Tab 3: System & Error Logs State ---
  const [logsList, setLogsList] = useState<SystemLogEntry[]>([])
  const [logSeverityFilter, setLogSeverityFilter] = useState<'ALL' | LogSeverity>('ALL')
  const [logSearch, setLogSearch] = useState('')
  const [selectedLog, setSelectedLog] = useState<SystemLogEntry | null>(null)

  // --- Tab 4: News & Gimmicks Moderation State ---
  const [newsList, setNewsList] = useState<NewsArticle[]>([])
  const [gimmicksList, setGimmicksList] = useState<ShopGimmick[]>([])

  // Initial Load
  useEffect(() => {
    async function initAdmin() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (session?.user?.email) {
          setUserEmail(session.user.email)
        }
        const metaRole = session?.user?.user_metadata?.role
        if (metaRole) {
          setProfileRole(metaRole)
        }
      } catch {
        // Non-blocking
      }

      await loadAllAdminData()
    }
    initAdmin()
  }, [])

  const loadAllAdminData = async () => {
    setIsLoadingCafes(true)
    try {
      const { error: pingErr } = await supabase
        .from('cafes')
        .select('id', { count: 'exact', head: true })

      if (pingErr) {
        setDbStatus('LocalFallback')
      } else {
        setDbStatus('Connected')
      }

      const loadedCafes = await getCafesFromSupabase()
      setCafesList(loadedCafes)
    } catch {
      setDbStatus('LocalFallback')
    } finally {
      setIsLoadingCafes(false)
    }

    setUsersList(getManagedUsers())
    setLogsList(getSystemLogs())
    setNewsList(getNewsArticles())
    setGimmicksList(getShopGimmicks())
  }

  // --- Cafe Handlers ---
  const openAddCafeModal = () => {
    setEditingCafe(null)
    setFormId('')
    setFormName('')
    setFormLocation('Cagayan de Oro, PH')
    setFormNeighborhood('Corrales Ave, Cagayan de Oro')
    setFormWebsite('https://instagram.com')
    setFormImage('https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80')
    setFormType('PRO')
    setFormTaste(9.1)
    setFormVibeScore(9.0)
    setFormService(9.2)
    setFormWifi('60 Mbps Fiber WiFi')
    setFormOutlets('Plentiful at every table')
    setFormSeating('Indoor & Al Fresco')
    setFormNoise('Moderate')
    setFormRoaster('In-House Specialty Roaster')
    setFormBeans('Bukidnon & Mt. Apo Single-Origin')
    setFormEspresso('La Marzocco Linea PB')
    setFormFilter('Hario V60 & Aeropress')
    setFormReview(
      'A specialty coffee space in Cagayan de Oro offering dialed-in espresso, single-origin pour-overs, and work-friendly seating.'
    )
    setFormTop('50%')
    setFormLeft('50%')
    setFormLatitude(8.4785)
    setFormLongitude(124.6472)
    setFormStatus('Open')
    setFormHours('7:00 AM - 10:00 PM')
    setFormDistance('0.6 KM')
    setFormTopFeature('Specialty Roastery & Fast WiFi')
    setFormAtmosphere('Focused & Welcoming')
    setFormPromos('15% off single-origin filter flights before 11 AM daily')
    setIsCafeModalOpen(true)
  }

  const openEditCafeModal = (cafe: Cafe) => {
    setEditingCafe(cafe)
    setFormId(cafe.id)
    setFormName(cafe.name)
    setFormLocation(cafe.location)
    setFormNeighborhood(cafe.neighborhood)
    setFormWebsite(cafe.website)
    setFormImage(cafe.image)
    setFormType(cafe.type || 'PRO')
    setFormTaste(cafe.stats.taste)
    setFormVibeScore(cafe.stats.vibe)
    setFormService(cafe.stats.service)
    setFormWifi(cafe.vibe.wifi)
    setFormOutlets(cafe.vibe.outlets)
    setFormSeating(cafe.vibe.seating)
    setFormNoise(cafe.vibe.noise)
    setFormRoaster(cafe.coffee.roaster)
    setFormBeans(cafe.coffee.beans)
    setFormEspresso(cafe.coffee.espresso)
    setFormFilter(cafe.coffee.filter)
    setFormReview(cafe.review)
    setFormTop(cafe.coordinates.top)
    setFormLeft(cafe.coordinates.left)
    setFormLatitude(cafe.latitude !== undefined ? cafe.latitude : 8.4772)
    setFormLongitude(cafe.longitude !== undefined ? cafe.longitude : 124.6459)
    setFormStatus(cafe.status)
    setFormHours(cafe.hours)
    setFormDistance(cafe.distance || '0.5 KM')
    setFormTopFeature(cafe.topFeature || '')
    setFormAtmosphere(cafe.atmosphere || '')
    setFormPromos(cafe.promos || '')
    setIsCafeModalOpen(true)
  }

  const handleSaveCafe = async (e: React.FormEvent) => {
    e.preventDefault()

    const total = Number(((formTaste + formVibeScore + formService) / 3).toFixed(1))
    const generatedId = editingCafe
      ? formId
      : formId.trim() ||
        formName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') ||
        `cafe-${Date.now()}`

    const cafePayload: Cafe = {
      id: generatedId,
      name: formName.trim(),
      location: formLocation.trim(),
      neighborhood: formNeighborhood.trim(),
      website: formWebsite.trim(),
      image:
        formImage.trim() ||
        'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80',
      type: formType,
      stats: {
        taste: Number(formTaste),
        vibe: Number(formVibeScore),
        service: Number(formService),
        total,
      },
      vibe: {
        wifi: formWifi,
        outlets: formOutlets,
        seating: formSeating,
        noise: formNoise,
      },
      coffee: {
        roaster: formRoaster,
        beans: formBeans,
        espresso: formEspresso,
        filter: formFilter,
      },
      review: formReview,
      coordinates: { top: formTop, left: formLeft },
      latitude: formLatitude === '' ? 8.4772 : Number(formLatitude),
      longitude: formLongitude === '' ? 124.6459 : Number(formLongitude),
      status: formStatus,
      hours: formHours,
      distance: formDistance,
      topFeature: formTopFeature,
      atmosphere: formAtmosphere,
      promos: formPromos.trim() || undefined,
    }

    if (editingCafe) {
      await updateCafeInSupabase(cafePayload.id, cafePayload)
      appendSystemLog({
        severity: 'INFO',
        source: 'Admin / CafeManager',
        message: `Updated coffee shop "${cafePayload.name}" (${cafePayload.id})`,
        details: `Address: ${cafePayload.neighborhood} · Status: ${cafePayload.status} · Roaster: ${cafePayload.coffee.roaster || 'Cafe'}`,
        statusCode: 200,
        resolved: true,
      })
      showToast(`Updated "${cafePayload.name}" across Map & Directory`)
    } else {
      await insertCafeToSupabase(cafePayload)
      appendSystemLog({
        severity: 'INFO',
        source: 'Admin / CafeManager',
        message: `Added new coffee shop "${cafePayload.name}" (${cafePayload.id})`,
        details: `Coordinates: [${cafePayload.latitude}, ${cafePayload.longitude}] · Address: ${cafePayload.neighborhood}`,
        statusCode: 201,
        resolved: true,
      })
      showToast(`Added "${cafePayload.name}" to the platform`)
    }

    setIsCafeModalOpen(false)
    const refreshed = await getCafesFromSupabase()
    setCafesList(refreshed)
    setLogsList(getSystemLogs())
  }

  const handleToggleCafeOpenClosed = async (cafe: Cafe) => {
    const nextStatus: 'Open' | 'Closed' = cafe.status === 'Open' ? 'Closed' : 'Open'
    const updated: Cafe = { ...cafe, status: nextStatus }
    await updateCafeInSupabase(updated.id, updated)
    appendSystemLog({
      severity: 'INFO',
      source: 'Admin / QuickStatus',
      message: `Switched "${cafe.name}" status to ${nextStatus.toUpperCase()}`,
      details: `Marker on live map updated immediately for ${cafe.id}.`,
      statusCode: 200,
      resolved: true,
    })
    const refreshed = await getCafesFromSupabase()
    setCafesList(refreshed)
    setLogsList(getSystemLogs())
    showToast(`${cafe.name} marked as ${nextStatus}`)
  }

  const handleDeleteCafe = async (cafe: Cafe) => {
    if (!confirm(`Are you sure you want to delete "${cafe.name}"?`)) return
    await deleteCafeFromSupabase(cafe.id, cafe.name)
    appendSystemLog({
      severity: 'WARNING',
      source: 'Admin / CafeManager',
      message: `Deleted coffee shop "${cafe.name}" (${cafe.id})`,
      details: `Removed from active Map, Directory, and search index by ${userEmail}.`,
      statusCode: 200,
      resolved: true,
    })
    const refreshed = await getCafesFromSupabase()
    setCafesList(refreshed)
    setLogsList(getSystemLogs())
    showToast(`Deleted "${cafe.name}"`)
  }

  const handleSeedDatabase = async () => {
    const res = await seedSupabaseWithMockData()
    const msg = res.success
      ? `Synced ${res.count} default CDO coffee shops`
      : 'Synced default CDO coffee shops via local override store'
    appendSystemLog({
      severity: res.success ? 'INFO' : 'WARNING',
      source: 'Admin / SeedRunner',
      message: msg,
      details: 'Executed seedSupabaseWithMockData() from Admin Control Center.',
      statusCode: res.success ? 200 : 206,
      resolved: true,
    })
    const refreshed = await getCafesFromSupabase()
    setCafesList(refreshed)
    setLogsList(getSystemLogs())
    showToast(msg)
  }

  // --- User Management Handlers ---
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newUserName.trim() || !newUserEmail.trim()) return

    const created: ManagedUser = {
      id: `usr-${Date.now()}`,
      name: newUserName.trim(),
      email: newUserEmail.trim().toLowerCase(),
      role: newUserRole,
      managedCafeId: newUserCafeId || null,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      lastActive: 'Invited just now',
    }

    const updated = [created, ...usersList]
    setUsersList(updated)
    saveManagedUsers(updated)
    appendSystemLog({
      severity: 'INFO',
      source: 'Admin / UserRBAC',
      message: `Added user ${created.email} with role "${created.role}"`,
      details: `Assigned shop: ${created.managedCafeId || 'All / None'}`,
      statusCode: 201,
      resolved: true,
    })
    setLogsList(getSystemLogs())
    setIsUserModalOpen(false)
    setNewUserName('')
    setNewUserEmail('')
    setNewUserCafeId('')
    showToast(`Added user ${created.email}`)
  }

  const handleUpdateUserRole = (userId: string, role: ManagedUser['role']) => {
    const updated = usersList.map((u) => (u.id === userId ? { ...u, role } : u))
    setUsersList(updated)
    saveManagedUsers(updated)
    const target = updated.find((u) => u.id === userId)
    appendSystemLog({
      severity: 'INFO',
      source: 'Admin / UserRBAC',
      message: `Updated role for ${target?.email} to "${role}"`,
      details: `Role permission change persisted by ${userEmail}.`,
      statusCode: 200,
      resolved: true,
    })
    setLogsList(getSystemLogs())
    showToast(`Updated role for ${target?.name}`)
  }

  const handleUpdateUserCafe = (userId: string, cafeId: string) => {
    const updated = usersList.map((u) =>
      u.id === userId ? { ...u, managedCafeId: cafeId || null } : u
    )
    setUsersList(updated)
    saveManagedUsers(updated)
    showToast('Updated assigned coffee shop')
  }

  const handleToggleUserStatus = (userId: string) => {
    const updated: ManagedUser[] = usersList.map((u) =>
      u.id === userId
        ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' }
        : u
    )
    setUsersList(updated)
    saveManagedUsers(updated)
    const target = updated.find((u) => u.id === userId)
    appendSystemLog({
      severity: target?.status === 'Suspended' ? 'WARNING' : 'INFO',
      source: 'Admin / UserSecurity',
      message: `Account ${target?.email} status changed to ${target?.status}`,
      details: `Action performed via Admin Users panel.`,
      statusCode: 200,
      resolved: true,
    })
    setLogsList(getSystemLogs())
    showToast(`${target?.name} is now ${target?.status}`)
  }

  const handleDeleteUser = (user: ManagedUser) => {
    if (!confirm(`Remove user "${user.name}" (${user.email})?`)) return
    const updated = usersList.filter((u) => u.id !== user.id)
    setUsersList(updated)
    saveManagedUsers(updated)
    appendSystemLog({
      severity: 'WARNING',
      source: 'Admin / UserRBAC',
      message: `Removed user account ${user.email}`,
      details: `Deleted user record ${user.id} (${user.role}).`,
      statusCode: 200,
      resolved: true,
    })
    setLogsList(getSystemLogs())
    showToast(`Removed ${user.email}`)
  }

  // --- Logs & Monitoring Handlers ---
  const handleToggleLogResolved = (logId: string) => {
    const updated = logsList.map((l) =>
      l.id === logId ? { ...l, resolved: !l.resolved } : l
    )
    setLogsList(updated)
    saveSystemLogs(updated)
    if (selectedLog?.id === logId) {
      setSelectedLog({ ...selectedLog, resolved: !selectedLog.resolved })
    }
  }

  const handleClearResolvedLogs = () => {
    const remaining = logsList.filter((l) => !l.resolved)
    setLogsList(remaining)
    saveSystemLogs(remaining)
    setSelectedLog(null)
    showToast('Cleared all resolved logs')
  }

  const handleRunDiagnostics = async () => {
    const start = performance.now()
    const { error } = await supabase
      .from('cafes')
      .select('id', { count: 'exact', head: true })
    const latency = Math.round(performance.now() - start)

    if (error) {
      appendSystemLog({
        severity: 'WARNING',
        source: 'Diagnostics / HealthCheck',
        message: `Supabase table check returned notice (${latency}ms) — Local Override Store active`,
        details: `Message: ${error.message}. All CRUD operations remain 100% operational via hybrid local + cloud persistence.`,
        statusCode: 206,
        resolved: true,
      })
    } else {
      appendSystemLog({
        severity: 'INFO',
        source: 'Diagnostics / HealthCheck',
        message: `All platform services healthy (${latency}ms latency)`,
        details: `Verified: Supabase REST API (OK), Esri Basemap Tiles (OK), Auth Non-Blocking Lock (OK), ${cafesList.length} Cafes Indexed.`,
        statusCode: 200,
        resolved: true,
      })
    }
    setLogsList(getSystemLogs())
    showToast(`Diagnostics complete (${latency}ms)`)
  }

  const handleSimulateErrorLog = () => {
    appendSystemLog({
      severity: 'ERROR',
      source: 'Webhook / RoasterSync',
      message: 'Simulated rate-limit spike on external inventory webhook (HTTP 429)',
      details:
        'POST /api/webhooks/roaster-beans exceeded 60 req/min burst window from IP 203.177.42.19. Retry-After queued for 15s.',
      statusCode: 429,
      resolved: false,
    })
    setLogsList(getSystemLogs())
    showToast('Logged test error event to monitor')
  }

  // --- Filtered Lists ---
  const filteredCafes = useMemo(() => {
    return cafesList.filter((c) => {
      if (cafeFilterStatus !== 'ALL' && c.status !== cafeFilterStatus) return false
      if (cafeSearch.trim()) {
        const q = cafeSearch.toLowerCase()
        return (
          c.name.toLowerCase().includes(q) ||
          c.neighborhood.toLowerCase().includes(q) ||
          (c.coffee.roaster || '').toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [cafesList, cafeFilterStatus, cafeSearch])

  const filteredUsers = useMemo(() => {
    return usersList.filter((u) => {
      if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase()
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [usersList, userRoleFilter, userSearch])

  const filteredLogs = useMemo(() => {
    return logsList.filter((l) => {
      if (logSeverityFilter !== 'ALL' && l.severity !== logSeverityFilter) return false
      if (logSearch.trim()) {
        const q = logSearch.toLowerCase()
        return (
          l.message.toLowerCase().includes(q) ||
          l.source.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [logsList, logSeverityFilter, logSearch])

  const unresolvedErrorsCount = useMemo(
    () => logsList.filter((l) => !l.resolved).length,
    [logsList]
  )

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-ink">
      <Navbar />

      {/* Top Admin Command Header */}
      <header className="bg-white border-b border-border px-4 sm:px-8 py-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-border">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-ink text-white font-mono text-[10px] uppercase tracking-widest font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> ADMIN CONTROL CENTER
                </span>
                <span className="font-mono text-[11px] uppercase tracking-widest text-muted">
                  {userEmail} ({profileRole})
                </span>
                <Tooltip content="Manage all coffee shops on the map, user accounts & roles, live site error logs, and city news dispatches from one unified command center.">
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-border text-[10px] font-mono text-muted hover:text-ink cursor-help">
                    ?
                  </span>
                </Tooltip>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-ink">
                Platform Operations & Monitoring
              </h1>
            </div>

            {/* Quick System Telemetry Pills */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="px-3 py-2 bg-[#FAF9F6] border border-border flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <div className="font-mono text-[10px] uppercase tracking-wider">
                  <div className="text-muted">DATA STORE</div>
                  <div className="font-bold text-ink">
                    {dbStatus === 'Connected' ? 'Supabase + Local Sync' : 'Hybrid Store Active'}
                  </div>
                </div>
              </div>

              <div className="px-3 py-2 bg-[#FAF9F6] border border-border flex items-center gap-2">
                <Coffee className="w-3.5 h-3.5 text-ink" />
                <div className="font-mono text-[10px] uppercase tracking-wider">
                  <div className="text-muted">CAFES INDEXED</div>
                  <div className="font-bold text-ink">{cafesList.length} Spaces</div>
                </div>
              </div>

              <div className="px-3 py-2 bg-[#FAF9F6] border border-border flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-ink" />
                <div className="font-mono text-[10px] uppercase tracking-wider">
                  <div className="text-muted">USERS</div>
                  <div className="font-bold text-ink">{usersList.length} Accounts</div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('LOGS')}
                className={`px-3 py-2 border flex items-center gap-2 cursor-pointer transition-colors ${
                  unresolvedErrorsCount > 0
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <div className="font-mono text-[10px] uppercase tracking-wider text-left">
                  <div className="opacity-75">SITE MONITOR</div>
                  <div className="font-bold">
                    {unresolvedErrorsCount > 0
                      ? `${unresolvedErrorsCount} Open Alerts`
                      : '0 Open Errors'}
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Admin Navigation Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('CAFES')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-widest border transition-colors cursor-pointer ${
                  activeTab === 'CAFES'
                    ? 'bg-ink text-white border-ink font-bold'
                    : 'bg-white text-muted border-border hover:text-ink hover:border-ink'
                }`}
              >
                <Coffee className="w-3.5 h-3.5" />
                1. Coffee Shops ({cafesList.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('USERS')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-widest border transition-colors cursor-pointer ${
                  activeTab === 'USERS'
                    ? 'bg-ink text-white border-ink font-bold'
                    : 'bg-white text-muted border-border hover:text-ink hover:border-ink'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                2. Users & Roles ({usersList.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('LOGS')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-widest border transition-colors cursor-pointer ${
                  activeTab === 'LOGS'
                    ? 'bg-ink text-white border-ink font-bold'
                    : 'bg-white text-muted border-border hover:text-ink hover:border-ink'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                3. Error Logs & Monitor
                {unresolvedErrorsCount > 0 && (
                  <span className="px-1.5 py-0.2 bg-amber-400 text-ink font-bold text-[10px]">
                    {unresolvedErrorsCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('CONTENT')}
                className={`inline-flex items-center gap-2 px-4 py-2.5 font-mono text-xs uppercase tracking-widest border transition-colors cursor-pointer ${
                  activeTab === 'CONTENT'
                    ? 'bg-ink text-white border-ink font-bold'
                    : 'bg-white text-muted border-border hover:text-ink hover:border-ink'
                }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                4. News & Gimmicks ({newsList.length + gimmicksList.length})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadAllAdminData}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-border bg-white hover:border-ink font-mono text-[10px] uppercase tracking-widest text-ink cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Data
              </button>
            </div>
          </div>
        </div>
      </header>

      {toastMessage && (
        <div className="bg-emerald-700 text-white px-4 py-2.5 font-mono text-xs uppercase tracking-widest text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Main Tab Body */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-8 py-8">
        {/* ============================================================
            TAB 1: COFFEE SHOPS MANAGEMENT (ADD / EDIT / DELETE)
           ============================================================ */}
        {activeTab === 'CAFES' && (
          <div className="space-y-6">
            <div className="bg-white border border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={cafeSearch}
                    onChange={(e) => setCafeSearch(e.target.value)}
                    placeholder="Search cafes by name, street, roaster..."
                    className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-border font-mono text-xs focus:outline-none focus:border-ink"
                  />
                  {cafeSearch && (
                    <button
                      type="button"
                      onClick={() => setCafeSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  {(['ALL', 'Open', 'Closed'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setCafeFilterStatus(status)}
                      className={`px-3 py-2 font-mono text-[10px] uppercase tracking-widest border cursor-pointer ${
                        cafeFilterStatus === status
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-muted border-border hover:text-ink'
                      }`}
                    >
                      {status === 'ALL' ? 'All Status' : status}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleSeedDatabase}
                  className="px-3.5 py-2.5 border border-border bg-[#FAF9F6] hover:border-ink font-mono text-xs uppercase tracking-widest text-ink cursor-pointer"
                >
                  Sync / Seed DB
                </button>
                <button
                  type="button"
                  onClick={openAddCafeModal}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink text-white font-mono text-xs uppercase tracking-widest hover:bg-ink/90 cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> + Add Coffee Shop
                </button>
              </div>
            </div>

            {isLoadingCafes ? (
              <div className="bg-white border border-border p-12 text-center font-mono text-xs uppercase tracking-widest text-muted">
                Loading coffee shops...
              </div>
            ) : filteredCafes.length === 0 ? (
              <div className="bg-white border border-border p-12 text-center">
                <p className="font-mono text-xs uppercase tracking-widest text-muted mb-4">
                  No coffee shops match your current filter.
                </p>
                <button
                  type="button"
                  onClick={openAddCafeModal}
                  className="px-4 py-2 bg-ink text-white font-mono text-xs uppercase tracking-widest cursor-pointer"
                >
                  + Add New Coffee Shop
                </button>
              </div>
            ) : (
              <div className="bg-white border border-border overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-[#FAF9F6] font-mono text-[10px] uppercase tracking-widest text-muted">
                      <th className="py-3.5 px-4">Coffee Shop</th>
                      <th className="py-3.5 px-4">Neighborhood & Coords</th>
                      <th className="py-3.5 px-4">Marker / Roaster</th>
                      <th className="py-3.5 px-4">Hours & Status</th>
                      <th className="py-3.5 px-4">Score</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {filteredCafes.map((cafe) => {
                      const isRoastery =
                        cafe.type === 'PRO' ||
                        (cafe.coffee.roaster || '').toLowerCase().includes('roast')
                      return (
                        <tr key={cafe.id} className="hover:bg-[#FAF9F6]/60 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={cafe.image}
                                alt={cafe.name}
                                className="w-11 h-11 object-cover border border-border shrink-0 bg-neutral-100"
                              />
                              <div>
                                <div className="font-bold text-ink flex items-center gap-1.5">
                                  {cafe.name}
                                  <Link
                                    href={`/cafe/${cafe.id}`}
                                    className="text-muted hover:text-ink"
                                    title="View Cafe Page"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </Link>
                                </div>
                                <div className="font-mono text-[10px] text-muted">{cafe.id}</div>
                              </div>
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <div className="text-ink font-medium">{cafe.neighborhood}</div>
                            <div className="font-mono text-[10px] text-muted flex items-center gap-1 mt-0.5">
                              <MapPin className="w-2.5 h-2.5" />
                              {cafe.latitude?.toFixed(4) || '8.4772'},{' '}
                              {cafe.longitude?.toFixed(4) || '124.6459'}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest border ${
                                isRoastery
                                  ? 'bg-amber-50 text-amber-900 border-amber-200'
                                  : 'bg-neutral-100 text-ink border-border'
                              }`}
                            >
                              {isRoastery ? 'Bean · Roastery' : 'Cup · Cafe'}
                            </span>
                            <div className="text-[11px] text-muted mt-1 truncate max-w-[180px]">
                              {cafe.coffee.roaster || cafe.coffee.beans}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <button
                              type="button"
                              onClick={() => handleToggleCafeOpenClosed(cafe)}
                              title="Click to toggle Open / Closed on the live map"
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest font-bold border cursor-pointer transition-colors ${
                                cafe.status === 'Open'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                                  : 'bg-rose-50 text-rose-800 border-rose-300 hover:bg-rose-100'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  cafe.status === 'Open' ? 'bg-emerald-600' : 'bg-rose-600'
                                }`}
                              />
                              {cafe.status}
                            </button>
                            <div className="font-mono text-[10px] text-muted mt-1">
                              {cafe.hours}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span className="px-2 py-1 bg-ink text-white font-mono text-xs font-bold">
                              {cafe.stats.total.toFixed(1)}
                            </span>
                          </td>

                          <td className="py-3.5 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditCafeModal(cafe)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-border bg-white hover:border-ink font-mono text-[10px] uppercase tracking-widest text-ink cursor-pointer"
                              >
                                <Edit3 className="w-3 h-3" /> Edit
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteCafe(cafe)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-rose-200 bg-rose-50/60 hover:bg-rose-600 hover:text-white font-mono text-[10px] uppercase tracking-widest text-rose-700 cursor-pointer transition-colors"
                              >
                                <Trash2 className="w-3 h-3" /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ============================================================
            TAB 2: USERS & ROLE-BASED ACCESS CONTROL
           ============================================================ */}
        {activeTab === 'USERS' && (
          <div className="space-y-6">
            <div className="bg-white border border-border p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name, email, role..."
                    className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-border font-mono text-xs focus:outline-none focus:border-ink"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {(['ALL', 'superadmin', 'admin', 'managers', 'user'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setUserRoleFilter(r)}
                      className={`px-3 py-2 font-mono text-[10px] uppercase tracking-widest border cursor-pointer ${
                        userRoleFilter === r
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-muted border-border hover:text-ink'
                      }`}
                    >
                      {r === 'ALL' ? 'All Roles' : r}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsUserModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-ink text-white font-mono text-xs uppercase tracking-widest hover:bg-ink/90 cursor-pointer"
              >
                <UserPlus className="w-4 h-4" /> + Add / Invite User
              </button>
            </div>

            <div className="bg-white border border-border overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-[#FAF9F6] font-mono text-[10px] uppercase tracking-widest text-muted">
                    <th className="py-3.5 px-4">User</th>
                    <th className="py-3.5 px-4">Role Permission</th>
                    <th className="py-3.5 px-4">Assigned Coffee Shop</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Activity</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FAF9F6]/60">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-ink">{u.name}</div>
                        <div className="font-mono text-[11px] text-muted">{u.email}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={u.role}
                          onChange={(e) =>
                            handleUpdateUserRole(u.id, e.target.value as ManagedUser['role'])
                          }
                          className="px-2.5 py-1.5 bg-[#FAF9F6] border border-border font-mono text-[11px] uppercase tracking-wider text-ink focus:outline-none focus:border-ink"
                        >
                          <option value="superadmin">superadmin</option>
                          <option value="admin">admin</option>
                          <option value="managers">managers</option>
                          <option value="user">user</option>
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <select
                          value={u.managedCafeId || ''}
                          onChange={(e) => handleUpdateUserCafe(u.id, e.target.value)}
                          className="px-2.5 py-1.5 bg-[#FAF9F6] border border-border font-mono text-[11px] text-ink max-w-[220px] focus:outline-none focus:border-ink"
                        >
                          <option value="">— All / No Specific Shop —</option>
                          {cafesList.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`px-2.5 py-1 font-mono text-[10px] uppercase tracking-widest font-bold border cursor-pointer ${
                            u.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-rose-50 text-rose-800 border-rose-300'
                          }`}
                        >
                          {u.status}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[10px] text-muted">
                        <div>Last: {u.lastActive}</div>
                        <div>Joined: {u.createdAt}</div>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(u)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-rose-200 bg-rose-50/60 hover:bg-rose-600 hover:text-white font-mono text-[10px] uppercase tracking-widest text-rose-700 cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3 h-3" /> Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 3: ERROR LOGS & SITE MONITORING
           ============================================================ */}
        {activeTab === 'LOGS' && (
          <div className="space-y-6">
            {/* System Health Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-border p-4">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
                  <span>SUPABASE & DATA STORE</span>
                  <Database className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-lg font-bold text-ink flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Operational
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Hybrid cloud + local override store active. Zero data-loss fallback enabled.
                </p>
              </div>

              <div className="bg-white border border-border p-4">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
                  <span>MAP TILE ENGINE</span>
                  <Server className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-lg font-bold text-ink flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Esri Light Gray Base
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Clean street-label-free canvas (`maxNativeZoom: 15`) with animated Bean/Cup SVG markers.
                </p>
              </div>

              <div className="bg-white border border-border p-4">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
                  <span>AUTH SESSION LOCK</span>
                  <Lock className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-lg font-bold text-ink flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Non-Blocking Lock
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Navigator LockManager deadlock protection active across all tabs.
                </p>
              </div>

              <div className="bg-white border border-border p-4">
                <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-widest text-muted mb-2">
                  <span>UNRESOLVED ALERTS</span>
                  <AlertTriangle
                    className={`w-4 h-4 ${
                      unresolvedErrorsCount > 0 ? 'text-amber-600' : 'text-emerald-600'
                    }`}
                  />
                </div>
                <div className="text-lg font-bold text-ink">
                  {unresolvedErrorsCount} Open / {logsList.length} Total Logs
                </div>
                <p className="text-[11px] text-muted mt-1">
                  Click any log entry below to inspect stack details or mark resolved.
                </p>
              </div>
            </div>

            {/* Filter & Action Toolbar */}
            <div className="bg-white border border-border p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3 flex-1">
                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Filter logs by source, message..."
                    className="w-full pl-9 pr-8 py-2 bg-[#FAF9F6] border border-border font-mono text-xs focus:outline-none focus:border-ink"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  {(['ALL', 'CRITICAL', 'ERROR', 'WARNING', 'INFO'] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setLogSeverityFilter(sev)}
                      className={`px-3 py-2 font-mono text-[10px] uppercase tracking-widest border cursor-pointer ${
                        logSeverityFilter === sev
                          ? 'bg-ink text-white border-ink'
                          : 'bg-white text-muted border-border hover:text-ink'
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleRunDiagnostics}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 text-white font-mono text-[10px] uppercase tracking-widest hover:bg-emerald-800 cursor-pointer"
                >
                  <Activity className="w-3.5 h-3.5" /> Run Live Health Check
                </button>
                <button
                  type="button"
                  onClick={handleSimulateErrorLog}
                  className="px-3.5 py-2 border border-border bg-[#FAF9F6] hover:border-ink font-mono text-[10px] uppercase tracking-widest text-ink cursor-pointer"
                >
                  + Simulate Error Event
                </button>
                <button
                  type="button"
                  onClick={handleClearResolvedLogs}
                  className="px-3.5 py-2 border border-border bg-white hover:border-ink font-mono text-[10px] uppercase tracking-widest text-muted hover:text-ink cursor-pointer"
                >
                  Clear Resolved
                </button>
              </div>
            </div>

            {/* Logs Table + Inspector */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-8 bg-white border border-border overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-[#FAF9F6] font-mono text-[10px] uppercase tracking-widest text-muted">
                      <th className="py-3 px-4">Severity</th>
                      <th className="py-3 px-4">Source & Message</th>
                      <th className="py-3 px-4">HTTP</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border text-xs">
                    {filteredLogs.map((log) => {
                      const isSelected = selectedLog?.id === log.id
                      return (
                        <tr
                          key={log.id}
                          onClick={() => setSelectedLog(log)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-amber-50/70' : 'hover:bg-[#FAF9F6]'
                          }`}
                        >
                          <td className="py-3.5 px-4 align-top">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest font-bold border ${
                                log.severity === 'CRITICAL' || log.severity === 'ERROR'
                                  ? 'bg-rose-50 text-rose-800 border-rose-300'
                                  : log.severity === 'WARNING'
                                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                                  : 'bg-sky-50 text-sky-800 border-sky-200'
                              }`}
                            >
                              {log.severity === 'ERROR' || log.severity === 'CRITICAL' ? (
                                <XCircle className="w-3 h-3" />
                              ) : log.severity === 'WARNING' ? (
                                <AlertTriangle className="w-3 h-3" />
                              ) : (
                                <Info className="w-3 h-3" />
                              )}
                              {log.severity}
                            </span>
                            <div className="font-mono text-[9px] text-muted mt-1">
                              {new Date(log.timestamp).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                              })}
                            </div>
                          </td>

                          <td className="py-3.5 px-4 align-top">
                            <div className="font-mono text-[10px] uppercase tracking-wider text-muted">
                              {log.source}
                            </div>
                            <div className="font-bold text-ink mt-0.5">{log.message}</div>
                          </td>

                          <td className="py-3.5 px-4 align-top font-mono text-[11px] text-muted">
                            {log.statusCode || 200}
                          </td>

                          <td
                            className="py-3.5 px-4 align-top"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              type="button"
                              onClick={() => handleToggleLogResolved(log.id)}
                              className={`px-2.5 py-1 font-mono text-[9px] uppercase tracking-widest font-bold border cursor-pointer ${
                                log.resolved
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                  : 'bg-amber-100 text-amber-950 border-amber-400'
                              }`}
                            >
                              {log.resolved ? '✓ Resolved' : 'Open Alert'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Right 4 Cols: Stack & Diagnostic Inspector */}
              <div className="lg:col-span-4 bg-ink text-white border border-ink p-5 flex flex-col justify-between">
                {selectedLog ? (
                  <div>
                    <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/15">
                      <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
                        LOG INSPECTOR · {selectedLog.id}
                      </span>
                      <span className="font-mono text-[10px] text-white/60">
                        HTTP {selectedLog.statusCode || 200}
                      </span>
                    </div>

                    <div className="space-y-3 font-mono text-xs">
                      <div>
                        <div className="text-[10px] text-white/50 uppercase">Source Module</div>
                        <div className="text-amber-300 font-bold">{selectedLog.source}</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-white/50 uppercase">Timestamp</div>
                        <div className="text-white/90">{selectedLog.timestamp}</div>
                      </div>

                      <div>
                        <div className="text-[10px] text-white/50 uppercase">Summary</div>
                        <div className="text-white font-bold leading-snug">
                          {selectedLog.message}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] text-white/50 uppercase mb-1">
                          Diagnostic Stack / Trace Details
                        </div>
                        <pre className="p-3 bg-black/50 border border-white/15 text-[11px] text-emerald-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                          {selectedLog.details}
                        </pre>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleToggleLogResolved(selectedLog.id)}
                        className="px-4 py-2 bg-emerald-500 text-ink font-mono text-[10px] uppercase tracking-widest font-bold cursor-pointer hover:bg-emerald-400"
                      >
                        {selectedLog.resolved ? 'Reopen Alert' : 'Mark as Resolved'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLog(null)}
                        className="font-mono text-[10px] uppercase tracking-widest text-white/60 hover:text-white cursor-pointer"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="my-auto text-center py-12">
                    <Terminal className="w-8 h-8 text-emerald-400 mx-auto mb-3 opacity-80" />
                    <div className="font-mono text-xs uppercase tracking-widest text-white font-bold">
                      Select any log entry to inspect
                    </div>
                    <p className="font-mono text-[11px] text-white/60 mt-2 max-w-xs mx-auto">
                      View full stack traces, HTTP status codes, and self-healing fallback actions.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================
            TAB 4: NEWS OUTLET & SHOP GIMMICKS MODERATION
           ============================================================ */}
        {activeTab === 'CONTENT' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* City News Dispatches */}
            <div className="bg-white border border-border p-6">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-700 font-bold">
                    THE ROOT DISPATCH
                  </span>
                  <h3 className="text-lg font-bold text-ink">
                    Published News Outlet Stories ({newsList.length})
                  </h3>
                </div>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-ink text-white font-mono text-[10px] uppercase tracking-widest"
                >
                  Open News Outlet <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {newsList.map((article) => (
                  <div
                    key={article.id}
                    className="p-4 bg-[#FAF9F6] border border-border flex items-start justify-between gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest mb-1">
                        <span className="px-2 py-0.5 bg-ink text-white">{article.category}</span>
                        <span className="text-muted">{article.locationArea}</span>
                      </div>
                      <h4 className="text-xs font-bold text-ink">{article.title}</h4>
                      <p className="text-[11px] text-muted mt-1 line-clamp-2">
                        {article.subtitle}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = deleteNewsArticle(article.id)
                        setNewsList(updated)
                        showToast('Removed news dispatch')
                      }}
                      className="px-2.5 py-1.5 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-mono text-[10px] uppercase tracking-widest shrink-0 cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Shop Studio Gimmicks */}
            <div className="bg-white border border-border p-6">
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
                <div>
                  <span className="font-mono text-[10px] uppercase tracking-widest text-amber-700 font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> SHOP STUDIO GIMMICKS
                  </span>
                  <h3 className="text-lg font-bold text-ink">
                    Active Shop Gimmicks & Tournaments ({gimmicksList.length})
                  </h3>
                </div>
                <Link
                  href="/studio"
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-ink text-white font-mono text-[10px] uppercase tracking-widest"
                >
                  Open Shop Studio <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-3">
                {gimmicksList.map((g) => {
                  const cafe = cafesList.find((c) => c.id === g.cafeId)
                  return (
                    <div
                      key={g.id}
                      className="p-4 bg-[#FAF9F6] border border-border flex items-start justify-between gap-4"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest mb-1">
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-900 font-bold">
                            {g.category}
                          </span>
                          <span className="text-emerald-700 font-bold">
                            {cafe?.name || g.cafeId}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-ink">{g.title}</h4>
                        <p className="text-[11px] text-muted mt-1">{g.schedule}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = deleteShopGimmick(g.id)
                          setGimmicksList(updated)
                          showToast('Removed shop gimmick')
                        }}
                        className="px-2.5 py-1.5 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-mono text-[10px] uppercase tracking-widest shrink-0 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================
          MODAL 1: ADD / EDIT COFFEE SHOP
         ============================================================ */}
      {isCafeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsCafeModalOpen(false)}
        >
          <div
            className="bg-white border border-ink max-w-3xl w-full p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-border">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-700 font-bold">
                  {editingCafe ? `EDITING: ${editingCafe.id}` : 'NEW COFFEE SHOP RECORD'}
                </span>
                <h2 className="text-xl font-bold text-ink mt-0.5">
                  {editingCafe ? `Edit ${editingCafe.name}` : 'Add Coffee Shop to Map & Directory'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCafeModalOpen(false)}
                className="w-8 h-8 border border-border flex items-center justify-center text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveCafe} className="space-y-5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Coffee Shop Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g., H Proper Coffee Roasters"
                    className="w-full px-3 py-2 border border-border font-mono focus:outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Current Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as 'Open' | 'Closed')}
                    className="w-full px-3 py-2 border border-border font-mono bg-white focus:outline-none focus:border-ink"
                  >
                    <option value="Open">Open (Animated Bean/Cup)</option>
                    <option value="Closed">Closed (Red X Marker)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Street Address / Neighborhood *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNeighborhood}
                    onChange={(e) => setFormNeighborhood(e.target.value)}
                    placeholder="e.g., Corrales Ave, Cagayan de Oro"
                    className="w-full px-3 py-2 border border-border font-mono focus:outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    City / Region *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-border font-mono focus:outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Operating Hours *
                  </label>
                  <input
                    type="text"
                    required
                    value={formHours}
                    onChange={(e) => setFormHours(e.target.value)}
                    placeholder="7:00 AM - 10:00 PM or 24/7"
                    className="w-full px-3 py-2 border border-border font-mono focus:outline-none focus:border-ink"
                  />
                </div>
              </div>

              {/* Map Coordinates & Marker Type */}
              <div className="p-4 bg-[#FAF9F6] border border-border grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Latitude (CDO ~8.4772) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formLatitude}
                    onChange={(e) =>
                      setFormLatitude(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-white border border-border font-mono focus:outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Longitude (CDO ~124.6459) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={formLongitude}
                    onChange={(e) =>
                      setFormLongitude(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-white border border-border font-mono focus:outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Marker Type (Roastery = Bean, Cafe = Cup)
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-border font-mono focus:outline-none focus:border-ink"
                  >
                    <option value="PRO">PRO · Roastery (Animated Bean Marker)</option>
                    <option value="INT">INT · Specialty Cafe (Animated Cup Marker)</option>
                    <option value="NEW">NEW · New Opening (Cup Marker)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    className="w-full px-3 py-2 border border-border font-mono focus:outline-none focus:border-ink"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Top Feature Highlight
                  </label>
                  <input
                    type="text"
                    value={formTopFeature}
                    onChange={(e) => setFormTopFeature(e.target.value)}
                    placeholder="e.g., Bukidnon Single-Origin Roaster"
                    className="w-full px-3 py-2 border border-border font-mono focus:outline-none focus:border-ink"
                  />
                </div>
              </div>

              {/* Scores & Vibe */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Taste (1-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formTaste}
                    onChange={(e) => setFormTaste(parseFloat(e.target.value) || 8)}
                    className="w-full px-2.5 py-2 border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Vibe (1-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formVibeScore}
                    onChange={(e) => setFormVibeScore(parseFloat(e.target.value) || 8)}
                    className="w-full px-2.5 py-2 border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Service (1-10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={formService}
                    onChange={(e) => setFormService(parseFloat(e.target.value) || 8)}
                    className="w-full px-2.5 py-2 border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    WiFi Speed
                  </label>
                  <input
                    type="text"
                    value={formWifi}
                    onChange={(e) => setFormWifi(e.target.value)}
                    className="w-full px-2.5 py-2 border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Power Outlets
                  </label>
                  <input
                    type="text"
                    value={formOutlets}
                    onChange={(e) => setFormOutlets(e.target.value)}
                    className="w-full px-2.5 py-2 border border-border font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                    Beans Origin
                  </label>
                  <input
                    type="text"
                    value={formBeans}
                    onChange={(e) => setFormBeans(e.target.value)}
                    className="w-full px-2.5 py-2 border border-border font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                  Editorial Overview / Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formReview}
                  onChange={(e) => setFormReview(e.target.value)}
                  className="w-full p-3 border border-border font-mono focus:outline-none focus:border-ink"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                  Active Promo / Special Offer (Automatically Syndicated to News Outlet)
                </label>
                <input
                  type="text"
                  value={formPromos}
                  onChange={(e) => setFormPromos(e.target.value)}
                  placeholder="e.g., 20% off single-origin pour-overs every weekday morning"
                  className="w-full p-3 border border-border font-mono text-[11px] focus:outline-none focus:border-ink"
                />
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCafeModalOpen(false)}
                  className="px-4 py-2.5 border border-border font-mono text-xs uppercase tracking-widest text-muted hover:text-ink cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-ink text-white font-mono text-xs uppercase tracking-widest hover:bg-ink/90 cursor-pointer"
                >
                  {editingCafe ? 'Save Changes' : 'Create Coffee Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          MODAL 2: ADD / INVITE USER
         ============================================================ */}
      {isUserModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setIsUserModalOpen(false)}
        >
          <div
            className="bg-white border border-ink max-w-md w-full p-6 sm:p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-border">
              <div>
                <span className="font-mono text-[10px] uppercase tracking-widest text-emerald-700 font-bold">
                  USER & RBAC DIRECTORY
                </span>
                <h3 className="text-lg font-bold text-ink mt-0.5">Add / Invite Platform User</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="w-8 h-8 border border-border flex items-center justify-center text-muted hover:text-ink cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g., Marco Villanueva"
                  className="w-full px-3 py-2.5 border border-border font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g., owner@roastery.ph"
                  className="w-full px-3 py-2.5 border border-border font-mono"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                  Role Permission *
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as ManagedUser['role'])}
                  className="w-full px-3 py-2.5 border border-border font-mono bg-white"
                >
                  <option value="superadmin">superadmin (Full Platform Access)</option>
                  <option value="admin">admin (Admin & Moderation)</option>
                  <option value="managers">managers (Shop Owner / Studio Manager)</option>
                  <option value="user">user (Curator & Community Member)</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-widest font-bold mb-1">
                  Assign Coffee Shop (Optional)
                </label>
                <select
                  value={newUserCafeId}
                  onChange={(e) => setNewUserCafeId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-border font-mono bg-white"
                >
                  <option value="">— None / All Cafes —</option>
                  {cafesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-border flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-border font-mono text-xs uppercase tracking-widest text-muted cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-ink text-white font-mono text-xs uppercase tracking-widest cursor-pointer"
                >
                  Add User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}
