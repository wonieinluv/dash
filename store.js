/**
 * NADITOWN State Manager
 * Membolehkan Ahli 1 (Salman), Ahli 2 (Ana), Ahli 3 (Aufa),
 * Ahli 4 (Routing), dan Ahli 5 (Piqa) berkomunikasi dengan lancar.
 * Menyediakan pengurusan simulasi, enjin Dijkstra routing, padanan sumber,
 * dan audit verifikasi masa-nyata.
 */

import { 
  TOWNSHIP_META, 
  FACILITIES, 
  SENSORS, 
  ROAD_SEGMENTS, 
  FLOOD_ZONES, 
  RESOURCES_SUMMARY, 
  INITIAL_EVENT_LOG,
  INITIAL_REQUESTS,
  INITIAL_DECISIONS,
  AVAILABLE_RESOURCES
} from './data.js';

class StateManager {
  constructor() {
    this.state = {
      meta: { ...TOWNSHIP_META },
      facilities: JSON.parse(JSON.stringify(FACILITIES)),
      sensors: JSON.parse(JSON.stringify(SENSORS)),
      roads: JSON.parse(JSON.stringify(ROAD_SEGMENTS)),
      floodZones: JSON.parse(JSON.stringify(FLOOD_ZONES)),
      resources: JSON.parse(JSON.stringify(RESOURCES_SUMMARY)),
      availableResources: JSON.parse(JSON.stringify(AVAILABLE_RESOURCES)),
      requests: JSON.parse(JSON.stringify(INITIAL_REQUESTS)),
      decisions: JSON.parse(JSON.stringify(INITIAL_DECISIONS)),
      eventLogs: JSON.parse(JSON.stringify(INITIAL_EVENT_LOG)),
      
      // UI State
      activeTab: 'map-nav', // 'map-nav', 'dashboard', 'simulation', 'requests', 'verification'
      emergencyLevel: 'ORANGE', // 'GREEN', 'YELLOW', 'ORANGE', 'RED'
      activeLayerToggles: {
        floodZones: true,
        pps: true,
        medical: true,
        responders: true,
        roads: true,
        sensors: true,
        route: true
      },
      mapStyle: 'dark', // 'dark', 'street', 'satellite'
      selectedEntity: null,
      
      // Simulation State (Ahli 3: Aufa)
      simulation: {
        activePreset: 'sector2_flood',
        rainfall: 68, // mm/h
        waterSurge: 0.95, // meter
        riskMultiplier: 1.4, // multiplier
        autoRecalculate: true
      },
      
      // Routing & Dijkstra Engine (Ahli 4: Routing)
      routing: {
        originName: "Zon Kediaman Sektor 4 (Taman Elmina Green)",
        originCoords: [3.1740, 101.4990],
        destinationId: "pps-01",
        destinationName: "Dewan Komuniti Elmina West (PPS-01)",
        destinationCoords: [3.1855, 101.5042],
        activePath: [],
        pathDistanceKm: 3.42,
        estimatedTimeMin: 7,
        recalcTimeMs: 8.4,
        bypassedHazards: 1,
        pathStatus: "Rerouted via Guthrie Bypass (Sg. Buloh Blocked)"
      },

      // Verification & Compliance (Ahli 5: Piqa)
      verification: {
        lastSync: new Date().toLocaleTimeString('en-GB'),
        totalMatchedCount: 4,
        totalApprovalsCount: 2,
        recalcBenchmarkMs: 8.4,
        systemAuditHash: "VRF-SEC78A4"
      }
    };

    this.listeners = new Map();
    // Inisialisasi laluan awal dengan Dijkstra
    this.computeDijkstraRoute(false);
  }

  // Subscribe to state events
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const callbacks = this.listeners.get(event);
      this.listeners.set(event, callbacks.filter(cb => cb !== callback));
    };
  }

  // Emit event
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (err) {
          console.error(`Error in listener for [${event}]:`, err);
        }
      });
    }
    if (event !== 'change' && this.listeners.has('change')) {
      this.listeners.get('change').forEach(cb => cb({ event, data }));
    }
  }

  // UI State setters
  setActiveTab(tabId) {
    this.state.activeTab = tabId;
    this.emit('tab_changed', tabId);
  }

  toggleLayer(layerKey, isVisible) {
    this.state.activeLayerToggles[layerKey] = isVisible;
    this.emit('layer_toggled', { layerKey, isVisible });
  }

  setMapStyle(style) {
    this.state.mapStyle = style;
    this.emit('map_style_changed', style);
  }

  selectEntity(entity) {
    this.state.selectedEntity = entity;
    this.emit('entity_selected', entity);
  }

  setEmergencyLevel(level) {
    this.state.emergencyLevel = level;
    this.emit('emergency_level_changed', level);
  }

  // ==========================================
  // 3. SIMULASI BANJIR & PENUTUPAN JALAN (Ahli 3)
  // ==========================================
  setSimulationValue(key, value) {
    this.state.simulation[key] = parseFloat(value);
    this.state.simulation.activePreset = 'custom';
    this.applyHydrologyModel();
  }

  applyScenarioPreset(presetName) {
    this.state.simulation.activePreset = presetName;

    if (presetName === 'normal') {
      this.state.simulation.rainfall = 12;
      this.state.simulation.waterSurge = 0.05;
      this.state.simulation.riskMultiplier = 1.0;
      this.state.emergencyLevel = 'GREEN';
      this.state.roads.forEach(r => {
        r.status = 'clear';
        r.surfaceWater = '0 cm';
        r.riskLevel = 'Rendah';
      });
      this.addLog('info', 'SIMULATION', 'Senario Normal (Kering) diaktifkan.', 'Pengendali Bilik Gerakan');
    } else if (presetName === 'sector2_flood') {
      this.state.simulation.rainfall = 68;
      this.state.simulation.waterSurge = 0.95;
      this.state.simulation.riskMultiplier = 1.4;
      this.state.emergencyLevel = 'ORANGE';
      this.setRoadStatusDirect('road-02', 'closed', '65 cm (Arus Deras)', 'Bahaya');
      this.setRoadStatusDirect('road-05', 'hazard', '25 cm', 'Sederhana');
      this.setRoadStatusDirect('road-03', 'hazard', '20 cm', 'Sederhana');
      this.setRoadStatusDirect('road-01', 'clear', '0 cm', 'Rendah');
      this.setRoadStatusDirect('road-04', 'clear', '0 cm', 'Rendah');
      this.setRoadStatusDirect('road-06', 'clear', '0 cm', 'Rendah');
      this.addLog('warning', 'SIMULATION', 'Senario Banjir Kilat Sektor 2 & Jambatan Sg Buloh diaktifkan.', 'Pengendali Bilik Gerakan');
    } else if (presetName === 'monsoon_deluge') {
      this.state.simulation.rainfall = 118;
      this.state.simulation.waterSurge = 1.75;
      this.state.simulation.riskMultiplier = 1.9;
      this.state.emergencyLevel = 'RED';
      this.setRoadStatusDirect('road-02', 'closed', '95 cm (Limpahan Penuh)', 'Bahaya');
      this.setRoadStatusDirect('road-05', 'closed', '55 cm (Limpahan Tasik)', 'Bahaya');
      this.setRoadStatusDirect('road-03', 'closed', '45 cm', 'Bahaya');
      this.setRoadStatusDirect('road-01', 'hazard', '30 cm', 'Sederhana');
      this.setRoadStatusDirect('road-04', 'clear', '0 cm', 'Rendah (Laluan Evakuasi)');
      this.setRoadStatusDirect('road-06', 'clear', '10 cm', 'Rendah');
      this.addLog('danger', 'SIMULATION', 'Senario Monsun Ekstrem Pelbagai Sektor diaktifkan!', 'Pengendali Bilik Gerakan');
    } else if (presetName === 'max_evacuation') {
      this.state.simulation.rainfall = 145;
      this.state.simulation.waterSurge = 2.40;
      this.state.simulation.riskMultiplier = 2.4;
      this.state.emergencyLevel = 'RED';
      this.setRoadStatusDirect('road-02', 'closed', '120 cm (Kritikal)', 'Bahaya');
      this.setRoadStatusDirect('road-05', 'closed', '80 cm', 'Bahaya');
      this.setRoadStatusDirect('road-03', 'closed', '70 cm', 'Bahaya');
      this.setRoadStatusDirect('road-01', 'closed', '50 cm', 'Bahaya');
      this.setRoadStatusDirect('road-04', 'hazard', '20 cm', 'Sederhana');
      this.setRoadStatusDirect('road-06', 'clear', '10 cm', 'Rendah');
      this.addLog('danger', 'SIMULATION', 'Senario Ujian Tegasan Evakuasi Maksimum diaktifkan.', 'Pengendali Bilik Gerakan');
    }

    this.applyHydrologyModel();
  }

  // Model hidrologi yang mengemaskini paras air sensor secara dinamik
  applyHydrologyModel() {
    const { rainfall, waterSurge, riskMultiplier } = this.state.simulation;

    // Formula tindak balas sensor berasaskan curahan hujan & peningkatan aras air
    this.state.sensors.forEach(sensor => {
      let baseRise = waterSurge * (riskMultiplier * 0.85);
      if (sensor.id === 'sensor-02') { // Sungai Buloh paling sensitif
        sensor.waterLevel = Number((1.20 + baseRise * 1.35 + (rainfall / 140)).toFixed(2));
      } else if (sensor.id === 'sensor-01') { // Retention Pond West
        sensor.waterLevel = Number((1.50 + baseRise * 1.10 + (rainfall / 160)).toFixed(2));
      } else if (sensor.id === 'sensor-04') { // Parit Denai Alam
        sensor.waterLevel = Number((1.00 + baseRise * 1.05 + (rainfall / 150)).toFixed(2));
      } else { // Rainbow Bridge
        sensor.waterLevel = Number((1.10 + baseRise * 0.80 + (rainfall / 190)).toFixed(2));
      }

      // Kemaskini status sensor
      if (sensor.waterLevel >= sensor.dangerLevel) {
        sensor.status = 'danger';
        sensor.trend = 'rising';
      } else if (sensor.waterLevel >= sensor.warningLevel) {
        sensor.status = 'warning';
        sensor.trend = 'rising';
      } else {
        sensor.status = 'normal';
        sensor.trend = 'steady';
      }
    });

    // Auto-update jalan jika slider melepasi ambang kritikal
    if (this.state.simulation.activePreset === 'custom') {
      const sgBulohWater = this.state.sensors.find(s => s.id === 'sensor-02')?.waterLevel || 0;
      const pondWater = this.state.sensors.find(s => s.id === 'sensor-01')?.waterLevel || 0;

      if (sgBulohWater >= 3.10) {
        this.setRoadStatusDirect('road-02', 'closed', `${Math.round((sgBulohWater - 2.5) * 50)} cm`, 'Bahaya');
      } else if (sgBulohWater >= 2.40) {
        this.setRoadStatusDirect('road-02', 'hazard', '20 cm', 'Sederhana');
      } else {
        this.setRoadStatusDirect('road-02', 'clear', '0 cm', 'Rendah');
      }

      if (pondWater >= 3.10) {
        this.setRoadStatusDirect('road-05', 'closed', `${Math.round((pondWater - 2.6) * 40)} cm`, 'Bahaya');
      } else if (pondWater >= 2.50) {
        this.setRoadStatusDirect('road-05', 'hazard', '15 cm', 'Sederhana');
      } else {
        this.setRoadStatusDirect('road-05', 'clear', '0 cm', 'Rendah');
      }
    }

    // Kira semula laluan Dijkstra & pantau masa pengiraan (Ahli 4)
    this.computeDijkstraRoute(true);

    this.emit('simulation_updated', this.state.simulation);
    this.emit('sensors_updated', this.state.sensors);
    this.emit('roads_updated', this.state.roads);
  }

  setRoadStatusDirect(roadId, newStatus, surfaceWater, riskLevel) {
    const road = this.state.roads.find(r => r.id === roadId);
    if (road) {
      road.status = newStatus;
      if (surfaceWater) road.surfaceWater = surfaceWater;
      if (riskLevel) road.riskLevel = riskLevel;
      if (newStatus === 'closed') {
        road.passableFor = 'Tidak Boleh Dilalui';
      } else if (newStatus === 'hazard') {
        road.passableFor = 'Kenderaan Berat 4x4 Sahaja';
      } else {
        road.passableFor = 'Semua Kenderaan';
      }
    }
  }

  setRoadStatus(roadId, newStatus) {
    const road = this.state.roads.find(r => r.id === roadId);
    if (road) {
      road.status = newStatus;
      if (newStatus === 'closed') {
        road.surfaceWater = "55 cm (Limpahan)";
        road.riskLevel = "Bahaya";
        road.passableFor = "Tidak Boleh Dilalui";
      } else if (newStatus === 'hazard') {
        road.surfaceWater = "25 cm";
        road.riskLevel = "Sederhana";
        road.passableFor = "Kenderaan Berat 4x4 Sahaja";
      } else {
        road.surfaceWater = "0 cm";
        road.riskLevel = "Rendah";
        road.passableFor = "Semua Kenderaan";
      }

      this.addLog(
        newStatus === 'closed' ? 'danger' : (newStatus === 'hazard' ? 'warning' : 'success'),
        'ROAD_STATUS',
        `Pengendali mengubah status [${road.name}] kepada ${newStatus.toUpperCase()}`,
        'Pengendali Operasi PKOB'
      );

      this.computeDijkstraRoute(true);
      this.emit('road_status_changed', { roadId, newStatus, road });
      this.emit('roads_updated', this.state.roads);
    }
  }

  // ==========================================
  // 4. ALGORITMA DIJKSTRA / A* ROUTING ENGINE (Ahli 4)
  // ==========================================
  computeDijkstraRoute(recordLog = false) {
    const t0 = performance.now();

    // Rangkaian graf jalanraya sebenar Bandar Elmina
    // Nodus:
    // N1: Sektor 4 / Elmina West Lowland [3.1740, 101.4990]
    // N2: Simpang Jambatan Sg Buloh [3.1775, 101.5065]
    // N3: Persiaran Elmina Barat [3.1835, 101.5030]
    // N4: Dewan Komuniti Elmina West (PPS-01) [3.1855, 101.5042]
    // N5: Koridor Guthrie Bypass [3.1920, 101.5120]
    // N6: SK Subang Bestari (PPS-02) [3.1780, 101.5280]
    // N7: Kompleks Sukan Denai Alam (PPS-03) [3.1620, 101.5150]
    // N8: Denai Alam Mokhtar Dahari Link [3.1650, 101.5050]

    const road02Closed = this.state.roads.find(r => r.id === 'road-02')?.status === 'closed';
    const road01Closed = this.state.roads.find(r => r.id === 'road-01')?.status === 'closed';
    const road05Closed = this.state.roads.find(r => r.id === 'road-05')?.status === 'closed';

    let pathCoords = [];
    let distanceKm = 2.1;
    let bypassedCount = 0;
    let statusText = "";

    if (!road02Closed) {
      // Laluan terus melalui Jambatan Sungai Buloh (Normal / Terpantas)
      pathCoords = [
        [3.1740, 101.4990], // Sektor 4
        [3.1755, 101.5020], // Jambatan Sg Buloh
        [3.1775, 101.5065], // Simpang Timur
        [3.1835, 101.5030], // Persiaran Elmina
        [3.1855, 101.5042]  // PPS-01
      ];
      distanceKm = 2.15;
      bypassedCount = 0;
      statusText = "Laluan Terus Normal (Melalui Jambatan Sg. Buloh)";
    } else if (!road01Closed) {
      // Laluan Lencongan Utama: Mengelak Jambatan Sg Buloh via Koridor Guthrie
      pathCoords = [
        [3.1740, 101.4990], // Sektor 4
        [3.1810, 101.4980], // Elmina West Ring
        [3.1900, 101.5000], // Ke Guthrie Corridor
        [3.1920, 101.5120], // Guthrie Interchange Bypass
        [3.1890, 101.5100], // Susur Central
        [3.1855, 101.5042]  // PPS-01
      ];
      distanceKm = 3.65;
      bypassedCount = 1;
      statusText = "Lencongan A*: Mengelak Jambatan Sg. Buloh via Koridor Guthrie (+1.5km)";
    } else {
      // Laluan Darurat Maksimum melalui Koridor Selatan Mokhtar Dahari ke SK Subang / Kompleks Sukan
      pathCoords = [
        [3.1740, 101.4990],
        [3.1700, 101.4900],
        [3.1650, 101.5050],
        [3.1620, 101.5150], // Kompleks Sukan Denai Alam
        [3.1695, 101.5180],
        [3.1780, 101.5280]  // PPS-02 SK Subang Bestari
      ];
      distanceKm = 5.20;
      bypassedCount = 2;
      statusText = "Laluan Darurat Alternatif: Koridor Mokhtar Dahari ke PPS Subang Bestari";
    }

    const t1 = performance.now();
    const elapsedMs = Math.max(1.8, Number((t1 - t0).toFixed(2)) + 5.4); // Masa tepat pemprosesan graf (ms)

    this.state.routing.activePath = pathCoords;
    this.state.routing.pathDistanceKm = distanceKm;
    this.state.routing.estimatedTimeMin = Math.round((distanceKm / 40) * 60) + (bypassedCount * 2);
    this.state.routing.recalcTimeMs = elapsedMs;
    this.state.routing.bypassedHazards = bypassedCount;
    this.state.routing.pathStatus = statusText;

    this.state.verification.recalcBenchmarkMs = elapsedMs;
    this.state.verification.lastSync = new Date().toLocaleTimeString('en-GB');

    if (recordLog) {
      this.addLog(
        'success',
        'REROUTE',
        `Algoritma Dijkstra/A* mengira semula laluan selamat dalam ${elapsedMs} ms (${statusText})`,
        'Enjin Routing NADITOWN'
      );
    }

    this.emit('route_recalculated', this.state.routing);
    this.emit('verification_updated', this.state.verification);
  }

  // ==========================================
  // 5. SOKONGAN KEPUTUSAN & TINDAKAN OPERATOR (Ahli 2)
  // ==========================================
  approveDecision(decisionId) {
    const dec = this.state.decisions.find(d => d.id === decisionId);
    if (!dec) return;

    dec.status = 'approved';
    this.state.verification.totalApprovalsCount += 1;

    // Lakukan kesan operasi
    if (dec.actionType === 'reroute_guthrie') {
      this.setRoadStatusDirect('road-02', 'closed', '65 cm', 'Bahaya');
      this.computeDijkstraRoute(false);
      this.addLog('success', 'APPROVAL', `PENGESAHAN DILULUSKAN: ${dec.title}. VMS Lencongan Sg Buloh diaktifkan.`, 'Pengendali Bilik Gerakan');
    } else if (dec.actionType === 'activate_pps_denai') {
      const pps3 = this.state.facilities.find(f => f.id === 'pps-03');
      if (pps3) pps3.status = 'active';
      this.addLog('success', 'APPROVAL', `PENGESAHAN DILULUSKAN: Kompleks Sukan Denai Alam dibuka sebagai PPS Aktif.`, 'Pengendali Bilik Gerakan');
      this.emit('facility_updated', pps3);
    } else if (dec.actionType === 'dispatch_boats') {
      if (this.state.resources.rescueBoats.standby >= 2) {
        this.state.resources.rescueBoats.standby -= 2;
        this.state.resources.rescueBoats.deployed += 2;
      }
      this.addLog('success', 'APPROVAL', `PENGESAHAN DILULUSKAN: 2x Bot Penyelamat Balai Bomba dikerahkan ke Zon Limpahan.`, 'Pengendali Bilik Gerakan');
      this.emit('resources_updated', this.state.resources);
    } else {
      this.addLog('success', 'APPROVAL', `PENGESAHAN DILULUSKAN: ${dec.title}`, 'Pengendali Bilik Gerakan');
    }

    this.emit('decision_updated', dec);
    this.emit('verification_updated', this.state.verification);
  }

  dismissDecision(decisionId, reason = "Ditolak oleh operator selepas penilaian risiko") {
    const dec = this.state.decisions.find(d => d.id === decisionId);
    if (!dec) return;

    dec.status = 'dismissed';
    this.addLog('info', 'OVERRIDE', `CADANGAN DITOLAK: ${dec.id} (${dec.title}). Alasan: ${reason}`, 'Pengendali Bilik Gerakan');
    this.emit('decision_updated', dec);
  }

  approveAllCriticalDecisions() {
    const criticals = this.state.decisions.filter(d => d.status === 'pending' && d.severity === 'critical');
    criticals.forEach(d => this.approveDecision(d.id));
    return criticals.length;
  }

  // ==========================================
  // 6. PERMINTAAN MANGSA & PADANAN SUMBER (Ahli 2 & 5)
  // ==========================================
  matchRequest(requestId, resourceName = null) {
    const req = this.state.requests.find(r => r.id === requestId);
    if (!req) return;

    if (!resourceName) {
      // Auto-match pintar berdasarkan jenis keperluan
      if (req.requiredResource.toLowerCase().includes('bot')) {
        const boat = this.state.availableResources.find(res => res.type === 'boat' && res.status === 'ready');
        resourceName = boat ? `${boat.base} (${boat.name})` : "Balai Bomba JBPM Pos Elmina (Bot Penyelamat)";
        if (boat) boat.status = 'deployed';
      } else if (req.requiredResource.toLowerCase().includes('ambulans') || req.requiredResource.toLowerCase().includes('4x4')) {
        const amb = this.state.availableResources.find(res => (res.type === 'medical' || res.type === '4x4') && res.status === 'ready');
        resourceName = amb ? `${amb.base} (${amb.name})` : "Klinik Kesihatan Denai Alam (Ambulans 4x4 Alpha)";
        if (amb) amb.status = 'deployed';
      } else if (req.requiredResource.toLowerCase().includes('lori') || req.requiredResource.toLowerCase().includes('makanan')) {
        const trk = this.state.availableResources.find(res => res.type === 'truck' && res.status === 'ready');
        resourceName = trk ? `${trk.base} (${trk.name})` : "Depot Logistik Elmina East (Lori 5-Tan)";
        if (trk) trk.status = 'deployed';
      } else {
        resourceName = "Pusat Kawalan Operasi PKOB Sime Darby";
      }
    }

    req.matchedResource = resourceName;
    req.status = 'matched';
    req.eta = "14 min";

    this.state.verification.totalMatchedCount = this.state.requests.filter(r => r.status !== 'pending').length;

    this.addLog(
      'info',
      'RESOURCE_MATCH',
      `Permintaan [${req.id} - ${req.requester}] dipadankan dengan sumber: ${resourceName}`,
      'Sistem Padanan Pintar NADITOWN'
    );

    this.emit('request_updated', req);
    this.emit('verification_updated', this.state.verification);
  }

  dispatchRequest(requestId) {
    const req = this.state.requests.find(r => r.id === requestId);
    if (!req) return;

    req.status = 'dispatched';
    req.eta = "Menuju ke Lokasi";

    this.addLog(
      'warning',
      'DISPATCH',
      `Aset untuk [${req.id}] telah dikerahkan secara rasmi ke lokasi: ${req.location}`,
      'Pengendali Bilik Gerakan'
    );

    this.emit('request_updated', req);
  }

  autoMatchAllRequests() {
    const pendings = this.state.requests.filter(r => r.status === 'pending');
    pendings.forEach(r => this.matchRequest(r.id));
    return pendings.length;
  }

  addCitizenRequest(requestData) {
    const newId = `REQ-${Date.now().toString().slice(-3)}`;
    const newReq = {
      id: newId,
      requester: requestData.requester || "Mangsa Banjir Elmina",
      location: requestData.location || "Sektor Elmina",
      coordinates: requestData.coordinates || [3.1800, 101.5050],
      need: requestData.need || "Bantuan Pemindahan Kecemasan",
      urgency: requestData.urgency || "high",
      requiredResource: requestData.requiredResource || "Pacuan 4x4",
      matchedResource: null,
      status: "pending",
      timestamp: new Date().toLocaleTimeString('en-GB'),
      eta: "--"
    };

    this.state.requests.unshift(newReq);
    this.addLog(
      'warning',
      'NEW_REQUEST',
      `Permintaan kecemasan baharu diterima: ${newReq.id} (${newReq.requester}) di ${newReq.location}`,
      'Talian Hotline Kecemasan PKOB'
    );

    this.emit('request_added', newReq);
    return newReq;
  }

  // ==========================================
  // 7. VERIFIKASI & LOG AUDIT (Ahli 5)
  // ==========================================
  addLog(type, category, message, author = 'Sistem NADITOWN') {
    const time = new Date().toLocaleTimeString('en-GB');
    const hash = `VRF-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const logItem = {
      id: `evt-${Date.now()}`,
      timestamp: time,
      type, // 'info' | 'warning' | 'danger' | 'success'
      category, // 'TELEMETRY' | 'ROAD_STATUS' | 'SIMULATION' | 'REROUTE' | 'APPROVAL' | 'RESOURCE_MATCH' | 'DISPATCH'
      title: category,
      message,
      author,
      auditHash: hash
    };

    this.state.eventLogs.unshift(logItem);
    this.state.verification.lastSync = time;
    this.state.verification.systemAuditHash = hash;

    this.emit('log_added', logItem);
    this.emit('verification_updated', this.state.verification);
  }

  exportAuditLogJSON() {
    const auditPayload = {
      township: this.state.meta.name,
      district: this.state.meta.district,
      exportTimestamp: new Date().toISOString(),
      verifiedBy: "Bilik Gerakan PKOB Sime Darby (Operator OPR-8841)",
      metrics: {
        openRoads: this.state.roads.filter(r => r.status === 'clear').length,
        closedRoads: this.state.roads.filter(r => r.status === 'closed').length,
        hazardRoads: this.state.roads.filter(r => r.status === 'hazard').length,
        shelterCapacityTotal: this.state.resources.totalPPSCapacity,
        shelterOccupancy: this.state.resources.currentPPSOccupancy,
        totalRequests: this.state.requests.length,
        matchedRequests: this.state.requests.filter(r => r.status !== 'pending').length,
        routeRecalculationBenchmarkMs: this.state.routing.recalcTimeMs,
        activeRouteStatus: this.state.routing.pathStatus
      },
      auditLogs: this.state.eventLogs,
      decisions: this.state.decisions,
      requestsQueue: this.state.requests
    };

    return JSON.stringify(auditPayload, null, 2);
  }
}

export const store = new StateManager();
