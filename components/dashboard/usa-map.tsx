'use client'

import { useState, useRef, useCallback } from 'react'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'
import { trucks } from '@/lib/truck-data'

const geoUrl = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json'

const statusColors = {
  moving: '#22c55e',
  stopped: '#eab308',
  in_shop: '#3b82f6',
  issue: '#ef4444'
}

interface USAMapProps {
  fullHeight?: boolean
}

export function USAMap({ fullHeight = false }: USAMapProps) {
  const [mapView, setMapView] = useState<'Map' | 'Satellite'>('Map')
  const [zoom, setZoom] = useState(1)
  const [center, setCenter] = useState<[number, number]>([-96, 38])
  const mapRef = useRef<HTMLDivElement>(null)

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev * 1.5, 8))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev / 1.5, 0.5))
  }, [])

  const handleWheel = useCallback((event: React.WheelEvent) => {
    event.preventDefault()
    if (event.deltaY < 0) {
      setZoom((prev) => Math.min(prev * 1.15, 8))
    } else {
      setZoom((prev) => Math.max(prev / 1.15, 0.5))
    }
  }, [])

  const handleMoveEnd = useCallback((position: { coordinates: [number, number]; zoom: number }) => {
    setCenter(position.coordinates)
    setZoom(position.zoom)
  }, [])

  return (
    <div className={`glass-card relative overflow-hidden rounded-xl ${fullHeight ? 'h-full' : ''}`}>
      {/* Map Toggle */}
      <div className="absolute left-4 top-4 z-10 flex overflow-hidden rounded-lg border border-border bg-secondary">
        <button
          onClick={() => setMapView('Map')}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            mapView === 'Map'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Map
        </button>
        <button
          onClick={() => setMapView('Satellite')}
          className={`px-4 py-1.5 text-sm font-medium transition-colors ${
            mapView === 'Satellite'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Zoom Controls */}
      <div className="absolute left-4 top-16 z-10 flex flex-col gap-1">
        <button 
          onClick={handleZoomIn}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-foreground hover:bg-muted transition-colors"
        >
          +
        </button>
        <button 
          onClick={handleZoomOut}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-secondary text-foreground hover:bg-muted transition-colors"
        >
          −
        </button>
      </div>

      {/* Map */}
      <div 
        ref={mapRef}
        className={`${fullHeight ? 'h-full' : 'h-[320px]'} w-full cursor-grab active:cursor-grabbing`}
        onWheel={handleWheel}
      >
        <ComposableMap
          projection="geoAlbersUsa"
          projectionConfig={{
            scale: 1000
          }}
          style={{
            width: '100%',
            height: '100%'
          }}
        >
          <ZoomableGroup
            zoom={zoom}
            center={center}
            onMoveEnd={handleMoveEnd}
            minZoom={0.5}
            maxZoom={8}
          >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#1e293b"
                  stroke="#334155"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: 'none' },
                    hover: { outline: 'none', fill: '#334155' },
                    pressed: { outline: 'none' }
                  }}
                />
              ))
            }
          </Geographies>

          {/* Truck Markers */}
          {trucks.map((truck) => (
            <Marker
              key={truck.id}
              coordinates={[truck.coordinates.lng, truck.coordinates.lat]}
            >
              <g transform="translate(-12, -24)">
                {/* Marker background */}
                <ellipse
                  cx="12"
                  cy="24"
                  rx="6"
                  ry="3"
                  fill="rgba(0,0,0,0.3)"
                />
                {/* Marker pin */}
                <path
                  d="M12 0C7.58 0 4 3.58 4 8c0 5.25 8 16 8 16s8-10.75 8-16c0-4.42-3.58-8-8-8z"
                  fill={statusColors[truck.status]}
                  stroke="#fff"
                  strokeWidth="1"
                />
                {/* Truck icon inside */}
                <g transform="translate(6, 4)">
                  <rect x="1" y="3" width="10" height="5" rx="1" fill="#fff" opacity="0.9" />
                  <rect x="8" y="1" width="3" height="4" rx="0.5" fill="#fff" opacity="0.9" />
                </g>
              </g>
            </Marker>
          ))}
          </ZoomableGroup>
        </ComposableMap>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500"></span>
          <span className="text-xs text-muted-foreground">Moving</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-yellow-500"></span>
          <span className="text-xs text-muted-foreground">Stopped</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-blue-500"></span>
          <span className="text-xs text-muted-foreground">In Shop</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500"></span>
          <span className="text-xs text-muted-foreground">Issue</span>
        </div>
      </div>
    </div>
  )
}
