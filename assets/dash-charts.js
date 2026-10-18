/**
 * STAND-HF Electronic CRF Registry Portal
 * Reusable Dashboard Charts Component Library (DashCharts)
 * 
 * Provides pure SVG & CSS responsive charts for clinical registry dashboards.
 * Independent and reusable across any registry screen.
 */
(function(global){
  'use strict';

  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pct = (a, b) => (b ? Math.round(100 * a / b) : null);
  const PALETTE = ['#1a5fb4','#1e7a4c','#9a5b00','#b3261e','#6b4fbb','#0f7c8c','#7a5c3e','#5b616d'];
  const colourOf = i => PALETTE[i % PALETTE.length];
  const PL = STANDHF_DATA.gdmt.pillars.map(p => [p.key, p.label]);
  const G = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const act = v => PL.filter(([q]) => G(v, 'g.' + q + '.status') === 'Active').length;
  const day = s => new Date(s + 'T00:00:00');
  const addD = (s, n) => { const d = day(s); d.setDate(d.getDate() + n); return d; };
  const has = v => Object.keys(v || {}).some(k => k !== 'done' && v[k] !== '' && v[k] != null && typeof v[k] !== 'object') || (v.g && Object.values(v.g).some(x => x.status));

  function vstat(p, k){
    const v = p.v?.[k] || {};
    if (v.done) return 'Completed';
    const b = p.v?.b?.done ? p.v.b.date : null;
    let late = false, due = false, missed = false;
    if (k !== 'b' && b) {
      const t = k === 'm3' ? 90 : 180, w = k === 'm3' ? 14 : 21, T = new Date();
      late = T > addD(b, t + w);
      due = T >= addD(b, t - w);
      missed = T > addD(b, t + w + 30) && !has(v);
    }
    return missed ? 'Missed' : late ? 'Overdue' : has(v) ? 'In Progress' : due ? 'Due' : 'Not Started';
  }

  const DashCharts = {

    /**
     * Grouped Bars: Site completion breakdown (Baseline, 3M, 6M)
     * @param {Array<{label: string, values: number[]}>} rows
     * @param {Object} [opts]
     */
    groupedBars: function(rows, opts){
      opts = opts || {};
      if (!rows || !rows.length) {
        return '<div class="empty"><i class="ms">bar_chart</i>No sites available for completion chart.</div>';
      }
      const W = opts.width || 620, H = opts.height || 240, pad = 36, top = 16;
      const gw = (W - pad - 10) / rows.length, bw = Math.min(22, gw / 4);
      const cols = ['var(--primary)', 'var(--success)', 'var(--warning)'];

      let g = '';
      [0, 25, 50, 75, 100].forEach(v => {
        const y = H - pad - (H - pad - top) * v / 100;
        g += `<line x1="${pad}" x2="${W - 10}" y1="${y}" y2="${y}" stroke="var(--line)"/>
              <text x="${pad - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${v}%</text>`;
      });

      rows.forEach((r, i) => {
        const x0 = pad + i * gw + (gw - 3 * bw - 8) / 2;
        r.values.forEach((v, j) => {
          const h = (H - pad - top) * (v || 0) / 100;
          g += `<rect x="${x0 + j * (bw + 4)}" y="${H - pad - h}" width="${bw}" height="${h}" rx="5" fill="${cols[j]}">
                  <title>${esc(r.label)}: ${v == null ? '–' : v + '%'}</title>
                </rect>`;
        });
        g += `<text x="${pad + i * gw + gw / 2}" y="${H - pad + 18}" text-anchor="middle" font-size="12" fill="var(--ink-2)">${esc(r.label)}</text>`;
      });

      return `
        <svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Completion rates by site">${g}</svg>
        <div class="legend-row">
          <span><i style="background:var(--primary)"></i>Baseline</span>
          <span><i style="background:var(--success)"></i>3 Months</span>
          <span><i style="background:var(--warning)"></i>6 Months</span>
        </div>
      `;
    },

    /**
     * Donut Chart: Status distribution of registry visits
     * @param {Array|Object} ptsOrCounts
     */
    milestoneDonut: function(ptsOrCounts){
      const counts = { Completed: 0, 'In progress': 0, Due: 0, Overdue: 0, 'Not started': 0 };
      if (Array.isArray(ptsOrCounts)) {
        ptsOrCounts.forEach(p => ['b','m3','m6'].forEach(k => {
          const v = vstat(p, k);
          const key = v === 'Missed' ? 'Overdue' : v === 'In Progress' ? 'In progress' : v === 'Not Started' ? 'Not started' : v;
          counts[key] = (counts[key] || 0) + 1;
        }));
      } else if (typeof ptsOrCounts === 'object' && ptsOrCounts) {
        Object.assign(counts, ptsOrCounts);
      }

      const parts = [
        { label: 'Completed', value: counts.Completed, color: 'var(--success)' },
        { label: 'In progress', value: counts['In progress'], color: 'var(--primary)' },
        { label: 'Due', value: counts.Due, color: 'var(--warning)' },
        { label: 'Overdue', value: counts.Overdue, color: 'var(--error)' },
        { label: 'Not started', value: counts['Not started'], color: 'var(--ink-3)' }
      ];

      const total = parts.reduce((x, p) => x + p.value, 0);
      const R = 54, C = 2 * Math.PI * R;
      let off = 0;

      const segs = parts.filter(p => p.value > 0).map(p => {
        const len = total ? C * p.value / total : 0;
        const s = `<circle cx="70" cy="70" r="${R}" fill="none" stroke="${p.color}" stroke-width="18"
                    stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-off}"
                    transform="rotate(-90 70 70)">
                    <title>${p.label}: ${p.value}</title>
                  </circle>`;
        off += len;
        return s;
      }).join('');

      return `
        <div class="donut-wrap">
          <svg viewBox="0 0 140 140" role="img" aria-label="Visit milestone status breakdown">
            <circle cx="70" cy="70" r="${R}" fill="none" stroke="var(--soft-2)" stroke-width="18"/>
            ${segs}
            <text x="70" y="68" text-anchor="middle" font-size="22" font-weight="600" fill="var(--ink)">${total}</text>
            <text x="70" y="86" text-anchor="middle" font-size="11" fill="var(--ink-3)">visits</text>
          </svg>
          <ul class="legend-list">
            ${parts.map(p => `<li><i style="background:${p.color}"></i><span>${p.label}</span><b>${p.value}</b></li>`).join('')}
          </ul>
        </div>
      `;
    },

    /**
     * Stacked Recruitment Trajectory by site (last 6 months)
     * @param {Array} pts
     * @param {Array<{code: string, name: string}>} sites
     * @param {Object} [opts]
     */
    enrolmentBars: function(pts, sites, opts){
      opts = opts || {};
      const now = new Date(), months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({ y: d.getFullYear(), m: d.getMonth(), lbl: d.toLocaleDateString('en-GB', { month: 'short' }), counts: {} });
      }

      (pts || []).forEach(p => {
        if (!p.consent) return;
        const d = day(p.consent);
        const h = months.find(x => x.y === d.getFullYear() && x.m === d.getMonth());
        if (h) h.counts[p.site] = (h.counts[p.site] || 0) + 1;
      });

      const codes = (sites || []).map(s => s.code);
      const totals = months.map(m => Object.values(m.counts).reduce((x, y) => x + y, 0));
      const max = Math.max(1, ...totals);
      const W = opts.width || 620, H = opts.height || 240, pad = 36, top = 16;
      const gw = (W - pad - 10) / 6, bw = Math.min(36, gw * 0.55);

      let g = '';
      [0, 0.5, 1].forEach(f => {
        const y = H - pad - (H - pad - top) * f;
        g += `<line x1="${pad}" x2="${W - 10}" y1="${y}" y2="${y}" stroke="var(--line)"/>
              <text x="${pad - 6}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--ink-3)">${Math.round(max * f)}</text>`;
      });

      months.forEach((m, i) => {
        const x = pad + i * gw + (gw - bw) / 2;
        let base = H - pad;
        codes.forEach((c, ci) => {
          const v = m.counts[c] || 0;
          if (!v) return;
          const h = (H - pad - top) * v / max;
          base -= h;
          g += `<rect x="${x}" y="${base}" width="${bw}" height="${h}" fill="${colourOf(ci)}">
                  <title>${esc(c)} · ${m.lbl}: ${v} patients</title>
                </rect>`;
        });
        g += `<text x="${x + bw/2}" y="${H - pad + 18}" text-anchor="middle" font-size="12" fill="var(--ink-2)">${m.lbl}</text>`;
        if (totals[i]) {
          g += `<text x="${x + bw/2}" y="${base - 6}" text-anchor="middle" font-size="12" font-weight="600" fill="var(--ink)">${totals[i]}</text>`;
        }
      });

      const legend = codes.map((c, ci) => `<span><i style="background:${colourOf(ci)}"></i>${esc(c)}</span>`).join('');
      return `
        <svg class="chart-svg" viewBox="0 0 ${W} ${H}" role="img" aria-label="Monthly patient intake by centre">${g}</svg>
        <div class="legend-row">${legend}</div>
      `;
    },

    /**
     * Horizontal Ranking Bars for investigators or entities
     * @param {Array<{label: string, sub?: string, value: number, color?: string}>} items
     */
    hbars: function(items){
      if (!items || !items.length) {
        return '<div class="empty"><i class="ms">groups</i>No team members found.</div>';
      }
      const max = Math.max(1, ...items.map(i => i.value));
      return `
        <div class="hbars">
          ${items.map(i => `
            <div class="hbar-row">
              <div class="hbar-label">
                <b>${esc(i.label)}</b>
                <small>${esc(i.sub || '')}</small>
              </div>
              <div class="hbar-track" role="img" aria-label="${esc(i.label)}: ${i.value} patients">
                <i style="width:${100 * i.value / max}%;background:${i.color || 'var(--primary)'}"></i>
              </div>
              <span class="hbar-val">${i.value}</span>
            </div>
          `).join('')}
        </div>
      `;
    },

    /**
     * Circular radial dials for study phase progress
     * @param {Array} pts
     */
    phaseDials: function(pts){
      const n = (pts || []).length;
      if (!n) return '<div class="empty"><i class="ms">donut_large</i>No patients enrolled yet.</div>';
      const R = 46, C = 2 * Math.PI * R;
      const VK = [['b','Baseline'],['m3','3 Months'],['m6','6 Months']];

      return VK.map(([k, lbl]) => {
        const done = pts.filter(p => p.v?.[k]?.done).length;
        const pVal = pct(done, n) || 0;
        const inprog = pts.filter(p => !p.v?.[k]?.done && vstat(p, k) === 'In Progress').length;
        const over = pts.filter(p => ['Overdue','Missed'].includes(vstat(p, k))).length;
        const colour = over ? 'var(--error)' : pVal >= 100 ? 'var(--success)' : 'var(--primary)';

        return `
          <div class="ring-wrap">
            <div class="dial">
              <svg viewBox="0 0 120 120" role="img" aria-label="${lbl}: ${pVal}% complete">
                <circle cx="60" cy="60" r="${R}" fill="none" stroke="var(--soft)" stroke-width="12"/>
                <circle cx="60" cy="60" r="${R}" fill="none" stroke="${colour}" stroke-width="12" stroke-linecap="round"
                  stroke-dasharray="${C * pVal / 100} ${C}" transform="rotate(-90 60 60)"/>
              </svg>
            </div>
            <div class="pct">${pVal}%</div>
            <div class="lbl">${lbl}</div>
            <div class="cnt">
              ${done} of ${n} complete${inprog ? ' · ' + inprog + ' in progress' : ''}${over ? ' · ' + over + ' overdue' : ''}
            </div>
          </div>
        `;
      }).join('');
    },

    /**
     * GDMT 4 Foundational Pillars Progress Panel (DSH-03)
     * @param {Array} pts
     */
    gdmtBreakdown: function(pts){
      const n = (pts || []).length;
      if (!n) return '<div class="empty"><i class="ms">medication</i>No patients to analyze.</div>';

      const pillarCounts = { arni: 0, bb: 0, mra: 0, sg: 0 };
      const reasons = {};

      pts.forEach(p => {
        const last = ['m6','m3','b'].find(k => p.v?.[k]?.done);
        if (!last) return;
        const v = p.v[last];
        PL.forEach(([q]) => {
          if (G(v, 'g.' + q + '.status') === 'Active') pillarCounts[q]++;
        });
        if (v.rs) {
          Object.entries(v.rs).forEach(([rCode, active]) => {
            if (active) reasons[rCode] = (reasons[rCode] || 0) + 1;
          });
        }
      });

      const R_NAMES = STANDHF_DATA.gdmt.notUsedReasons;

      return `
        <div class="gdmt-grid">
          <div class="gdmt-card p1">
            <div class="gdmt-head">
              <span class="gdmt-title">1. ARNI (Sacubitril+Valsartan)</span>
              <span class="gdmt-val">${pct(pillarCounts.arni, n) ?? 0}%</span>
            </div>
            <div class="gdmt-bar"><i style="width:${pct(pillarCounts.arni, n) ?? 0}%;background:var(--brand-magenta)"></i></div>
            <small class="muted">${pillarCounts.arni} of ${n} patients on ARNI</small>
          </div>

          <div class="gdmt-card p2">
            <div class="gdmt-head">
              <span class="gdmt-title">2. Beta-blocker</span>
              <span class="gdmt-val">${pct(pillarCounts.bb, n) ?? 0}%</span>
            </div>
            <div class="gdmt-bar"><i style="width:${pct(pillarCounts.bb, n) ?? 0}%;background:var(--primary)"></i></div>
            <small class="muted">${pillarCounts.bb} of ${n} patients on BB</small>
          </div>

          <div class="gdmt-card p3">
            <div class="gdmt-head">
              <span class="gdmt-title">3. MRA</span>
              <span class="gdmt-val">${pct(pillarCounts.mra, n) ?? 0}%</span>
            </div>
            <div class="gdmt-bar"><i style="width:${pct(pillarCounts.mra, n) ?? 0}%;background:var(--warning)"></i></div>
            <small class="muted">${pillarCounts.mra} of ${n} patients on MRA</small>
          </div>

          <div class="gdmt-card p4">
            <div class="gdmt-head">
              <span class="gdmt-title">4. SGLT2 inhibitor</span>
              <span class="gdmt-val">${pct(pillarCounts.sg, n) ?? 0}%</span>
            </div>
            <div class="gdmt-bar"><i style="width:${pct(pillarCounts.sg, n) ?? 0}%;background:var(--success)"></i></div>
            <small class="muted">${pillarCounts.sg} of ${n} patients on SGLT2i</small>
          </div>
        </div>

        <div style="margin-top:16px">
          <div style="font-size:12px;font-weight:600;color:var(--ink-2);margin-bottom:6px">Documented Clinical Reasons for Incomplete GDMT:</div>
          <div class="reason-tags">
            ${Object.entries(reasons).map(([code, cnt]) => `
              <span class="reason-tag"><b>${R_NAMES[code] || code}:</b> ${cnt} patients</span>
            `).join('') || '<span class="muted" style="font-size:12px">None documented or fully optimized across all 4 pillars.</span>'}
          </div>
        </div>
      `;
    },

    /**
     * Longitudinal Clinical Trajectories & Outcomes Panel (DSH-04)
     * @param {Array} pts
     * @param {Object} st
     */
    trajectories: function(pts, st){
      const bNyha = { I: 0, II: 0, III: 0, IV: 0 };
      const m6Nyha = { I: 0, II: 0, III: 0, IV: 0 };
      let m6Count = 0;

      (pts || []).forEach(p => {
        if (p.v?.b?.nyha && bNyha[p.v.b.nyha] !== undefined) bNyha[p.v.b.nyha]++;
        if (p.v?.m6?.done && p.v?.m6?.nyha && m6Nyha[p.v.m6.nyha] !== undefined) {
          m6Nyha[p.v.m6.nyha]++;
          m6Count++;
        }
      });

      const signed = x => (x == null ? '–' : (x > 0 ? '+' : '') + x.toFixed(1));
      const signedInt = x => (x == null ? '–' : (x > 0 ? '+' : '') + Math.round(x));
      const mean = a => (a && a.length ? a.reduce((x, y) => x + y, 0) / a.length : null);
      const mstsMean = mean(st.dMsts);
      const efMean = mean(st.dEf);

      return `
        <div style="display:flex;flex-direction:column;gap:12px">
          <div class="traj-row">
            <div>
              <b>NYHA Functional Class Shift</b>
              <div class="muted" style="font-size:12px">Baseline vs Month 6 Cohort (${m6Count} completed M6)</div>
            </div>
            <div class="traj-stages">
              <span class="traj-pill" title="Baseline Class III/IV">B: ${bNyha.III + bNyha.IV} in Cl III/IV</span>
              <span class="traj-arrow">➔</span>
              <span class="traj-pill" style="background:var(--success-soft);color:var(--on-success-soft)" title="M6 Class I/II">M6: ${m6Nyha.I + m6Nyha.II} in Cl I/II</span>
            </div>
          </div>

          <div class="traj-row">
            <div>
              <b>Functional Capacity (1MSTS)</b>
              <div class="muted" style="font-size:12px">Mean 1-Minute Sit-to-Stand repetitions gain</div>
            </div>
            <b style="font-size:18px;color:${mstsMean > 0 ? 'var(--success)' : 'var(--ink)'}">${signedInt(mstsMean)} reps</b>
          </div>

          <div class="traj-row">
            <div>
              <b>Echocardiographic Recovery (LVEF)</b>
              <div class="muted" style="font-size:12px">Mean left ventricular ejection fraction improvement</div>
            </div>
            <b style="font-size:18px;color:${efMean > 0 ? 'var(--success)' : 'var(--ink)'}">${signed(efMean)}%</b>
          </div>

          <div class="traj-row">
            <div>
              <b>Adverse Hospitalization &amp; Event Rates</b>
              <div class="muted" style="font-size:12px">Reported during longitudinal follow-up</div>
            </div>
            <div style="display:flex;gap:8px">
              <span class="chip ${st.events?.hf ? 'Overdue' : 'good'}">${st.events?.hf || 0} HF Hosp</span>
              <span class="chip ${st.events?.death ? 'Overdue' : 'good'}">${st.events?.death || 0} Death</span>
            </div>
          </div>
        </div>
      `;
    }
  };

  global.DashCharts = DashCharts;
})(window);
