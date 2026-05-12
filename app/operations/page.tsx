'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { fleetTrucks, statusColors, TruckStatus } from '@/lib/fleet-data'
import { 
  Search, 
  Filter, 
  Eye, 
  MoreVertical, 
  Download, 
  Columns3,
  Truck,
  Home,
  AlertTriangle,
  Wrench,
  Clock,
  Skull,
  Activity,
  X,
  Check
} from 'lucide-react'

const allColumns = [
  { key: 'truckNumber', label: 'Truck #', default: true },
  { key: 'status', label: 'Status', default: true },
  { key: 'driver', label: 'Driver', default: true },
  { key: 'makeModel', label: 'Make / Model / Year', default: true },
  { key: 'fleet', label: 'Fleet', default: true },
  { key: 'locationStatus', label: 'Location Status', default: true },
  { key: 'notes', label: 'Notes', default: true },
  { key: 'plate', label: 'Plate #', default: true },
  { key: 'inspection', label: 'Inspection', default: true },
  { key: 'vin', label: 'VIN', default: true },
  { key: 'camera', label: 'Camera', default: true },
]

const fleetOptions = ['All Fleets', 'Alpha', 'Beta', 'Gamma', 'Delta']

const kpiCards = [
  { label: 'TOTAL TRUCKS', value: 137, percent: '100%', color: '#3b82f6', icon: Truck },
  { label: 'ON DUTY', value: 102, percent: '74.5%', color: '#22c55e', icon: Activity },
  { label: 'HOME TIME', value: 12, percent: '8.7%', color: '#3b82f6', icon: Home },
  { label: 'BROKEN TRUCKS', value: 8, percent: '5.8%', color: '#ef4444', icon: Wrench },
  { label: 'ACCIDENT', value: 2, percent: '1.4%', color: '#f97316', icon: AlertTriangle },
  { label: 'TOTAL LOST', value: 1, percent: '0.7%', color: '#7f1d1d', icon: Skull },
  { label: 'GETTING READY', value: 10, percent: '7.3%', color: '#f97316', icon: Clock },
]

const tabs = ['All Trucks', 'On Duty', 'Broken', 'In Shop', 'Accident', 'Home Time', 'Getting Ready'] as const
type TabType = typeof tabs[number]

const tabToStatus: Record<TabType, TruckStatus | 'All'> = {
  'All Trucks': 'All' as const,
  'On Duty': 'ON DUTY',
  'Broken': 'BROKEN TRUCK',
  'In Shop': 'IN SHOP',
  'Accident': 'ACCIDENT',
  'Home Time': 'HOME TIME',
  'Getting Ready': 'GETTING READY',
}

export default function OperationsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState<TabType>('All Trucks')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)
  const [showColumns, setShowColumns] = useState(false)
  const [selectedFleet, setSelectedFleet] = useState('All Fleets')
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    allColumns.filter(c => c.default).map(c => c.key)
  )
  const filtersRef = useRef<HTMLDivElement>(null)
  const columnsRef = useRef<HTMLDivElement>(null)
  const itemsPerPage = 250
  
  // Inline editing state
  const [trucksData, setTrucksData] = useState(fleetTrucks)
  const [editingCell, setEditingCell] = useState<{ truckId: number; field: string } | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  
  // Modal editing state
  const [editingTruck, setEditingTruck] = useState<FleetTruck | null>(null)
  const [editForm, setEditForm] = useState<Partial<FleetTruck>>({})

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (filtersRef.current && !filtersRef.current.contains(event.target as Node)) {
        setShowFilters(false)
      }
      if (columnsRef.current && !columnsRef.current.contains(event.target as Node)) {
        setShowColumns(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredTrucks = useMemo(() => {
    return trucksData.filter(truck => {
      const matchesSearch = 
        truck.truckNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (truck.driverName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        truck.locationStatus.toLowerCase().includes(searchTerm.toLowerCase())
      const statusFilter = tabToStatus[activeTab]
      const matchesStatus = statusFilter === 'All' || truck.status === statusFilter
      const matchesFleet = selectedFleet === 'All Fleets' || truck.fleet === selectedFleet
      return matchesSearch && matchesStatus && matchesFleet
    })
  }, [searchTerm, activeTab, selectedFleet, trucksData])

  const toggleColumn = (key: string) => {
    setVisibleColumns(prev => 
      prev.includes(key) 
        ? prev.filter(k => k !== key)
        : [...prev, key]
    )
  }

  const handleCellClick = (truckId: number, field: string, currentValue: string | number | undefined) => {
    setEditingCell({ truckId, field })
    setEditValue(String(currentValue || ''))
  }

  const handleCellSave = () => {
    if (!editingCell) return
    setTrucksData(prev => 
      prev.map(truck => 
        truck.id === editingCell.truckId 
          ? { ...truck, [editingCell.field]: editingCell.field === 'year' ? parseInt(editValue) : editValue } 
          : truck
      )
    )
    setEditingCell(null)
    setEditValue('')
  }

  const handleCellCancel = () => {
    setEditingCell(null)
    setEditValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCellSave()
    } else if (e.key === 'Escape') {
      handleCellCancel()
    }
  }

  // Modal functions
  const handleOpenModal = (truck: FleetTruck) => {
    setEditingTruck(truck)
    setEditForm({ ...truck })
  }

  const handleSaveModal = () => {
    if (!editingTruck) return
    setTrucksData(prev => 
      prev.map(truck => 
        truck.id === editingTruck.id 
          ? { ...truck, ...editForm } 
          : truck
      )
    )
    setEditingTruck(null)
    setEditForm({})
  }

  const handleCloseModal = () => {
    setEditingTruck(null)
    setEditForm({})
  }

  const handleExport = () => {
    const headers = allColumns
      .filter(col => visibleColumns.includes(col.key))
      .map(col => col.label)
    
    const rows = filteredTrucks.map(truck => {
      const row: string[] = []
      if (visibleColumns.includes('truckNumber')) row.push(truck.truckNumber)
      if (visibleColumns.includes('status')) row.push(truck.status)
      if (visibleColumns.includes('driver')) row.push(truck.driverName || '-')
      if (visibleColumns.includes('makeModel')) row.push(`${truck.make} ${truck.model} ${truck.year}`)
      if (visibleColumns.includes('fleet')) row.push(truck.fleet)
      if (visibleColumns.includes('locationStatus')) row.push(truck.locationStatus)
      if (visibleColumns.includes('notes')) row.push(truck.notes || '-')
      if (visibleColumns.includes('plate')) row.push(truck.plateNumber)
      if (visibleColumns.includes('inspection')) row.push(truck.inspection)
      if (visibleColumns.includes('vin')) row.push(truck.vin)
      if (visibleColumns.includes('camera')) row.push(truck.cameraStatus || '-')
      return row
    })

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `fleet-operations-${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const totalPages = Math.ceil(filteredTrucks.length / itemsPerPage)
  const paginatedTrucks = filteredTrucks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const renderPagination = () => {
    const pages = []
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      pages.push(i)
    }
    if (totalPages > 5) {
      pages.push(-1) // ellipsis
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Operations" subtitle="Fleet operations and truck management" />
        
        <main className="p-6">
          {/* KPI Cards */}
          <div className="mb-6 grid grid-cols-7 gap-3">
            {kpiCards.map((card) => {
              const Icon = card.icon
              return (
                <div
                  key={card.label}
                  className="glass-card flex flex-col rounded-xl p-4"
                  style={{ 
                    boxShadow: `0 0 20px ${card.color}15`,
                    borderColor: `${card.color}30`
                  }}
                >
                  <div className="mb-3 flex items-center gap-2">
                    <Icon className="h-4 w-4" style={{ color: card.color }} />
                    <span className="text-[10px] font-medium uppercase tracking-wider text-white/70">
                      {card.label}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-white">{card.value}</div>
                  <div className="text-xs" style={{ color: card.color }}>
                    {card.percent} of fleet
                  </div>
                </div>
              )
            })}
          </div>

          {/* Fleet Operations Section */}
          <div className="glass-card overflow-hidden rounded-xl">
            {/* Section Header with Tabs */}
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Fleet Operations
                </h2>
                <div className="flex items-center gap-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab)
                        setCurrentPage(1)
                      }}
                      className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                        activeTab === tab
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {/* Filters Dropdown */}
                <div className="relative" ref={filtersRef}>
                  <button 
                    onClick={() => {
                      setShowFilters(!showFilters)
                      setShowColumns(false)
                    }}
                    className={`flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm transition-colors ${
                      showFilters || selectedFleet !== 'All Fleets' 
                        ? 'border-primary text-foreground' 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                    {selectedFleet !== 'All Fleets' && (
                      <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        1
                      </span>
                    )}
                  </button>
                  {showFilters && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-64 rounded-lg border border-border bg-card p-4 shadow-xl">
                      <div className="mb-3 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
                        <button 
                          onClick={() => setShowFilters(false)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Fleet</label>
                          <select
                            value={selectedFleet}
                            onChange={(e) => {
                              setSelectedFleet(e.target.value)
                              setCurrentPage(1)
                            }}
                            className="w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            {fleetOptions.map(fleet => (
                              <option key={fleet} value={fleet}>{fleet}</option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedFleet('All Fleets')
                            setShowFilters(false)
                          }}
                          className="w-full rounded-lg border border-border py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                        >
                          Clear Filters
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Columns Dropdown */}
                <div className="relative" ref={columnsRef}>
                  <button 
                    onClick={() => {
                      setShowColumns(!showColumns)
                      setShowFilters(false)
                    }}
                    className={`flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm transition-colors ${
                      showColumns ? 'border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Columns3 className="h-4 w-4" />
                    Columns
                  </button>
                  {showColumns && (
                    <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-card p-3 shadow-xl">
                      <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-foreground">Toggle Columns</h3>
                        <button 
                          onClick={() => setShowColumns(false)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="max-h-64 space-y-1 overflow-y-auto">
                        {allColumns.map(col => (
                          <button
                            key={col.key}
                            onClick={() => toggleColumn(col.key)}
                            className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-sm text-foreground hover:bg-secondary"
                          >
                            <div className={`flex h-4 w-4 items-center justify-center rounded border ${
                              visibleColumns.includes(col.key) 
                                ? 'border-primary bg-primary' 
                                : 'border-muted-foreground'
                            }`}>
                              {visibleColumns.includes(col.key) && (
                                <Check className="h-3 w-3 text-primary-foreground" />
                              )}
                            </div>
                            {col.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Export Button */}
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-2 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export
                </button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="border-b border-border px-4 py-3">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search by truck #, driver, location..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-secondary/30">
                    {visibleColumns.includes('truckNumber') && <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Truck #</th>}
                    {visibleColumns.includes('status') && <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Status</th>}
                    {visibleColumns.includes('driver') && <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Driver</th>}
                    {visibleColumns.includes('makeModel') && <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Make / Model / Year</th>}
                    {visibleColumns.includes('fleet') && <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Fleet</th>}
                    {visibleColumns.includes('locationStatus') && <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Location Status</th>}
                    {visibleColumns.includes('notes') && <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Notes</th>}
                    {visibleColumns.includes('plate') && <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Plate #</th>}
                    {visibleColumns.includes('inspection') && <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Inspection</th>}
                    {visibleColumns.includes('vin') && <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">VIN</th>}
                    {visibleColumns.includes('camera') && <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Camera</th>}
                    <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTrucks.map((truck) => (
                    <tr key={truck.id} className="border-b border-border/50 hover:bg-secondary/20">
                      {visibleColumns.includes('truckNumber') && (
                        <td 
                          className="whitespace-nowrap px-4 py-3 text-sm font-medium text-primary cursor-pointer hover:text-primary/80 hover:underline"
                          onClick={() => handleOpenModal(truck)}
                        >
                          {truck.truckNumber}
                        </td>
                      )}
                      {visibleColumns.includes('status') && (
                        <td 
                          className="whitespace-nowrap px-4 py-3 cursor-pointer hover:bg-white/5"
                          onClick={() => handleCellClick(truck.id, 'status', truck.status)}
                        >
                          {editingCell?.truckId === truck.id && editingCell?.field === 'status' ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              autoFocus
                              className="bg-gray-800 border border-primary rounded px-2 py-1 text-xs font-semibold text-white focus:outline-none"
                            >
                              <option value="ON DUTY">ON DUTY</option>
                              <option value="BROKEN TRUCK">BROKEN TRUCK</option>
                              <option value="ACCIDENT">ACCIDENT</option>
                              <option value="HOME TIME">HOME TIME</option>
                              <option value="IN SHOP">IN SHOP</option>
                              <option value="GETTING READY">GETTING READY</option>
                              <option value="TOTAL LOST">TOTAL LOST</option>
                            </select>
                          ) : (
                            <span
                              className="inline-flex items-center rounded px-2 py-1 text-xs font-semibold"
                              style={{
                                backgroundColor: statusColors[truck.status],
                                color: '#ffffff'
                              }}
                            >
                              {truck.status}
                            </span>
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('driver') && (
                        <td 
                          className="whitespace-nowrap px-4 py-3 text-sm text-foreground cursor-pointer hover:bg-white/5"
                          onClick={() => handleCellClick(truck.id, 'driverName', truck.driverName)}
                        >
                          {editingCell?.truckId === truck.id && editingCell?.field === 'driverName' ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleCellSave}
                              autoFocus
                              className="w-full bg-white/10 border border-primary rounded px-2 py-1 text-sm text-white focus:outline-none"
                            />
                          ) : (
                            truck.driverName || '-'
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('makeModel') && (
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">
                          {truck.make} {truck.model} {truck.year}
                        </td>
                      )}
                      {visibleColumns.includes('fleet') && (
                        <td 
                          className="whitespace-nowrap px-4 py-3 text-sm text-foreground cursor-pointer hover:bg-white/5"
                          onClick={() => handleCellClick(truck.id, 'fleet', truck.fleet)}
                        >
                          {editingCell?.truckId === truck.id && editingCell?.field === 'fleet' ? (
                            <select
                              value={editValue}
                              onChange={(e) => { setEditValue(e.target.value); }}
                              onBlur={handleCellSave}
                              autoFocus
                              className="bg-gray-800 border border-primary rounded px-2 py-1 text-sm text-white focus:outline-none"
                            >
                              <option value="Alpha">Alpha</option>
                              <option value="Beta">Beta</option>
                              <option value="Gamma">Gamma</option>
                              <option value="Delta">Delta</option>
                            </select>
                          ) : (
                            truck.fleet
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('locationStatus') && (
                        <td 
                          className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:bg-white/5"
                          onClick={() => handleCellClick(truck.id, 'locationStatus', truck.locationStatus)}
                        >
                          {editingCell?.truckId === truck.id && editingCell?.field === 'locationStatus' ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleCellSave}
                              autoFocus
                              className="w-full bg-white/10 border border-primary rounded px-2 py-1 text-sm text-white focus:outline-none"
                            />
                          ) : (
                            truck.locationStatus
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('notes') && (
                        <td 
                          className="max-w-[180px] truncate px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:bg-white/5" 
                          title={truck.notes}
                          onClick={() => handleCellClick(truck.id, 'notes', truck.notes)}
                        >
                          {editingCell?.truckId === truck.id && editingCell?.field === 'notes' ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleCellSave}
                              autoFocus
                              className="w-full bg-white/10 border border-primary rounded px-2 py-1 text-sm text-white focus:outline-none"
                            />
                          ) : (
                            truck.notes || '-'
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('plate') && (
                        <td 
                          className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:bg-white/5"
                          onClick={() => handleCellClick(truck.id, 'plateNumber', truck.plateNumber)}
                        >
                          {editingCell?.truckId === truck.id && editingCell?.field === 'plateNumber' ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleCellSave}
                              autoFocus
                              className="w-full bg-white/10 border border-primary rounded px-2 py-1 text-sm text-white focus:outline-none"
                            />
                          ) : (
                            truck.plateNumber
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('inspection') && (
                        <td 
                          className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:bg-white/5"
                          onClick={() => handleCellClick(truck.id, 'inspection', truck.inspection)}
                        >
                          {editingCell?.truckId === truck.id && editingCell?.field === 'inspection' ? (
                            <input
                              type="date"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleCellSave}
                              autoFocus
                              className="bg-gray-800 border border-primary rounded px-2 py-1 text-sm text-white focus:outline-none"
                            />
                          ) : (
                            truck.inspection
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('vin') && (
                        <td 
                          className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground cursor-pointer hover:bg-white/5"
                          onClick={() => handleCellClick(truck.id, 'vin', truck.vin)}
                        >
                          {editingCell?.truckId === truck.id && editingCell?.field === 'vin' ? (
                            <input
                              type="text"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onKeyDown={handleKeyDown}
                              onBlur={handleCellSave}
                              autoFocus
                              className="w-full bg-white/10 border border-primary rounded px-2 py-1 text-sm text-white focus:outline-none"
                            />
                          ) : (
                            truck.vin
                          )}
                        </td>
                      )}
                      {visibleColumns.includes('camera') && (
                        <td 
                          className="whitespace-nowrap px-4 py-3 cursor-pointer hover:bg-white/5"
                          onClick={() => handleCellClick(truck.id, 'cameraStatus', truck.cameraStatus)}
                        >
                          {editingCell?.truckId === truck.id && editingCell?.field === 'cameraStatus' ? (
                            <select
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={handleCellSave}
                              autoFocus
                              className="bg-gray-800 border border-primary rounded px-2 py-1 text-sm text-white focus:outline-none"
                            >
                              <option value="Online">Online</option>
                              <option value="Offline">Offline</option>
                              <option value="N/A">N/A</option>
                            </select>
                          ) : truck.cameraStatus === 'Online' ? (
                            <span className="flex items-center gap-1.5 text-sm">
                              <span className="h-2 w-2 rounded-full bg-accent"></span>
                              <span className="text-accent">Online</span>
                            </span>
                          ) : truck.cameraStatus === 'Offline' ? (
                            <span className="flex items-center gap-1.5 text-sm">
                              <span className="h-2 w-2 rounded-full bg-destructive"></span>
                              <span className="text-destructive">Offline</span>
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">-</span>
                          )}
                        </td>
                      )}
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-border bg-secondary/20 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredTrucks.length)} of {filteredTrucks.length} results
              </p>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-secondary disabled:opacity-50"
                >
                  &lt;
                </button>
                {renderPagination().map((page, idx) => (
                  page === -1 ? (
                    <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">...</span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium transition-colors ${
                        currentPage === page
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      {page}
                    </button>
                  )
                ))}
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-secondary disabled:opacity-50"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </main>
      </MainContent>

      {/* Edit Truck Modal */}
      {editingTruck && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 glass-card rounded-xl border border-white/20 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Edit Truck #{editingTruck.truckNumber}</h2>
                  <p className="text-sm text-gray-400">{editingTruck.make} {editingTruck.model} {editingTruck.year}</p>
                </div>
              </div>
              <button 
                onClick={handleCloseModal}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {/* Truck Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Truck Number</label>
                  <input
                    type="text"
                    value={editForm.truckNumber || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, truckNumber: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                  <select
                    value={editForm.status || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as TruckStatus }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="ON DUTY" className="bg-gray-800">ON DUTY</option>
                    <option value="BROKEN TRUCK" className="bg-gray-800">BROKEN TRUCK</option>
                    <option value="ACCIDENT" className="bg-gray-800">ACCIDENT</option>
                    <option value="HOME TIME" className="bg-gray-800">HOME TIME</option>
                    <option value="IN SHOP" className="bg-gray-800">IN SHOP</option>
                    <option value="GETTING READY" className="bg-gray-800">GETTING READY</option>
                    <option value="TOTAL LOST" className="bg-gray-800">TOTAL LOST</option>
                  </select>
                </div>

                {/* Driver Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Driver Name</label>
                  <input
                    type="text"
                    value={editForm.driverName || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, driverName: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Fleet */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Fleet</label>
                  <select
                    value={editForm.fleet || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, fleet: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Alpha" className="bg-gray-800">Alpha</option>
                    <option value="Beta" className="bg-gray-800">Beta</option>
                    <option value="Gamma" className="bg-gray-800">Gamma</option>
                    <option value="Delta" className="bg-gray-800">Delta</option>
                  </select>
                </div>

                {/* Make */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Make</label>
                  <input
                    type="text"
                    value={editForm.make || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, make: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
                  <input
                    type="text"
                    value={editForm.model || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Year</label>
                  <input
                    type="number"
                    value={editForm.year || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Plate Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Plate Number</label>
                  <input
                    type="text"
                    value={editForm.plateNumber || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, plateNumber: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* VIN */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">VIN</label>
                  <input
                    type="text"
                    value={editForm.vin || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, vin: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Location Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location Status</label>
                  <input
                    type="text"
                    value={editForm.locationStatus || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, locationStatus: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Camera Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Camera Status</label>
                  <select
                    value={editForm.cameraStatus || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, cameraStatus: e.target.value as 'Online' | 'Offline' | 'N/A' }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Online" className="bg-gray-800">Online</option>
                    <option value="Offline" className="bg-gray-800">Offline</option>
                    <option value="N/A" className="bg-gray-800">N/A</option>
                  </select>
                </div>

                {/* Inspection Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Inspection Date</label>
                  <input
                    type="date"
                    value={editForm.inspection || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, inspection: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Notes */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Notes</label>
                  <textarea
                    value={editForm.notes || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button
                onClick={handleCloseModal}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveModal}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors"
              >
                <Check className="h-4 w-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
