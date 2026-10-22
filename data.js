/**
 * NADITOWN - Township Emergency Operating System
 * Sample Dataset: Bandar Elmina (City of Elmina), Shah Alam
 * Developer: Sime Darby Property
 * Supports: Ahli 1 (Map & UI), Ahli 2 (Dashboard), 
 * Ahli 3 (Simulation), Ahli 4 (Routing), and Ahli 5 (Data & Verification).
 */

export const TOWNSHIP_META = {
  name: "Bandar Elmina (City of Elmina)",
  developer: "Sime Darby Property",
  district: "Shah Alam, Selangor, Malaysia",
  coordinates: [3.1835, 101.5080],
  zoom: 14,
  bounds: [
    [3.1600, 101.4850],
    [3.2100, 101.5350]
  ]
};

// 1. HEALTHCARE, PPS EVACUATION SHELTERS, LOGISTICS & COMMAND CENTERS
export const FACILITIES = [
  {
    id: "pps-01",
    name: "Elmina West Community Hall",
    type: "pps",
    category: "Temporary Evacuation Center (PPS)",
    coordinates: [3.1855, 101.5042],
    capacity: 450,
    currentOccupants: 168,
    status: "active", // active | full | standby | closed
    amenities: ["Food Rations", "First Aid Clinic", "Power Generator", "Satellite WiFi"],
    contact: "+60 19-321 4589 (Mr. Rashid - Welfare Dept)",
    lastUpdated: "10 mins ago"
  },
  {
    id: "pps-02",
    name: "SK Subang Bestari (Main Hall)",
    type: "pps",
    category: "Temporary Evacuation Center (PPS)",
    coordinates: [3.1780, 101.5280],
    capacity: 600,
    currentOccupants: 480,
    status: "warning", // Near capacity
    amenities: ["Community Kitchen", "Emergency Maternity Care", "PA Broadcast System"],
    contact: "+60 12-987 6543 (Mrs. Salmah - Principal)",
    lastUpdated: "5 mins ago"
  },
  {
    id: "pps-03",
    name: "Denai Alam Sports Complex",
    type: "pps",
    category: "Temporary Evacuation Center (PPS)",
    coordinates: [3.1620, 101.5150],
    capacity: 350,
    currentOccupants: 0,
    status: "standby",
    amenities: ["Emergency Helipad Field", "50,000L Potable Water Tank"],
    contact: "+60 13-445 5667 (Capt. Faris - Civil Defense)",
    lastUpdated: "15 mins ago"
  },
  {
    id: "med-01",
    name: "Denai Alam Health Clinic & Triage Base",
    type: "medical",
    category: "Healthcare & Triage Center",
    coordinates: [3.1660, 101.5185],
    capacity: 120,
    currentOccupants: 42,
    status: "active",
    amenities: ["4x4 Ambulance Convoy", "Antivenom & Tetanus Stocks", "Oxygen Cylinders"],
    contact: "+60 3-7845 1122 (Dr. Azlan)",
    lastUpdated: "2 mins ago"
  },
  {
    id: "med-02",
    name: "Thomson Hospital / Subang Medical Forward Base",
    type: "medical",
    category: "Referral Medical Center",
    coordinates: [3.1950, 101.5240],
    capacity: 80,
    currentOccupants: 15,
    status: "active",
    amenities: ["Mobile Intensive Care Unit", "Emergency Operating Theater"],
    contact: "+60 3-6140 9999 (Hotline)",
    lastUpdated: "8 mins ago"
  },
  {
    id: "resp-01",
    name: "Fire & Rescue Station (JBPM) Elmina Post",
    type: "responder",
    category: "Emergency First Responder Base",
    coordinates: [3.1910, 101.5110],
    capacity: 50,
    currentOccupants: 38,
    status: "active",
    amenities: ["3x Rescue Boats", "2x 5-Ton Trucks", "Swift Water Rescue Gear"],
    contact: "+60 3-7846 9994 (Officer Shahril)",
    lastUpdated: "1 min ago"
  },
  {
    id: "resp-02",
    name: "Sime Darby Disaster Operation Command Center (PKOB)",
    type: "command",
    category: "Disaster Operations Command",
    coordinates: [3.1830, 101.5030],
    capacity: 40,
    currentOccupants: 22,
    status: "active",
    amenities: ["Drone Surveillance Command", "VHF/UHF Tactical Radio", "Township AI CCTV"],
    contact: "+60 3-7849 8800 (Operations Desk)",
    lastUpdated: "Just now"
  },
  {
    id: "log-01",
    name: "Elmina East Disaster Relief & Logistics Depot",
    type: "logistics",
    category: "Disaster Relief Supply Depot",
    coordinates: [3.1795, 101.5150],
    capacity: 5000,
    currentOccupants: 3400,
    status: "active",
    amenities: ["Ready-to-Eat Food Packs (MRE)", "Blankets & Canvas Tents", "25kVA Generators"],
    contact: "+60 17-665 5443 (NADMA Logistics Officer)",
    lastUpdated: "12 mins ago"
  }
];

// 2. IOT WATER LEVEL & WEATHER TELEMETRY SENSORS
export const SENSORS = [
  {
    id: "sensor-01",
    name: "Elmina Retention Pond West Sensor",
    coordinates: [3.1838, 101.5092],
    waterLevel: 2.85, // meters
    dangerLevel: 3.20,
    warningLevel: 2.50,
    normalLevel: 1.50,
    trend: "rising", // rising | steady | falling
    status: "warning", // normal | warning | danger
    battery: "94%",
    lastReading: "2 mins ago"
  },
  {
    id: "sensor-02",
    name: "Sungai Buloh Bridge Sensor (Jalan Elmina 1)",
    coordinates: [3.1755, 101.5020],
    waterLevel: 3.42, // Breached danger level
    dangerLevel: 3.10,
    warningLevel: 2.40,
    normalLevel: 1.20,
    trend: "rising",
    status: "danger",
    battery: "88%",
    lastReading: "1 min ago"
  },
  {
    id: "sensor-03",
    name: "Elmina Rainbow Bridge Watercourse Sensor",
    coordinates: [3.1882, 101.5078],
    waterLevel: 1.95,
    dangerLevel: 2.80,
    warningLevel: 2.20,
    normalLevel: 1.10,
    trend: "steady",
    status: "normal",
    battery: "99%",
    lastReading: "Just now"
  },
  {
    id: "sensor-04",
    name: "Denai Alam Main Monsoon Drainage Sensor",
    coordinates: [3.1645, 101.5125],
    waterLevel: 2.65,
    dangerLevel: 2.70,
    warningLevel: 2.10,
    normalLevel: 1.00,
    trend: "rising",
    status: "warning",
    battery: "92%",
    lastReading: "4 mins ago"
  }
];

// 3. ROAD SEGMENTS & PASSABILITY STATUS
export const ROAD_SEGMENTS = [
  {
    id: "road-01",
    name: "Persiaran Elmina (West Sector Corridor)",
    status: "clear", // clear | closed | hazard
    riskLevel: "Low",
    coordinates: [
      [3.1810, 101.4980],
      [3.1835, 101.5030],
      [3.1855, 101.5080]
    ],
    surfaceWater: "0 cm",
    passableFor: "All Vehicles",
    floodThreshold: 35 // cm water depth trigger
  },
  {
    id: "road-02",
    name: "Sungai Buloh Bridge Crossway (Sector 2 Link)",
    status: "closed", // CLOSED DUE TO FLASH FLOOD
    riskLevel: "Danger",
    coordinates: [
      [3.1730, 101.4990],
      [3.1755, 101.5020],
      [3.1775, 101.5065]
    ],
    surfaceWater: "65 cm (Rapid Flow)",
    passableFor: "Closed (Rescue Boats Only)",
    floodThreshold: 20
  },
  {
    id: "road-03",
    name: "Denai Alam East Road (SK Subang Bestari Link)",
    status: "hazard", // WATER LOGGED
    riskLevel: "Moderate",
    coordinates: [
      [3.1660, 101.5120],
      [3.1695, 101.5180],
      [3.1740, 101.5240]
    ],
    surfaceWater: "20 cm",
    passableFor: "Heavy Trucks & 4x4 Only",
    floodThreshold: 25
  },
  {
    id: "road-04",
    name: "Guthrie Corridor Interchange - Elmina East Bypass",
    status: "clear",
    riskLevel: "Low",
    coordinates: [
      [3.1900, 101.5000],
      [3.1920, 101.5120],
      [3.1890, 101.5250]
    ],
    surfaceWater: "0 cm",
    passableFor: "All Vehicles (Designated Evacuation Bypass)",
    floodThreshold: 60
  },
  {
    id: "road-05",
    name: "Elmina Central Park Lake Perimeter Ring",
    status: "hazard",
    riskLevel: "Moderate",
    coordinates: [
      [3.1840, 101.5060],
      [3.1865, 101.5090],
      [3.1880, 101.5120]
    ],
    surfaceWater: "25 cm",
    passableFor: "First Responder Vehicles Only",
    floodThreshold: 25
  },
  {
    id: "road-06",
    name: "Persiaran Mokhtar Dahari Bypass Corridor",
    status: "clear",
    riskLevel: "Low",
    coordinates: [
      [3.1700, 101.4900],
      [3.1650, 101.5050],
      [3.1620, 101.5150]
    ],
    surfaceWater: "0 cm",
    passableFor: "All Vehicles",
    floodThreshold: 50
  }
];

// 4. FLOOD HAZARD RISK POLYGONS (RED, ORANGE, YELLOW ZONES)
export const FLOOD_ZONES = [
  {
    id: "zone-red",
    name: "Sungai Buloh Lowland Flood Basin",
    severity: "danger",
    level: "Red Zone (Immediate Evacuation Required)",
    depth: "0.6m - 1.2m",
    color: "#ef4444",
    fillColor: "#dc2626",
    fillOpacity: 0.38,
    polygon: [
      [3.1720, 101.4980],
      [3.1780, 101.5000],
      [3.1790, 101.5060],
      [3.1750, 101.5070],
      [3.1710, 101.5020]
    ]
  },
  {
    id: "zone-orange",
    name: "Elmina Central Park Lake Overflow Buffer",
    severity: "warning",
    level: "Orange Zone (Standby for Evacuation)",
    depth: "0.2m - 0.5m",
    color: "#b45309",
    fillColor: "#d97706",
    fillOpacity: 0.28,
    polygon: [
      [3.1820, 101.5070],
      [3.1870, 101.5080],
      [3.1880, 101.5130],
      [3.1830, 101.5120]
    ]
  },
  {
    id: "zone-yellow",
    name: "Denai Alam Monsoon Drain Corridor",
    severity: "advisory",
    level: "Yellow Zone (Continuous Advisory & Monitoring)",
    depth: "0.1m - 0.3m",
    color: "#a16207",
    fillColor: "#ca8a04",
    fillOpacity: 0.22,
    polygon: [
      [3.1620, 101.5100],
      [3.1670, 101.5140],
      [3.1650, 101.5180],
      [3.1600, 101.5140]
    ]
  }
];

// 5. TOWNSHIP RESOURCE & LOGISTICS INVENTORY
export const RESOURCES_SUMMARY = {
  totalPPSCapacity: 1400,
  currentPPSOccupancy: 648,
  availableBeds: 752,
  rescueBoats: { total: 8, deployed: 5, standby: 3 },
  fourByFourVehicles: { total: 14, deployed: 9, standby: 5 },
  foodPacks: { total: 4200, distributed: 1850, stockRemaining: 2350 },
  medicalTeams: { total: 6, deployed: 4, standby: 2 },
  emergencyGenerators: { total: 10, operational: 9, underMaintenance: 1 }
};

// 6. STANDBY ASSETS FOR INCIDENT MATCHING
export const AVAILABLE_RESOURCES = [
  { id: "res-amb-01", name: "4x4 Emergency Ambulance Alpha", base: "Denai Alam Health Clinic", type: "medical", status: "ready" },
  { id: "res-amb-02", name: "Thomson Hospital Mobile Medic", base: "Thomson Hospital", type: "medical", status: "ready" },
  { id: "res-boat-01", name: "JBPM Rapid Rescue Boat #1", base: "Fire & Rescue Station Elmina", type: "boat", status: "deployed" },
  { id: "res-boat-02", name: "JBPM Rapid Rescue Boat #2", base: "Fire & Rescue Station Elmina", type: "boat", status: "ready" },
  { id: "res-boat-03", name: "Civil Defense Boat Delta", base: "Denai Alam Sports Complex", type: "boat", status: "ready" },
  { id: "res-truck-01", name: "JBPM 5-Ton High-Water Transporter", base: "Fire & Rescue Station Elmina", type: "truck", status: "deployed" },
  { id: "res-truck-02", name: "NADMA 5-Ton Relief Supply Truck", base: "Elmina East Logistics Depot", type: "truck", status: "ready" },
  { id: "res-4x4-01", name: "PKOB Recon 4x4 Vehicle", base: "PKOB Command Center", type: "4x4", status: "ready" },
  { id: "res-4x4-02", name: "NADMA Volunteer 4x4 Truck", base: "Elmina East Logistics Depot", type: "4x4", status: "ready" },
  { id: "res-gen-01", name: "Mobile 25kVA Power Generator", base: "PKOB Command Center", type: "generator", status: "ready" }
];

// 7. CITIZEN ASSISTANCE & EMERGENCY REQUESTS
export const INITIAL_REQUESTS = [
  {
    id: "REQ-401",
    requester: "Mdm. Zaleha & Husband (Senior Citizens)",
    location: "No. 42, Jalan Elmina Barat 4 (Sector 4)",
    coordinates: [3.1812, 101.4995],
    need: "Wheelchair Evacuation & Asthma Oxygen Support",
    urgency: "critical", // critical | high | medium
    requiredResource: "4x4 Ambulance / Medic",
    matchedResource: null,
    status: "pending", // pending | matched | dispatched | resolved
    timestamp: "10:02:14",
    eta: "--"
  },
  {
    id: "REQ-402",
    requester: "Block B Residents Committee (15 Families)",
    location: "Elmina Green 2 Apartments",
    coordinates: [3.1870, 101.5030],
    need: "150 MRE Food Packs & Clean Potable Water",
    urgency: "high",
    requiredResource: "5-Ton Logistics Truck",
    matchedResource: "Elmina East Logistics Depot (Truck L-02)",
    status: "matched",
    timestamp: "09:55:30",
    eta: "18 mins"
  },
  {
    id: "REQ-403",
    requester: "Khairul Family (4 Trapped Residents on Balcony)",
    location: "Lowland Terrace House (Near Sungai Buloh Riverbank)",
    coordinates: [3.1740, 101.5015],
    need: "Rapid Water Rescue Boat (0.8m Depth Currents)",
    urgency: "critical",
    requiredResource: "Fire & Rescue Boat (JBPM)",
    matchedResource: "Fire & Rescue Station Elmina (Boat B-01)",
    status: "dispatched",
    timestamp: "09:48:12",
    eta: "6 mins"
  },
  {
    id: "REQ-404",
    requester: "Denai Alam Health Clinic (Triage Center)",
    location: "Denai Alam Health Clinic",
    coordinates: [3.1660, 101.5185],
    need: "25kVA Backup Power Generator & Medical Oxygen Tank",
    urgency: "high",
    requiredResource: "25kVA Generator & Gas Supply",
    matchedResource: "PKOB Command Center (Mobile Genset #1)",
    status: "matched",
    timestamp: "09:40:05",
    eta: "12 mins"
  },
  {
    id: "REQ-405",
    requester: "Permata Elmina Daycare (8 Children & 2 Teachers)",
    location: "Jalan Denai Alam Timur 3",
    coordinates: [3.1685, 101.5155],
    need: "High-Clearance Evacuation Truck to SK Subang PPS",
    urgency: "critical",
    requiredResource: "4x4 Evacuation Truck",
    matchedResource: null,
    status: "pending",
    timestamp: "10:08:40",
    eta: "--"
  },
  {
    id: "REQ-406",
    requester: "Elmina West Community Center (PPS-01)",
    location: "Elmina West Community Hall",
    coordinates: [3.1855, 101.5042],
    need: "60 Foldable Mattresses & Welfare Hygiene Kits",
    urgency: "medium",
    requiredResource: "Shelter Mattresses & Hygiene Kits",
    matchedResource: "Elmina East Logistics Depot",
    status: "dispatched",
    timestamp: "09:35:18",
    eta: "8 mins"
  }
];

// 8. TACTICAL DECISION SUPPORT RECOMMENDATIONS
export const INITIAL_DECISIONS = [
  {
    id: "REC-101",
    title: "Relief Convoy Reroute: Sector 2 Bridge Blocked",
    severity: "critical",
    category: "Traffic & Routing",
    trigger: "Sensor 02 Breached Danger Level (3.42m)",
    description: "Sungai Buloh bridge crossway submerged under rapid currents (+65cm). Divert all inbound medical ambulances and relief supply trucks via Guthrie Corridor Interchange Bypass (+1.4 km, estimated +4 mins).",
    suggestedAction: "Authorize Reroute & Deploy Digital VMS Signboards",
    status: "pending", // pending | approved | dismissed
    actionType: "reroute_guthrie",
    impact: "+4 mins travel time | 100% safe from flood inundation",
    timestamp: "09:32:00"
  },
  {
    id: "REC-102",
    title: "Shelter Overflow Prevention: SK Subang Bestari",
    severity: "high",
    category: "Shelter Operations",
    trigger: "SK Subang Bestari PPS Occupancy reached 80% (480/600 pax)",
    description: "SK Subang Bestari PPS is nearing critical capacity. Activate Denai Alam Sports Complex (350 standby beds) as primary intake for upcoming Denai Alam flood evacuees.",
    suggestedAction: "Activate Denai Alam Sports Complex as Active PPS",
    status: "pending",
    actionType: "activate_pps_denai",
    impact: "Adds 350 available beds | Prevents shelter overcrowding",
    timestamp: "09:41:15"
  },
  {
    id: "REC-103",
    title: "Deploy Additional Water Rescue Boats to Red Zone",
    severity: "critical",
    category: "Search & Rescue",
    trigger: "2 Pending Critical Evacuation Calls in Lowland Basin",
    description: "Mobilize 2x standby inflatable rescue boats from JBPM Fire Post to Jalan Elmina 1 intersection for priority citizen evacuation.",
    suggestedAction: "Authorize JBPM Water Rescue Asset Deployment",
    status: "pending",
    actionType: "dispatch_boats",
    impact: "Reduces Search & Rescue response time to < 8 mins",
    timestamp: "09:50:20"
  },
  {
    id: "REC-104",
    title: "Activate Elmina Retention Pond Gravity Spillway",
    severity: "medium",
    category: "Hydrology Control",
    trigger: "Retention Pond West Water Level reached 2.85m",
    description: "Open gravity controlled sluice gate at Retention Pond West to avert uncontrolled road overflow along Persiaran Elmina over the next 45 minutes.",
    suggestedAction: "Authorize Phased Spillway Water Discharge",
    status: "approved",
    actionType: "open_spillway",
    impact: "Relieves hydraulic head pressure along Persiaran Elmina by 30%",
    timestamp: "09:20:00"
  }
];

// 9. VERIFIED EVENT & TELEMETRY AUDIT TRAIL
export const INITIAL_EVENT_LOG = [
  {
    id: "evt-001",
    timestamp: "09:15:20",
    type: "warning",
    category: "TELEMETRY",
    message: "Sensor 02 (Sungai Buloh Bridge) breached warning threshold at 3.10m.",
    author: "IoT Telemetry System",
    auditHash: "VRF-9821A"
  },
  {
    id: "evt-002",
    timestamp: "09:22:45",
    type: "danger",
    category: "ROAD_BLOCK",
    message: "Precautionary road closure activated on Sungai Buloh Bridge Crossway.",
    author: "PKOB Command Desk",
    auditHash: "VRF-4412B"
  },
  {
    id: "evt-003",
    timestamp: "09:28:10",
    type: "info",
    category: "PPS_UPDATE",
    message: "Elmina West Community Hall PPS activated. 168 Red Zone residents sheltered.",
    author: "District Welfare Officer",
    auditHash: "VRF-7731C"
  },
  {
    id: "evt-004",
    timestamp: "09:31:00",
    type: "success",
    category: "REROUTE",
    message: "Dijkstra/A* algorithm computed safe alternate route via Guthrie Bypass in 8.4 ms.",
    author: "NADITOWN Routing Engine",
    auditHash: "VRF-1109D"
  }
];
