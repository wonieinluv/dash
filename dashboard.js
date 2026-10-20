/**
 * NADITOWN - Dashboard Component Module (Ahli 2: Ana)
 * Bertanggungjawab untuk:
 * 1. Paparan KPI Rangkaian Jalan, Kapasiti PPS, Permintaan & Pengiraan Laluan.
 * 2. Panel Sokongan Keputusan (Cadangan & Tindakan Pengendali).
 * 3. Senarai Permintaan Tertunggak & Padanan Sumber.
 * 4. Verifikasi Masa Pengiraan, Padanan & Log Audit.
 * 5. Kawalan Simulasi & Sliders Pengendali.
 */

import { store } from './store.js';

export class Dashboard {
  constructor(mapEngine = null) {
    this.mapEngine = mapEngine;
    this.currentReqFilter = 'all';
    this.currentLogFilter = 'ALL';
  }

  init(mapEngineInstance = null) {
    if (mapEngineInstance) this.mapEngine = mapEngineInstance;

    this.initClock();
    this.initKPIs();
    this.initSimulationControls();
    this.initTabs();
    this.initDecisionsPanel();
    this.initRequestsPanel();
    this.initVerificationPanel();
    this.initModal();
    this.setupSubscriptions();

    console.log("NADITOWN: Dashboard Component (Ahli 2) berjaya diinisialisasi.");
  }

  setMapEngine(mapEngine) {
    this.mapEngine = mapEngine;
  }

  // ==========================================
  // 1. JAM DIGITAL & STATUS
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

  // ==========================================
  // 2. KPI SUMMARY CARDS
  // ==========================================
  initKPIs() {
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
        badgeEl.textContent = `${closedCount} Terputus`;
        badgeEl.style.color = '#ef4444';
        badgeEl.style.borderColor = '#ef4444';
        badgeEl.style.background = 'rgba(239, 68, 68, 0.15)';
      } else if (hazardCount > 0) {
        badgeEl.textContent = `${hazardCount} Amaran Air`;
        badgeEl.style.color = '#b45309';
        badgeEl.style.borderColor = '#b45309';
        badgeEl.style.background = 'rgba(180, 83, 9, 0.15)';
      } else {
        badgeEl.textContent = `Semua Laluan Jelas`;
        badgeEl.style.color = '#15803d';
        badgeEl.style.borderColor = '#15803d';
        badgeEl.style.background = 'rgba(21, 128, 61, 0.15)';
      }
    }
    if (subtextEl) subtextEl.textContent = `${openCount} Selamat • ${hazardCount} Amaran • ${closedCount} Ditutup`;
    if (pctEl) pctEl.textContent = `${passablePct}% Passable`;
    if (barEl) {
      barEl.style.width = `${passablePct}%`;
      barEl.style.background = passablePct > 70 ? '#15803d' : (passablePct > 40 ? '#b45309' : '#ef4444');
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
    if (countsEl) countsEl.textContent = `(${currentOcc.toLocaleString()} / ${totalCap.toLocaleString()} Mangsa)`;
    if (activeBadge) activeBadge.textContent = `${activePPS.length} PPS Aktif`;
    if (barEl) {
      barEl.style.width = `${Math.min(pct, 100)}%`;
      barEl.style.background = pct > 85 ? '#ef4444' : (pct > 65 ? '#b45309' : '#15803d');
    }

    const res = store.state.resources;
    const foodEl = document.getElementById('badge-food');
    const boatsEl = document.getElementById('badge-boats');
    const fourEl = document.getElementById('badge-4x4');
    if (foodEl) foodEl.textContent = `🍱 MRE: ${res.foodPacks.stockRemaining.toLocaleString()}`;
    if (boatsEl) boatsEl.textContent = `🚤 Bot: ${res.rescueBoats.standby} Sedia`;
    if (fourEl) fourEl.textContent = `🚙 4x4: ${res.fourByFourVehicles.standby} Sedia`;
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
      badgeEl.textContent = `${pending} Menunggu`;
      badgeEl.style.color = pending > 0 ? '#b45309' : '#15803d';
      badgeEl.style.borderColor = pending > 0 ? '#b45309' : '#15803d';
    }
    if (breakdownEl) breakdownEl.textContent = `${pending} Menunggu • ${matched} Dipadan • ${dispatched} Dikerah`;
    if (rateEl) rateEl.textContent = `${matchRate}% Matched`;
    if (barEl) {
      barEl.style.width = `${matchRate}%`;
      barEl.style.background = '#a16207';
    }

    // Tab badges
    const badgeReq = document.getElementById('badge-requests-count');
    if (badgeReq) badgeReq.textContent = pending;
    const countAll = document.getElementById('count-req-all');
    const countPen = document.getElementById('count-req-pending');
    const countMat = document.getElementById('count-req-matched');
    const countDis = document.getElementById('count-req-dispatched');
    if (countAll) countAll.textContent = total;
    if (countPen) countPen.textContent = pending;
    if (countMat) countMat.textContent = matched;
    if (countDis) countDis.textContent = dispatched;
  }

  updateRoutingKPIs() {
    const routing = store.state.routing;
    const logs = store.state.eventLogs;

    const timeEl = document.getElementById('kpi-recalc-time');
    const hazardEl = document.getElementById('kpi-route-hazard-count');
    const verifiedEl = document.getElementById('kpi-verified-count');

    if (timeEl) timeEl.textContent = routing.recalcTimeMs;
    if (hazardEl) hazardEl.textContent = `${routing.bypassedHazards} Bahaya Dilencongkan`;
    if (verifiedEl) verifiedEl.textContent = `${logs.length} Triggers Disahkan`;

    const bannerTag = document.getElementById('banner-route-tag');
    const bannerText = document.getElementById('banner-route-text');
    const bannerStat = document.getElementById('banner-recalc-stat');

    if (bannerTag) {
      bannerTag.textContent = routing.bypassedHazards > 0 ? "LALUAN LENCONGAN AKTIF" : "LALUAN TERUS UTAMA";
      bannerTag.style.background = routing.bypassedHazards > 0 ? "rgba(21, 128, 61, 0.2)" : "rgba(161, 98, 7, 0.2)";
      bannerTag.style.color = routing.bypassedHazards > 0 ? "#22c55e" : "#fcd34d";
    }
    if (bannerText) {
      bannerText.textContent = `${routing.originName} ➔ ${routing.destinationName} (${routing.pathStatus})`;
    }
    if (bannerStat) {
      bannerStat.textContent = `Masa Graf: ${routing.recalcTimeMs} ms | Jarak: ${routing.pathDistanceKm} km | ETA: ~${routing.estimatedTimeMin} min`;
    }

    const vrfCalcTime = document.getElementById('vrf-calc-time');
    if (vrfCalcTime) vrfCalcTime.textContent = `${routing.recalcTimeMs} ms (A* Dijkstra)`;
  }

  // ==========================================
  // 3. KAWALAN SIMULASI & SLIDERS
  // ==========================================
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
        let label = val > 100 ? "Monsun Ekstrem" : (val > 60 ? "Lebat" : (val > 30 ? "Sederhana" : "Renyai"));
        if (vRain) vRain.textContent = `${val} mm/j (${label})`;
        store.setSimulationValue('rainfall', val);
        this.clearPresets();
      };
    }
    if (sSurge) {
      sSurge.oninput = (e) => {
        const val = parseFloat(e.target.value).toFixed(2);
        if (vSurge) vSurge.textContent = `+${val} m ${val > 1.2 ? '(Kritikal)' : '(Limpahan)'}`;
        store.setSimulationValue('waterSurge', val);
        this.clearPresets();
      };
    }
    if (sRisk) {
      sRisk.oninput = (e) => {
        const val = parseFloat(e.target.value).toFixed(1);
        if (vRisk) vRisk.textContent = `${val}x (${val > 1.8 ? 'Tinggi' : 'Piawai'})`;
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
        this.showToast(`Senario dipilih: ${btn.textContent}`, 'warning');
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
    if (vRain) vRain.textContent = `${sim.rainfall} mm/j`;
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

  // ==========================================
  // 4. TAB NAVIGATION
  // ==========================================
  initTabs() {
    const btns = document.querySelectorAll('.tab-btn');
    const panes = document.querySelectorAll('.tab-pane');
    btns.forEach(b => {
      b.onclick = () => {
        btns.forEach(x => x.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        b.classList.add('active');
        const target = document.getElementById(b.dataset.tab);
        if (target) target.classList.add('active');
      };
    });
  }

  // ==========================================
  // 5. DECISION SUPPORT PANEL
  // ==========================================
  initDecisionsPanel() {
    this.renderDecisions();
    const allBtn = document.getElementById('btn-approve-all');
    if (allBtn) {
      allBtn.onclick = () => {
        const c = store.approveAllCriticalDecisions();
        if (c > 0) this.showToast(`${c} tindakan kritikal berjaya diluluskan.`, 'success');
        else this.showToast("Tiada tindakan kritikal belum diluluskan.", 'info');
      };
    }
  }

  renderDecisions() {
    const container = document.getElementById('decisions-list-container');
    if (!container) return;
    container.innerHTML = '';

    const decs = store.state.decisions;
    const pendingCount = decs.filter(d => d.status === 'pending').length;
    const badge = document.getElementById('badge-decisions-count');
    if (badge) badge.textContent = pendingCount;

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
          <span class="dec-badge ${isApp ? 'badge-approved' : `badge-${dec.severity}`}">${isApp ? 'DILULUSKAN' : dec.severity.toUpperCase()}</span>
        </div>
        <p class="dec-desc">${dec.description}</p>
        <div class="dec-impact">⚡ Impak: ${dec.impact}</div>
        <div class="dec-actions">
          ${!isApp ? `
            <button class="btn-action btn-approve" data-dec-approve="${dec.id}">✅ ${dec.suggestedAction}</button>
            <button class="btn-action btn-map-view" data-dec-view="${dec.id}">🧭 Peta</button>
            <button class="btn-action btn-dismiss" data-dec-dismiss="${dec.id}">Tolak</button>
          ` : `
            <span style="font-size:11px; color:#22c55e; font-weight:700;">✓ Tindakan Telah Diluluskan &amp; Dikuatkuasakan oleh Operator</span>
          `}
        </div>
      `;

      const appBtn = card.querySelector(`[data-dec-approve="${dec.id}"]`);
      if (appBtn) {
        appBtn.onclick = () => {
          store.approveDecision(dec.id);
          this.showToast(`Tindakan diluluskan: ${dec.title}`, 'success');
        };
      }
      const viewBtn = card.querySelector(`[data-dec-view="${dec.id}"]`);
      if (viewBtn) {
        viewBtn.onclick = () => {
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
          this.showToast(`Cadangan ${dec.id} ditolak.`, 'info');
        };
      }
      container.appendChild(card);
    });
  }

  // ==========================================
  // 6. OUTSTANDING REQUESTS PANEL
  // ==========================================
  initRequestsPanel() {
    this.renderRequests();
    document.querySelectorAll('#request-filter-group .audit-filter-btn').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('#request-filter-group .audit-filter-btn').forEach(x => x.classList.remove('active'));
        b.classList.add('active');
        this.currentReqFilter = b.dataset.reqFilter;
        this.renderRequests();
      };
    });

    const autoBtn = document.getElementById('btn-auto-match-all');
    if (autoBtn) {
      autoBtn.onclick = () => {
        const c = store.autoMatchAllRequests();
        if (c > 0) this.showToast(`${c} permintaan berjaya dipadankan dengan sumber berhampiran!`, 'success');
        else this.showToast("Tiada permintaan menunggu untuk dipadankan.", 'info');
      };
    }
  }

  renderRequests() {
    const container = document.getElementById('requests-list-container');
    if (!container) return;
    container.innerHTML = '';

    const list = store.state.requests.filter(r => {
      if (this.currentReqFilter === 'all') return true;
      if (this.currentReqFilter === 'pending') return r.status === 'pending';
      if (this.currentReqFilter === 'matched') return r.status === 'matched';
      if (this.currentReqFilter === 'dispatched') return r.status === 'dispatched' || r.status === 'resolved';
      return true;
    });

    if (list.length === 0) {
      container.innerHTML = `<div style="text-align:center; padding:20px; color:var(--text-muted); font-size:12px;">Tiada permintaan dalam kategori ini.</div>`;
      return;
    }

    list.forEach(req => {
      const card = document.createElement('div');
      card.className = 'request-card';
      const urgColor = req.urgency === 'critical' ? '#ef4444' : (req.urgency === 'high' ? '#b45309' : '#15803d');
      const isPend = req.status === 'pending';
      const isMat = req.status === 'matched';
      let mClass = isPend ? 'match-pending' : (isMat ? 'match-assigned' : 'match-dispatched');
      let mText = isPend ? '⚠️ Belum Dipadankan (Menunggu Aset)' : (isMat ? `✓ Dipadankan: ${req.matchedResource} (ETA: ${req.eta})` : `🚀 Dikerahkan: ${req.matchedResource}`);

      card.innerHTML = `
        <div class="req-header">
          <span class="req-id">${req.id}</span>
          <span class="req-urgency" style="background:${urgColor}22; color:${urgColor}; border:1px solid ${urgColor};">${req.urgency.toUpperCase()}</span>
        </div>
        <div>
          <div class="req-requester">${req.requester}</div>
          <div class="req-location">📍 ${req.location} &bull; ${req.timestamp}</div>
        </div>
        <div class="req-need">
          <strong>Keperluan:</strong> ${req.need} <br>
          <small style="color:var(--text-muted);">Diperlukan: <strong>${req.requiredResource}</strong></small>
        </div>
        <div class="req-match-box ${mClass}"><span>${mText}</span></div>
        <div style="display:flex; justify-content:flex-end; gap:6px; margin-top:4px;">
          <button class="btn-action btn-map-view" data-req-locate="${req.id}" style="padding:4px 8px; font-size:10px;">📍 Lokasi</button>
          ${isPend ? `<button class="btn-action btn-approve" data-req-match="${req.id}" style="padding:4px 8px; font-size:10px;">⚡ Padan Sumber Sekarang</button>` : ''}
          ${isMat ? `<button class="btn-action btn-approve" data-req-dispatch="${req.id}" style="padding:4px 8px; font-size:10px; background:#15803d;">🚀 Kerahkan Aset</button>` : ''}
        </div>
      `;

      const locBtn = card.querySelector(`[data-req-locate="${req.id}"]`);
      if (locBtn) {
        locBtn.onclick = () => {
          if (this.mapEngine && req.coordinates) {
            this.mapEngine.focusLocation(req.coordinates[0], req.coordinates[1], 16);
            this.showToast(`Menumpukan peta ke lokasi pemohon ${req.id}`, 'info');
          }
        };
      }
      const matBtn = card.querySelector(`[data-req-match="${req.id}"]`);
      if (matBtn) {
        matBtn.onclick = () => {
          store.matchRequest(req.id);
          this.showToast(`Permintaan ${req.id} berjaya dipadankan!`, 'success');
        };
      }
      const disBtn = card.querySelector(`[data-req-dispatch="${req.id}"]`);
      if (disBtn) {
        disBtn.onclick = () => {
          store.dispatchRequest(req.id);
          this.showToast(`Aset bagi ${req.id} telah dikerahkan!`, 'success');
        };
      }

      container.appendChild(card);
    });
  }

  // ==========================================
  // 7. VERIFICATION & AUDIT PANEL
  // ==========================================
  initVerificationPanel() {
    this.renderAuditLogs();
    document.querySelectorAll('#audit-filter-group .audit-filter-btn').forEach(b => {
      b.onclick = () => {
        document.querySelectorAll('#audit-filter-group .audit-filter-btn').forEach(x => x.classList.remove('active'));
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
        this.showToast("Laporan verifikasi audit digital berjaya dimuat turun (JSON).", 'success');
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
      vrfMatch.textContent = `${mat} / ${tot} Permintaan (${pct}%)`;
    }
    if (vrfApp) vrfApp.textContent = `${vrf.totalApprovalsCount} Diluluskan`;
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
          <span style="font-size:9px; color:var(--text-muted);">Punca: ${log.author || 'Sistem'}</span>
          <span class="audit-hash">${log.auditHash || 'VRF-HASH'}</span>
        </div>
      `;
      container.appendChild(d);
    });
  }

  // ==========================================
  // 8. MODAL PERMINTAAN BAHARU
  // ==========================================
  initModal() {
    const modal = document.getElementById('modal-new-request');
    const openBtn = document.getElementById('btn-new-request-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const submitBtn = document.getElementById('modal-submit-btn');

    if (openBtn) openBtn.onclick = () => modal.style.display = 'flex';
    if (closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    if (cancelBtn) cancelBtn.onclick = () => modal.style.display = 'none';

    if (submitBtn) {
      submitBtn.onclick = () => {
        const name = document.getElementById('modal-inp-name')?.value.trim();
        const loc = document.getElementById('modal-inp-location')?.value.trim();
        const need = document.getElementById('modal-inp-need')?.value.trim();
        const urg = document.getElementById('modal-inp-urgency')?.value;
        const res = document.getElementById('modal-inp-resource')?.value;

        if (!name || !loc || !need) {
          alert("Sila lengkapkan maklumat mangsa.");
          return;
        }

        store.addCitizenRequest({
          requester: name,
          location: loc,
          need: need,
          urgency: urg,
          requiredResource: res,
          coordinates: [3.1800, 101.5050]
        });

        document.getElementById('modal-inp-name').value = '';
        document.getElementById('modal-inp-location').value = '';
        document.getElementById('modal-inp-need').value = '';
        modal.style.display = 'none';
        this.showToast(`Permintaan ${name} didaftarkan!`, 'success');
      };
    }
  }

  // ==========================================
  // 9. SUBSCRIPTIONS
  // ==========================================
  setupSubscriptions() {
    store.subscribe('roads_updated', () => { this.updateRoadKPIs(); this.updateRoutingKPIs(); this.renderDecisions(); });
    store.subscribe('facility_updated', () => this.updateShelterKPIs());
    store.subscribe('resources_updated', () => this.updateShelterKPIs());
    store.subscribe('request_updated', () => { this.updateRequestsKPIs(); this.renderRequests(); this.renderAuditLogs(); });
    store.subscribe('request_added', () => { this.updateRequestsKPIs(); this.renderRequests(); this.renderAuditLogs(); });
    store.subscribe('decision_updated', () => { this.renderDecisions(); this.renderAuditLogs(); });
    store.subscribe('route_recalculated', () => this.updateRoutingKPIs());
    store.subscribe('log_added', () => { this.renderAuditLogs(); this.updateRoutingKPIs(); });
    store.subscribe('verification_updated', () => this.renderAuditLogs());
  }

  // ==========================================
  // 10. TOAST NOTIFICATIONS
  // ==========================================
  showToast(msg, type = 'info') {
    const c = document.getElementById('toast-container');
    if (!c) return;
    const t = document.createElement('div');
    t.className = 'toast';
    if (type === 'success') t.style.borderLeftColor = '#22c55e';
    else if (type === 'warning') t.style.borderLeftColor = '#b45309';
    else if (type === 'danger') t.style.borderLeftColor = '#ef4444';
    else t.style.borderLeftColor = '#15803d';
    t.innerHTML = `<span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateX(50px)';
      setTimeout(() => t.remove(), 400);
    }, 3500);
  }
}

