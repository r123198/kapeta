'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { 
  getCafesFromSupabase, 
  insertCafeToSupabase, 
  updateCafeInSupabase, 
  deleteCafeFromSupabase, 
  Cafe 
} from '@/lib/data'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const router = useRouter()
  
  // Auth state
  const [profileRole, setProfileRole] = useState<string | null>(null)
  const [managedCafeId, setManagedCafeId] = useState<string | null>(null)
  const [userEmail, setUserEmail] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Cafes data state
  const [cafesList, setCafesList] = useState<Cafe[]>([])
  const [subscriberCount, setSubscriberCount] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [dbStatus, setDbStatus] = useState<'Checking' | 'Connected' | 'Error'>('Checking')
  const [dbError, setDbError] = useState<string>('')
  


  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCafe, setEditingCafe] = useState<Cafe | null>(null) // null means adding a new cafe

  // Form State
  const [formId, setFormId] = useState('')
  const [formName, setFormName] = useState('')
  const [formLocation, setFormLocation] = useState('')
  const [formNeighborhood, setFormNeighborhood] = useState('')
  const [formWebsite, setFormWebsite] = useState('')
  const [formImage, setFormImage] = useState('')
  const [formType, setFormType] = useState('INT')
  
  // Scores
  const [formTaste, setFormTaste] = useState(8.0)
  const [formVibeScore, setFormVibeScore] = useState(8.0)
  const [formService, setFormService] = useState(8.0)

  // Vibe Details
  const [formWifi, setFormWifi] = useState('')
  const [formOutlets, setFormOutlets] = useState('')
  const [formSeating, setFormSeating] = useState('')
  const [formNoise, setFormNoise] = useState('')

  // Coffee Details
  const [formRoaster, setFormRoaster] = useState('')
  const [formBeans, setFormBeans] = useState('')
  const [formEspresso, setFormEspresso] = useState('')
  const [formFilter, setFormFilter] = useState('')

  // Other fields
  const [formReview, setFormReview] = useState('')
  const [formTop, setFormTop] = useState('50%')
  const [formLeft, setFormLeft] = useState('50%')
  const [formLatitude, setFormLatitude] = useState<number | ''>('')
  const [formLongitude, setFormLongitude] = useState<number | ''>('')
  const [formStatus, setFormStatus] = useState<'Open' | 'Closed'>('Open')
  const [formHours, setFormHours] = useState('8:00 AM - 6:00 PM')
  const [formDistance, setFormDistance] = useState('1.0 MI')
  const [formTopFeature, setFormTopFeature] = useState('')
  const [formAtmosphere, setFormAtmosphere] = useState('')
  const [formPromos, setFormPromos] = useState('')

  // Check auth and role
  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session?.user) {
          router.push('/login')
          return
        }
        setUserEmail(session.user.email || '')
        
        // Fetch user profile from database
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, managed_cafe_id')
          .eq('id', session.user.id)
          .single()

        const activeRole = profile?.role || session.user.user_metadata?.role || 'managers'
        const activeManagedCafeId = profile?.managed_cafe_id || session.user.user_metadata?.managed_cafe_id || null

        setProfileRole(activeRole)
        setManagedCafeId(activeManagedCafeId)

        if (activeRole !== 'superadmin' && activeRole !== 'admin') {
          // Block managers or standard users
          alert('Access Denied. You do not have permission to view the Admin page.')
          router.push('/')
          return
        }
        
        setAuthLoading(false)
        await loadData(activeRole, activeManagedCafeId)
      } catch (err) {
        console.error('Auth verification failed:', err)
        router.push('/login')
      }
    }
    checkAuth()
  }, [])

  // Load dashboard data
  const loadData = async (activeRole?: string, activeManagedCafeId?: string | null) => {
    const currentRole = activeRole !== undefined ? activeRole : profileRole
    const currentManagedCafeId = activeManagedCafeId !== undefined ? activeManagedCafeId : managedCafeId

    setIsLoading(true)
    try {
      // Test connection
      const { data: ping, error: pingError } = await supabase.from('early_users').select('count', { count: 'exact', head: true })
      
      if (pingError) {
        setDbStatus('Error')
        setDbError(pingError.message)
      } else {
        setDbStatus('Connected')
        setDbError('')
      }

      // Load cafes
      const list = await getCafesFromSupabase()
      
      // If admin, scope to only their assigned shop
      if (currentRole === 'admin' && currentManagedCafeId) {
        const filtered = list.filter(c => c.id === currentManagedCafeId)
        setCafesList(filtered)
      } else {
        setCafesList(list)
      }

      // Load email subscribers count
      const { count, error: subError } = await supabase
        .from('early_users')
        .select('*', { count: 'exact', head: true })
      
      if (!subError && count !== null) {
        setSubscriberCount(count)
      }
    } catch (e: any) {
      console.error(e)
      setDbStatus('Error')
      setDbError(e.message || 'Unknown network error')
    } finally {
      setIsLoading(false)
    }
  }

  // Calculate Metrics
  const totalCafes = cafesList.length
  const openCafesCount = cafesList.filter(c => c.status === 'Open').length
  const closedCafesCount = totalCafes - openCafesCount
  
  const avgTaste = totalCafes > 0 ? (cafesList.reduce((acc, c) => acc + c.stats.taste, 0) / totalCafes).toFixed(1) : '0.0'
  const avgVibe = totalCafes > 0 ? (cafesList.reduce((acc, c) => acc + c.stats.vibe, 0) / totalCafes).toFixed(1) : '0.0'
  const avgService = totalCafes > 0 ? (cafesList.reduce((acc, c) => acc + c.stats.service, 0) / totalCafes).toFixed(1) : '0.0'

  // Open modal for adding
  const handleAddClick = () => {
    if (profileRole !== 'superadmin') return
    setEditingCafe(null)
    setFormId('')
    setFormName('')
    setFormLocation('Iligan City, PH')
    setFormNeighborhood('Pala-o')
    setFormWebsite('')
    setFormImage('https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop')
    setFormType('INT')
    setFormTaste(8.5)
    setFormVibeScore(8.5)
    setFormService(8.5)
    setFormWifi('Fast Verified (50 Mbps)')
    setFormOutlets('Abundant')
    setFormSeating('Communal & Individual')
    setFormNoise('Moderate')
    setFormRoaster('Local Roasters')
    setFormBeans('Bukidnon / Mt. Apo')
    setFormEspresso('La Marzocco Linea')
    setFormFilter('V60')
    setFormReview('A beautiful new specialty cafe focused on creating an inspiring work environment and serving amazing single-origin Philippine coffee.')
    setFormTop('50%')
    setFormLeft('50%')
    setFormLatitude('')
    setFormLongitude('')
    setFormStatus('Open')
    setFormHours('8:00 AM - 8:00 PM')
    setFormDistance('1.0 MI')
    setFormTopFeature('High-Speed WiFi & Outlets')
    setFormAtmosphere('Cozy, Productive, Modern')
    setFormPromos('')
    setIsModalOpen(true)
  }

  // Open modal for editing
  const handleEditClick = (cafe: Cafe) => {
    setEditingCafe(cafe)
    setFormId(cafe.id)
    setFormName(cafe.name)
    setFormLocation(cafe.location)
    setFormNeighborhood(cafe.neighborhood)
    setFormWebsite(cafe.website)
    setFormImage(cafe.image)
    setFormType(cafe.type)
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
    setFormLatitude(cafe.latitude !== undefined && cafe.latitude !== null ? cafe.latitude : '')
    setFormLongitude(cafe.longitude !== undefined && cafe.longitude !== null ? cafe.longitude : '')
    setFormStatus(cafe.status)
    setFormHours(cafe.hours)
    setFormDistance(cafe.distance || '')
    setFormTopFeature(cafe.topFeature || '')
    setFormAtmosphere(cafe.atmosphere || '')
    setFormPromos(cafe.promos || '')
    setIsModalOpen(true)
  }

  // Save form (Insert or Update)
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if ID exists (when inserting)
    if (!editingCafe && !formId) {
      alert('Please provide a unique slug ID (e.g. "my-awesome-cafe")')
      return
    }

    const calculatedTotal = Number(((formTaste + formVibeScore + formService) / 3).toFixed(1))

    const cafePayload: Cafe = {
      id: formId.trim().toLowerCase().replace(/\s+/g, '-'),
      name: formName.trim(),
      location: formLocation.trim(),
      neighborhood: formNeighborhood.trim(),
      website: formWebsite.trim(),
      image: formImage.trim(),
      type: formType,
      stats: {
        taste: formTaste,
        vibe: formVibeScore,
        service: formService,
        total: calculatedTotal
      },
      vibe: {
        wifi: formWifi.trim(),
        outlets: formOutlets.trim(),
        seating: formSeating.trim(),
        noise: formNoise.trim()
      },
      coffee: {
        roaster: formRoaster.trim(),
        beans: formBeans.trim(),
        espresso: formEspresso.trim(),
        filter: formFilter.trim()
      },
      review: formReview.trim(),
      coordinates: {
        top: formTop.trim(),
        left: formLeft.trim()
      },
      status: formStatus,
      latitude: formLatitude !== '' ? Number(formLatitude) : undefined,
      longitude: formLongitude !== '' ? Number(formLongitude) : undefined,
      hours: formHours.trim(),
      distance: formDistance.trim(),
      topFeature: formTopFeature.trim(),
      atmosphere: formAtmosphere.trim(),
      promos: formPromos.trim()
    }

    let res
    if (editingCafe) {
      res = await updateCafeInSupabase(editingCafe.id, cafePayload)
    } else {
      if (profileRole !== 'superadmin') {
        alert('Action unauthorized.')
        return
      }
      res = await insertCafeToSupabase(cafePayload)
    }

    if (res.success) {
      setIsModalOpen(false)
      loadData()
      alert(editingCafe ? 'Cafe updated successfully!' : 'Cafe added successfully!')
    } else {
      alert(`Operation failed: ${res.error?.message || 'Unknown database error'}`)
    }
  }

  // Delete cafe
  const handleDeleteClick = async (id: string, name: string) => {
    if (profileRole !== 'superadmin') return
    if (confirm(`Are you sure you want to delete "${name}" from the database?`)) {
      const res = await deleteCafeFromSupabase(id)
      if (res.success) {
        loadData()
        alert('Cafe deleted successfully.')
      } else {
        alert(`Deletion failed: ${res.error?.message || 'Unknown database error'}`)
      }
    }
  }



  if (authLoading) {
    return (
      <div className="bg-surface min-h-screen text-on-surface flex flex-col font-sans">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <span className="font-mono text-label-caps text-secondary">Checking Authorization...</span>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="bg-surface min-h-screen text-on-surface flex flex-col font-sans mb-16 md:mb-0">
      <Navbar />

      <main className="flex-grow p-4 md:p-grid-margin max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <section className="pb-8 border-b border-border-subtle flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-hanken text-[36px] md:text-headline-lg font-bold text-primary uppercase tracking-tight mb-2">
              ADMIN CONTROL PANEL
            </h1>
            <p className="font-mono text-label-caps text-secondary">
              Logged in as: <span className="text-primary font-bold">{userEmail}</span> ({profileRole})
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Database status banner */}
            <div className="flex items-center gap-3 border border-border-subtle bg-canvas-white px-4 py-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                dbStatus === 'Connected' ? 'bg-green-600' : dbStatus === 'Checking' ? 'bg-yellow-500' : 'bg-red-600'
              }`} />
              <span className="font-mono text-label-caps text-[11px] text-primary">
                DB Status: {dbStatus}
              </span>
            </div>

          </div>
        </section>

        {dbStatus === 'Error' && (
          <div className="my-6 bg-error-container border border-error text-error p-4 font-mono text-body-sm">
            <span className="font-bold">Database Error:</span> {dbError}
            <p className="mt-2 text-[12px] text-secondary">
              Please check your `.env` configuration. Ensure you have run the schema migration in the Supabase SQL editor.
            </p>
          </div>
        )}

        {/* Insights Grid */}
        <section className="my-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-grid-gutter bg-border-subtle border border-border-subtle">
          <div className="bg-canvas-white p-6 flex flex-col">
            <span className="font-mono text-label-caps text-secondary text-[11px] tracking-wider mb-2">TOTAL WORKSPACES</span>
            <span className="font-hanken text-[48px] font-bold text-primary leading-none mt-auto">
              {isLoading ? '...' : totalCafes}
            </span>
          </div>

          <div className="bg-canvas-white p-6 flex flex-col">
            <span className="font-mono text-label-caps text-secondary text-[11px] tracking-wider mb-2">RATINGS PROFILE</span>
            <div className="flex flex-col gap-1 mt-auto font-mono text-[13px] text-primary">
              <div className="flex justify-between border-b border-border-subtle/55 pb-1">
                <span>TASTE:</span> <span className="font-bold">{isLoading ? '...' : avgTaste}</span>
              </div>
              <div className="flex justify-between border-b border-border-subtle/55 pb-1">
                <span>VIBE:</span> <span className="font-bold">{isLoading ? '...' : avgVibe}</span>
              </div>
              <div className="flex justify-between">
                <span>SERVICE:</span> <span className="font-bold">{isLoading ? '...' : avgService}</span>
              </div>
            </div>
          </div>

          <div className="bg-canvas-white p-6 flex flex-col">
            <span className="font-mono text-label-caps text-secondary text-[11px] tracking-wider mb-2">OPERATIONAL STATUS</span>
            <div className="flex justify-between mt-auto font-mono text-[13px] text-primary">
              <div className="flex flex-col">
                <span className="text-[10px] text-secondary uppercase">OPEN NOW</span>
                <span className="text-xl font-bold text-green-700">{isLoading ? '...' : openCafesCount}</span>
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-secondary uppercase">CLOSED</span>
                <span className="text-xl font-bold text-red-600">{isLoading ? '...' : closedCafesCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-canvas-white p-6 flex flex-col">
            <span className="font-mono text-label-caps text-secondary text-[11px] tracking-wider mb-2">NEWSLETTER LEADS</span>
            <span className="font-hanken text-[48px] font-bold text-primary leading-none mt-auto">
              {isLoading ? '...' : subscriberCount}
            </span>
          </div>
        </section>

        {/* CRUD Title Strip */}
        <section className="flex items-center justify-between py-4 border-b border-border-subtle">
          <h2 className="font-hanken text-title-md md:text-title-lg font-bold text-primary">
            WORKSPACE LIST
          </h2>
          {profileRole === 'superadmin' && (
            <button 
              onClick={handleAddClick}
              className="font-mono text-label-caps bg-primary text-on-primary px-4 py-2 hover:bg-tertiary-container transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Add Workspace
            </button>
          )}
        </section>

        {/* CRUD Table */}
        <section className="my-6 overflow-x-auto border border-border-subtle bg-canvas-white">
          {isLoading ? (
            <div className="text-center py-20 font-mono text-label-caps text-secondary">
              Querying database records...
            </div>
          ) : cafesList.length === 0 ? (
            <div className="text-center py-20 border border-border-subtle bg-canvas-white flex flex-col items-center">
              <span className="material-symbols-outlined text-[48px] text-secondary mb-4">
                database
              </span>
              <p className="font-mono text-label-caps text-secondary mb-4">No workspace records found in database.</p>
            </div>
          ) : (
            <table className="w-full text-left font-sans border-collapse">
              <thead>
                <tr className="bg-surface-alt font-mono text-label-caps text-secondary text-[11px] uppercase tracking-wider border-b border-border-subtle select-none">
                  <th className="py-3.5 px-6">ID / Name</th>
                  <th className="py-3.5 px-6">Location</th>
                  <th className="py-3.5 px-6">Type</th>
                  <th className="py-3.5 px-6">Scores (T / V / S)</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-sans text-body-sm text-primary">
                {cafesList.map((cafe) => (
                  <tr key={cafe.id} className="hover:bg-surface-alt transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 border border-border-subtle overflow-hidden shrink-0">
                          <img 
                            className="w-full h-full object-cover grayscale" 
                            src={cafe.image} 
                            alt="" 
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=600&auto=format&fit=crop';
                            }}
                          />
                        </div>
                        <div>
                          <div className="font-semibold text-primary">{cafe.name}</div>
                          <div className="font-mono text-[10px] text-secondary">{cafe.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>{cafe.location}</div>
                      <div className="text-[11px] text-secondary">{cafe.neighborhood}</div>
                    </td>
                    <td className="py-4 px-6 font-mono text-label-caps text-[10px]">
                      {cafe.type}
                    </td>
                    <td className="py-4 px-6 font-mono">
                      {cafe.stats.taste.toFixed(1)} / {cafe.stats.vibe.toFixed(1)} / {cafe.stats.service.toFixed(1)}
                      <span className="font-bold ml-2 text-primary font-sans">({cafe.stats.total.toFixed(1)})</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-0.5 font-mono text-[10px] uppercase border ${
                        cafe.status === 'Open' ? 'border-green-600 bg-green-50 text-green-700' : 'border-red-500 bg-red-50 text-red-600'
                      }`}>
                        {cafe.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-3">
                        <button 
                          onClick={() => handleEditClick(cafe)}
                          className="text-secondary hover:text-primary transition-colors flex items-center gap-1 font-mono text-[11px] uppercase"
                        >
                          <span className="material-symbols-outlined text-[16px]">edit</span>
                          Edit
                        </button>
                        {profileRole === 'superadmin' && (
                          <button 
                            onClick={() => handleDeleteClick(cafe.id, cafe.name)}
                            className="text-secondary hover:text-error transition-colors flex items-center gap-1 font-mono text-[11px] uppercase"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>

      {/* CRUD Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#00000033] backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-canvas-white border border-primary w-full max-w-3xl flex flex-col max-h-[90vh] shadow-lg animate-fade-in-up">
            
            {/* Modal Header */}
            <div className="bg-primary text-on-primary px-6 py-4 flex items-center justify-between">
              <h3 className="font-mono text-label-caps uppercase tracking-wider">
                {editingCafe ? `Edit Cafe: ${editingCafe.name}` : 'Add New Workspace'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-on-primary hover:text-secondary-container transition-colors animate-none"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-6">
              
              {/* Core Information Section */}
              <div>
                <h4 className="font-mono text-label-caps text-secondary text-[11px] tracking-wider border-b border-border-subtle pb-1 mb-4 uppercase">
                  1. Core Workspace details
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="cafe-id">
                      Slug ID (URL path) *
                    </label>
                    <input 
                      className="archival-input disabled:bg-surface-alt disabled:text-secondary text-primary"
                      id="cafe-id"
                      placeholder="e.g. sey-coffee"
                      required
                      disabled={!!editingCafe || profileRole !== 'superadmin'}
                      type="text"
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="cafe-name">
                      Workspace Name *
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="cafe-name"
                      placeholder="e.g. Sey Coffee"
                      required
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="cafe-location">
                      Location (City, State/Country) *
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="cafe-location"
                      placeholder="e.g. Brooklyn, NY"
                      required
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="cafe-neighborhood">
                      Neighborhood / District *
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="cafe-neighborhood"
                      placeholder="e.g. Brooklyn"
                      required
                      type="text"
                      value={formNeighborhood}
                      onChange={(e) => setFormNeighborhood(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="cafe-website">
                      Website URL
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="cafe-website"
                      placeholder="e.g. seycoffee.com"
                      type="text"
                      value={formWebsite}
                      onChange={(e) => setFormWebsite(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="cafe-image">
                      Hero Image URL *
                    </label>
                    <input 
                      className="archival-input text-primary disabled:bg-surface-alt disabled:text-secondary"
                      id="cafe-image"
                      placeholder="https://..."
                      disabled={profileRole !== 'superadmin'}
                      type="text"
                      value={formImage}
                      onChange={(e) => setFormImage(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="cafe-type">
                      Space Type *
                    </label>
                    <select
                      id="cafe-type"
                      className="archival-input bg-canvas-white cursor-pointer text-primary"
                      value={formType}
                      onChange={(e) => setFormType(e.target.value)}
                    >
                      <option value="INT">INT (Interior Focused)</option>
                      <option value="PRO">PRO (Roastery Focused)</option>
                      <option value="NEW">NEW (New Space)</option>
                      <option value="HM">HM (Historic Monument/Classic)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Cafe Scores (1 - 10) */}
              <div>
                <h4 className="font-mono text-label-caps text-secondary text-[11px] tracking-wider border-b border-border-subtle pb-1 mb-4 uppercase">
                  2. Quality Scores (0.0 - 10.0)
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="score-taste">
                      Taste Score
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="score-taste"
                      max="10"
                      min="0"
                      step="0.1"
                      type="number"
                      value={formTaste}
                      onChange={(e) => setFormTaste(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="score-vibe">
                      Vibe Score
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="score-vibe"
                      max="10"
                      min="0"
                      step="0.1"
                      type="number"
                      value={formVibeScore}
                      onChange={(e) => setFormVibeScore(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="score-service">
                      Service Score
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="score-service"
                      max="10"
                      min="0"
                      step="0.1"
                      type="number"
                      value={formService}
                      onChange={(e) => setFormService(Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              {/* Vibe Details */}
              <div>
                <h4 className="font-mono text-label-caps text-secondary text-[11px] tracking-wider border-b border-border-subtle pb-1 mb-4 uppercase">
                  3. The Vibe (Workspace Suitability)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="vibe-wifi">
                      WiFi Details
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="vibe-wifi"
                      placeholder="e.g. Fast (75 Mbps)"
                      type="text"
                      value={formWifi}
                      onChange={(e) => setFormWifi(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="vibe-outlets">
                      Power Outlets Density
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="vibe-outlets"
                      placeholder="e.g. Abundant / Sparse / None"
                      type="text"
                      value={formOutlets}
                      onChange={(e) => setFormOutlets(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="vibe-seating">
                      Seating Layout
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="vibe-seating"
                      placeholder="e.g. Communal tables, cozy pods"
                      type="text"
                      value={formSeating}
                      onChange={(e) => setFormSeating(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="vibe-noise">
                      Peak Noise Level
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="vibe-noise"
                      placeholder="e.g. Quiet / Moderate / Bustling"
                      type="text"
                      value={formNoise}
                      onChange={(e) => setFormNoise(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Coffee Details */}
              <div>
                <h4 className="font-mono text-label-caps text-secondary text-[11px] tracking-wider border-b border-border-subtle pb-1 mb-4 uppercase">
                  4. The Coffee Profile
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="coffee-roaster">
                      Roaster
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="coffee-roaster"
                      placeholder="e.g. In-house / Guest Roasters"
                      type="text"
                      value={formRoaster}
                      onChange={(e) => setFormRoaster(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="coffee-beans">
                      Bean Sourcing
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="coffee-beans"
                      placeholder="e.g. Single Origin (Bukidnon, Mt. Apo)"
                      type="text"
                      value={formBeans}
                      onChange={(e) => setFormBeans(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="coffee-espresso">
                      Espresso Setup
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="coffee-espresso"
                      placeholder="e.g. Synesso MVP / Modbar"
                      type="text"
                      value={formEspresso}
                      onChange={(e) => setFormEspresso(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="coffee-filter">
                      Filter Brewing Methods
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="coffee-filter"
                      placeholder="e.g. Kalita Wave, V60"
                      type="text"
                      value={formFilter}
                      onChange={(e) => setFormFilter(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Coordinates & Metadata */}
              <div>
                <h4 className="font-mono text-label-caps text-secondary text-[11px] tracking-wider border-b border-border-subtle pb-1 mb-4 uppercase">
                  5. Mapping & Editorial Metadata
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="coord-top">
                      Map Y-Coordinate (Top %)
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="coord-top"
                      placeholder="e.g. 33.33%"
                      type="text"
                      value={formTop}
                      onChange={(e) => setFormTop(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="coord-left">
                      Map X-Coordinate (Left %)
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="coord-left"
                      placeholder="e.g. 25%"
                      type="text"
                      value={formLeft}
                      onChange={(e) => setFormLeft(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="coord-latitude">
                      GPS Latitude
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="coord-latitude"
                      placeholder="e.g. 51.5262"
                      step="0.000001"
                      type="number"
                      value={formLatitude}
                      onChange={(e) => setFormLatitude(e.target.value !== '' ? Number(e.target.value) : '')}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="coord-longitude">
                      GPS Longitude
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="coord-longitude"
                      placeholder="e.g. -0.0863"
                      step="0.000001"
                      type="number"
                      value={formLongitude}
                      onChange={(e) => setFormLongitude(e.target.value !== '' ? Number(e.target.value) : '')}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="meta-status">
                      Initial Status
                    </label>
                    <select
                      id="meta-status"
                      className="archival-input bg-canvas-white cursor-pointer text-primary"
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as 'Open' | 'Closed')}
                    >
                      <option value="Open">Open</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="meta-hours">
                      Operating Hours
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="meta-hours"
                      placeholder="e.g. 7:00 AM - 5:00 PM"
                      type="text"
                      value={formHours}
                      onChange={(e) => setFormHours(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="meta-distance">
                      Distance (Display metric)
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="meta-distance"
                      placeholder="e.g. 0.4 MI"
                      type="text"
                      value={formDistance}
                      onChange={(e) => setFormDistance(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="meta-feature">
                      Top Feature Tag
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="meta-feature"
                      placeholder="e.g. 75 Mbps Verified WiFi"
                      type="text"
                      value={formTopFeature}
                      onChange={(e) => setFormTopFeature(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="meta-atmosphere">
                      Atmosphere Tags (Comma-separated)
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="meta-atmosphere"
                      placeholder="e.g. Serene, Botanical, Precise"
                      type="text"
                      value={formAtmosphere}
                      onChange={(e) => setFormAtmosphere(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="meta-promos">
                      Active Promos / Specials
                    </label>
                    <input 
                      className="archival-input text-primary"
                      id="meta-promos"
                      placeholder="e.g. 10% off for remote workers, Free cookie with every espresso on Tuesdays"
                      type="text"
                      value={formPromos}
                      onChange={(e) => setFormPromos(e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block font-mono text-label-caps text-[10px] text-primary uppercase mb-1.5" htmlFor="meta-review">
                      Curated Editorial Review (2-3 sentences) *
                    </label>
                    <textarea 
                      className="archival-input min-h-24 resize-y text-primary disabled:bg-surface-alt disabled:text-secondary"
                      id="meta-review"
                      placeholder="Write your editorial review here..."
                      required
                      disabled={profileRole !== 'superadmin'}
                      value={formReview}
                      onChange={(e) => setFormReview(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="border-t border-border-subtle pt-6 flex gap-4">
                <button 
                  type="submit"
                  className="archival-btn-primary flex-1"
                >
                  {editingCafe ? 'Save Changes' : 'Create Workspace'}
                  <span className="material-symbols-outlined text-[16px]">check</span>
                </button>
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="archival-btn-secondary w-32"
                >
                  Cancel
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
