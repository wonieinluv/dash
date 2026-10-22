/**
 * NADITOWN - Tactical Map Engine
 * Developed for Sime Darby Property - Bandar Elmina Township
 * Component: Interactive Leaflet Map, Tactical Markers,
 * Geo-Layers (Flood Zones, Roads, Facilities, IoT Sensors, Dijkstra Route).
 */

import { store } from './store.js';

const L = typeof window !== 'undefined' && window.L ? window.L : null;

export class TownshipMap {
  constructor(containerId) {
    this.containerId = containerId;
    this.map = null;
    this.baseLayers = {};
    this.layerGroups = {
      floodZones: L ? L.layerGroup() : null,
      pps: L ? L.layerGroup() : null,
      medical: L ? L.layerGroup() : null,
      responders: L ? L.layerGroup() : null,
      roads: L ? L.layerGroup() : null,
      sensors: L ? L.layerGroup() : null,
      route: L ? L.layerGroup() : null
    };
    this.markersMap = new Map();
    this.roadsMap = new Map();
  }

  init() {
    if (!L) {
      console.error("Leaflet (L) not found. Please ensure Leaflet CDN is loaded.");
      return;
    }

    const meta = store.state.meta;

    // 1. Initialize Leaflet Map
    this.map = L.map(this.containerId, {
      center: meta.coordinates,
      zoom: meta.zoom,
      minZoom: 12,
      maxZoom: 18,
      zoomControl: false
    });

    // 2. Base Tile Layers
    this.baseLayers.dark = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      attribution: '&copy; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    });

    this.baseLayers.street = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; CARTO &copy; OpenStreetMap contributors',
      subdomains: 'abcd',
      maxZoom: 19
    });

    this.baseLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles &copy; Esri &mdash; DigitalGlobe, GeoEye, Earthstar',
      maxZoom: 18
    });

    this.baseLayers.dark.addTo(this.map);

    // 3. Add Layer Groups
    Object.values(this.layerGroups).forEach(group => {
      if (group) group.addTo(this.map);
    });

    // 4. Render Initial Layers
    this.renderTownshipBoundary();
    this.renderFloodZones();
    this.renderRoads();
    this.renderFacilities();
    this.renderSensors();
    this.renderActiveRoute();

    // 5. Connect State Listeners
    this.setupStateListeners();

    // Scale Bar
    L.control.scale({ imperial: false, position: 'bottomright' }).addTo(this.map);

    console.log("NADITOWN: Tactical Map initialized for " + meta.name);
  }

  setupStateListeners() {
    store.subscribe('layer_toggled', ({ layerKey, isVisible }) => {
      const group = this.layerGroups[layerKey];
      if (group) {
        if (isVisible) {
          if (!this.map.hasLayer(group)) this.map.addLayer(group);
        } else {
          if (this.map.hasLayer(group)) this.map.removeLayer(group);
        }
      }
    });

    store.subscribe('map_style_changed', (styleKey) => {
      this.switchBaseLayer(styleKey);
    });

    store.subscribe('road_status_changed', ({ roadId, newStatus }) => {
      this.updateRoadDisplay(roadId, newStatus);
    });

    store.subscribe('roads_updated', () => {
      this.renderRoads();
    });

    store.subscribe('sensors_updated', () => {
      this.renderSensors();
    });

    store.subscribe('simulation_updated', () => {
      this.renderFloodZones();
    });

    store.subscribe('route_recalculated', (routingData) => {
      this.renderActiveRoute(routingData);
    });

    store.subscribe('facility_added', (facility) => {
      this.addFacilityMarker(facility);
    });

    store.subscribe('facility_updated', () => {
      this.renderFacilities();
    });
  }

  switchBaseLayer(styleKey) {
    Object.values(this.baseLayers).forEach(layer => {
      if (this.map.hasLayer(layer)) this.map.removeLayer(layer);
    });

    if (this.baseLayers[styleKey]) {
      this.baseLayers[styleKey].addTo(this.map);
    }
  }

  renderTownshipBoundary() {
    const boundaryCoords = [
      [3.1600, 101.4880],
      [3.1950, 101.4920],
      [3.2100, 101.5200],
      [3.1900, 101.5360],
      [3.1650, 101.5280]
    ];

    L.polygon(boundaryCoords, {
      color: '#15803d',
      weight: 2,
      dashArray: '6, 6',
      fillColor: '#15803d',
      fillOpacity: 0.03,
      interactive: false
    }).addTo(this.map);
  }

  renderFloodZones() {
    this.layerGroups.floodZones.clearLayers();
    const multiplier = store.state.simulation.riskMultiplier || 1.0;

    store.state.floodZones.forEach(zone => {
      const polygon = L.polygon(zone.polygon, {
        color: zone.color,
        weight: 2,
        fillColor: zone.fillColor,
        fillOpacity: Math.min(0.65, zone.fillOpacity * (multiplier * 0.9)),
        className: `flood-polygon flood-${zone.severity}`
      });

      polygon.bindTooltip(`
        <div style="font-family: inherit; font-size: 12px; color: #fff;">
          <strong style="color: ${zone.color};">${zone.name}</strong><br>
          <span style="display:inline-block; margin-top:2px; padding: 2px 6px; border-radius: 4px; font-weight:700; font-size:10px; background: ${zone.color}33; color: ${zone.color};">${zone.level}</span><br>
          <small style="color: #d7bfa8;">Expected Water Depth: ${zone.depth}</small>
        </div>
      `, { sticky: true, className: 'leaflet-dark-tooltip' });

      polygon.on('click', () => {
        store.selectEntity({ ...zone, entityType: 'floodZone' });
      });

      polygon.addTo(this.layerGroups.floodZones);
    });
  }

  renderRoads() {
    this.layerGroups.roads.clearLayers();
    this.roadsMap.clear();

    store.state.roads.forEach(road => {
      this.createRoadPolyline(road);
    });
  }

  createRoadPolyline(road) {
    let color = '#22c55e'; // Green / Clear
    let weight = 5;
    let dashArray = null;

    if (road.status === 'closed') {
      color = '#ef4444'; // Red / Closed
      weight = 6;
      dashArray = '8, 8';
    } else if (road.status === 'hazard') {
      color = '#b45309'; // Amber / Hazard
      weight = 5;
      dashArray = '5, 6';
    }

    const polyline = L.polyline(road.coordinates, {
      color: color,
      weight: weight,
      dashArray: dashArray,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round',
      className: `tactical-road-line road-${road.status}`
    });

    const statusBadge = road.status === 'closed' 
      ? '<span style="background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">🔴 ROAD CLOSED</span>'
      : (road.status === 'hazard' 
        ? '<span style="background: rgba(180, 83, 9, 0.2); color: #f59e0b; border: 1px solid #b45309; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">⚠️ WATER LOGGED</span>'
        : '<span style="background: rgba(21, 128, 61, 0.2); color: #22c55e; border: 1px solid #15803d; padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 11px;">🟢 ROAD CLEAR (OPEN)</span>');

    const popupHtml = `
      <div style="font-family: inherit; color: #f8fafc; min-width: 230px;">
        <div style="margin-bottom: 8px;">
          ${statusBadge}
          <h4 style="margin-top: 6px; font-size: 14px; font-weight: 700; color: #fff;">${road.name}</h4>
        </div>
        <div style="background: #19241b; padding: 8px 10px; border-radius: 6px; font-size: 12px; margin-bottom: 10px; border: 1px solid #2d4533;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
            <span style="color: #9fb39c;">Water Depth:</span>
            <strong style="color: #fff;">${road.surfaceWater}</strong>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
            <span style="color: #9fb39c;">Passable For:</span>
            <strong style="color: #fff; text-align:right;">${road.passableFor}</strong>
          </div>
          <div style="display:flex; justify-content:space-between;">
            <span style="color: #9fb39c;">Risk Level:</span>
            <strong style="color: ${road.status === 'closed' ? '#ef4444' : (road.status === 'hazard' ? '#f59e0b' : '#22c55e')};">${road.riskLevel}</strong>
          </div>
        </div>
        <button id="toggle-road-btn-${road.id}" style="width: 100%; padding: 6px 12px; border-radius: 4px; border: none; font-size: 12px; font-weight: 700; cursor: pointer; background: ${road.status === 'closed' ? '#15803d' : '#ef4444'}; color: #fff;">
          ${road.status === 'closed' ? 'Reopen Road Segment' : 'Close Road Segment (Simulate Flood)'}
        </button>
      </div>
    `;

    polyline.bindPopup(popupHtml, { className: 'tactical-map-popup' });

    polyline.on('popupopen', () => {
      const btn = document.getElementById(`toggle-road-btn-${road.id}`);
      if (btn) {
        btn.onclick = () => {
          const nextStatus = road.status === 'closed' ? 'clear' : 'closed';
          store.setRoadStatus(road.id, nextStatus);
          polyline.closePopup();
        };
      }
    });

    polyline.addTo(this.layerGroups.roads);
    this.roadsMap.set(road.id, polyline);
  }

  updateRoadDisplay(roadId, newStatus) {
    const road = store.state.roads.find(r => r.id === roadId);
    if (!road) return;

    const existing = this.roadsMap.get(roadId);
    if (existing) {
      this.layerGroups.roads.removeLayer(existing);
    }
    this.createRoadPolyline(road);
  }

  renderFacilities() {
    this.layerGroups.pps.clearLayers();
    this.layerGroups.medical.clearLayers();
    this.layerGroups.responders.clearLayers();
    this.markersMap.clear();

    store.state.facilities.forEach(fac => {
      this.addFacilityMarker(fac);
    });
  }

  addFacilityMarker(fac) {
    let targetGroup = this.layerGroups.pps;
    if (fac.type === 'medical') targetGroup = this.layerGroups.medical;
    else if (fac.type === 'responder' || fac.type === 'command' || fac.type === 'logistics') targetGroup = this.layerGroups.responders;

    const occupancyRate = fac.capacity > 0 ? Math.round((fac.currentOccupants / fac.capacity) * 100) : 0;
    const iconHtml = this.getCustomIconHtml(fac, occupancyRate);

    const customIcon = L.divIcon({
      html: iconHtml,
      className: `tactical-icon-wrap fac-${fac.type}`,
      iconSize: [42, 42],
      iconAnchor: [21, 21],
      popupAnchor: [0, -22]
    });

    const marker = L.marker(fac.coordinates, { icon: customIcon });

    const barColor = occupancyRate >= 90 ? '#ef4444' : (occupancyRate >= 70 ? '#b45309' : '#22c55e');

    const popupHtml = `
      <div style="font-family: inherit; color: #f8fafc; min-width: 250px;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
          <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; background: rgba(21, 128, 61, 0.2); color: #86efac; border: 1px solid rgba(21, 128, 61, 0.3);">
            ${fac.category}
          </span>
          <span style="font-size: 11px; color: ${fac.status === 'active' ? '#22c55e' : (fac.status === 'warning' ? '#f59e0b' : '#9fb39c')}; font-weight: 700;">
            ● ${fac.status.toUpperCase()}
          </span>
        </div>
        <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #fff;">${fac.name}</h4>
        
        <div style="background: #19241b; padding: 10px; border-radius: 6px; font-size: 12px; margin-bottom: 10px; border: 1px solid #2d4533;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
            <span style="color: #9fb39c;">Shelter Occupancy:</span>
            <strong style="color: #fff;">${fac.currentOccupants} / ${fac.capacity} (${occupancyRate}%)</strong>
          </div>
          <div style="height: 6px; width: 100%; background: #283e2f; border-radius: 3px; overflow: hidden; margin-bottom: 8px;">
            <div style="width: ${Math.min(occupancyRate, 100)}%; height: 100%; background: ${barColor};"></div>
          </div>
          <div style="margin-bottom: 4px; color: #cbd5e1;">
            <span style="color: #9fb39c;">Amenities:</span> ${fac.amenities.slice(0, 2).join(', ')}
          </div>
          <div style="color: #cbd5e1;">
            <span style="color: #9fb39c;">Contact:</span> ${fac.contact}
          </div>
        </div>

        <button id="set-dest-btn-${fac.id}" style="width: 100%; padding: 6px 12px; border-radius: 4px; border: none; font-size: 12px; font-weight: 700; cursor: pointer; background: #15803d; color: #fff;">
          🧭 Set as Evacuation Destination
        </button>
      </div>
    `;

    marker.bindPopup(popupHtml, { className: 'tactical-map-popup' });

    marker.on('popupopen', () => {
      const btn = document.getElementById(`set-dest-btn-${fac.id}`);
      if (btn) {
        btn.onclick = () => {
          store.state.routing.destinationId = fac.id;
          store.state.routing.destinationName = fac.name;
          store.state.routing.destinationCoords = fac.coordinates;
          store.computeDijkstraRoute(true);
          marker.closePopup();
        };
      }
    });

    marker.addTo(targetGroup);
    this.markersMap.set(fac.id, marker);
  }

  renderSensors() {
    this.layerGroups.sensors.clearLayers();

    store.state.sensors.forEach(sensor => {
      const isDanger = sensor.status === 'danger';
      const isWarning = sensor.status === 'warning';
      const color = isDanger ? '#ef4444' : (isWarning ? '#b45309' : '#22c55e');

      const sensorHtml = `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; border-radius: 50%; border: 2px solid ${color}; opacity: 0.8; animation: pulseGlow 2s infinite ease-in-out;"></div>
          <div style="background: #1b261e; border: 2px solid ${color}; border-radius: 50%; width: 34px; height: 34px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 0 10px ${color}88;">
            <span style="font-size: 10px; font-weight: 800; color: ${color}; line-height: 1;">${sensor.waterLevel}m</span>
          </div>
        </div>
      `;

      const icon = L.divIcon({
        html: sensorHtml,
        className: 'tactical-sensor-icon',
        iconSize: [44, 44],
        iconAnchor: [22, 22],
        popupAnchor: [0, -18]
      });

      const marker = L.marker(sensor.coordinates, { icon });

      const popupHtml = `
        <div style="font-family: inherit; color: #f8fafc; min-width: 240px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 4px; background: ${color}22; color: ${color}; border: 1px solid ${color};">
              STATUS: ${sensor.status.toUpperCase()}
            </span>
            <small style="color: #d7bfa8;">Battery ${sensor.battery}</small>
          </div>
          <h4 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #fff;">${sensor.name}</h4>
          
          <div style="background: #19241b; padding: 10px; border-radius: 6px; font-size: 12px; border: 1px solid #2d4533;">
            <div style="display:flex; justify-content:space-between; margin-bottom: 6px; align-items:baseline;">
              <span style="color: #9fb39c;">Current Water Level:</span>
              <strong style="color: ${color}; font-size: 16px;">${sensor.waterLevel} Meters</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
              <span style="color: #9fb39c;">Danger Threshold:</span>
              <strong style="color: #ef4444;">${sensor.dangerLevel}m</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
              <span style="color: #9fb39c;">Warning Threshold:</span>
              <strong style="color: #f59e0b;">${sensor.warningLevel}m</strong>
            </div>
            <div style="display:flex; justify-content:space-between;">
              <span style="color: #9fb39c;">Telemetry Trend:</span>
              <strong style="color: ${sensor.trend === 'rising' ? '#ef4444' : '#22c55e'};">
                ${sensor.trend === 'rising' ? '⬆️ Rising Rapidly' : '➡️ Steady'}
              </strong>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { className: 'tactical-map-popup' });
      marker.addTo(this.layerGroups.sensors);
    });
  }

  renderActiveRoute(routingData = null) {
    this.layerGroups.route.clearLayers();

    const data = routingData || store.state.routing;
    const points = data.activePath;

    if (!points || points.length === 0) return;

    L.polyline(points, {
      color: '#10b981',
      weight: 6,
      opacity: 0.95,
      dashArray: '10, 8',
      className: 'animated-route-flow',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(this.layerGroups.route);

    const startPoint = points[0];
    const endPoint = points[points.length - 1];

    L.circleMarker(startPoint, {
      radius: 8,
      fillColor: '#b45309',
      fillOpacity: 1,
      color: '#ffffff',
      weight: 2
    }).bindTooltip('📍 Incident Location (Sector 4)', { permanent: false, direction: 'top' })
      .addTo(this.layerGroups.route);

    L.circleMarker(endPoint, {
      radius: 9,
      fillColor: '#15803d',
      fillOpacity: 1,
      color: '#ffffff',
      weight: 2
    }).bindTooltip('🏁 Safe Evacuation Shelter (PPS)', { permanent: false, direction: 'top' })
      .addTo(this.layerGroups.route);
  }

  getCustomIconHtml(fac, occupancyRate) {
    let color = '#22c55e';
    let iconChar = '🏛️';

    if (fac.type === 'pps') {
      color = '#22c55e';
      iconChar = '🏠';
    } else if (fac.type === 'medical') {
      color = '#ef4444';
      iconChar = '🏥';
    } else if (fac.type === 'responder') {
      color = '#f97316';
      iconChar = '🚒';
    } else if (fac.type === 'command') {
      color = '#8b5cf6';
      iconChar = '🛡️';
    } else if (fac.type === 'logistics') {
      color = '#a16207';
      iconChar = '📦';
    }

    return `
      <div style="position:relative; width:42px; height:42px; display:flex; align-items:center; justify-content:center;">
        <div style="position:absolute; inset:0; background: ${color}22; border: 2px solid ${color}; border-radius: 50%; box-shadow: 0 0 12px ${color}66;"></div>
        <div style="position:relative; font-size:18px;">${iconChar}</div>
        ${fac.capacity > 0 ? `<div style="position:absolute; bottom:-4px; background:#1b261e; border: 1px solid ${color}; color:#fff; font-size:9px; font-weight:700; padding:1px 4px; border-radius:10px;">${occupancyRate}%</div>` : ''}
      </div>
    `;
  }

  focusLocation(lat, lng, zoom = 16) {
    if (!this.map) return;
    this.map.flyTo([lat, lng], zoom, { animate: true, duration: 1.0 });
  }

  resetView() {
    if (!this.map) return;
    const meta = store.state.meta;
    this.map.flyTo(meta.coordinates, meta.zoom, { animate: true, duration: 1.0 });
  }
}
