'use client'

import { useState } from 'react'
import { Sidebar } from '@/components/dashboard/sidebar'
import { Header } from '@/components/dashboard/header'
import { MainContent } from '@/components/dashboard/main-content'
import { shops } from '@/lib/fleet-data'
import { Search, Star, Phone, MapPin, CircleDot } from 'lucide-react'

const tireShops = shops.filter(s => s.type === 'Tire Shop' || s.type === 'Full Service')

export default function TireShopsPage() {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredShops = tireShops.filter(shop =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    shop.state.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MainContent>
        <Header title="Tire Shops" subtitle="Tire service centers and pricing" />
        
        <main className="p-6">
          {/* Summary */}
          <div className="mb-6 grid gap-4 sm:grid-cols-4">
            <div className="glass-card rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Total Tire Shops</p>
              <p className="text-3xl font-bold text-foreground">{tireShops.length}</p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Avg Steer Tire</p>
              <p className="text-3xl font-bold text-foreground">
                ${Math.round(tireShops.reduce((sum, s) => sum + s.steerTire, 0) / tireShops.length)}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Avg Drive Tire</p>
              <p className="text-3xl font-bold text-foreground">
                ${Math.round(tireShops.reduce((sum, s) => sum + s.driveTire, 0) / tireShops.length)}
              </p>
            </div>
            <div className="glass-card rounded-xl p-4">
              <p className="text-sm text-muted-foreground">Avg Trailer Tire</p>
              <p className="text-3xl font-bold text-foreground">
                ${Math.round(tireShops.reduce((sum, s) => sum + s.trailerTire, 0) / tireShops.length)}
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="glass-card mb-6 rounded-xl p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search tire shop, state..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-border bg-secondary py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Tire Shops Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredShops.map((shop) => (
              <div key={shop.id} className="glass-card rounded-xl p-4">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <CircleDot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{shop.name}</h3>
                      <p className="text-xs text-muted-foreground">{shop.manager}</p>
                    </div>
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

                <div className="mb-4 space-y-1.5">
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {shop.location}
                  </p>
                  <p className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Phone className="h-3 w-3" /> {shop.phone}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 rounded-lg bg-secondary/50 p-3">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Steer</p>
                    <p className="text-lg font-bold text-foreground">${shop.steerTire}</p>
                  </div>
                  <div className="text-center border-x border-border">
                    <p className="text-xs text-muted-foreground">Drive</p>
                    <p className="text-lg font-bold text-foreground">${shop.driveTire}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Trailer</p>
                    <p className="text-lg font-bold text-foreground">${shop.trailerTire}</p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Call Out: ${shop.callOutFee}</span>
                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-primary">{shop.paymentMethod}</span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </MainContent>
    </div>
  )
}
