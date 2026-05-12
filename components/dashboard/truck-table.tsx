'use client'

import { useState } from 'react'
import { Search, ChevronDown, Eye, MoreVertical, ChevronLeft, ChevronRight, Columns3 } from 'lucide-react'
import { trucks } from '@/lib/truck-data'

const conditionColors = {
  GOOD: 'bg-green-500/20 text-green-400 border-green-500/30',
  'PM SOON': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  ISSUE: 'bg-red-500/20 text-red-400 border-red-500/30',
  'IN SHOP': 'bg-blue-500/20 text-blue-400 border-blue-500/30'
}

export function TruckTable() {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const totalPages = Math.ceil(trucks.length / itemsPerPage)

  const filteredTrucks = trucks.filter(
    (truck) =>
      truck.truckNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.currentLocation.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      truck.driver?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const paginatedTrucks = filteredTrucks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <div className="glass-card rounded-xl">
      {/* Table Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border p-4">
        <div className="flex items-center gap-4">
          <h3 className="font-semibold text-foreground">All Trucks</h3>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search truck..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-48 rounded-lg border border-border bg-input pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-sm text-muted-foreground hover:text-foreground">
            All Status
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-sm text-muted-foreground hover:text-foreground">
            All Conditions
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-sm text-muted-foreground hover:text-foreground">
            All Shops
            <ChevronDown className="h-4 w-4" />
          </button>
          <button className="flex h-9 items-center gap-2 rounded-lg border border-border bg-secondary px-3 text-sm text-muted-foreground hover:text-foreground">
            <Columns3 className="h-4 w-4" />
            Columns
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Truck #
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Condition
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Current Location
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Destination
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                LPM
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                LPTI
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                L Shop
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Last Shop Note
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                ETA
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Miles Left
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Current Trip
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Driver
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedTrucks.map((truck) => (
              <tr key={truck.id} className="hover:bg-secondary/50">
                <td className="whitespace-nowrap px-4 py-3">
                  <span className="font-medium text-primary">{truck.truckNumber}</span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <span
                    className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium ${
                      conditionColors[truck.condition]
                    }`}
                  >
                    {truck.condition}
                  </span>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div>
                    <p className="text-sm text-foreground">
                      {truck.currentLocation.city}, {truck.currentLocation.state}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {truck.currentLocation.highway}
                    </p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {truck.destination ? (
                    <div>
                      <p className="text-sm text-foreground">
                        📍 {truck.destination.city}, {truck.destination.state}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {truck.destination.highway}
                      </p>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                  {truck.lpm ?? '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                  {truck.lpti ?? '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                  {truck.lastShop ?? '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                  {truck.lastShopNote || '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  {truck.eta ? (
                    <span
                      className={`text-sm ${
                        truck.eta === 'Arrived'
                          ? 'text-green-400'
                          : truck.eta.includes('d')
                          ? 'text-orange-400'
                          : 'text-yellow-400'
                      }`}
                    >
                      {truck.eta}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">-</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                  {truck.milesLeft ? `${truck.milesLeft.toLocaleString()} mi` : '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                  {truck.currentTrip || '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-sm text-foreground">
                  {truck.driver || '-'}
                </td>
                <td className="whitespace-nowrap px-4 py-3">
                  <div className="flex items-center gap-1">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
                      <Eye className="h-4 w-4" />
                    </button>
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground">
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
      <div className="flex items-center justify-between border-t border-border px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
          {Math.min(currentPage * itemsPerPage, filteredTrucks.length)} of{' '}
          {filteredTrucks.length} results
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                currentPage === page
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:bg-secondary'
              }`}
            >
              {page}
            </button>
          ))}
          {totalPages > 4 && (
            <>
              <span className="px-1 text-muted-foreground">...</span>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm ${
                  currentPage === totalPages
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border text-muted-foreground hover:bg-secondary'
                }`}
              >
                {totalPages}
              </button>
            </>
          )}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:bg-secondary disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
