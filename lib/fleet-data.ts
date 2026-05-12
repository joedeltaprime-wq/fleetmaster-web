// Fleet Operations Data

export type TruckStatus = 'ON DUTY' | 'BROKEN TRUCK' | 'ACCIDENT' | 'TOTAL LOST' | 'HOME TIME' | 'GETTING READY' | 'IN SHOP'

export const statusColors: Record<TruckStatus, string> = {
  'ON DUTY': '#22c55e',
  'BROKEN TRUCK': '#ef4444',
  'ACCIDENT': '#f97316',
  'TOTAL LOST': '#7f1d1d',
  'HOME TIME': '#3b82f6',
  'GETTING READY': '#06b6d4',
  'IN SHOP': '#a855f7'
}

export interface FleetTruck {
  id: string
  truckNumber: string
  status: TruckStatus
  driverName: string | null
  make: string
  model: string
  year: number
  fleet: string
  locationStatus: string
  notes: string
  plateNumber: string
  inspection: string
  vin: string
  cameraStatus: 'Online' | 'Offline' | 'N/A'
  coordinates: { lat: number; lng: number }
}

export interface Shop {
  id: string
  name: string
  manager: string
  type: 'Truck Repair' | 'Tire Shop' | 'Full Service' | 'Mobile' | 'Dealer'
  phone: string
  state: string
  hourlyLaborFee: number
  callOutFee: number
  steerTire: number
  driveTire: number
  trailerTire: number
  location: string
  website: string
  paymentMethod: 'Cash' | 'Credit' | 'Check' | 'Net 30' | 'Comcheck'
  stars: number
  isBlacklisted: boolean
  coordinates: { lat: number; lng: number }
}

export interface BlacklistShop {
  id: string
  shop: string
  manager: string
  state: string
  location: string
  phone: string
  type: string
  stars: number
  priority: 'High' | 'Medium' | 'Low'
  status: 'Active' | 'Under Review'
  owner: string
  reason: string
}

export interface WeakTruck {
  id: string
  truckNumber: string
  make: string
  model: string
  year: number
  jigariPresent: boolean
  riskLevel: 'High' | 'Medium' | 'Low'
  notes: string
}

export interface TrailerCost {
  id: string
  trailerNumber: string
  yearlyCost: number
  monthlyAvg: number
  lastExpenseDate: string
  comment: string
}

export interface TruckCost {
  id: string
  truckNumber: string
  monthlyCost: number
  yearlyCost: number
  monthlyAvg: number
  lastExpenseDate: string
}

// Demo Data
export const fleetTrucks: FleetTruck[] = [
  {
    id: '1',
    truckNumber: '1032',
    status: 'ON DUTY',
    driverName: 'John Smith',
    make: 'Freightliner',
    model: 'Cascadia',
    year: 2022,
    fleet: 'Alpha',
    locationStatus: 'Moving - I-40 East',
    notes: 'Regular route to TX',
    plateNumber: 'ABC-1234',
    inspection: '2024-03-15',
    vin: '1FUJGLDR5CLBP1234',
    cameraStatus: 'Online',
    coordinates: { lat: 35.2, lng: -101.83 }
  },
  {
    id: '2',
    truckNumber: '2000',
    status: 'ON DUTY',
    driverName: 'Mike Johnson',
    make: 'Peterbilt',
    model: '579',
    year: 2021,
    fleet: 'Beta',
    locationStatus: 'Stopped - Rest Area',
    notes: 'Delivering to Phoenix',
    plateNumber: 'DEF-5678',
    inspection: '2024-02-20',
    vin: '1XPWD49X1ED123456',
    cameraStatus: 'Online',
    coordinates: { lat: 37.08, lng: -88.6 }
  },
  {
    id: '3',
    truckNumber: '2040',
    status: 'BROKEN TRUCK',
    driverName: 'Tom Williams',
    make: 'Kenworth',
    model: 'T680',
    year: 2020,
    fleet: 'Alpha',
    locationStatus: 'Stopped - Shop',
    notes: 'Engine issue - waiting for parts',
    plateNumber: 'GHI-9012',
    inspection: '2024-01-10',
    vin: '1NKDL40X6GJ789012',
    cameraStatus: 'Offline',
    coordinates: { lat: 39.73, lng: -84.06 }
  },
  {
    id: '4',
    truckNumber: '3001',
    status: 'HOME TIME',
    driverName: 'David Brown',
    make: 'Volvo',
    model: 'VNL 760',
    year: 2023,
    fleet: 'Gamma',
    locationStatus: 'At Terminal',
    notes: 'Driver on vacation until 03/20',
    plateNumber: 'JKL-3456',
    inspection: '2024-04-01',
    vin: '4V4NC9EH5EN345678',
    cameraStatus: 'N/A',
    coordinates: { lat: 41.88, lng: -87.63 }
  },
  {
    id: '5',
    truckNumber: '3015',
    status: 'ON DUTY',
    driverName: 'Chris Davis',
    make: 'Mack',
    model: 'Anthem',
    year: 2022,
    fleet: 'Beta',
    locationStatus: 'Moving - I-5 North',
    notes: '',
    plateNumber: 'MNO-7890',
    inspection: '2024-03-25',
    vin: '1M1AN07Y5EM901234',
    cameraStatus: 'Online',
    coordinates: { lat: 47.61, lng: -122.33 }
  },
  {
    id: '6',
    truckNumber: '3022',
    status: 'ACCIDENT',
    driverName: 'James Wilson',
    make: 'Freightliner',
    model: 'Cascadia',
    year: 2021,
    fleet: 'Alpha',
    locationStatus: 'Stopped - Accident Scene',
    notes: 'Minor fender bender - no injuries',
    plateNumber: 'PQR-1234',
    inspection: '2024-02-15',
    vin: '1FUJGLDR7CLBP5678',
    cameraStatus: 'Online',
    coordinates: { lat: 44.98, lng: -93.27 }
  },
  {
    id: '7',
    truckNumber: '3028',
    status: 'IN SHOP',
    driverName: null,
    make: 'Peterbilt',
    model: '389',
    year: 2019,
    fleet: 'Gamma',
    locationStatus: 'Denver Shop',
    notes: 'Transmission rebuild',
    plateNumber: 'STU-5678',
    inspection: '2024-01-20',
    vin: '1XPWD49X3ED567890',
    cameraStatus: 'Offline',
    coordinates: { lat: 39.74, lng: -104.99 }
  },
  {
    id: '8',
    truckNumber: '4001',
    status: 'ON DUTY',
    driverName: 'Robert Garcia',
    make: 'Kenworth',
    model: 'W990',
    year: 2023,
    fleet: 'Delta',
    locationStatus: 'Moving - I-15 North',
    notes: 'New driver training',
    plateNumber: 'VWX-9012',
    inspection: '2024-04-10',
    vin: '1NKDL40X8GJ123456',
    cameraStatus: 'Online',
    coordinates: { lat: 36.17, lng: -115.14 }
  },
  {
    id: '9',
    truckNumber: '4012',
    status: 'GETTING READY',
    driverName: 'Kevin Martinez',
    make: 'Volvo',
    model: 'VNL 860',
    year: 2024,
    fleet: 'Alpha',
    locationStatus: 'At Terminal - Loading',
    notes: 'Picking up load #78566',
    plateNumber: 'YZA-3456',
    inspection: '2024-05-01',
    vin: '4V4NC9EH7EN789012',
    cameraStatus: 'Online',
    coordinates: { lat: 37.77, lng: -122.42 }
  },
  {
    id: '10',
    truckNumber: '4025',
    status: 'ON DUTY',
    driverName: 'Jose Rodriguez',
    make: 'International',
    model: 'LT',
    year: 2022,
    fleet: 'Beta',
    locationStatus: 'Moving - I-95 North',
    notes: '',
    plateNumber: 'BCD-7890',
    inspection: '2024-03-01',
    vin: '3HSDJSJR4EN345678',
    cameraStatus: 'Online',
    coordinates: { lat: 25.76, lng: -80.19 }
  },
  {
    id: '11',
    truckNumber: '4033',
    status: 'TOTAL LOST',
    driverName: null,
    make: 'Freightliner',
    model: 'Cascadia',
    year: 2020,
    fleet: 'Gamma',
    locationStatus: 'Salvage Yard',
    notes: 'Total loss from accident 02/15',
    plateNumber: 'EFG-1234',
    inspection: 'N/A',
    vin: '1FUJGLDR9CLBP9012',
    cameraStatus: 'N/A',
    coordinates: { lat: 40.71, lng: -74.01 }
  },
  {
    id: '12',
    truckNumber: '4041',
    status: 'ON DUTY',
    driverName: 'Marcus Thompson',
    make: 'Peterbilt',
    model: '579',
    year: 2023,
    fleet: 'Delta',
    locationStatus: 'Moving - I-85 West',
    notes: '',
    plateNumber: 'HIJ-5678',
    inspection: '2024-04-15',
    vin: '1XPWD49X5ED901234',
    cameraStatus: 'Online',
    coordinates: { lat: 33.75, lng: -84.39 }
  },
  {
    id: '13',
    truckNumber: '5001',
    status: 'ON DUTY',
    driverName: 'William Lee',
    make: 'Kenworth',
    model: 'T880',
    year: 2021,
    fleet: 'Alpha',
    locationStatus: 'Moving - US-287',
    notes: 'Heavy haul permit',
    plateNumber: 'KLM-9012',
    inspection: '2024-02-28',
    vin: '1NKDL40X0GJ567890',
    cameraStatus: 'Online',
    coordinates: { lat: 34.25, lng: -99.52 }
  },
  {
    id: '14',
    truckNumber: '5030',
    status: 'GETTING READY',
    driverName: 'Alex Rivera',
    make: 'Volvo',
    model: 'VNL 740',
    year: 2022,
    fleet: 'Beta',
    locationStatus: 'At Terminal - Pre-trip',
    notes: '',
    plateNumber: 'NOP-3456',
    inspection: '2024-03-20',
    vin: '4V4NC9EH9EN123456',
    cameraStatus: 'Online',
    coordinates: { lat: 35.2, lng: -111.65 }
  },
  {
    id: '15',
    truckNumber: '5040',
    status: 'BROKEN TRUCK',
    driverName: 'Daniel Kim',
    make: 'Mack',
    model: 'Pinnacle',
    year: 2019,
    fleet: 'Gamma',
    locationStatus: 'Stopped - Roadside',
    notes: 'Waiting for tow',
    plateNumber: 'QRS-7890',
    inspection: '2024-01-05',
    vin: '1M1AN07Y7EM567890',
    cameraStatus: 'Online',
    coordinates: { lat: 37.41, lng: -94.7 }
  }
]

export const shops: Shop[] = [
  {
    id: '1',
    name: 'Big Rig Repair Center',
    manager: 'Mike Thompson',
    type: 'Full Service',
    phone: '(214) 555-1234',
    state: 'TX',
    hourlyLaborFee: 125,
    callOutFee: 350,
    steerTire: 450,
    driveTire: 380,
    trailerTire: 280,
    location: 'Dallas, TX',
    website: 'bigrigrepair.com',
    paymentMethod: 'Net 30',
    stars: 5,
    isBlacklisted: false,
    coordinates: { lat: 32.78, lng: -96.8 }
  },
  {
    id: '2',
    name: 'Highway Truck Service',
    manager: 'Sarah Johnson',
    type: 'Truck Repair',
    phone: '(404) 555-5678',
    state: 'GA',
    hourlyLaborFee: 110,
    callOutFee: 400,
    steerTire: 420,
    driveTire: 360,
    trailerTire: 260,
    location: 'Atlanta, GA',
    website: 'highwaytruckservice.com',
    paymentMethod: 'Credit',
    stars: 4,
    isBlacklisted: false,
    coordinates: { lat: 33.75, lng: -84.39 }
  },
  {
    id: '3',
    name: 'Midwest Tire & Repair',
    manager: 'Bob Williams',
    type: 'Tire Shop',
    phone: '(312) 555-9012',
    state: 'IL',
    hourlyLaborFee: 95,
    callOutFee: 275,
    steerTire: 400,
    driveTire: 340,
    trailerTire: 240,
    location: 'Chicago, IL',
    website: 'midwesttire.com',
    paymentMethod: 'Comcheck',
    stars: 4,
    isBlacklisted: false,
    coordinates: { lat: 41.88, lng: -87.63 }
  },
  {
    id: '4',
    name: 'Desert Fleet Services',
    manager: 'Carlos Martinez',
    type: 'Full Service',
    phone: '(602) 555-3456',
    state: 'AZ',
    hourlyLaborFee: 115,
    callOutFee: 325,
    steerTire: 430,
    driveTire: 370,
    trailerTire: 270,
    location: 'Phoenix, AZ',
    website: 'desertfleet.com',
    paymentMethod: 'Net 30',
    stars: 5,
    isBlacklisted: false,
    coordinates: { lat: 33.45, lng: -112.07 }
  },
  {
    id: '5',
    name: 'Rocky Mountain Diesel',
    manager: 'John Anderson',
    type: 'Dealer',
    phone: '(303) 555-7890',
    state: 'CO',
    hourlyLaborFee: 145,
    callOutFee: 450,
    steerTire: 480,
    driveTire: 420,
    trailerTire: 320,
    location: 'Denver, CO',
    website: 'rockymtndiesel.com',
    paymentMethod: 'Credit',
    stars: 5,
    isBlacklisted: false,
    coordinates: { lat: 39.74, lng: -104.99 }
  },
  {
    id: '6',
    name: 'Mobile Truck Medics',
    manager: 'Dave Wilson',
    type: 'Mobile',
    phone: '(615) 555-2345',
    state: 'TN',
    hourlyLaborFee: 135,
    callOutFee: 200,
    steerTire: 440,
    driveTire: 375,
    trailerTire: 275,
    location: 'Nashville, TN',
    website: 'mobiletruckmedics.com',
    paymentMethod: 'Cash',
    stars: 4,
    isBlacklisted: false,
    coordinates: { lat: 36.16, lng: -86.78 }
  },
  {
    id: '7',
    name: 'Pacific Coast Truck Center',
    manager: 'Lisa Chen',
    type: 'Full Service',
    phone: '(213) 555-6789',
    state: 'CA',
    hourlyLaborFee: 155,
    callOutFee: 500,
    steerTire: 500,
    driveTire: 430,
    trailerTire: 330,
    location: 'Los Angeles, CA',
    website: 'pacificcoasttruck.com',
    paymentMethod: 'Net 30',
    stars: 4,
    isBlacklisted: false,
    coordinates: { lat: 34.05, lng: -118.24 }
  },
  {
    id: '8',
    name: 'Shady Mechanics LLC',
    manager: 'Unknown',
    type: 'Truck Repair',
    phone: '(555) 555-0000',
    state: 'NM',
    hourlyLaborFee: 200,
    callOutFee: 600,
    steerTire: 600,
    driveTire: 550,
    trailerTire: 450,
    location: 'Albuquerque, NM',
    website: 'N/A',
    paymentMethod: 'Cash',
    stars: 1,
    isBlacklisted: true,
    coordinates: { lat: 35.08, lng: -106.65 }
  }
]

export const blacklistShops: BlacklistShop[] = [
  {
    id: '1',
    shop: 'Shady Mechanics LLC',
    manager: 'Unknown',
    state: 'NM',
    location: 'Albuquerque, NM',
    phone: '(555) 555-0000',
    type: 'Truck Repair',
    stars: 1,
    priority: 'High',
    status: 'Active',
    owner: 'John Doe',
    reason: 'Overcharging, poor quality work, damaged truck'
  },
  {
    id: '2',
    shop: 'Quick Fix Trucking',
    manager: 'Steve Brown',
    state: 'TX',
    location: 'Houston, TX',
    phone: '(713) 555-4321',
    type: 'Mobile',
    stars: 2,
    priority: 'Medium',
    status: 'Active',
    owner: 'Steve Brown',
    reason: 'Unreliable service, missed appointments'
  },
  {
    id: '3',
    shop: 'Budget Tire Express',
    manager: 'Tim Jones',
    state: 'OK',
    location: 'Oklahoma City, OK',
    phone: '(405) 555-8765',
    type: 'Tire Shop',
    stars: 2,
    priority: 'High',
    status: 'Under Review',
    owner: 'Tim Jones',
    reason: 'Used tires sold as new, safety concerns'
  }
]

export const weakTrucks: WeakTruck[] = [
  {
    id: '1',
    truckNumber: '2040',
    make: 'Kenworth',
    model: 'T680',
    year: 2020,
    jigariPresent: true,
    riskLevel: 'High',
    notes: 'Frequent engine issues, 4 breakdowns in 3 months'
  },
  {
    id: '2',
    truckNumber: '3028',
    make: 'Peterbilt',
    model: '389',
    year: 2019,
    jigariPresent: false,
    riskLevel: 'Medium',
    notes: 'Transmission problems, currently in shop'
  },
  {
    id: '3',
    truckNumber: '5040',
    make: 'Mack',
    model: 'Pinnacle',
    year: 2019,
    jigariPresent: true,
    riskLevel: 'High',
    notes: 'Multiple roadside breakdowns, consider replacement'
  },
  {
    id: '4',
    truckNumber: '4033',
    make: 'Freightliner',
    model: 'Cascadia',
    year: 2020,
    jigariPresent: false,
    riskLevel: 'High',
    notes: 'Total loss from accident - to be removed from fleet'
  }
]

export const trailerCosts: TrailerCost[] = [
  { id: '1', trailerNumber: 'TR-1001', yearlyCost: 8500, monthlyAvg: 708, lastExpenseDate: '2024-03-10', comment: 'New tires installed' },
  { id: '2', trailerNumber: 'TR-1002', yearlyCost: 4200, monthlyAvg: 350, lastExpenseDate: '2024-02-28', comment: 'Brake repair' },
  { id: '3', trailerNumber: 'TR-1003', yearlyCost: 12300, monthlyAvg: 1025, lastExpenseDate: '2024-03-15', comment: 'Major suspension work' },
  { id: '4', trailerNumber: 'TR-1004', yearlyCost: 3100, monthlyAvg: 258, lastExpenseDate: '2024-01-20', comment: 'Light repairs' },
  { id: '5', trailerNumber: 'TR-1005', yearlyCost: 6800, monthlyAvg: 567, lastExpenseDate: '2024-03-05', comment: 'Roof patch' },
  { id: '6', trailerNumber: 'TR-1006', yearlyCost: 2400, monthlyAvg: 200, lastExpenseDate: '2024-02-15', comment: 'Door hinges' },
  { id: '7', trailerNumber: 'TR-1007', yearlyCost: 9200, monthlyAvg: 767, lastExpenseDate: '2024-03-12', comment: 'Full service' },
  { id: '8', trailerNumber: 'TR-1008', yearlyCost: 5500, monthlyAvg: 458, lastExpenseDate: '2024-02-01', comment: 'ABS sensor' }
]

export const truckCosts: TruckCost[] = [
  { id: '1', truckNumber: '1032', monthlyCost: 2450, yearlyCost: 29400, monthlyAvg: 2450, lastExpenseDate: '2024-03-14' },
  { id: '2', truckNumber: '2000', monthlyCost: 1890, yearlyCost: 22680, monthlyAvg: 1890, lastExpenseDate: '2024-03-10' },
  { id: '3', truckNumber: '2040', monthlyCost: 4500, yearlyCost: 54000, monthlyAvg: 4500, lastExpenseDate: '2024-03-15' },
  { id: '4', truckNumber: '3001', monthlyCost: 1200, yearlyCost: 14400, monthlyAvg: 1200, lastExpenseDate: '2024-02-28' },
  { id: '5', truckNumber: '3015', monthlyCost: 1650, yearlyCost: 19800, monthlyAvg: 1650, lastExpenseDate: '2024-03-08' },
  { id: '6', truckNumber: '3022', monthlyCost: 5200, yearlyCost: 62400, monthlyAvg: 5200, lastExpenseDate: '2024-03-16' },
  { id: '7', truckNumber: '3028', monthlyCost: 3800, yearlyCost: 45600, monthlyAvg: 3800, lastExpenseDate: '2024-03-12' },
  { id: '8', truckNumber: '4001', monthlyCost: 980, yearlyCost: 11760, monthlyAvg: 980, lastExpenseDate: '2024-03-01' },
  { id: '9', truckNumber: '5040', monthlyCost: 6100, yearlyCost: 73200, monthlyAvg: 6100, lastExpenseDate: '2024-03-15' }
]

// KPI Data
export const kpiData = {
  totalTrucks: 137,
  activeTrucks: 102,
  homeTime: 12,
  brokenTrucks: 8,
  accident: 3,
  totalLost: 2,
  gettingReady: 5,
  inShop: 8,
  highRiskShops: 3,
  monthlyCost: 285400,
  trailerCost: 52000,
  pmRisk: 14
}
