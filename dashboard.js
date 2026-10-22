/**
 * NADITOWN - Multi-Page Dashboard & Operations Module (Ahli 2: Ana)
 * Supports 4 Distinct Pages:
 * 1. Dashboard (Road Network, Shelter Capacity & Resources, Incident Requests, Routing Benchmark)
 * 2. Map & Simulation (Interactive Leaflet Map, Hydrology Sliders, Facilities Directory)
 * 3. Reports & Operations (Decision Support, Outstanding Requests Queue, Verification & Audit Trail)
 * 4. Community Requests (Citizen SOS Intake Form, Live Community Assistance Tracker)
 */

import { store } from './store.js';

export class Dashboard {
  constructor(mapEngine = null) {
    this.mapEngine = mapEngine;
    this.currentReqFilter = 'all';
    this.currentLogFilter = 'ALL';
    this.currentCommFilter = 'all';
    this.currentFacFilter = 'all';
  }

  init(mapEngineInstance = null) {
    if (mapEngineInstance) this.mapEngine = mapEngineInstance;

    this.initClock();
    this.initNavigation();
    this.initDashboardPage();
    this.initMapPage();
    this.initReportsPage();
    this.initCommunityPage();
    this.setupSubscriptions();

    // Check URL hash for direct page loading (e.g. #map, #reports, #community)
    const hash = window.location.hash.replace('#', '');
    if (hash && ['dashboard', 'map', 'reports', 'community'].includes(hash)) {
      this.switchPage(`page-${hash}`);
    } else {
      this.switchPage('page-dashboard');
    }

    console.log("NADITOWN: Multi-Page Operations System initialized.");
  }

  setMapEngine(mapEngine) {
    this.mapEngine = mapEngine;
  }

  // ==========================================
  // 1. TOP BAR CLOCK & NAVIGATION
  // ==========================================
  initClock() {
    const el = document.getElementById('live-clock');
    const tick = () => {
      const now = new Date();
      if (el) el.textContent = now.toLocaleTimeString('en-GB') + ' UTC+8';
    };
    tick();
    setInterval(tick, 1000);
  }

  initNavigation() {
    const navBtns = document.querySelectorAll('.nav-page-btn');
    navBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetPage = btn.dataset.page;
        this.switchPage(targetPage);
      });
    });

    window.addEventListener('hashchange', () => {
      const h = window.location.hash.replace('#', '');
      if (h && ['dashboard', 'map', 'reports', 'community'].includes(h)) {
        this.switchPage(`page-${h}`, false);
      }
    });
  }

  switchPage(pageId, updateHash = true) {
    const pagePanes = document.querySelectorAll('.page-view-container');
    const navBtns = document.querySelectorAll('.nav-page-btn');

    pagePanes.forEach(p => p.classList.remove('active'));
    navBtns.forEach(b => b.classList.remove('active'));

    const targetEl = document.getElementById(pageId);
    if (targetEl) targetEl.classList.add('active');

    const activeNavBtn = document.querySelector(`.nav-page-btn[data-page="${pageId}"]`);
    if (activeNavBtn) activeNavBtn.classList.add('active');

    const cleanHash = pageId.replace('page-', '');
    if (updateHash) {
      window.location.hash = cleanHash;
    }

    store.setActivePage(cleanHash);

    // If switching to Map, invalidate Leaflet container size to re-render tiles
    if (pageId === 'page-map' && this.mapEngine && this.mapEngine.map) {
      setTimeout(() => {
        this.mapEngine.map.invalidateSize();
      }, 150);
    }
  }

  // ==========================================
  // 2. PAGE 1: DASHBOARD
  // ==========================================
  initDashboardPage() {
    this.updateKPIs();
    this.renderRoadsDetailTable();
    this.renderShelterDetailCards();
    this.renderRequestsSummaryCard();
    this.renderRouteBenchmarkCard();
  }

  updateKPIs() {
    this.updateRoadKPIs();
    this.updateShelterKPIs();
    this.updateRequestsKPIs();
    this.updateRoutingKPIs();
  }

  updateRoadKPIs() {
    const roads = store.state.roads;
    const total = roads.length;
    const openCount = roads.filter(r => r.status === 'clear').length;
    const hazardCount = roads.filter(r => r.status === 'hazard').length;
    const closedCount = roads.filter(r => r.status === 'closed').length;
    const passablePct = Math.round(((openCount + hazardCount * 0.5) / total) * 100);

    const valEl = document.getElementById('kpi-open-roads');
    const badgeEl = document.getElementById('kpi-road-badge');
    const subtextEl = document.getElementById('kpi-road-subtext');
    const pctEl = document.getElementById('kpi-road-pct');
    const barEl = document.getElementById('kpi-road-bar');

    if (valEl) valEl.textContent = openCount;
    if (badgeEl) {
      if (closedCount > 0) {
        badgeEl.textContent = `${closedCount} Closed`;
        badgeEl.style.color = '#ef4444';
        badgeEl.style.borderColor = '#ef4444';
        badgeEl.style.background = 'rgba(239, 68, 68, 0.15)';
      } else if (hazardCount > 0) {
        badgeEl.textContent = `${hazardCount} Hazard`;
        badgeEl.style.color = '#b45309';
        badgeEl.style.borderColor = '#b45309';
        badgeEl.style.background = 'rgba(180, 83, 9, 0.15)';
      } else {
        badgeEl.textContent = `All Clear`;
        badgeEl.style.color = '#22c55e';
        badgeEl.style.borderColor = '#15803d';
        badgeEl.style.background = 'rgba(21, 128, 61, 0.15)';
      }
    }
    if (subtextEl) subtextEl.textContent = `${openCount} Clear • ${hazardCount} Hazard • ${closedCount} Closed`;
    if (pctEl) pctEl.textContent = `${passablePct}% Passable`;
    if (barEl) {
      barEl.style.width = `${passablePct}%`;
      barEl.style.background = passablePct > 70 ? '#22c55e' : (passablePct > 40 ? '#b45309' : '#ef4444');
    }
  }

  updateShelterKPIs() {
    const facs = store.state.facilities.filter(f => f.type === 'pps');
    const activePPS = facs.filter(f => f.status === 'active' || f.status === 'warning');
    const totalCap = facs.reduce((sum, f) => sum + f.capacity, 0);
    const currentOcc = facs.reduce((sum, f) => sum + f.currentOccupants, 0);
    const pct = totalCap > 0 ? ((currentOcc / totalCap) * 100).toFixed(1) : 0;

    const pctEl = document.getElementById('kpi-shelter-pct');
    const countsEl = document.getElementById('kpi-shelter-counts');
    const activeBadge = document.getElementById('kpi-shelter-active');
    const barEl = document.getElementById('kpi-shelter-bar');

    if (pctEl) pctEl.textContent = `${pct}%`;
    if (countsEl) countsEl.textContent = `(${currentOcc.toLocaleString()} / ${totalCap.toLocaleString()} Evacuees)`;
    if (activeBadge) activeBadge.textContent = `${activePPS.length} Active Shelters`;
    if (barEl) {
      barEl.style.width = `${Math.min(pct, 100)}%`;
      barEl.style.background = pct > 85 ? '#ef4444' : (pct > 65 ? '#b45309' : '#22c55e');
    }

    const res = store.state.resources;
    const foodEl = document.getElementById('badge-food');
    const boatsEl = document.getElementById('badge-boats');
    const fourEl = document.getElementById('badge-4x4');
    if (foodEl) foodEl.textContent = `🍱 MRE: ${res.foodPacks.stockRemaining.toLocaleString()}`;
    if (boatsEl) boatsEl.textContent = `🚤 Boats: ${res.rescueBoats.standby} Ready`;
    if (fourEl) fourEl.textContent = `🚙 4x4: ${res.fourByFourVehicles.standby} Ready`;
  }

  updateRequestsKPIs() {
    const reqs = store.state.requests;
    const total = reqs.length;
    const pending = reqs.filter(r => r.status === 'pending').length;
    const matched = reqs.filter(r => r.status === 'matched').length;
    const dispatched = reqs.filter(r => r.status === 'dispatched' || r.status === 'resolved').length;
    const matchRate = total > 0 ? (((matched + dispatched) / total) * 100).toFixed(1) : 0;

    const totalEl = document.getElementById('kpi-total-requests');
    const badgeEl = document.getElementById('kpi-req-badge');
    const breakdownEl = document.getElementById('kpi-requests-breakdown');
    const rateEl = document.getElementById('kpi-match-rate');
    const barEl = document.getElementById('kpi-requests-bar');

    if (totalEl) totalEl.textContent = total;
    if (badgeEl) {
      badgeEl.textContent = `${pending} Pending`;
      badgeEl.style.color = pending > 0 ? '#f59e0b' : '#22c55e';
      badgeEl.style.borderColor = pending > 0 ? '#b45309' : '#15803d';
    }
    if (breakdownEl) breakdownEl.textContent = `${pending} Pending • ${matched} Matched • ${dispatched} Dispatched`;
    if (rateEl) rateEl.textContent = `${matchRate}% Matched`;
    if (barEl) {
      barEl.style.width = `${matchRate}%`;
      barEl.style.background = '#a16207';
    }

    // Top navigation badge updates
    const navCommBadge = document.getElementById('nav-community-badge');
    if (navCommBadge) navCommBadge.textContent = pending;
  }

  updateRoutingKPIs() {
    const routing = store.state.routing;
    const logs = store.state.eventLogs;

    const timeEl = document.getElementById('kpi-recalc-time');
    const hazardEl = document.getElementById('kpi-route-hazard-count');
    const verifiedEl = document.getElementById('kpi-verified-count');

    if (timeEl) timeEl.textContent = routing.recalcTimeMs;
    if (hazardEl) hazardEl.textContent = `${routing.bypassedHazards} Hazards Bypassed`;
    if (verifiedEl) verifiedEl.textContent = `${logs.length} Triggers Verified`;

    const bannerTag = document.getElementById('banner-route-tag');
    const bannerText = document.getElementById('banner-route-text');
    const bannerStat = document.getElementById('banner-recalc-stat');

    if (bannerTag) {
      bannerTag.textContent = routing.bypassedHazards > 0 ? "ALTERNATE REROUTE ACTIVE" : "DIRECT CORRIDOR OPEN";
      bannerTag.style.background = routing.bypassedHazards > 0 ? "rgba(21, 128, 61, 0.2)" : "rgba(161, 98, 7, 0.2)";
      bannerTag.style.color = routing.bypassedHazards > 0 ? "#22c55e" : "#fcd34d";
    }
    if (bannerText) {
      bannerText.textContent = `${routing.originName} ➔ ${routing.destinationName} (${routing.pathStatus})`;
    }
    if (bannerStat) {
      bannerStat.textContent = `Graph Latency: ${routing.recalcTimeMs} ms | Distance: ${routing.pathDistanceKm} km | ETA: ~${routing.estimatedTimeMin} mins`;
    }

    const vrfCalcTime = document.getElementById('vrf-calc-time');
    if (vrfCalcTime) vrfCalcTime.textContent = `${routing.recalcTimeMs} ms (A* Dijkstra)`;
  }

  renderRoadsDetailTable() {
    const container = document.getElementById('dash-roads-table-body');
    if (!container) return;
    container.innerHTML = '';

    store.state.roads.forEach(road => {
      const tr = document.createElement('tr');
      const isClosed = road.status === 'closed';
      const isHazard = road.status === 'hazard';

      let statusBadge = isClosed 
        ? `<span class="badge-status-closed">🔴 Closed</span>`
        : (isHazard ? `<span class="badge-status-hazard">⚠️ Hazard</span>` : `<span class="badge-status-clear">🟢 Clear</span>`);

      tr.innerHTML = `
        <td><strong style="color:var(--text-white);">${road.name}</strong></td>
        <td>${statusBadge}</td>
        <td><span style="font-family:monospace; color:var(--text-white); font-weight:700;">${road.surfaceWater}</span></td>
        <td style="color:var(--text-brown);">${road.passableFor}</td>
        <td><span class="risk-tag risk-${road.riskLevel.toLowerCase()}">${road.riskLevel}</span></td>
        <td>
          <button class="btn-action ${isClosed ? 'btn-approve' : 'btn-dismiss'}" data-toggle-road="${road.id}" style="padding:4px 8px; font-size:10px;">
            ${isClosed ? 'Reopen' : 'Close Road'}
          </button>
        </td>
      `;

      const btn = tr.querySelector(`[data-toggle-road="${road.id}"]`);
      if (btn) {
        btn.onclick = () => {
          store.setRoadStatus(road.id, isClosed ? 'clear' : 'closed');
          this.showToast(`Updated ${road.name} to ${isClosed ? 'CLEAR' : 'CLOSED'}.`, 'info');
        };
      }

      container.appendChild(tr);
    });
  }

  renderShelterDetailCards() {
    const container = document.getElementById('dash-shelter-cards');
    if (!container) return;
    container.innerHTML = '';

    const ppsList = store.state.facilities.filter(f => f.type === 'pps');
    ppsList.forEach(fac => {
      const card = document.createElement('div');
      card.className = 'detail-stat-card';
      const occPct = fac.capacity > 0 ? Math.round((fac.currentOccupants / fac.capacity) * 100) : 0;
      const barColor = occPct >= 90 ? '#ef4444' : (occPct >= 70 ? '#b45309' : '#22c55e');

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
          <h4 style="font-size:13px; font-weight:700; color:var(--text-white);">${fac.name}</h4>
          <span style="font-size:10px; font-weight:700; color:${fac.status === 'active' ? '#22c55e' : (fac.status === 'warning' ? '#f59e0b' : '#9fb39c')};">
            ● ${fac.status.toUpperCase()}
          </span>
        </div>
        <div style="font-size:11px; color:var(--text-brown); margin-bottom:6px;">
          Occupancy: <strong>${fac.currentOccupants} / ${fac.capacity} (${occPct}%)</strong>
        </div>
        <div class="mini-progress-track" style="margin-bottom:8px;">
          <div class="mini-progress-fill" style="width:${Math.min(occPct, 100)}%; background:${barColor};"></div>
        </div>
        <div style="font-size:10px; color:var(--text-muted); line-height:1.4;">
          <strong>Amenities:</strong> ${fac.amenities.slice(0, 3).join(', ')}<br>
          <strong>Contact:</strong> ${fac.contact}
        </div>
      `;
      container.appendChild(card);
    });
  }

  renderRequestsSummaryCard() {
    const container = document.getElementById('dash-requests-summary');
    if (!container) return;

    const reqs = store.state.requests;
    const critical = reqs.filter(r => r.urgency === 'critical').length;
    const high = reqs.filter(r => r.urgency === 'high').length;
    const medium = reqs.filter(r => r.urgency === 'medium').length;

    container.innerHTML = `
      <div style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px; margin-bottom:10px;">
        <div class="summary-metric-tile">
          <span class="tile-label">Critical SOS</span>
          <span class="tile-val" style="color:#ef4444;">${critical}</span>
        </div>
        <div class="summary-metric-tile">
          <span class="tile-label">High Priority</span>
          <span class="tile-val" style="color:#f59e0b;">${high}</span>
        </div>
        <div class="summary-metric-tile">
          <span class="tile-label">Moderate</span>
          <span class="tile-val" style="color:#22c55e;">${medium}</span>
        </div>
      </div>
      <div style="font-size:11px; color:var(--text-brown);">
        Latest Request: <strong style="color:var(--text-white);">${reqs[0]?.requester || 'None'}</strong> (${reqs[0]?.need || '--'})
      </div>
    `;
  }

  renderRouteBenchmarkCard() {
    const container = document.getElementById('dash-route-benchmark');
    if (!container) return;

    const routing = store.state.routing;
    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <div>
          <div style="font-size:10px; color:var(--text-brown); text-transform:uppercase; font-weight:700;">A* Dijkstra Calculation Latency</div>
          <div style="font-size:24px; font-weight:800; color:#22c55e;">${routing.recalcTimeMs} ms</div>
        </div>
        <span class="route-status-tag" style="padding:4px 8px; font-size:11px;">PASSABLE BYPASS</span>
      </div>
      <div style="font-size:11px; color:var(--text-muted); background:var(--card-inner); padding:8px; border-radius:6px; border:1px solid var(--border);">
        <div><strong>Origin:</strong> ${routing.originName}</div>
        <div><strong>Destination:</strong> ${routing.destinationName}</div>
        <div><strong>Path Status:</strong> ${routing.pathStatus}</div>
      </div>
    `;
  }

  // ==========================================
  // 3. PAGE 2: MAP & SIMULATION
  // ==========================================
  initMapPage() {
    this.initMapControls();
    this.initSimulationControls();
    this.renderFacilitiesList();
  }

  initMapControls() {
    const keys = ['floodZones', 'roads', 'pps', 'sensors', 'route'];
    keys.forEach(k => {
      const btn = document.getElementById(`layer-btn-${k}`);
      if (btn) {
        btn.onclick = () => {
          const active = btn.classList.toggle('active');
          if (this.mapEngine && this.mapEngine.layerGroups[k]) {
            if (active) this.mapEngine.map.addLayer(this.mapEngine.layerGroups[k]);
            else this.mapEngine.map.removeLayer(this.mapEngine.layerGroups[k]);
          }
        };
      }
    });

    const styleBtn = document.getElementById('map-style-toggle');
    const styles = ['dark', 'street', 'satellite'];
    let sIdx = 0;
    if (styleBtn) {
      styleBtn.onclick = () => {
        sIdx = (sIdx + 1) % styles.length;
        const next = styles[sIdx];
        if (this.mapEngine) this.mapEngine.switchBaseLayer(next);
        styleBtn.textContent = next === 'dark' ? '🗺️ Dark' : (next === 'street' ? '🗺️ Street' : '🗺️ Satellite');
        this.showToast(`Map style changed to: ${next.toUpperCase()}`, 'info');
      };
    }

    const resetBtn = document.getElementById('map-reset-btn');
    if (resetBtn) {
      resetBtn.onclick = () => {
        if (this.mapEngine) this.mapEngine.resetView();
        this.showToast("Map view reset to Bandar Elmina central.", 'info');
      };
    }
  }

  initSimulationControls() {
    const sRain = document.getElementById('slider-rainfall');
    const sSurge = document.getElementById('slider-surge');
    const sRisk = document.getElementById('slider-risk');
    const vRain = document.getElementById('val-rainfall');
    const vSurge = document.getElementById('val-surge');
    const vRisk = document.getElementById('val-risk');

    if (sRain) {
      sRain.oninput = (e) => {
        const val = e.target.value;
        let label = val > 100 ? "Monsoon Deluge" : (val > 60 ? "Heavy Downpour" : (val > 30 ? "Moderate" : "Light Drizzle"));
        if (vRain) vRain.textContent = `${val} mm/h (${label})`;
        store.setSimulationValue('rainfall', val);
        this.clearPresets();
      };
    }
    if (sSurge) {
      sSurge.oninput = (e) => {
        const val = parseFloat(e.target.value).toFixed(2);
        if (vSurge) vSurge.textContent = `+${val} m ${val > 1.2 ? '(Critical Breach)' : '(Surge Rise)'}`;
        store.setSimulationValue('waterSurge', val);
        this.clearPresets();
      };
    }
    if (sRisk) {
      sRisk.oninput = (e) => {
        const val = parseFloat(e.target.value).toFixed(1);
        if (vRisk) vRisk.textContent = `${val}x (${val > 1.8 ? 'High Alert' : 'Standard'})`;
        store.setSimulationValue('riskMultiplier', val);
        this.clearPresets();
      };
    }

    document.querySelectorAll('.preset-btn').forEach(btn => {
      btn.onclick = () => {
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        store.applyScenarioPreset(btn.dataset.preset);
        this.syncSliders();
        this.showToast(`Simulation Scenario: ${btn.textContent}`, 'warning');
      };
    });
  }

  clearPresets() {
    document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
  }

  syncSliders() {
    const sim = store.state.simulation;
    const sRain = document.getElementById('slider-rainfall');
    const sSurge = document.getElementById('slider-surge');
    const sRisk = document.getElementById('slider-risk');
    const vRain = document.getElementById('val-rainfall');
    const vSurge = document.getElementById('val-surge');
    const vRisk = document.getElementById('val-risk');

    if (sRain) sRain.value = sim.rainfall;
    if (sSurge) sSurge.value = sim.waterSurge;
    if (sRisk) sRisk.value = sim.riskMultiplier;
    if (vRain) vRain.textContent = `${sim.rainfall} mm/h`;
    if (vSurge) vSurge.textContent = `+${sim.waterSurge.toFixed(2)} m`;
    if (vRisk) vRisk.textContent = `${sim.riskMultiplier.toFixed(1)}x`;

    const emPill = document.getElementById('emergency-pill');
    const emText = document.getElementById('emergency-level-text');
    if (emText && emPill) {
      const lvl = store.state.emergencyLevel;
      if (lvl === 'RED') {
        emText.textContent = "LEVEL 4: RED DELUGE ALERT";
        emPill.style.color = "#ef4444";
        emPill.style.borderColor = "#ef4444";
        emPill.style.background = "rgba(239, 68, 68, 0.2)";
      } else if (lvl === 'ORANGE') {
        emText.textContent = "LEVEL 3: ORANGE ALERT";
        emPill.style.color = "#f59e0b";
        emPill.style.borderColor = "#b45309";
        emPill.style.background = "rgba(180, 83, 9, 0.15)";
      } else {
        emText.textContent = "LEVEL 1: GREEN NORMAL";
        emPill.style.color = "#22c55e";
        emPill.style.borderColor = "#15803d";
        emPill.style.background = "rgba(21, 128, 61, 0.15)";
      }
    }
  }

  renderFacilitiesList() {
    const container = document.getElementById('map-facilities-list-body');
    if (!container) return;
    container.innerHTML = '';

    const filterBtns = document.querySelectorAll('#fac-filter-group .audit-filter-btn');
    filterBtns.forEach(btn => {
      btn.onclick = () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFacFilter = btn.dataset.facFilter;
        this.renderFacilitiesList();
      };
    });

    const list = store.state.facilities.filter(f => {
      if (this.currentFacFilter === 'all') return true;
      return f.type === this.currentFacFilter;
    });

    list.forEach(fac => {
      const card = document.createElement('div');
      card.className = 'facility-card-item';
      const occPct = fac.capacity > 0 ? Math.round((fac.currentOccupants / fac.capacity) * 100) : 0;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:4px;">
          <span style="font-size:10px; font-weight:700; text-transform:uppercase; color:var(--green-bright); background:var(--green-pill-bg); padding:2px 6px; border-radius:4px;">
            ${fac.category}
          </span>
          <span style="font-size:10px; font-weight:700; color:${fac.status === 'active' ? '#22c55e' : (fac.status === 'warning' ? '#f59e0b' : '#9fb39c')};">
            ● ${fac.status.toUpperCase()}
          </span>
        </div>
        <h4 style="font-size:13px; font-weight:700; color:var(--text-white); margin-bottom:4px;">${fac.name}</h4>
        <div style="font-size:11px; color:var(--text-brown); margin-bottom:6px;">
          ${fac.capacity > 0 ? `Occupancy: <strong>${fac.currentOccupants} / ${fac.capacity} (${occPct}%)</strong> • ` : ''}
          ${fac.contact}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <small style="color:var(--text-muted); font-size:10px;">${fac.amenities.slice(0, 2).join(', ')}</small>
          <button class="btn-action btn-map-view" data-focus-fac="${fac.id}" style="padding:3px 8px; font-size:10px;">
            📍 Focus on Map
          </button>
        </div>
      `;

      const btn = card.querySelector(`[data-focus-fac="${fac.id}"]`);
      if (btn) {
        btn.onclick = () => {
          if (this.mapEngine) {
            this.mapEngine.focusLocation(fac.coordinates[0], fac.coordinates[1], 16);
            this.showToast(`Centered map on: ${fac.name}`, 'info');
          }
        };
      }

      container.appendChild(card);
    });
  }

  // ==========================================
  // 4. PAGE 3: REPORTS & OPERATIONS
  // ==========================================
  initReportsPage() {
    this.renderDecisions();
    this.renderOutstandingRequests();
    this.renderVerificationPanel();

    const approveAllBtn = document.getElementById('btn-approve-all');
    if (approveAllBtn) {
      approveAllBtn.onclick = () => {
        const c = store.approveAllCriticalDecisions();
        if (c > 0) this.showToast(`${c} critical operations approved.`, 'success');
        else this.showToast("No critical actions pending approval.", 'info');
      };
    }

    const autoMatchBtn = document.getElementById('btn-auto-match-all');
    if (autoMatchBtn) {
      autoMatchBtn.onclick = () => {
        const c = store.autoMatchAllRequests();
        if (c > 0) this.showToast(`${c} requests matched with nearby relief assets!`, 'success');
        else this.showToast("No pending requests to match.", 'info');
      };
    }
  }

  renderDecisions() {
    const container = document.getElementById('decisions-list-container');
    if (!container) return;
    container.innerHTML = '';

    const decs = store.state.decisions;
    const pendingCount = decs.filter(d => d.status === 'pending').length;
    const navReportsBadge = document.getElementById('nav-reports-badge');
    if (navReportsBadge) navReportsBadge.textContent = pendingCount;

    decs.forEach(dec => {
      if (dec.status === 'dismissed') return;
      const isApp = dec.status === 'approved';
      const card = document.createElement('div');
      card.className = `decision-card severity-${dec.severity} ${isApp ? 'status-approved' : ''}`;

      card.innerHTML = `
        <div class="dec-header">
          <div>
            <span style="font-size:10px; color:var(--text-muted); font-weight:700;">${dec.id} &bull; ${dec.category}</span>
            <h4 class="dec-title">${dec.title}</h4>
          </div>
          <span class="dec-badge ${isApp ? 'badge-approved' : `badge-${dec.severity}`}">${isApp ? 'APPROVED' : dec.severity.toUpperCase()}</span>
        </div>
        <p class="dec-desc">${dec.description}</p>
        <div class="dec-impact">⚡ Impact Analysis: ${dec.impact}</div>
        <div class="dec-actions">
          ${!isApp ? `
            <button class="btn-action btn-approve" data-dec-approve="${dec.id}">✅ ${dec.suggestedAction}</button>
            <button class="btn-action btn-map-view" data-dec-view="${dec.id}">🧭 Map View</button>
            <button class="btn-action btn-dismiss" data-dec-dismiss="${dec.id}">Dismiss</button>
          ` : `
            <span style="font-size:11px; color:#22c55e; font-weight:700;">✓ Action Authorized &amp; Enforced by PKOB Command</span>
          `}
        </div>
      `;

      const appBtn = card.querySelector(`[data-dec-approve="${dec.id}"]`);
      if (appBtn) {
        appBtn.onclick = () => {
          store.approveDecision(dec.id);
          this.showToast(`Action Authorized: ${dec.title}`, 'success');
        };
      }
      const viewBtn = card.querySelector(`[data-dec-view="${dec.id}"]`);
      if (viewBtn) {
        viewBtn.onclick = () => {
          this.switchPage('page-map');
          if (this.mapEngine) {
            if (dec.actionType === 'reroute_guthrie') this.mapEngine.focusLocation(3.1755, 101.5020, 15);
            else if (dec.actionType === 'activate_pps_denai') this.mapEngine.focusLocation(3.1620, 101.5150, 16);
            else this.mapEngine.focusLocation(3.1835, 101.5080, 15);
          }
        };
      }
      const disBtn = card.querySelector(`[data-dec-dismiss="${dec.id}"]`);
      if (disBtn) {
        disBtn.onclick = () => {
          store.dismissDecision(dec.id);
          this.showToast(`Recommendation ${dec.id} dismissed.`, 'info');
        };
      }
      container.appendChild(card);
    });
  }

  renderOutstandingRequests() {
    const container = document.getElementById('requests-list-container');
    if (!container) return;
    container.innerHTML = '';

    const filterBtns = document.querySelectorAll('#request-filter-group .audit-filter-btn');
    filterBtns.forEach(b => {
      b.onclick = () => {
        filterBtns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        this.currentReqFilter = b.dataset.reqFilter;
        this.renderOutstandingRequests();
      };
    });

    const list = store.state.requests.filter(r => {
      if (this.currentReqFilter === 'all') return true;
      if (this.currentReqFilter === 'pending') return r.status === 'pending';
      if (this.currentReqFilter === 'matched') return r.status === 'matched';
      if (this.currentReqFilter === 'dispatched') return r.status === 'dispatched' || r.status === 'resolved';
      return true;
    });

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">No requests found in this category.</div>`;
      return;
    }

    list.forEach(req => {
      const card = document.createElement('div');
      card.className = 'request-card';
      const urgColor = req.urgency === 'critical' ? '#ef4444' : (req.urgency === 'high' ? '#b45309' : '#15803d');
      const isPend = req.status === 'pending';
      const isMat = req.status === 'matched';
      let mClass = isPend ? 'match-pending' : (isMat ? 'match-assigned' : 'match-dispatched');
      let mText = isPend ? '⚠️ Unassigned (Awaiting Assets)' : (isMat ? `✓ Matched: ${req.matchedResource} (ETA: ${req.eta})` : `🚀 Dispatched: ${req.matchedResource}`);

      card.innerHTML = `
        <div class="req-header">
          <span class="req-id">${req.id}</span>
          <span class="req-urgency" style="background:${urgColor}22; color:${urgColor}; border:1px solid ${urgColor};">${req.urgency.toUpperCase()}</span>
        </div>
        <div>
          <div class="req-requester">${req.requester}</div>
          <div class="req-location">📍 ${req.location} &bull; Logged: ${req.timestamp}</div>
        </div>
        <div class="req-need">
          <strong>Assistance Need:</strong> ${req.need} <br>
          <small style="color:var(--text-brown);">Required Resource: <strong>${req.requiredResource}</strong></small>
        </div>
        <div class="req-match-box ${mClass}"><span>${mText}</span></div>
        <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:4px;">
          <button class="btn-action btn-map-view" data-req-locate="${req.id}" style="padding:4px 8px; font-size:10px;">📍 Location</button>
          ${isPend ? `<button class="btn-action btn-approve" data-req-match="${req.id}" style="padding:4px 8px; font-size:10px;">⚡ Match Asset</button>` : ''}
          ${isMat ? `<button class="btn-action btn-approve" data-req-dispatch="${req.id}" style="padding:4px 8px; font-size:10px; background:#15803d;">🚀 Dispatch Asset</button>` : ''}
        </div>
      `;

      const locBtn = card.querySelector(`[data-req-locate="${req.id}"]`);
      if (locBtn) {
        locBtn.onclick = () => {
          this.switchPage('page-map');
          if (this.mapEngine && req.coordinates) {
            this.mapEngine.focusLocation(req.coordinates[0], req.coordinates[1], 16);
            this.showToast(`Centered map on resident: ${req.id}`, 'info');
          }
        };
      }
      const matBtn = card.querySelector(`[data-req-match="${req.id}"]`);
      if (matBtn) {
        matBtn.onclick = () => {
          store.matchRequest(req.id);
          this.showToast(`Request ${req.id} successfully matched with asset!`, 'success');
        };
      }
      const disBtn = card.querySelector(`[data-req-dispatch="${req.id}"]`);
      if (disBtn) {
        disBtn.onclick = () => {
          store.dispatchRequest(req.id);
          this.showToast(`Asset dispatched to ${req.id}!`, 'success');
        };
      }

      container.appendChild(card);
    });
  }

  renderVerificationPanel() {
    this.renderAuditLogs();

    const filterBtns = document.querySelectorAll('#audit-filter-group .audit-filter-btn');
    filterBtns.forEach(b => {
      b.onclick = () => {
        filterBtns.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        this.currentLogFilter = b.dataset.logFilter;
        this.renderAuditLogs();
      };
    });

    const expBtn = document.getElementById('btn-export-audit');
    if (expBtn) {
      expBtn.onclick = () => {
        const jsonStr = store.exportAuditLogJSON();
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `NADITOWN_Audit_Report_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showToast("Official audit report downloaded (JSON).", 'success');
      };
    }
  }

  renderAuditLogs() {
    const container = document.getElementById('audit-log-stream');
    if (!container) return;
    container.innerHTML = '';

    const vrf = store.state.verification;
    const vrfMatch = document.getElementById('vrf-match-ratio');
    const vrfApp = document.getElementById('vrf-approvals-count');
    const vrfHash = document.getElementById('vrf-hash-val');
    const bCount = document.getElementById('badge-logs-count');

    if (vrfMatch) {
      const tot = store.state.requests.length;
      const mat = store.state.requests.filter(r => r.status !== 'pending').length;
      const pct = tot > 0 ? Math.round((mat / tot) * 100) : 0;
      vrfMatch.textContent = `${mat} / ${tot} Requests (${pct}%)`;
    }
    if (vrfApp) vrfApp.textContent = `${vrf.totalApprovalsCount} Authorized`;
    if (vrfHash) vrfHash.textContent = vrf.systemAuditHash;
    if (bCount) bCount.textContent = store.state.eventLogs.length;

    const filtered = store.state.eventLogs.filter(l => this.currentLogFilter === 'ALL' || l.category === this.currentLogFilter);
    filtered.forEach(log => {
      const d = document.createElement('div');
      d.className = 'audit-entry';
      d.innerHTML = `
        <div class="audit-entry-top">
          <span class="audit-cat cat-${log.category || 'INFO'}">${log.category || 'EVENT'}</span>
          <span class="audit-time">${log.timestamp}</span>
        </div>
        <div style="color:#ffffff; line-height:1.3;">${log.message}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:2px;">
          <span style="font-size:9px; color:var(--text-muted);">Source: ${log.author || 'System'}</span>
          <span class="audit-hash">${log.auditHash || 'VRF-HASH'}</span>
        </div>
      `;
      container.appendChild(d);
    });
  }

  // ==========================================
  // 5. PAGE 4: COMMUNITY REQUESTS
  // ==========================================
  initCommunityPage() {
    this.renderCommunityRequestsBoard();
    this.initCommunityForm();

    const commFilters = document.querySelectorAll('#comm-filter-group .audit-filter-btn');
    commFilters.forEach(b => {
      b.onclick = () => {
        commFilters.forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        this.currentCommFilter = b.dataset.commFilter;
        this.renderCommunityRequestsBoard();
      };
    });
  }

  initCommunityForm() {
    const submitBtn = document.getElementById('comm-submit-btn');
    if (!submitBtn) return;

    submitBtn.onclick = (e) => {
      e.preventDefault();
      const name = document.getElementById('comm-inp-name')?.value.trim();
      const phone = document.getElementById('comm-inp-phone')?.value.trim();
      const loc = document.getElementById('comm-inp-location')?.value.trim();
      const need = document.getElementById('comm-inp-need')?.value.trim();
      const urg = document.getElementById('comm-inp-urgency')?.value;
      const res = document.getElementById('comm-inp-resource')?.value;

      if (!name || !loc || !need) {
        alert("Please complete all required fields (Name, Location, Assistance Needed).");
        return;
      }

      const newReq = store.addCitizenRequest({
        requester: `${name} ${phone ? '(' + phone + ')' : ''}`,
        location: loc,
        need: need,
        urgency: urg,
        requiredResource: res,
        coordinates: [3.1800 + (Math.random() - 0.5) * 0.02, 101.5050 + (Math.random() - 0.5) * 0.02]
      });

      // Clear form
      document.getElementById('comm-inp-name').value = '';
      document.getElementById('comm-inp-phone').value = '';
      document.getElementById('comm-inp-location').value = '';
      document.getElementById('comm-inp-need').value = '';

      this.renderCommunityRequestsBoard();
      this.showToast(`Emergency Request ${newReq.id} recorded into the live response queue!`, 'success');
    };
  }

  renderCommunityRequestsBoard() {
    const container = document.getElementById('community-requests-board');
    if (!container) return;
    container.innerHTML = '';

    const list = store.state.requests.filter(r => {
      if (this.currentCommFilter === 'all') return true;
      if (this.currentCommFilter === 'pending') return r.status === 'pending';
      if (this.currentCommFilter === 'matched') return r.status === 'matched';
      if (this.currentCommFilter === 'dispatched') return r.status === 'dispatched' || r.status === 'resolved';
      return true;
    });

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:30px; color:var(--text-muted); font-size:12px;">No community requests found under this status.</div>`;
      return;
    }

    list.forEach(req => {
      const card = document.createElement('div');
      card.className = 'community-request-tile';

      let statusBadge = `<span class="badge-status-closed">⚠️ Pending Triage</span>`;
      if (req.status === 'matched') statusBadge = `<span class="badge-status-hazard">✓ Asset Matched</span>`;
      else if (req.status === 'dispatched') statusBadge = `<span class="badge-status-clear">🚀 Responders Dispatched</span>`;

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:6px;">
          <div>
            <span style="font-family:monospace; font-weight:800; color:var(--green-bright); font-size:12px;">${req.id}</span>
            <span style="font-size:10px; color:var(--text-brown); margin-left:6px;">${req.timestamp}</span>
          </div>
          ${statusBadge}
        </div>
        <h4 style="font-size:13px; font-weight:700; color:var(--text-white); margin-bottom:4px;">${req.requester}</h4>
        <div style="font-size:11px; color:var(--text-brown); margin-bottom:6px;">📍 ${req.location}</div>
        <div style="background:var(--brown-surface); padding:8px; border-radius:6px; font-size:11px; margin-bottom:8px; border-left:3px solid var(--brown-amber);">
          <strong>Need:</strong> ${req.need}<br>
          <small style="color:var(--text-muted);">Required Asset: <strong>${req.requiredResource}</strong></small>
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; font-size:11px;">
          <span style="color:var(--text-muted);">${req.matchedResource ? `Assigned: <strong style="color:var(--text-white);">${req.matchedResource}</strong>` : 'Awaiting Dispatch'}</span>
          ${req.status === 'pending' ? `
            <button class="btn-action btn-approve" data-comm-match="${req.id}" style="padding:4px 8px; font-size:10px;">
              ⚡ Match &amp; Dispatch
            </button>
          ` : `
            <span style="color:#22c55e; font-weight:700; font-size:10px;">ETA: ${req.eta}</span>
          `}
        </div>
      `;

      const matchBtn = card.querySelector(`[data-comm-match="${req.id}"]`);
      if (matchBtn) {
        matchBtn.onclick = () => {
          store.matchRequest(req.id);
          this.showToast(`Request ${req.id} matched and assigned!`, 'success');
        };
      }

      container.appendChild(card);
    });
  }

  // ==========================================
  // 6. REACTIVE STATE SUBSCRIPTIONS
  // ==========================================
  setupSubscriptions() {
    store.subscribe('roads_updated', () => {
      this.updateRoadKPIs();
      this.updateRoutingKPIs();
      this.renderRoadsDetailTable();
      this.renderDecisions();
    });

    store.subscribe('facility_updated', () => {
      this.updateShelterKPIs();
      this.renderShelterDetailCards();
      this.renderFacilitiesList();
    });

    store.subscribe('resources_updated', () => {
      this.updateShelterKPIs();
    });

    store.subscribe('request_updated', () => {
      this.updateRequestsKPIs();
      this.renderRequestsSummaryCard();
      this.renderOutstandingRequests();
      this.renderCommunityRequestsBoard();
      this.renderAuditLogs();
    });

    store.subscribe('request_added', () => {
      this.updateRequestsKPIs();
      this.renderRequestsSummaryCard();
      this.renderOutstandingRequests();
      this.renderCommunityRequestsBoard();
      this.renderAuditLogs();
    });

    store.subscribe('decision_updated', () => {
      this.renderDecisions();
      this.renderAuditLogs();
    });

    store.subscribe('route_recalculated', () => {
      this.updateRoutingKPIs();
      this.renderRouteBenchmarkCard();
    });

    store.subscribe('log_added', () => {
      this.renderAuditLogs();
      this.updateRoutingKPIs();
    });

    store.subscribe('verification_updated', () => {
      this.renderAuditLogs();
    });
  }

  // ==========================================
  // 7. TOAST NOTIFICATIONS
  // ==========================================
  showToast(msg, type = 'info') {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast';
    if (type === 'success') t.style.borderLeftColor = 'var(--green-bright)';
    else if (type === 'warning') t.style.borderLeftColor = 'var(--brown-amber)';
    else if (type === 'danger') t.style.borderLeftColor = 'var(--accent-red)';
    else t.style.borderLeftColor = 'var(--green-primary)';
    t.innerHTML = `<span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(50px)';
      setTimeout(() => t.remove(), 400);
    }, 3500);
  }
}
