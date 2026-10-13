/**
 * STAND-HF Electronic CRF Registry Portal
 * Reusable Dashboard UI Component Library (DashUI)
 * 
 * Provides accessible, responsive clinical dashboard components:
 * KPI grids, view tabs, hierarchy filter toolbars, league tables,
 * overdue queues, two-team grids, and investigator profile drill-downs.
 */
(function(global){
  'use strict';

  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const initials = s => String(s || '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('') || '?';
  const pct = (a, b) => (b ? Math.round(100 * a / b) : null);
  const day = s => new Date(s + 'T00:00:00');
  const addD = (s, n) => { const d = day(s); d.setDate(d.getDate() + n); return d; };
  const fmtD = d => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const fmtShortD = d => d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  const DAY = 864e5;
  const PL = [['arni','ARNI'],['bb','Beta-blocker'],['mra','MRA'],['sg','SGLT2i']];
  const G = (o, p) => p.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  const act = v => PL.filter(([q]) => G(v, 'g.' + q + '.status') === 'Active').length;
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

  function window_(p, k){
    const b = p.v?.b?.date;
    if (k === 'b' || !b) return null;
    const t = k === 'm3' ? 90 : 180, w = k === 'm3' ? 14 : 21;
    return [addD(b, t - w), addD(b, t + w), t, w];
  }

  function onTime(p, k){
    if (k === 'b' || !p.v?.b?.date || !p.v?.[k]?.done || !p.v?.[k]?.date) return null;
    const t = k === 'm3' ? 90 : 180, w = k === 'm3' ? 14 : 21;
    const d = Math.round((day(p.v[k].date) - day(p.v.b.date)) / DAY);
    return Math.abs(d - t) <= w;
  }

  const chipCls = s => s === 'Missed' ? 'Overdue' : s === 'In Progress' ? 'In' : s === 'Not Started' ? 'Not' : s.split(' ')[0];

  function renderMiniBar(val){
    const v = val || 0;
    return `
      <div style="display:flex;align-items:center;gap:6px">
        <div style="flex:1;height:6px;background:var(--line);border-radius:4px;overflow:hidden">
          <div style="width:${v}%;height:100%;background:${v >= 80 ? 'var(--success)' : 'var(--primary)'};border-radius:4px"></div>
        </div>
        <span style="font-size:11px;font-weight:600;min-width:28px">${val != null ? val + '%' : '–'}</span>
      </div>
    `;
  }

  const DashUI = {

    /**
     * KPI Single Card Renderer
     */
    kpiCard: function(item){
      const icon = item.icon || 'analytics';
      const label = item.label || '';
      const value = item.value ?? '–';
      const sub = item.sub || '';
      const tag = item.tag ? `<span class="tag ${item.tagType || ''}">${item.tag}</span>` : '';
      const icoCls = item.iconBg ? `ico ${item.iconBg}` : 'ico';
      const valStyle = item.alert ? 'color:var(--error)' : item.valueColor ? `color:${item.valueColor}` : '';

      return `
        <div class="kpi">
          <div class="top">
            <span class="${icoCls}"><i class="ms">${icon}</i></span>
            ${tag}
          </div>
          <b style="${valStyle}">${value}</b>
          <span>${label}</span>
          <small>${sub}</small>
        </div>
      `;
    },

    /**
     * KPI Grid Container
     */
    kpiGrid: function(cards){
      return `<section class="kpis">${(cards || []).map(DashUI.kpiCard).join('')}</section>`;
    },

    /**
     * View Switcher Pill Bar (Tabs) for enhanced UX navigation
     * @param {Array<{id: string, label: string, icon: string, badge?: number|string}>} tabs
     * @param {string} activeId
     */
    viewTabs: function(tabs, activeId){
      return `
        <nav class="dash-tabs" aria-label="Dashboard views">
          ${(tabs || []).map(t => `
            <button type="button" class="dash-tab ${t.id === activeId ? 'active' : ''}" data-dashtab="${t.id}">
              <i class="ms" style="font-size:18px">${t.icon}</i>
              <span>${t.label}</span>
              ${t.badge !== undefined && t.badge !== null ? `<span class="tab-badge">${t.badge}</span>` : ''}
            </button>
          `).join('')}
        </nav>
      `;
    },

    /**
     * Interactive Hierarchy Filter Bar (Zone -> Site -> Investigator -> GDMT)
     */
    hierarchyToolbar: function(cfg){
      const zones = cfg.zones || ['North','Central','South'];
      const sites = cfg.sites || [];
      const invs = cfg.investigators || [];
      const filterZone = cfg.filterZone || 'all';
      const filterSite = cfg.filterSite || 'all';
      const filterInv = cfg.filterInv || 'all';
      const filterGdmt = cfg.filterGdmt || 'all';
      const totalCount = cfg.totalCount || 0;
      const filteredCount = cfg.filteredCount || 0;
      const isFiltered = filterZone !== 'all' || filterSite !== 'all' || filterInv !== 'all' || filterGdmt !== 'all';

      return `
        <div class="hierarchy-bar">
          <div class="hierarchy-filters">
            <div class="filter-group">
              <i class="ms">travel_explore</i>
              <label for="selZone" style="font-weight:600">Zone:</label>
              <select id="selZone" class="filter-select">
                <option value="all" ${filterZone==='all'?'selected':''}>All Zones (National)</option>
                ${zones.map(z => `<option value="${z}" ${filterZone===z?'selected':''}>Zone ${z}</option>`).join('')}
              </select>
            </div>

            <div class="filter-group">
              <i class="ms">local_hospital</i>
              <label for="selSite" style="font-weight:600">Site:</label>
              <select id="selSite" class="filter-select">
                <option value="all" ${filterSite==='all'?'selected':''}>All Sites (${sites.length})</option>
                ${sites.map(st => `<option value="${st.code}" ${filterSite===st.code?'selected':''}>${st.code} — ${esc(st.name)}</option>`).join('')}
              </select>
            </div>

            <div class="filter-group">
              <i class="ms">person</i>
              <label for="selInv" style="font-weight:600">Investigator:</label>
              <select id="selInv" class="filter-select">
                <option value="all" ${filterInv==='all'?'selected':''}>All Investigators (${invs.length})</option>
                ${invs.map(iv => `<option value="${esc(iv)}" ${filterInv===iv?'selected':''}>${esc(iv)}</option>`).join('')}
              </select>
            </div>

            <div class="filter-group">
              <i class="ms">pill</i>
              <label for="selGdmt" style="font-weight:600">GDMT:</label>
              <select id="selGdmt" class="filter-select">
                <option value="all" ${filterGdmt==='all'?'selected':''}>All Therapies</option>
                <option value="4" ${filterGdmt==='4'?'selected':''}>4 of 4 Pillars Only</option>
                <option value="incomplete" ${filterGdmt==='incomplete'?'selected':''}>Incomplete (&lt;4 Pillars)</option>
              </select>
            </div>
          </div>

          <div class="hierarchy-meta">
            <span class="filter-badge">
              <i class="ms" style="font-size:14px">filter_list</i>
              Showing ${filteredCount} of ${totalCount} Patients
            </span>
            ${isFiltered ? `
              <button type="button" class="btn btn-sm" id="btnResetFilters">
                <i class="ms">restart_alt</i>Reset
              </button>
            ` : ''}
          </div>
        </div>
      `;
    },

    /**
     * Multi-Site Performance League Table
     */
    siteLeagueTable: function(sites, filteredPts, allPts){
      if (!sites || !sites.length) {
        return '<div class="empty"><i class="ms">location_off</i>No sites match the current filter.</div>';
      }

      const rows = sites.map(st => {
        const sPts = (filteredPts || []).filter(p => p.site === st.code);
        const sAllPts = (allPts || []).filter(p => p.site === st.code);
        const n = sPts.length;
        const bPct = pct(sPts.filter(p => p.v?.b?.done).length, n);
        const m3Pct = pct(sPts.filter(p => p.v?.m3?.done).length, n);
        const m6Pct = pct(sPts.filter(p => p.v?.m6?.done).length, n);

        const fu = sPts.flatMap(p => ['m3','m6'].map(k => onTime(p, k))).filter(x => x !== null);
        const ontimePct = fu.length ? Math.round(100 * fu.filter(Boolean).length / fu.length) : null;
        const overdue = sPts.reduce((c, p) => c + ['m3','m6'].filter(k => ['Overdue','Missed'].includes(vstat(p, k))).length, 0);

        const latestPills = sPts.map(p => {
          const last = ['m6','m3','b'].find(k => p.v?.[k]?.done);
          return last ? act(p.v[last]) : null;
        }).filter(x => x !== null);
        const gdmt4Pct = latestPills.length ? Math.round(100 * latestPills.filter(x => x === 4).length / latestPills.length) : null;
        const invs = [...new Set(sAllPts.map(p => p.inv).filter(Boolean))].join(', ') || 'Pending Assignment';

        return `
          <tr>
            <td>
              <b>${esc(st.code)}</b>
              <div class="muted" style="font-size:12px">${esc(st.name)}</div>
            </td>
            <td><span class="tag" style="background:var(--soft);color:var(--ink-2)">${esc(st.zone || 'Central')}</span></td>
            <td><div style="font-weight:500">${esc(invs)}</div></td>
            <td class="num"><b>${n}</b></td>
            <td>${renderMiniBar(bPct)}</td>
            <td>${renderMiniBar(m3Pct)}</td>
            <td>${renderMiniBar(m6Pct)}</td>
            <td class="num"><b class="${ontimePct >= 80 ? 'good' : ontimePct ? 'warn' : ''}">${ontimePct != null ? ontimePct + '%' : '–'}</b></td>
            <td class="num"><span class="${overdue ? 'chip Overdue' : 'muted'}">${overdue || '0'}</span></td>
            <td class="num"><b style="${gdmt4Pct >= 70 ? 'color:var(--success)' : ''}">${gdmt4Pct != null ? gdmt4Pct + '%' : '–'}</b></td>
            <td>
              <button type="button" class="btn btn-sm" data-export-site="${esc(st.code)}">
                <i class="ms">download</i>CSV
              </button>
            </td>
          </tr>
        `;
      }).join('');

      return `
        <div class="table-wrap sticky-head">
          <table class="rows-rounded">
            <thead>
              <tr>
                <th>Site &amp; Centre Name</th>
                <th>Zone</th>
                <th>Lead Investigator</th>
                <th class="num">Enrolled</th>
                <th>Baseline %</th>
                <th>3 Months %</th>
                <th>6 Months %</th>
                <th class="num">On-Time %</th>
                <th class="num">Overdue</th>
                <th class="num">GDMT 4/4 %</th>
                <th>Quick Export</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    },

    /**
     * Study-wide or Role-scoped Overdue Follow-up Queue Table
     */
    overdueQueueTable: function(pts, getZoneFn){
      const overdueList = [];
      (pts || []).forEach(p => {
        ['m3','m6'].forEach(k => {
          const s = vstat(p, k);
          if (s === 'Overdue' || s === 'Missed') {
            const win = window_(p, k);
            const daysOver = win ? Math.round((new Date() - win[1]) / DAY) : 0;
            overdueList.push({ p, k, s, win, daysOver });
          }
        });
      });

      if (!overdueList.length) {
        return `
          <div style="text-align:center;padding:32px 16px;background:var(--soft);border-radius:14px">
            <i class="ms" style="font-size:32px;color:var(--success);display:block;margin-bottom:8px">check_circle</i>
            <b>No overdue or missed follow-ups across the selected scope!</b>
            <div class="muted" style="margin-top:4px">All scheduled visits are on-time or complete within clinical protocol bounds.</div>
          </div>
        `;
      }

      overdueList.sort((a,b) => b.daysOver - a.daysOver);

      return `
        <div class="table-wrap sticky-head">
          <table>
            <thead>
              <tr>
                <th>Study ID</th>
                <th>Site</th>
                <th>Zone</th>
                <th>Investigator</th>
                <th>Visit Due</th>
                <th>Expected Window</th>
                <th>Status</th>
                <th>Contact Number</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${overdueList.slice(0, 20).map(o => `
                <tr>
                  <td><b>${esc(o.p.id)}</b><div class="muted" style="font-size:11px">${esc(o.p.name || 'Patient')}</div></td>
                  <td><b>${esc(o.p.site)}</b></td>
                  <td><span class="tag" style="background:var(--soft);color:var(--ink-2)">${esc(getZoneFn ? getZoneFn(o.p.site) : 'Central')}</span></td>
                  <td>${esc(o.p.inv || '–')}</td>
                  <td><b>${o.k === 'm3' ? 'Month 3' : 'Month 6'}</b></td>
                  <td><small>${o.win ? fmtShortD(o.win[0]) + ' – ' + fmtShortD(o.win[1]) : '–'}</small></td>
                  <td><span class="chip Overdue">${o.s} (+${o.daysOver}d)</span></td>
                  <td><code>${esc(o.p.contact || '–')}</code></td>
                  <td>
                    <a class="btn btn-sm" href="../records/?patient=${encodeURIComponent(o.p.id)}&tab=${o.k}">
                      <i class="ms">visibility</i>Inspect
                    </a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    },

    /**
     * Two-Teams Hierarchy Presentation Grid (Central Directorate vs Clinical Investigators)
     */
    twoTeamsGrid: function(cfg){
      const centralUsers = cfg.centralUsers || [];
      const invUsers = cfg.invUsers || [];
      const allPts = cfg.allPts || [];
      const auditLogs = cfg.auditLogs || [];
      const aggregateStatsFn = cfg.aggregateStatsFn || (() => ({ ontimeRate: null }));
      const invActive = invUsers.filter(u => u.active).length;

      return `
        <section class="teams-grid">
          <!-- Team 1: Central Monitoring Directorate -->
          <div class="card">
            <div class="card-head">
              <div>
                <h2>Central Monitoring Directorate</h2>
                <small>Study leadership &amp; research export authority ("The boss after super admin")</small>
              </div>
              <a class="btn btn-sm" href="../admin/#users">
                <i class="ms">manage_accounts</i>Manage
              </a>
            </div>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr><th>Member</th><th>Username</th><th>Assigned Zone(s)</th><th>Status</th></tr>
                </thead>
                <tbody>
                  ${centralUsers.map(u => `
                    <tr>
                      <td><b>${esc(u.name)}</b></td>
                      <td><code>${esc(u.username)}</code></td>
                      <td>${u.zones?.length ? u.zones.join(', ') : 'All Zones (National)'}</td>
                      <td><span class="chip ${u.active ? 'In' : 'Not'}">${u.active ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  `).join('') || '<tr><td colspan="4" class="muted">No Central Team users configured.</td></tr>'}
                </tbody>
              </table>
            </div>

            <div style="margin-top:16px;border-top:1px solid var(--line);padding-top:12px">
              <div style="font-size:12px;font-weight:600;color:var(--ink-2);margin-bottom:8px">
                <i class="ms" style="font-size:14px;vertical-align:-2px">receipt_long</i> Central Team Monitoring &amp; Export Audit Log (Latest 5 Events):
              </div>
              <div style="font-size:12px;color:var(--ink-2)">
                ${auditLogs.slice(0, 5).map(a => `
                  <div style="padding:6px 0;border-bottom:1px dashed var(--line);display:flex;justify-content:space-between;align-items:center">
                    <span><b>${esc(a.name)}:</b> <span class="tag info" style="font-size:10px;padding:1px 6px">${esc(a.action)}</span> ${esc(a.details)}</span>
                    <span class="muted" style="font-size:11px;white-space:nowrap">${esc(a.t)}</span>
                  </div>
                `).join('') || '<div class="muted">No central export or audit actions recorded yet.</div>'}
              </div>
            </div>
          </div>

          <!-- Team 2: Clinical Site Investigators -->
          <div class="card">
            <div class="card-head">
              <div>
                <h2>Site Investigators Team</h2>
                <small>Frontline cardiologists entering patient visits at hospital sites · Click to drill into profile</small>
              </div>
              <div style="display:flex;gap:8px">
                <button type="button" class="btn btn-sm" id="btnExportAllInvs">
                  <i class="ms">download</i>CSV
                </button>
                <a class="btn btn-sm" href="../admin/#users">
                  <i class="ms">add</i>Add
                </a>
              </div>
            </div>
            <div style="display:flex;gap:16px;margin-bottom:12px;padding:0 4px">
              <div><b style="font-size:18px;line-height:1">${invUsers.length}</b><div class="muted" style="font-size:11px">Total</div></div>
              <div><b style="font-size:18px;line-height:1;color:var(--success)">${invActive}</b><div class="muted" style="font-size:11px">Active</div></div>
              <div><b style="font-size:18px;line-height:1;color:var(--ink-3)">${invUsers.length - invActive}</b><div class="muted" style="font-size:11px">Inactive</div></div>
            </div>
            <div class="table-wrap">
              <table class="rows-rounded">
                <thead>
                  <tr><th>Investigator</th><th>Assigned Sites</th><th class="num">Patients</th><th class="num">On-Time %</th><th>Drill-Down Profile</th></tr>
                </thead>
                <tbody>
                  ${invUsers.map(u => {
                    const uPts = allPts.filter(p => p.inv === u.name || p.owner === u.username);
                    const uSt = aggregateStatsFn(uPts);
                    return `
                      <tr class="row-link" data-admin-profile="${esc(u.username)}" title="Open ${esc(u.name)} profile dashboard">
                        <td>
                          <button type="button" class="name-link" data-admin-profile="${esc(u.username)}">
                            <b>${esc(u.name)}</b><i class="ms">chevron_right</i>
                          </button>
                          <div class="muted" style="font-size:11px">${esc(u.username)}</div>
                        </td>
                        <td>${u.sites?.join(', ') || '<span class="muted">No Sites</span>'}</td>
                        <td class="num"><b>${uPts.length}</b></td>
                        <td class="num"><b class="${uSt.ontimeRate >= 80 ? 'good' : uSt.ontimeRate ? 'warn' : ''}">${uSt.ontimeRate != null ? uSt.ontimeRate + '%' : '–'}</b></td>
                        <td>
                          <button type="button" class="btn btn-sm" data-admin-profile="${esc(u.username)}">
                            <i class="ms">account_circle</i>View Profile
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('') || '<tr><td colspan="5" class="muted">No Site Investigators configured.</td></tr>'}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      `;
    },

    /**
     * Dedicated Single Investigator Drill-Down Profile Dashboard
     */
    investigatorProfile: function(pu, allPts, aggregateStatsFn){
      const mine = (allPts || []).filter(p => p.inv === pu.name || p.owner === pu.username);
      const st = aggregateStatsFn ? aggregateStatsFn(mine) : {};

      const rows = mine.map(p => `
        <tr>
          <td><b>${esc(p.id)}</b><div class="muted" style="font-size:12px">${esc(p.name || 'Patient')}</div></td>
          <td><b>${esc(p.site)}</b></td>
          <td><span class="chip ${chipCls(vstat(p,'b'))}">${vstat(p,'b')}</span></td>
          <td><span class="chip ${chipCls(vstat(p,'m3'))}">${vstat(p,'m3')}</span></td>
          <td><span class="chip ${chipCls(vstat(p,'m6'))}">${vstat(p,'m6')}</span></td>
          <td class="num">${(p.audit || []).length}</td>
          <td>
            <a class="btn btn-sm" href="../records/?patient=${encodeURIComponent(p.id)}">
              <i class="ms">open_in_new</i>View
            </a>
          </td>
        </tr>
      `).join('');

      const activity = mine.flatMap(p => (p.audit || []).map(a => ({ ...a, pid: p.id }))).sort((a,b) => (b.at || 0) - (a.at || 0)).slice(0, 10);

      const overdueList = [];
      mine.forEach(p => {
        ['m3','m6'].forEach(k => {
          const s = vstat(p, k);
          if (s === 'Overdue' || s === 'Missed') {
            const win = window_(p, k);
            const daysOver = win ? Math.round((new Date() - win[1]) / DAY) : 0;
            overdueList.push({ p, k, s, win, daysOver });
          }
        });
      });

      return `
        <div class="dash-fade-in">
          <div class="dash-breadcrumbs-bar">
            <div class="dash-breadcrumbs">
              <a href="#" id="btnBreadcrumbDash"><i class="ms" style="font-size:16px">space_dashboard</i>Executive Overview</a>
              <span class="sep">/</span>
              <span>Site Investigators</span>
              <span class="sep">/</span>
              <b style="color:var(--ink)">${esc(pu.name)}</b>
            </div>
            <button type="button" class="btn btn-sm" id="btnAdminProfileBack">
              <i class="ms">arrow_back</i>Back to Study Overview
            </button>
          </div>

          <!-- Investigator Profile Header Card -->
          <section class="card">
            <div class="card-head">
              <div style="display:flex;align-items:center;gap:14px">
                <span class="avatar" style="width:48px;height:48px;font-size:18px">${initials(pu.name)}</span>
                <div>
                  <h2 style="font-size:20px;margin:0">${esc(pu.name)}</h2>
                  <div class="muted" style="font-size:13px"><code>${esc(pu.username)}</code> · Assigned: ${pu.sites?.join(', ') || 'No sites'}</div>
                </div>
              </div>
              <div style="display:flex;align-items:center;gap:10px">
                <span class="chip ${pu.active ? 'In' : 'Not'}">${pu.active ? 'Active Clinician' : 'Inactive'}</span>
                <button type="button" class="btn btn-sm" data-export-inv="${esc(pu.username)}">
                  <i class="ms">download</i>Export CSV
                </button>
              </div>
            </div>

            <div class="kpis">
              <div class="kpi">
                <div class="top"><span class="ico"><i class="ms">group</i></span></div>
                <b>${st.n || 0}</b><span>Patients</span><small>Entered by this investigator</small>
              </div>
              <div class="kpi">
                <div class="top"><span class="ico success"><i class="ms">biotech</i></span><span class="tag ${pct(st.b,st.n)>=80?'good':''}">${pct(st.b,st.n)??0}%</span></div>
                <b>${st.b || 0}</b><span>Baseline Complete</span><small>${st.b || 0} of ${st.n || 0} verified</small>
              </div>
              <div class="kpi">
                <div class="top"><span class="ico warn"><i class="ms">event_busy</i></span><span class="tag ${st.overdueCount?'warn':'good'}">${st.overdueCount || 0}</span></div>
                <b>${st.overdueCount || 0}</b><span>Follow-ups Overdue</span><small>Outside window</small>
              </div>
              <div class="kpi">
                <div class="top"><span class="ico brand"><i class="ms">schedule</i></span><span class="tag ${st.ontimeRate>=80?'good':'warn'}">${st.ontimeRate!=null?st.ontimeRate+'%':'–'}</span></div>
                <b>${st.ontimeRate!=null?st.ontimeRate+'%':'–'}</b><span>On-Time Visits</span><small>Protocol adherence</small>
              </div>
            </div>
          </section>

          <!-- Investigator Patient List -->
          <section class="card">
          <div class="card-head">
            <h2>Patients Entered (${mine.length})</h2>
            <small>Visit status and record modification count</small>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Patient</th><th>Site</th><th>Baseline</th><th>3 Months</th><th>6 Months</th><th class="num">Audit Changes</th><th>Action</th></tr>
              </thead>
              <tbody>
                ${rows || '<tr><td colspan="7" class="muted">No patients entered yet by this investigator.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <!-- Investigator Overdue Follow-ups -->
        <section class="card">
          <div class="card-head">
            <h2>Overdue Follow-ups (${overdueList.length})</h2>
            <small>3 and 6 month visits past protocol window</small>
          </div>
          <div class="table-wrap">
            <table>
              <thead>
                <tr><th>Study ID</th><th>Site</th><th>Visit</th><th>Expected Window</th><th>Status</th><th>Contact</th><th>Action</th></tr>
              </thead>
              <tbody>
                ${overdueList.map(o => `
                  <tr>
                    <td><b>${esc(o.p.id)}</b></td>
                    <td><b>${esc(o.p.site)}</b></td>
                    <td><b>${o.k === 'm3' ? 'Month 3' : 'Month 6'}</b></td>
                    <td><small>${o.win ? fmtShortD(o.win[0]) + ' – ' + fmtShortD(o.win[1]) : '–'}</small></td>
                    <td><span class="chip Overdue">${o.s} (+${o.daysOver}d)</span></td>
                    <td><code>${esc(o.p.contact || '–')}</code></td>
                    <td>
                      <a class="btn btn-sm" href="../records/?patient=${encodeURIComponent(o.p.id)}&tab=${o.k}">
                        <i class="ms">visibility</i>Inspect
                      </a>
                    </td>
                  </tr>
                `).join('') || '<tr><td colspan="7" class="muted" style="text-align:center;padding:20px"><i class="ms" style="font-size:22px;vertical-align:-4px;color:var(--success)">task_alt</i> No overdue follow-ups for this investigator.</td></tr>'}
              </tbody>
            </table>
          </div>
        </section>

        <!-- Recent Change Activity Audit -->
        <section class="card">
          <div class="card-head">
            <h2>Recent Clinical Activity Audit</h2>
            <small>Last 10 field modifications recorded for this investigator's patients</small>
          </div>
          ${activity.length ? `
            <div class="table-wrap">
              <table>
                <thead><tr><th>Timestamp</th><th>Patient</th><th>Field Modified</th><th>Modification</th></tr></thead>
                <tbody>
                  ${activity.map(a => `
                    <tr>
                      <td style="font-size:12px;white-space:nowrap">${esc(a.t || '')}</td>
                      <td><b>${esc(a.pid)}</b></td>
                      <td><code>${esc(a.f || '')}</code></td>
                      <td>${a.o ? esc(a.o) + ' ➔ ' : ''}<b>${esc(a.n || '')}</b></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          ` : '<div class="empty"><i class="ms">history</i>No recent change activity logged yet.</div>'}
        </section>
        </div>
      `;
    }
  };

  global.DashUI = DashUI;
})(window);
