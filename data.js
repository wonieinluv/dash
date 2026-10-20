/**
 * NADITOWN - Township Emergency Operating System
 * Dataset Sampel: Bandar Elmina (Sime Darby Property), Shah Alam
 * Menyokong keperluan Ahli 1 (Peta & UI), Ahli 2 (Dashboard), 
 * Ahli 3 (Simulasi), Ahli 4 (Routing), dan Ahli 5 (Data & Testing).
 */

export const TOWNSHIP_META = {
  name: "Bandar Elmina (City of Elmina)",
  developer: "Sime Darby Property",
  district: "Shah Alam, Selangor",
  coordinates: [3.1835, 101.5080],
  zoom: 14,
  bounds: [
    [3.1600, 101.4850],
    [3.2100, 101.5350]
  ]
};

// 1. FASILITI KESIHATAN, PPS, LOGISTIK, & PUSAT KAWALAN
export const FACILITIES = [
  {
    id: "pps-01",
    name: "Dewan Komuniti Elmina West",
    type: "pps",
    category: "Pusat Pemindahan Sementara (PPS)",
    coordinates: [3.1855, 101.5042],
    capacity: 450,
    currentOccupants: 168,
    status: "active", // active | full | standby | closed
    amenities: ["Bekalan Makanan", "Bilik Rawatan", "Genset Elektrik", "WiFi Satelit"],
    contact: "019-3214589 (En. Rashid - JKM)",
    lastUpdated: "10 minit lalu"
  },
  {
    id: "pps-02",
    name: "SK Subang Bestari (Dewan Utama)",
    type: "pps",
    category: "Pusat Pemindahan Sementara (PPS)",
    coordinates: [3.1780, 101.5280],
    capacity: 600,
    currentOccupants: 480,
    status: "warning", // hampir penuh
    amenities: ["Dapur Rakyat", "Ruang Bersalin Kecemasan", "Sistem PA"],
    contact: "012-9876543 (Pn. Salmah - Guru Besar)",
    lastUpdated: "5 minit lalu"
  },
  {
    id: "pps-03",
    name: "Kompleks Sukan Denai Alam",
    type: "pps",
    category: "Pusat Pemindahan Sementara (PPS)",
    coordinates: [3.1620, 101.5150],
    capacity: 350,
    currentOccupants: 0,
    status: "standby",
    amenities: ["Padang Helipad Sementara", "Tangki Air Bersih 50,000L"],
    contact: "013-4455667 (Kapten Faris - RELA)",
    lastUpdated: "15 minit lalu"
  },
  {
    id: "med-01",
    name: "Klinik Kesihatan Denai Alam & Pusat Triage",
    type: "medical",
    category: "Fasiliti Kesihatan",
    coordinates: [3.1660, 101.5185],
    capacity: 120,
    currentOccupants: 42,
    status: "active",
    amenities: ["Ambulans 4x4", "Stok Antivenom & Tetanus", "Tabung Oksigen"],
    contact: "03-78451122 (Dr. Azlan)",
    lastUpdated: "2 minit lalu"
  },
  {
    id: "med-02",
    name: "Hospital Thomson / Subang Medical Forward Base",
    type: "medical",
    category: "Fasiliti Kesihatan Rujukan",
    coordinates: [3.1950, 101.5240],
    capacity: 80,
    currentOccupants: 15,
    status: "active",
    amenities: ["Unit ICU Bergerak", "Bilik Bedah Kecemasan"],
    contact: "03-61409999",
    lastUpdated: "8 minit lalu"
  },
  {
    id: "resp-01",
    name: "Balai Bomba & Penyelamat (JBPM) Pos Elmina",
    type: "responder",
    category: "Pusat Tindak Balas Penyelamat",
    coordinates: [3.1910, 101.5110],
    capacity: 50,
    currentOccupants: 38,
    status: "active",
    amenities: ["3x Bot Penyelamat", "2x Lori 5-Tan", "Peralatan Penyelamatan Air"],
    contact: "03-78469994 (PBK II Shahril)",
    lastUpdated: "1 minit lalu"
  },
  {
    id: "resp-02",
    name: "Pusat Kawalan Operasi Bencana (PKOB) Sime Darby",
    type: "command",
    category: "Pusat Kawalan Operasi",
    coordinates: [3.1830, 101.5030],
    capacity: 40,
    currentOccupants: 22,
    status: "active",
    amenities: ["Drone Surveillance Command", "Radio Komunikasi Tetap", "CCTV Township AI"],
    contact: "03-78498800 (Bilik Gerakan)",
    lastUpdated: "Baru sahaja"
  },
  {
    id: "log-01",
    name: "Depot Logistik & Makanan Elmina East",
    type: "logistics",
    category: "Depot Bekalan Bencana",
    coordinates: [3.1795, 101.5150],
    capacity: 5000, // pek bekalan
    currentOccupants: 3400,
    status: "active",
    amenities: ["Makanan Sedia Dimakan (MRE)", "Selimut & Khemah Kanvas", "Generator 25kVA"],
    contact: "017-6655443 (Pegawai NADMA)",
    lastUpdated: "12 minit lalu"
  }
];

// 2. SENSOR IOT PARAS AIR & CUACA (TELEMETRI PINTAR)
export const SENSORS = [
  {
    id: "sensor-01",
    name: "Sensor Kolam Takungan Elmina (Retention Pond West)",
    coordinates: [3.1838, 101.5092],
    waterLevel: 2.85, // meter
    dangerLevel: 3.20,
    warningLevel: 2.50,
    normalLevel: 1.50,
    trend: "rising", // rising | steady | falling
    status: "warning", // normal | warning | danger
    battery: "94%",
    lastReading: "2 minit lalu"
  },
  {
    id: "sensor-02",
    name: "Sensor Jambatan Sungai Buloh (Jalan Elmina 1)",
    coordinates: [3.1755, 101.5020],
    waterLevel: 3.42, // Melebihi aras bahaya
    dangerLevel: 3.10,
    warningLevel: 2.40,
    normalLevel: 1.20,
    trend: "rising",
    status: "danger",
    battery: "88%",
    lastReading: "1 minit lalu"
  },
  {
    id: "sensor-03",
    name: "Sensor Alur Air Elmina Rainbow Bridge",
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
    name: "Sensor Parit Utama Denai Alam",
    coordinates: [3.1645, 101.5125],
    waterLevel: 2.65,
    dangerLevel: 2.70,
    warningLevel: 2.10,
    normalLevel: 1.00,
    trend: "rising",
    status: "warning",
    battery: "92%",
    lastReading: "4 minit lalu"
  }
];

// 3. SEGMEN JALAN RAYA & STATUS LALUAN
export const ROAD_SEGMENTS = [
  {
    id: "road-01",
    name: "Persiaran Elmina (Sektor Barat)",
    status: "clear", // clear | closed | hazard
    riskLevel: "Rendah",
    coordinates: [
      [3.1810, 101.4980],
      [3.1835, 101.5030],
      [3.1855, 101.5080]
    ],
    surfaceWater: "0 cm",
    passableFor: "Semua Kenderaan",
    floodThreshold: 35 // cm water depth trigger
  },
  {
    id: "road-02",
    name: "Laluan Jambatan Sungai Buloh (Jalan Rentas Sektor 2)",
    status: "closed", // DITUTUP KERANA BANJIR KILAT
    riskLevel: "Bahaya",
    coordinates: [
      [3.1730, 101.4990],
      [3.1755, 101.5020],
      [3.1775, 101.5065]
    ],
    surfaceWater: "65 cm (Arus Deras)",
    passableFor: "Tidak Boleh Dilalui (Kecuali Bot Penyelamat)",
    floodThreshold: 20
  },
  {
    id: "road-03",
    name: "Jalan Denai Alam Timur (Hubung ke SK Subang)",
    status: "hazard", // AMARAN: AIR BERTATANG
    riskLevel: "Sederhana",
    coordinates: [
      [3.1660, 101.5120],
      [3.1695, 101.5180],
      [3.1740, 101.5240]
    ],
    surfaceWater: "20 cm",
    passableFor: "Kenderaan Berat & Lori 4x4 Sahaja",
    floodThreshold: 25
  },
  {
    id: "road-04",
    name: "Koridor Guthrie Interchange - Elmina East Bypass",
    status: "clear",
    riskLevel: "Rendah",
    coordinates: [
      [3.1900, 101.5000],
      [3.1920, 101.5120],
      [3.1890, 101.5250]
    ],
    surfaceWater: "0 cm",
    passableFor: "Semua Kenderaan (Laluan Evakuasi Utama)",
    floodThreshold: 60
  },
  {
    id: "road-05",
    name: "Laluan Lingkaran Tasik Elmina Central Park",
    status: "hazard",
    riskLevel: "Sederhana",
    coordinates: [
      [3.1840, 101.5060],
      [3.1865, 101.5090],
      [3.1880, 101.5120]
    ],
    surfaceWater: "25 cm",
    passableFor: "Kenderaan Penyelamat Sahaja",
    floodThreshold: 25
  },
  {
    id: "road-06",
    name: "Persiaran Mokhtar Dahari Bypass Corridor",
    status: "clear",
    riskLevel: "Rendah",
    coordinates: [
      [3.1700, 101.4900],
      [3.1650, 101.5050],
      [3.1620, 101.5150]
    ],
    surfaceWater: "0 cm",
    passableFor: "Semua Kenderaan",
    floodThreshold: 50
  }
];

// 4. POLIGON ZON RISIKO BANJIR (ZON MERAH, JINGGA, KUNING)
export const FLOOD_ZONES = [
  {
    id: "zone-red",
    name: "Zon Limpahan Sungai Buloh (Sektor Bawah)",
    severity: "danger",
    level: "Zon Merah (Evakuasi Segera)",
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
    name: "Kawasan Berisiko Limpahan Tasik Elmina",
    severity: "warning",
    level: "Zon Jingga (Bersedia Berpindah)",
    depth: "0.2m - 0.5m",
    color: "#f59e0b",
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
    name: "Koridor Parit Monsun Denai Alam",
    severity: "advisory",
    level: "Zon Kuning (Pemantauan Berterusan)",
    depth: "0.1m - 0.3m",
    color: "#eab308",
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

// 5. DATA SUMBER & LOGISTIK KESELURUHAN
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

// 6. INVENTORI ASET BERSIAP-SIAGA UNTUK PADANAN PERMINTAAN (Ahli 5)
export const AVAILABLE_RESOURCES = [
  { id: "res-amb-01", name: "Ambulans 4x4 Triage Alpha", base: "Klinik Kesihatan Denai Alam", type: "medical", status: "ready" },
  { id: "res-amb-02", name: "Ambulans Hospital Thomson Forward", base: "Hospital Thomson", type: "medical", status: "ready" },
  { id: "res-boat-01", name: "Bot Penyelamat Bomba #1", base: "Balai Bomba Pos Elmina", type: "boat", status: "deployed" },
  { id: "res-boat-02", name: "Bot Penyelamat Bomba #2", base: "Balai Bomba Pos Elmina", type: "boat", status: "ready" },
  { id: "res-boat-03", name: "Bot Penyelamat RELA Delta", base: "Kompleks Sukan Denai Alam", type: "boat", status: "ready" },
  { id: "res-truck-01", name: "Lori 5-Tan Pengangkut Bomba", base: "Balai Bomba Pos Elmina", type: "truck", status: "deployed" },
  { id: "res-truck-02", name: "Lori Logistik Bantuan 5-Tan", base: "Depot Logistik Elmina East", type: "truck", status: "ready" },
  { id: "res-4x4-01", name: "Pacuan 4x4 Peninjau PKOB", base: "PKOB Sime Darby", type: "4x4", status: "ready" },
  { id: "res-4x4-02", name: "Pacuan 4x4 Sukarelawan NADMA", base: "Depot Logistik Elmina East", type: "4x4", status: "ready" },
  { id: "res-gen-01", name: "Genset Mudah Alih 25kVA", base: "PKOB Sime Darby", type: "generator", status: "ready" }
];

// 7. PERMINTAAN MANGSA KECEMASAN / OUTSTANDING REQUESTS (Ahli 2 & 5)
export const INITIAL_REQUESTS = [
  {
    id: "REQ-401",
    requester: "Pn. Zaleha & Suami (Warga Emas)",
    location: "No. 42, Jln Elmina Barat 4 (Sektor 4)",
    coordinates: [3.1812, 101.4995],
    need: "Pemindahan Kerusi Roda & Rawatan Asma",
    urgency: "critical", // critical | high | medium
    requiredResource: "Pacuan 4x4 / Ambulans",
    matchedResource: null,
    status: "pending", // pending | matched | dispatched | resolved
    timestamp: "10:02:14",
    eta: "--"
  },
  {
    id: "REQ-402",
    requester: "Komuniti Blok B (15 Keluarga)",
    location: "Pangsapuri Elmina Green 2",
    coordinates: [3.1870, 101.5030],
    need: "150 Pek Makanan Kering & Air Minuman Bersih",
    urgency: "high",
    requiredResource: "Lori Logistik 5-Tan",
    matchedResource: "Depot Logistik Elmina East (Lori L-02)",
    status: "matched",
    timestamp: "09:55:30",
    eta: "18 min"
  },
  {
    id: "REQ-403",
    requester: "Keluarga En. Khairul (4 Mangsa Terperangkap)",
    location: "Rumah Teres Sektor Bawah (Berhampiran Sg. Buloh)",
    coordinates: [3.1740, 101.5015],
    need: "Bot Penyelamat Air Deras (Paras Air 0.8m)",
    urgency: "critical",
    requiredResource: "Bot Penyelamat JBPM",
    matchedResource: "Balai Bomba Pos Elmina (Bot Penyelamat B-01)",
    status: "dispatched",
    timestamp: "09:48:12",
    eta: "6 min"
  },
  {
    id: "REQ-404",
    requester: "Klinik Kesihatan Denai Alam (Pusat Triage)",
    location: "Klinik Kesihatan Denai Alam",
    coordinates: [3.1660, 101.5185],
    need: "Genset Sandaran Elektrik 25kVA & Tabung Oksigen",
    urgency: "high",
    requiredResource: "Generator 25kVA & Gas",
    matchedResource: "PKOB Sime Darby (Genset Mobile #1)",
    status: "matched",
    timestamp: "09:40:05",
    eta: "12 min"
  },
  {
    id: "REQ-405",
    requester: "Taska Permata Elmina (8 Kanak-kanak & 2 Guru)",
    location: "Jalan Denai Alam Timur 3",
    coordinates: [3.1685, 101.5155],
    need: "Lori Pemindahan Menghala Ke PPS SK Subang Bestari",
    urgency: "critical",
    requiredResource: "Pacuan 4x4 / Lori Penyelamat",
    matchedResource: null,
    status: "pending",
    timestamp: "10:08:40",
    eta: "--"
  },
  {
    id: "REQ-406",
    requester: "Dewan Komuniti Elmina West (PPS-01)",
    location: "Dewan Komuniti Elmina West",
    coordinates: [3.1855, 101.5042],
    need: "60 Tilam Lipat & Kit Kebersihan Diri JKM",
    urgency: "medium",
    requiredResource: "Kit Kebersihan & Tilam PPS",
    matchedResource: "Depot Logistik Elmina East",
    status: "dispatched",
    timestamp: "09:35:18",
    eta: "8 min"
  }
];

// 8. CADANGAN SOKONGAN KEPUTUSAN / DECISION SUPPORT (Ahli 2 & 4)
export const INITIAL_DECISIONS = [
  {
    id: "REC-101",
    title: "Lencongan Konvoi Bantuan: Sektor 2 Terputus",
    severity: "critical",
    category: "Trafik & Logistik",
    trigger: "Sensor 02 Melepasi Aras Bahaya (3.42m)",
    description: "Laluan Jambatan Sungai Buloh terputus akibat arus deras. Alirkan semula konvoi bekalan dan ambulans melalui Koridor Guthrie Interchange Bypass (+1.4 km, pertambahan masa +4 minit).",
    suggestedAction: "Luluskan Lencongan & Muat Naik Papan Tanda VMS",
    status: "pending", // pending | approved | dismissed
    actionType: "reroute_guthrie",
    impact: "+4 min masa perjalanan | 100% selamat dari zon limpahan",
    timestamp: "09:32:00"
  },
  {
    id: "REC-102",
    title: "Pencegahan Lebihan Kapasiti PPS SK Subang Bestari",
    severity: "high",
    category: "Pengurusan PPS",
    trigger: "Kapasiti SK Subang mencapai 80% (480/600 orang)",
    description: "Kapasiti SK Subang Bestari hampir penuh. Aktifkan Kompleks Sukan Denai Alam (350 tempat kosong) sebagai pusat penerimaan mangsa gelombang seterusnya dari Zon Denai Alam.",
    suggestedAction: "Aktifkan Kompleks Sukan Denai Alam Sebagai PPS",
    status: "pending",
    actionType: "activate_pps_denai",
    impact: "Menambah 350 kapasiti katil | Mengelakkan kesesakan",
    timestamp: "09:41:15"
  },
  {
    id: "REC-103",
    title: "Atur Gerak Pasukan Bot Penyelamat Tambahan",
    severity: "critical",
    category: "Penyelamatan & SAR",
    trigger: "2 Permintaan Pemindahan Kritikal di Zon Banjir",
    description: "Keluarkan 2x Bot Penyelamat daripada simpanan Balai Bomba Pos Elmina ke persimpangan Jalan Elmina 1 untuk operasi menyelamat mangsa terperangkap.",
    suggestedAction: "Sahkan Arahan Mobilisasi Bot JBPM",
    status: "pending",
    actionType: "dispatch_boats",
    impact: "Masa tindak balas SAR disingkatkan kepada < 8 minit",
    timestamp: "09:50:20"
  },
  {
    id: "REC-104",
    title: "Buka Pintu Kawalan Alur Limpah Kolam Takungan",
    severity: "medium",
    category: "Kawalan Hidrologi",
    trigger: "Kolam Takungan Elmina West melepasi 2.85m",
    description: "Buka pintu pelepasan kawalan graviti di Kolam Takungan Barat bagi mengelakkan air melimpahi Persiaran Elmina dalam tempoh 45 minit akan datang.",
    suggestedAction: "Luluskan Pelepasan Berperingkat Kolam Takungan",
    status: "approved",
    actionType: "open_spillway",
    impact: "Mengurangkan tekanan air di Persiaran Elmina sebanyak 30%",
    timestamp: "09:20:00"
  }
];

// 9. LOG AKTIVITI & PERISTIWA (Untuk Ujian & Evaluasi Hackathon)
export const INITIAL_EVENT_LOG = [
  {
    id: "evt-001",
    timestamp: "09:15:20",
    type: "warning",
    category: "TELEMETRY",
    title: "Amaran Peningkatan Air",
    message: "Sensor 02 (Jambatan Sungai Buloh) melepasi paras amaran 3.10m.",
    author: "Sistem IoT Telemetri",
    auditHash: "VRF-9821A"
  },
  {
    id: "evt-002",
    timestamp: "09:22:45",
    type: "danger",
    category: "ROAD_BLOCK",
    title: "Penutupan Jalan Diaktifkan",
    message: "Laluan Jambatan Sungai Buloh ditutup kepada semua kenderaan demi keselamatan.",
    author: "Bilik Gerakan PKOB Sime Darby",
    auditHash: "VRF-4412B"
  },
  {
    id: "evt-003",
    timestamp: "09:28:10",
    type: "info",
    category: "PPS_UPDATE",
    title: "Pembukaan PPS Dewan Komuniti Elmina",
    message: "PPS dibuka secara rasmi. 168 orang penduduk Zon Merah berjaya dipindahkan.",
    author: "Pegawai JKM Shah Alam",
    auditHash: "VRF-7731C"
  },
  {
    id: "evt-004",
    timestamp: "09:31:00",
    type: "success",
    category: "REROUTE",
    title: "Laluan Alternatif Dikira Semula (8.4 ms)",
    message: "Algoritma A* mengenalpasti Koridor Guthrie Bypass sebagai laluan selamat mengelak banjir.",
    author: "NADITOWN Route Engine",
    auditHash: "VRF-1109D"
  }
];
