'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { shops, Shop } from '@/lib/fleet-data'
import { Search, Filter, Star, Phone, Globe, MapPin, Eye, Ban, X, Check, Wrench, Edit3 } from 'lucide-react'

export default function ShopsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [stateFilter, setStateFilter] = useState<string>('All')
  const [typeFilter, setTypeFilter] = useState<string>('All')
  const [view, setView] = useState<'cards' | 'table'>('cards')
  
  // Shop data and editing state
  const [shopsData, setShopsData] = useState(shops)
  const [editingShop, setEditingShop] = useState<Shop | null>(null)
  const [editForm, setEditForm] = useState<Partial<Shop>>({})

  const states = ['All', ...new Set(shopsData.map(s => s.state))]
  const types = ['All', ...new Set(shopsData.map(s => s.type))]

  // Edit functions
  const handleOpenEdit = (shop: Shop) => {
    setEditingShop(shop)
    setEditForm({ ...shop })
  }

  const handleSaveEdit = () => {
    if (!editingShop) return
    setShopsData(prev => 
      prev.map(shop => 
        shop.id === editingShop.id 
          ? { ...shop, ...editForm } as Shop
          : shop
      )
    )
    setEditingShop(null)
    setEditForm({})
  }

  const handleCloseEdit = () => {
    setEditingShop(null)
    setEditForm({})
  }

  const filteredShops = shopsData.filter(shop => {
    const matchesSearch = shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      shop.manager.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesState = stateFilter === 'All' || shop.state === stateFilter
    const matchesType = typeFilter === 'All' || shop.type === typeFilter
    return matchesSearch && matchesState && matchesType && !shop.isBlacklisted
  })

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Shops Network" subtitle="Repair shops and service centers" />
        
        <main className="p-6">
          {/* Filters */}
          <div className="glass-card mb-6 flex flex-wrap items-center gap-4 rounded-xl p-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search shop, manager..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={stateFilter}
                onChange={(e) => setStateFilter(e.target.value)}
                className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {states.map(state => (
                  <option key={state} value={state}>{state === 'All' ? 'All States' : state}</option>
                ))}
              </select>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {types.map(type => (
                  <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>
                ))}
              </select>
            </div>
            <div className="flex rounded-lg border border-border bg-secondary">
              <button
                onClick={() => setView('cards')}
                className={`px-3 py-2 text-sm ${view === 'cards' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Cards
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-3 py-2 text-sm ${view === 'table' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}
              >
                Table
              </button>
            </div>
          </div>

          {/* Shop Cards View */}
          {view === 'cards' && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredShops.map((shop) => (
                <div key={shop.id} className="glass-card rounded-xl p-4">
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 
                        className="font-semibold text-primary cursor-pointer hover:text-primary/80 hover:underline"
                        onClick={() => handleOpenEdit(shop)}
                      >
                        {shop.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{shop.manager}</p>
                    </div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < shop.stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="mb-3 space-y-1.5">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {shop.location}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {shop.phone}
                    </p>
                    {shop.website !== 'N/A' && (
                      <p className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Globe className="h-3 w-3" /> {shop.website}
                      </p>
                    )}
                  </div>

                  <div className="mb-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">{shop.type}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{shop.paymentMethod}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Hourly Labor</p>
                      <p className="font-semibold text-foreground">${shop.hourlyLaborFee}/hr</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Call Out</p>
                      <p className="font-semibold text-foreground">${shop.callOutFee}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Steer Tire</p>
                      <p className="font-semibold text-foreground">${shop.steerTire}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Drive Tire</p>
                      <p className="font-semibold text-foreground">${shop.driveTire}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2 border-t border-border pt-3">
                    <button className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary py-2 text-xs text-primary-foreground hover:bg-primary/90">
                      <Eye className="h-3 w-3" /> View Details
                    </button>
                    <button className="flex items-center justify-center rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-secondary">
                      <Ban className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {view === 'table' && (
            <div className="glass-card overflow-hidden rounded-xl">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-secondary/50">
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Shop Name</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Manager</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Type</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Phone</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">State</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Hourly Fee</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Call Out</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Steer</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Drive</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Trailer</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Payment</th>
                      <th className="whitespace-nowrap px-4 py-3 text-left text-xs font-medium text-muted-foreground">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredShops.map((shop) => (
                      <tr key={shop.id} className="border-b border-border/50 hover:bg-secondary/30">
                        <td 
                          className="whitespace-nowrap px-4 py-3 text-sm font-medium text-primary cursor-pointer hover:text-primary/80 hover:underline"
                          onClick={() => handleOpenEdit(shop)}
                        >
                          {shop.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">{shop.manager}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">{shop.type}</span>
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">{shop.phone}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">{shop.state}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">${shop.hourlyLaborFee}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">${shop.callOutFee}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">${shop.steerTire}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">${shop.driveTire}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">${shop.trailerTire}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-muted-foreground">{shop.paymentMethod}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-3 w-3 ${i < shop.stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                              />
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </MainContent>

      {/* Edit Shop Modal */}
      {editingShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-2xl mx-4 glass-card rounded-xl border border-white/20 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Edit Shop</h2>
                  <p className="text-sm text-gray-400">{editingShop.name}</p>
                </div>
              </div>
              <button 
                onClick={handleCloseEdit}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                {/* Shop Name */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Shop Name</label>
                  <input
                    type="text"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Manager */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Manager</label>
                  <input
                    type="text"
                    value={editForm.manager || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, manager: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Type</label>
                  <select
                    value={editForm.type || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as Shop['type'] }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="Full Service" className="bg-gray-800">Full Service</option>
                    <option value="Truck Repair" className="bg-gray-800">Truck Repair</option>
                    <option value="Tire Shop" className="bg-gray-800">Tire Shop</option>
                    <option value="Mobile" className="bg-gray-800">Mobile</option>
                    <option value="Dealer" className="bg-gray-800">Dealer</option>
                  </select>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                  <input
                    type="text"
                    value={editForm.phone || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* State */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, state: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={editForm.location || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Website</label>
                  <input
                    type="text"
                    value={editForm.website || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Payment Method</label>
                  <input
                    type="text"
                    value={editForm.paymentMethod || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, paymentMethod: e.target.value }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Stars */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Rating (1-5)</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={editForm.stars || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, stars: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Pricing Section Header */}
                <div className="col-span-2 border-t border-white/10 pt-4 mt-2">
                  <h3 className="text-sm font-semibold text-white mb-3">Pricing</h3>
                </div>

                {/* Hourly Labor Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Hourly Labor Fee ($)</label>
                  <input
                    type="number"
                    value={editForm.hourlyLaborFee || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, hourlyLaborFee: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Call Out Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Call Out Fee ($)</label>
                  <input
                    type="number"
                    value={editForm.callOutFee || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, callOutFee: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Steer Tire */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Steer Tire ($)</label>
                  <input
                    type="number"
                    value={editForm.steerTire || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, steerTire: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Drive Tire */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Drive Tire ($)</label>
                  <input
                    type="number"
                    value={editForm.driveTire || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, driveTire: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Trailer Tire */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Trailer Tire ($)</label>
                  <input
                    type="number"
                    value={editForm.trailerTire || ''}
                    onChange={(e) => setEditForm(prev => ({ ...prev, trailerTire: parseInt(e.target.value) }))}
                    className="w-full rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
              <button
                onClick={handleCloseEdit}
                className="rounded-lg border border-white/20 px-4 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
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
