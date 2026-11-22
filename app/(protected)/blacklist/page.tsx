'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { blacklistShops } from '@/lib/fleet-data'
import { Search, AlertTriangle, Star, Phone, MapPin, Eye, Trash2 } from 'lucide-react'

export default function BlacklistPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredShops = blacklistShops.filter(shop =>
    shop.shop.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.state.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Blacklist" subtitle="Chorniy list - Bad shops to avoid" />
        
        <main className="p-6">
          {/* Warning Banner */}
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
            <AlertTriangle className="h-6 w-6 text-red-500" />
            <div>
              <h3 className="font-semibold text-red-400">Warning: Blacklisted Shops</h3>
              <p className="text-sm text-red-300/80">These shops have been flagged for poor service, overcharging, or other issues. Avoid using them.</p>
            </div>
          </div>

          {/* Search */}
          <div className="glass-card mb-6 flex items-center gap-4 rounded-xl p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search blacklisted shops..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Blacklist Cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => (
              <div key={shop.id} className="glass-card overflow-hidden rounded-xl border border-red-500/20">
                <div className="border-b border-red-500/20 bg-red-500/10 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      shop.priority === 'High' ? 'bg-red-500/30 text-red-400' :
                      shop.priority === 'Medium' ? 'bg-orange-500/30 text-orange-400' :
                      'bg-yellow-500/30 text-yellow-400'
                    }`}>
                      {shop.priority} Priority
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${
                      shop.status === 'Active' ? 'bg-red-900/50 text-red-300' : 'bg-yellow-900/50 text-yellow-300'
                    }`}>
                      {shop.status}
                    </span>
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="mb-1 font-semibold text-foreground">{shop.shop}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">Manager: {shop.manager}</p>
                  
                  <div className="mb-3 space-y-1.5">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {shop.location}
                    </p>
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3 w-3" /> {shop.phone}
                    </p>
                  </div>

                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">{shop.type}</span>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < shop.stars ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3">
                    <p className="text-xs font-medium text-red-400">Reason for Blacklist:</p>
                    <p className="mt-1 text-sm text-red-300/80">{shop.reason}</p>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">
                    <span>Owner: {shop.owner}</span>
                  </div>

                  <div className="mt-3 flex gap-2 border-t border-border pt-3">
                    <button className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-secondary py-2 text-xs text-foreground hover:bg-secondary/80">
                      <Eye className="h-3 w-3" /> View Details
                    </button>
                    <button className="flex items-center justify-center rounded-lg border border-red-500/30 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10">
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredShops.length === 0 && (
            <div className="glass-card rounded-xl p-12 text-center">
              <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-medium text-foreground">No blacklisted shops found</h3>
              <p className="text-sm text-muted-foreground">Try adjusting your search terms</p>
            </div>
          )}
        </main>
      </MainContent>
    </div>
  )
}
