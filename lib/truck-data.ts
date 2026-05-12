export interface Truck {
  id: string
  truckNumber: string
  condition: 'GOOD' | 'PM SOON' | 'ISSUE' | 'IN SHOP'
  currentLocation: {
    city: string
    state: string
    highway: string
  }
  destination: {
    city: string
    state: string
    highway: string
  } | null
  lpm: number | null
  lpti: number | null
  lastShop: number | null
  lastShopNote: string
  eta: string | null
  milesLeft: number | null
  currentTrip: string | null
  driver: string | null
  coordinates: {
    lat: number
    lng: number
  }
  status: 'moving' | 'stopped' | 'in_shop' | 'issue'
}

export interface Alert {
  id: string
  type: 'warning' | 'danger' | 'info' | 'success'
  truckNumber: string
  message: string
  location: string
  time: string
}

export const trucks: Truck[] = [
  {
    id: '1',
    truckNumber: '1032',
    condition: 'GOOD',
    currentLocation: { city: 'Ozark', state: 'AL', highway: 'US-231' },
    destination: { city: 'McCalla', state: 'AL', highway: 'US-31' },
    lpm: 40,
    lpti: 7,
    lastShop: 15,
    lastShopNote: 'inverter',
    eta: '2h 13m',
    milesLeft: 112,
    currentTrip: null,
    driver: null,
    coordinates: { lat: 31.45, lng: -85.64 },
    status: 'moving'
  },
  {
    id: '2',
    truckNumber: '2000',
    condition: 'GOOD',
    currentLocation: { city: 'Paducah', state: 'KY', highway: 'I-24' },
    destination: { city: 'Phoenix', state: 'AZ', highway: 'I-10' },
    lpm: 231,
    lpti: null,
    lastShop: 47,
    lastShopNote: 'tow bar',
    eta: '22h 45m',
    milesLeft: 1584,
    currentTrip: 'Load #78452',
    driver: 'John D.',
    coordinates: { lat: 37.08, lng: -88.6 },
    status: 'moving'
  },
  {
    id: '3',
    truckNumber: '2040',
    condition: 'GOOD',
    currentLocation: { city: 'Beavercreek', state: 'OH', highway: 'I-675' },
    destination: { city: 'Los Angeles', state: 'CA', highway: 'I-10' },
    lpm: 42,
    lpti: 8,
    lastShop: 6,
    lastShopNote: 'Drive tire x2',
    eta: '1d 6h',
    milesLeft: 2041,
    currentTrip: 'Load #78412',
    driver: 'Mike S.',
    coordinates: { lat: 39.73, lng: -84.06 },
    status: 'moving'
  },
  {
    id: '4',
    truckNumber: '5001',
    condition: 'GOOD',
    currentLocation: { city: 'Chillicothe', state: 'TX', highway: 'US-287' },
    destination: { city: 'Denver', state: 'CO', highway: 'I-70' },
    lpm: 32,
    lpti: 11,
    lastShop: 16,
    lastShopNote: '3x butt connectors',
    eta: '1d 2h',
    milesLeft: 1120,
    currentTrip: null,
    driver: null,
    coordinates: { lat: 34.25, lng: -99.52 },
    status: 'moving'
  },
  {
    id: '5',
    truckNumber: '5030',
    condition: 'PM SOON',
    currentLocation: { city: 'Flagstaff', state: 'AZ', highway: 'I-40' },
    destination: { city: 'Coppell', state: 'TX', highway: 'I-35E' },
    lpm: 36,
    lpti: 15,
    lastShop: 4,
    lastShopNote: 'Trailer tire',
    eta: '8h 30m',
    milesLeft: 642,
    currentTrip: 'Load #78490',
    driver: 'Alex R.',
    coordinates: { lat: 35.2, lng: -111.65 },
    status: 'moving'
  },
  {
    id: '6',
    truckNumber: '5040',
    condition: 'ISSUE',
    currentLocation: { city: 'Pittsburg', state: 'KS', highway: 'I-70' },
    destination: null,
    lpm: 62,
    lpti: 11,
    lastShop: 12,
    lastShopNote: 'Tire repair',
    eta: null,
    milesLeft: null,
    currentTrip: null,
    driver: null,
    coordinates: { lat: 37.41, lng: -94.7 },
    status: 'issue'
  },
  {
    id: '7',
    truckNumber: '5051',
    condition: 'GOOD',
    currentLocation: { city: 'Charlotte', state: 'NC', highway: 'I-85' },
    destination: { city: 'Houston', state: 'TX', highway: 'I-10' },
    lpm: 14,
    lpti: 5,
    lastShop: 5,
    lastShopNote: 'trailer tire',
    eta: '14h 20m',
    milesLeft: 897,
    currentTrip: 'Load #78531',
    driver: 'David K.',
    coordinates: { lat: 35.22, lng: -80.84 },
    status: 'moving'
  },
  {
    id: '8',
    truckNumber: '5060',
    condition: 'IN SHOP',
    currentLocation: { city: 'Pleasant Valley', state: 'WV', highway: '-' },
    destination: null,
    lpm: 91,
    lpti: 5,
    lastShop: 15,
    lastShopNote: 'brake adjustment',
    eta: null,
    milesLeft: null,
    currentTrip: null,
    driver: null,
    coordinates: { lat: 39.45, lng: -80.14 },
    status: 'in_shop'
  },
  {
    id: '9',
    truckNumber: '5026',
    condition: 'PM SOON',
    currentLocation: { city: 'Dallas', state: 'TX', highway: 'I-35' },
    destination: { city: 'Atlanta', state: 'GA', highway: 'I-20' },
    lpm: 45,
    lpti: 12,
    lastShop: 8,
    lastShopNote: 'oil change',
    eta: '12h 30m',
    milesLeft: 780,
    currentTrip: 'Load #78501',
    driver: 'Tom B.',
    coordinates: { lat: 32.78, lng: -96.8 },
    status: 'moving'
  },
  {
    id: '10',
    truckNumber: '5032',
    condition: 'ISSUE',
    currentLocation: { city: 'Amarillo', state: 'TX', highway: 'I-40' },
    destination: null,
    lpm: 28,
    lpti: 9,
    lastShop: 3,
    lastShopNote: 'engine check',
    eta: null,
    milesLeft: null,
    currentTrip: null,
    driver: null,
    coordinates: { lat: 35.22, lng: -101.83 },
    status: 'stopped'
  },
  {
    id: '11',
    truckNumber: '5312',
    condition: 'GOOD',
    currentLocation: { city: 'McCalla', state: 'AL', highway: 'I-20' },
    destination: { city: 'McCalla', state: 'AL', highway: 'I-20' },
    lpm: 52,
    lpti: 6,
    lastShop: 10,
    lastShopNote: 'routine check',
    eta: 'Arrived',
    milesLeft: 0,
    currentTrip: 'Load #78445',
    driver: 'Sam L.',
    coordinates: { lat: 33.29, lng: -87.03 },
    status: 'stopped'
  },
  // More trucks across the US
  {
    id: '12',
    truckNumber: '3001',
    condition: 'GOOD',
    currentLocation: { city: 'Chicago', state: 'IL', highway: 'I-90' },
    destination: { city: 'Detroit', state: 'MI', highway: 'I-94' },
    lpm: 18,
    lpti: 4,
    lastShop: 12,
    lastShopNote: 'tire rotation',
    eta: '4h 15m',
    milesLeft: 285,
    currentTrip: 'Load #78522',
    driver: 'Chris M.',
    coordinates: { lat: 41.88, lng: -87.63 },
    status: 'moving'
  },
  {
    id: '13',
    truckNumber: '3015',
    condition: 'GOOD',
    currentLocation: { city: 'Seattle', state: 'WA', highway: 'I-5' },
    destination: { city: 'Portland', state: 'OR', highway: 'I-5' },
    lpm: 22,
    lpti: 3,
    lastShop: 18,
    lastShopNote: 'brake pads',
    eta: '2h 45m',
    milesLeft: 175,
    currentTrip: 'Load #78533',
    driver: 'Paul W.',
    coordinates: { lat: 47.61, lng: -122.33 },
    status: 'moving'
  },
  {
    id: '14',
    truckNumber: '3022',
    condition: 'GOOD',
    currentLocation: { city: 'Minneapolis', state: 'MN', highway: 'I-94' },
    destination: { city: 'Fargo', state: 'ND', highway: 'I-94' },
    lpm: 35,
    lpti: 7,
    lastShop: 9,
    lastShopNote: 'fluid check',
    eta: '3h 30m',
    milesLeft: 235,
    currentTrip: 'Load #78544',
    driver: 'Dan R.',
    coordinates: { lat: 44.98, lng: -93.27 },
    status: 'moving'
  },
  {
    id: '15',
    truckNumber: '3028',
    condition: 'IN SHOP',
    currentLocation: { city: 'Denver', state: 'CO', highway: '-' },
    destination: null,
    lpm: 67,
    lpti: 14,
    lastShop: 1,
    lastShopNote: 'transmission repair',
    eta: null,
    milesLeft: null,
    currentTrip: null,
    driver: null,
    coordinates: { lat: 39.74, lng: -104.99 },
    status: 'in_shop'
  },
  {
    id: '16',
    truckNumber: '4001',
    condition: 'GOOD',
    currentLocation: { city: 'Las Vegas', state: 'NV', highway: 'I-15' },
    destination: { city: 'Salt Lake City', state: 'UT', highway: 'I-15' },
    lpm: 28,
    lpti: 5,
    lastShop: 14,
    lastShopNote: 'alignment',
    eta: '6h 20m',
    milesLeft: 420,
    currentTrip: 'Load #78555',
    driver: 'Kevin L.',
    coordinates: { lat: 36.17, lng: -115.14 },
    status: 'moving'
  },
  {
    id: '17',
    truckNumber: '4012',
    condition: 'PM SOON',
    currentLocation: { city: 'San Francisco', state: 'CA', highway: 'I-80' },
    destination: { city: 'Sacramento', state: 'CA', highway: 'I-80' },
    lpm: 48,
    lpti: 13,
    lastShop: 2,
    lastShopNote: 'filter change',
    eta: '1h 45m',
    milesLeft: 88,
    currentTrip: 'Load #78566',
    driver: 'Brian T.',
    coordinates: { lat: 37.77, lng: -122.42 },
    status: 'moving'
  },
  {
    id: '18',
    truckNumber: '4025',
    condition: 'GOOD',
    currentLocation: { city: 'Miami', state: 'FL', highway: 'I-95' },
    destination: { city: 'Orlando', state: 'FL', highway: 'I-95' },
    lpm: 19,
    lpti: 4,
    lastShop: 11,
    lastShopNote: 'ac repair',
    eta: '3h 30m',
    milesLeft: 235,
    currentTrip: 'Load #78577',
    driver: 'Jose R.',
    coordinates: { lat: 25.76, lng: -80.19 },
    status: 'moving'
  },
  {
    id: '19',
    truckNumber: '4033',
    condition: 'ISSUE',
    currentLocation: { city: 'New York', state: 'NY', highway: 'I-95' },
    destination: null,
    lpm: 55,
    lpti: 10,
    lastShop: 7,
    lastShopNote: 'electrical issue',
    eta: null,
    milesLeft: null,
    currentTrip: null,
    driver: null,
    coordinates: { lat: 40.71, lng: -74.01 },
    status: 'issue'
  },
  {
    id: '20',
    truckNumber: '4041',
    condition: 'GOOD',
    currentLocation: { city: 'Atlanta', state: 'GA', highway: 'I-85' },
    destination: { city: 'Nashville', state: 'TN', highway: 'I-24' },
    lpm: 24,
    lpti: 5,
    lastShop: 13,
    lastShopNote: 'headlight',
    eta: '3h 45m',
    milesLeft: 250,
    currentTrip: 'Load #78588',
    driver: 'Marcus J.',
    coordinates: { lat: 33.75, lng: -84.39 },
    status: 'moving'
  }
]

export const alerts: Alert[] = [
  {
    id: '1',
    type: 'danger',
    truckNumber: '5040',
    message: 'entering high-risk area',
    location: 'Weigh Station I-80, Wyoming',
    time: '2m ago'
  },
  {
    id: '2',
    type: 'warning',
    truckNumber: '5026',
    message: 'PM overdue by 1,200 miles',
    location: 'Dallas, TX',
    time: '15m ago'
  },
  {
    id: '3',
    type: 'warning',
    truckNumber: '5032',
    message: 'stopped 6h unexpectedly',
    location: 'Amarillo, TX',
    time: '32m ago'
  },
  {
    id: '4',
    type: 'success',
    truckNumber: '5312',
    message: 'arrived at destination',
    location: 'McCalla, AL',
    time: '1h ago'
  }
]

export const kpiData = {
  totalTrucks: 137,
  activeTrucks: 102,
  inShop: 8,
  pmDueSoon: 14,
  highRisk: 6,
  noDestination: 7,
  avgMpg: 6.42,
  trucksNearPm: 23
}

export const topDestinations = [
  { state: 'Texas', trucks: 28, color: '#ef4444' },
  { state: 'California', trucks: 17, color: '#f97316' },
  { state: 'Illinois', trucks: 15, color: '#64748b' },
  { state: 'Georgia', trucks: 12, color: '#ef4444' },
  { state: 'Florida', trucks: 9, color: '#3b82f6' }
]
