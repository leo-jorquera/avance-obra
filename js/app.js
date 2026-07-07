let state = {
  currentUser: null,
  isAdmin: false,
  currentView: 'dashboard',
  selectedWeek: getMonday(new Date()),
  progress: {}
};

function esc(v) {
  return String(v).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

function showToast(msg, type) {
  const el = document.createElement('div');
  el.className = 'toast' + (type ? ' ' + type : '');
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); }, 3000);
}

// ===================== CLOUD SYNC =====================

function getSyncToken() {
  return localStorage.getItem('avance-obra-sync-token');
}

function setSyncToken(token) {
  if (token) localStorage.setItem('avance-obra-sync-token', token);
  else localStorage.removeItem('avance-obra-sync-token');
}

function getSyncUser() {
  return localStorage.getItem('avance-obra-sync-user') || 'leo-jorquera';
}

function setSyncUser(user) {
  localStorage.setItem('avance-obra-sync-user', user);
}

function getSyncRepo() {
  return localStorage.getItem('avance-obra-sync-repo') || 'avance-obra';
}

function setSyncRepo(repo) {
  localStorage.setItem('avance-obra-sync-repo', repo);
}

function getLastSync() {
  return localStorage.getItem('avance-obra-last-sync');
}

function setLastSync() {
  localStorage.setItem('avance-obra-last-sync', new Date().toISOString());
}

function configureSync() {
  const currentToken = getSyncToken() || '';
  const currentUser = getSyncUser();
  const currentRepo = getSyncRepo();
  const token = prompt('Token de GitHub (con permiso repo):', currentToken);
  if (token === null) return;
  setSyncToken(token.trim() || '');
  const user = prompt('Usuario de GitHub:', currentUser);
  if (user === null) return;
  setSyncUser(user.trim() || 'leo-jorquera');
  const repo = prompt('Nombre del repositorio:', currentRepo);
  if (repo === null) return;
  setSyncRepo(repo.trim() || 'avance-obra');
  showToast('Configuración guardada.', 'success');
  renderAdminExport();
}

async function syncPush() {
  const token = getSyncToken();
  if (!token) { showToast('Configura el token en el panel de control (Admin).', 'warning'); return; }
  const user = getSyncUser();
  const repo = getSyncRepo();
  const url = `https://api.github.com/repos/${user}/${repo}/contents/progress.json`;

  try {
    const data = {
      exportedAt: new Date().toISOString(),
      progress: state.progress
    };
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));

    let sha = null;
    const getResp = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' }
    });
    if (getResp.ok) {
      const existing = await getResp.json();
      sha = existing.sha;
    }

    const body = { message: 'sync progress ' + new Date().toISOString().slice(0,10), content: content };
    if (sha) body.sha = sha;

    const putResp = await fetch(url, {
      method: 'PUT',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json', 'Accept': 'application/vnd.github+json' },
      body: JSON.stringify(body)
    });

    if (putResp.ok) {
      setLastSync();
      showToast('Datos subidos correctamente.', 'success');
    } else {
      const err = await putResp.json();
      showToast('Error al subir: ' + (err.message || 'desconocido'), 'error');
    }
  } catch(e) {
    showToast('Error de conexión: ' + e.message, 'error');
  }
}

async function syncPull() {
  const user = getSyncUser();
  const repo = getSyncRepo();
  const token = getSyncToken();

  try {
    let resp;
    if (token) {
      resp = await fetch(`https://api.github.com/repos/${user}/${repo}/contents/progress.json`, {
        headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/vnd.github+json' }
      });
    } else {
      resp = await fetch(`https://raw.githubusercontent.com/${user}/${repo}/main/progress.json`);
    }
    if (!resp.ok) return;

    const raw = await resp.text();
    const parsed = JSON.parse(raw);

    if (parsed.progress) {
      const remoteCount = Object.keys(parsed.progress).length;
      for (const key of Object.keys(parsed.progress)) {
        state.progress[key] = parsed.progress[key];
      }
      saveState();
      setLastSync();
      if (remoteCount > 0) {
        showToast(`Sincronizados ${remoteCount} registros desde la nube.`, 'success');
      }
      if (state.currentUser) render();
    }
  } catch(e) {
    console.warn('Sync pull error:', e);
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem('avance-obra-state');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.currentUser = parsed.currentUser || null;
      state.isAdmin = parsed.isAdmin || false;
      state.progress = parsed.progress || {};
      if (parsed.selectedWeek) state.selectedWeek = new Date(parsed.selectedWeek);
    }
  } catch (e) { console.warn('State load error', e); }
}

function saveState() {
  try {
    localStorage.setItem('avance-obra-state', JSON.stringify({
      currentUser: state.currentUser,
      isAdmin: state.isAdmin,
      progress: state.progress,
      selectedWeek: state.selectedWeek.toISOString()
    }));
  } catch (e) { console.warn('State save error', e); }
}

function getProgressKey(supervisorId, activityName, date) {
  const d = date || new Date();
  return `${supervisorId}::${activityName}::${d.toISOString().slice(0,10)}`;
}

function isDeptDone(supervisorId, activityName, dept, date) {
  const key = getProgressKey(supervisorId, activityName, date);
  return state.progress[key] && state.progress[key].includes(dept);
}

function toggleDept(supervisorId, activityName, dept, date) {
  const key = getProgressKey(supervisorId, activityName, date);
  if (!state.progress[key]) state.progress[key] = [];
  const idx = state.progress[key].indexOf(dept);
  if (idx >= 0) state.progress[key].splice(idx, 1);
  else state.progress[key].push(dept);
  saveState();
}

function getCompanyProgress(supervisorId, companyName, date) {
  const comp = activitiesData[companyName];
  if (!comp) return { done: 0, total: 0 };
  const todayIdx = getTodayWeekdayIndex();
  let total = 0, done = 0;
  for (const act of comp.activities) {
    const depts = (comp.week[act.name] || {})[WEEKDAYS[todayIdx]] || [];
    for (const d of depts) {
      total++;
      if (isDeptDone(supervisorId, act.name, d, date)) done++;
    }
  }
  return { done, total };
}

function getAllProgress(supervisorId, date) {
  const companies = SUPERVISOR_COMPANIES[supervisorId] || [];
  let total = 0, done = 0;
  for (const comp of companies) {
    const p = getCompanyProgress(supervisorId, comp, date);
    total += p.total;
    done += p.done;
  }
  return { done, total };
}

function getWeekProgress(supervisorId) {
  const dates = getWeekDates(state.selectedWeek);
  const result = { total: 0, done: 0, activities: {} };
  const companies = SUPERVISOR_COMPANIES[supervisorId] || [];
  for (const comp of companies) {
    const data = activitiesData[comp];
    if (!data) continue;
    for (const act of data.activities) {
      const weekData = data.week[act.name];
      if (!weekData) continue;
      for (let i = 0; i < 5; i++) {
        const dayKey = WEEKDAYS[i];
        const date = dates[i];
        const depts = weekData[dayKey] || [];
        for (const d of depts) {
          result.total++;
          const key = `${act.name}::${dayKey}`;
          if (!result.activities[key]) result.activities[key] = { name: act.name, day: dayKey, depts: [], doneDepts: [], company: comp };
          result.activities[key].depts.push(d);
          if (isDeptDone(supervisorId, act.name, d, date)) {
            result.done++;
            result.activities[key].doneDepts.push(d);
          }
        }
      }
    }
  }
  return result;
}

function getConsolidatedReport() {
  const dates = getWeekDates(state.selectedWeek);
  const report = [];
  for (const sup of SUPERVISORS) {
    const supReport = { supervisor: sup, total: 0, done: 0, pendingActivities: [] };
    const companies = SUPERVISOR_COMPANIES[sup.id] || [];
    for (const comp of companies) {
      const data = activitiesData[comp];
      if (!data) continue;
      for (const act of data.activities) {
        const weekData = data.week[act.name];
        if (!weekData) continue;
        for (let i = 0; i < 5; i++) {
          const dayKey = WEEKDAYS[i];
          const date = dates[i];
          const depts = weekData[dayKey] || [];
          for (const d of depts) {
            supReport.total++;
            if (isDeptDone(sup.id, act.name, d, date)) {
              supReport.done++;
            } else {
              let existing = supReport.pendingActivities.find(p => p.actName === act.name && p.day === dayKey);
              if (!existing) {
                existing = { company: comp, actName: act.name, day: dayKey, depts: [] };
                supReport.pendingActivities.push(existing);
              }
              existing.depts.push(d);
            }
          }
        }
      }
    }
    report.push(supReport);
  }
  return report;
}

// ===================== RENDER =====================

function render() {
  try {
    updateHeader();
    if (!state.currentUser) { renderLogin(); return; }
    const supNav = document.getElementById('nav-supervisor');
    const admNav = document.getElementById('nav-admin');
    if (supNav) supNav.style.display = state.isAdmin ? 'none' : 'grid';
    if (admNav) admNav.style.display = state.isAdmin ? 'grid' : 'none';
    if (state.isAdmin) {
      switch (state.currentView) {
        case 'admin-report': renderAdminReport(); break;
        case 'admin-upload': renderAdminUpload(); break;
        case 'admin-export': renderAdminExport(); break;
        default: state.currentView = 'admin-report'; renderAdminReport(); break;
      }
    } else {
      switch (state.currentView) {
        case 'dashboard': renderDashboard(); break;
        case 'week': renderWeekView(); break;
        case 'report': renderReport(); break;
        case 'export': renderExport(); break;
        default: state.currentView = 'dashboard'; renderDashboard(); break;
      }
    }
    updateNav();
  } catch (e) {
    console.error('Render error:', e);
    alert('Error en la app: ' + e.message);
  }
}

function renderLogin() {
  try {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const supNav = document.getElementById('nav-supervisor');
    const admNav = document.getElementById('nav-admin');
    if (supNav) supNav.style.display = 'none';
    if (admNav) admNav.style.display = 'none';
    const screen = document.getElementById('screen-login');
    if (!screen) return;
    screen.classList.add('active');
    const grid = screen.querySelector('.login-grid');
    if (!grid) return;
    grid.innerHTML = '';
    for (const sup of SUPERVISORS) {
      const btn = document.createElement('button');
      btn.className = 'login-btn';
      btn.textContent = sup.name;
      btn.addEventListener('click', () => {
        const pwd = prompt(`Ingrese contraseña para ${sup.name}:`);
        if (pwd === null) return;
        if (pwd !== sup.password) {
          showToast('Contraseña incorrecta', 'error');
          return;
        }
        state.currentUser = sup.id;
        state.isAdmin = false;
        state.currentView = 'dashboard';
        saveState();
        render();
      });
      grid.appendChild(btn);
    }
    const adminBtn = document.createElement('button');
    adminBtn.className = 'login-btn';
    adminBtn.style.cssText = 'grid-column:1/-1;margin-top:8px;border-color:var(--primary);color:var(--primary)';
    adminBtn.textContent = '🔑 Administrador';
    adminBtn.addEventListener('click', () => {
      const pwd = prompt('Ingrese contraseña de administrador:');
      if (pwd === 'Limc2450725351') {
        state.currentUser = ADMIN.id;
        state.isAdmin = true;
        state.currentView = 'admin-report';
        saveState();
        render();
      } else if (pwd !== null) {
        alert('Contraseña incorrecta');
      }
    });
    grid.appendChild(adminBtn);
  } catch (e) {
    console.error('Login render error:', e);
  }
}

// ===================== SUPERVISOR VIEWS =====================

function renderDashboard() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-dashboard').classList.add('active');
  state.currentView = 'dashboard';
  const container = document.getElementById('dashboard-content');
  const sup = SUPERVISORS.find(s => s.id === state.currentUser);
  const companies = SUPERVISOR_COMPANIES[state.currentUser] || [];
  const todayIdx = getTodayWeekdayIndex();
  const todayLabel = WEEKDAY_FULL[WEEKDAYS[todayIdx]];
  const todayDate = new Date();
  const allProgress = getAllProgress(state.currentUser, todayDate);
  const firstTime = Object.keys(state.progress).length === 0;
  let html = `
    <div style="margin-bottom:12px">
      <div style="font-size:13px;color:var(--text2)">${sup.name}</div>
      <div style="font-size:20px;font-weight:700">${todayLabel}</div>
      <div style="font-size:13px;color:var(--text2)">${formatDateFull(todayDate)}</div>
    </div>
    ${firstTime ? `<div class="card" style="border-left:3px solid var(--primary);margin-bottom:12px;font-size:13px">
      <div style="font-weight:600;margin-bottom:4px">👋 Bienvenido, ${sup.name}</div>
      <div style="color:var(--text2)">Toca cada departamento para marcarlo como realizado. Usa el menú inferior para ver la semana completa y tu reporte semanal.</div>
    </div>` : ''}
    <div class="stats-row">
      <div class="stat">
        <div class="stat-num">${allProgress.done}</div>
        <div class="stat-label">Hecho Hoy</div>
      </div>
      <div class="stat">
        <div class="stat-num">${allProgress.total}</div>
        <div class="stat-label">Programado</div>
      </div>
      <div class="stat">
        <div class="stat-num">${allProgress.total ? Math.round(allProgress.done/allProgress.total*100) : 0}%</div>
        <div class="stat-label">Cumplimiento</div>
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${allProgress.total ? (allProgress.done/allProgress.total*100) : 0}%"></div>
    </div>`;
  for (const comp of companies) {
    const data = activitiesData[comp];
    if (!data) continue;
    const p = getCompanyProgress(state.currentUser, comp, todayDate);
    html += `<div style="margin-top:16px;margin-bottom:4px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-weight:600;font-size:14px">${comp}</div>
      <div style="font-size:12px;color:var(--text2)">${p.done}/${p.total}</div>
    </div>`;
    for (const act of data.activities) {
      const depts = (data.week[act.name] || {})[WEEKDAYS[todayIdx]] || [];
      if (depts.length === 0) continue;
      const doneDepts = depts.filter(d => isDeptDone(state.currentUser, act.name, d, todayDate));
      const allDone = doneDepts.length === depts.length;
      const badge = allDone ? 'badge-done' : (doneDepts.length > 0 ? 'badge-pending' : 'badge-todo');
      const badgeText = allDone ? 'Hecho' : (doneDepts.length > 0 ? `${doneDepts.length}/${depts.length}` : 'Pendiente');
      html += `<div class="activity-item">
        <div class="activity-header" onclick="toggleActivity(this)">
          <span class="activity-name">${act.name}</span>
          <span style="display:flex;align-items:center;gap:8px">
            <span class="activity-badge ${badge}">${badgeText}</span>
            <span style="font-size:12px;color:var(--text2)">▼</span>
          </span>
        </div>
        <div class="dept-grid">`;
      for (const d of depts) {
        const done = isDeptDone(state.currentUser, act.name, d, todayDate);
        html += `<div class="dept-btn ${done ? 'done' : ''}" onclick="handleDeptClick('${state.currentUser}','${esc(act.name)}','${d}')" title="${getDeptLabel(d)}">${d}</div>`;
      }
      html += `</div></div>`;
    }
  }
  container.innerHTML = html;
}

function handleDeptClick(supId, actName, dept) {
  toggleDept(supId, actName, dept, new Date());
  renderDashboard();
}

function toggleActivity(header) {
  const grid = header.nextElementSibling;
  if (grid) grid.classList.toggle('open');
}

function renderWeekView() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-week').classList.add('active');
  state.currentView = 'week';
  const container = document.getElementById('week-content');
  const sup = SUPERVISORS.find(s => s.id === state.currentUser);
  const companies = SUPERVISOR_COMPANIES[state.currentUser] || [];
  const dates = getWeekDates(state.selectedWeek);
  const todayStr = new Date().toISOString().slice(0,10);
  let html = `
    <div class="week-selector">
      <button onclick="shiftWeek(-1)">◀</button>
      <span>Semana del ${formatDate(dates[1])}</span>
      <button onclick="shiftWeek(1)">▶</button>
    </div>
    <div class="week-header">
      <div>Actividad</div>
      <div>Vie ${dates[0].getDate()}</div>
      <div>Lun ${dates[1].getDate()}</div>
      <div>Mar ${dates[2].getDate()}</div>
      <div>Mié ${dates[3].getDate()}</div>
      <div>Jue ${dates[4].getDate()}</div>
    </div>`;
  for (const comp of companies) {
    const data = activitiesData[comp];
    if (!data) continue;
    html += `<div style="margin-top:12px;margin-bottom:4px;font-weight:600;font-size:13px;color:var(--text2)">${comp}</div>`;
    for (const act of data.activities) {
      const weekData = data.week[act.name];
      if (!weekData) continue;
      const hasAny = WEEKDAYS.some(d => (weekData[d] || []).length > 0);
      if (!hasAny) continue;
      html += `<div class="week-row"><div class="act-name">${act.name}</div>`;
      for (let i = 0; i < 5; i++) {
        const dayKey = WEEKDAYS[i];
        const date = dates[i];
        const dateStr = date.toISOString().slice(0,10);
        const depts = weekData[dayKey] || [];
        const doneDepts = depts.filter(d => isDeptDone(state.currentUser, act.name, d, date));
        const allDone = depts.length > 0 && doneDepts.length === depts.length;
        const isToday = dateStr === todayStr;
        const cls = `day-cell${allDone ? ' done' : ''}${isToday ? ' today' : ''}${depts.length > 0 ? ' has-dept' : ''}`;
        html += `<div class="${cls}" onclick="showDayDetail('${state.currentUser}','${esc(act.name)}','${dateStr}')">
          ${allDone ? '✓' : (depts.length > 0 ? `${doneDepts.length}/${depts.length}` : '—')}
        </div>`;
      }
      html += `</div>`;
    }
  }
  container.innerHTML = html;
}

function shiftWeek(dir) {
  const newDate = new Date(state.selectedWeek);
  newDate.setDate(newDate.getDate() + dir * 7);
  state.selectedWeek = newDate;
  saveState();
  renderWeekView();
}

function dayToWeekKey(day) {
  return {5:'fri',1:'mon',2:'tue',3:'wed',4:'thu'}[day] || 'fri';
}

function showDayDetail(supId, actName, dateStr) {
  const date = new Date(dateStr + 'T12:00:00');
  const dayLabel = date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
  const dayName = dayToWeekKey(date.getDay());
  const companies = SUPERVISOR_COMPANIES[state.currentUser] || [];
  let allDepts = [];
  for (const comp of companies) {
    const data = activitiesData[comp];
    if (!data) continue;
    const weekData = data.week[actName];
    if (!weekData) continue;
    const depts = weekData[dayName] || [];
    for (const d of depts) allDepts.push(d);
  }
  if (allDepts.length === 0) return;
  allDepts = [...new Set(allDepts)];
  let html = `<div class="modal-overlay open" id="day-modal" onclick="closeDayModal(event)">
    <div class="modal" onclick="event.stopPropagation()">
      <h3>${actName}</h3>
      <p style="color:var(--text2);margin-bottom:12px">${dayLabel}</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(70px,1fr));gap:6px" id="day-dept-grid">`;
  for (const d of allDepts) {
    const done = isDeptDone(state.currentUser, actName, d, date);
    html += `<div class="dept-btn ${done ? 'done' : ''}" data-dept="${d}" onclick="handleDeptClickDay('${state.currentUser}','${esc(actName)}','${d}','${dateStr}')" title="${getDeptLabel(d)}">${d}</div>`;
  }
  html += `</div>
      <div class="modal-actions">
        <button class="btn btn-primary" onclick="closeDayModal()">Cerrar</button>
      </div>
    </div>
  </div>`;
  document.body.insertAdjacentHTML('beforeend', html);
}

function handleDeptClickDay(supId, actName, dept, dateStr) {
  toggleDept(supId, actName, dept, new Date(dateStr + 'T12:00:00'));
  const btn = document.querySelector(`#day-dept-grid .dept-btn[data-dept="${dept}"]`);
  if (btn) btn.classList.toggle('done');
}

function closeDayModal(e) {
  const modal = document.getElementById('day-modal');
  if (modal) modal.remove();
}

// ===================== SUPERVISOR REPORT =====================

function renderReport() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-report').classList.add('active');
  state.currentView = 'report';
  const container = document.getElementById('report-content');
  const sup = SUPERVISORS.find(s => s.id === state.currentUser);
  const weekProgress = getWeekProgress(state.currentUser);
  const dates = getWeekDates(state.selectedWeek);

  let html = `
    <div class="week-selector">
      <button onclick="shiftWeekReport(-1)">◀</button>
      <span>Semana del ${formatDate(dates[1])}</span>
      <button onclick="shiftWeekReport(1)">▶</button>
    </div>
    <div style="margin-bottom:8px">
      <div style="font-size:13px;color:var(--text2)">${sup.name}</div>
      <div style="font-size:18px;font-weight:700">Reporte Semanal</div>
    </div>
    <div class="stats-row">
      <div class="stat">
        <div class="stat-num">${weekProgress.done}</div>
        <div class="stat-label">Hecho</div>
      </div>
      <div class="stat">
        <div class="stat-num">${weekProgress.total}</div>
        <div class="stat-label">Programado</div>
      </div>
      <div class="stat">
        <div class="stat-num">${weekProgress.total ? Math.round(weekProgress.done/weekProgress.total*100) : 0}%</div>
        <div class="stat-label">Cumplimiento</div>
      </div>
    </div>
    <div class="progress-bar">
      <div class="progress-fill" style="width:${weekProgress.total ? (weekProgress.done/weekProgress.total*100) : 0}%"></div>
    </div>`;

  const pending = Object.values(weekProgress.activities).filter(a => a.doneDepts.length < a.depts.length);
  if (pending.length > 0) {
    html += `<div style="margin-top:20px">
      <h3 style="font-size:16px;color:var(--danger);margin-bottom:8px">⏳ Actividades Pendientes</h3>`;
    for (const p of pending) {
      const missing = p.depts.filter(d => !p.doneDepts.includes(d));
      html += `<div class="card" style="border-left:3px solid var(--danger)">
        <div style="font-weight:600;font-size:14px">${p.actName}</div>
        <div style="font-size:12px;color:var(--text2)">${p.company} · ${WEEKDAY_FULL[p.day]}</div>
        <div style="margin-top:6px;display:flex;flex-wrap:wrap;gap:4px">
          ${missing.map(d => `<span class="pending-dept" title="${getDeptLabel(d)}">${d}</span>`).join('')}
        </div>
        <div style="font-size:11px;color:var(--text2);margin-top:4px">${p.doneDepts.length}/${p.depts.length} completados</div>
      </div>`;
    }
    html += `</div>`;
  } else if (weekProgress.total > 0) {
    html += `<div class="card" style="margin-top:20px;text-align:center;border-color:var(--success)">
      <div style="font-size:40px;margin-bottom:8px">✅</div>
      <div style="font-weight:600;color:var(--success)">¡Todas las actividades completadas!</div>
    </div>`;
  }

  html += `<div style="margin-top:20px">
    <h3 style="font-size:16px;margin-bottom:8px">📋 Resumen por Actividad</h3></div>`;
  const sorted = Object.values(weekProgress.activities).sort((a,b) => a.company.localeCompare(b.company) || a.name.localeCompare(b.name));
  let lastComp = '';
  for (const a of sorted) {
    if (a.company !== lastComp) {
      html += `<div style="margin-top:8px;font-weight:600;font-size:13px;color:var(--text2)">${a.company}</div>`;
      lastComp = a.company;
    }
    const pct = a.depts.length ? Math.round(a.doneDepts.length/a.depts.length*100) : 0;
    html += `<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.05);font-size:13px">
      <span>${a.name} <span style="color:var(--text2)">(${WEEKDAY_FULL[a.day]})</span></span>
      <span style="font-weight:600;color:${pct === 100 ? 'var(--success)' : pct > 0 ? 'var(--warning)' : 'var(--danger)'}">${a.doneDepts.length}/${a.depts.length}</span>
    </div>`;
  }

  html += `<div style="margin-top:16px"><button class="btn btn-primary" onclick="exportSupervisorExcel()" style="width:100%">📥 Descargar Excel</button></div>`;
  container.innerHTML = html;
}

function exportSupervisorExcel() {
  loadXLSX(() => {
  const weekProgress = getWeekProgress(state.currentUser);
  const sup = SUPERVISORS.find(s => s.id === state.currentUser);
  const wb = XLSX.utils.book_new();
  const wsData = [['Empresa', 'Actividad', 'Día', 'Deptos Programados', 'Deptos Hechos', 'Pendientes']];
  const sorted = Object.values(weekProgress.activities).sort((a,b) => a.company.localeCompare(b.company) || a.name.localeCompare(b.name));
  for (const a of sorted) {
    const pending = a.depts.filter(d => !a.doneDepts.includes(d));
    wsData.push([a.company, a.name, WEEKDAY_FULL[a.day], a.depts.join(', '), a.doneDepts.join(', '), pending.join(', ')]);
  }
  wsData.push([]);
  wsData.push(['RESUMEN', '', '', weekProgress.total, weekProgress.done, weekProgress.total ? Math.round(weekProgress.done/weekProgress.total*100)+'%' : '0%']);
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{wch:20},{wch:35},{wch:12},{wch:30},{wch:30},{wch:30}];
  XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
  XLSX.writeFile(wb, `reporte-${sup.id}-${new Date().toISOString().slice(0,10)}.xlsx`);
  });
}

// ===================== SUPERVISOR EXPORT =====================

function renderExport() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-export').classList.add('active');
  state.currentView = 'export';
  const container = document.getElementById('export-content');
  const sup = SUPERVISORS.find(s => s.id === state.currentUser);
  const today = new Date();
  const allProgress = getAllProgress(state.currentUser, today);
  let html = `
    <div style="margin-bottom:16px">
      <h2>Exportar / Importar</h2>
      <p style="color:var(--text2);font-size:13px">Respalda o transfiere tu progreso registrado.</p>
    </div>
    <div class="card">
      <div class="card-title">Progreso Total Hoy</div>
      <div class="card-value">${allProgress.done} <small>/ ${allProgress.total} actividades</small></div>
      <div class="progress-bar" style="margin-top:8px">
        <div class="progress-fill" style="width:${allProgress.total ? (allProgress.done/allProgress.total*100) : 0}%"></div>
      </div>
    </div>
    <div class="export-actions">
      <button class="btn btn-primary" onclick="exportData()">📤 Exportar mis datos</button>
      <button class="btn btn-secondary" onclick="document.getElementById('import-file').click()">📥 Importar datos</button>
      <input type="file" id="import-file" accept=".json" onchange="importData(event)">
      <button class="btn btn-secondary" onclick="resetData()" style="color:var(--danger)">🗑️ Reiniciar mis datos</button>
    </div>
    <div style="margin-top:16px">
      <div style="font-size:14px;font-weight:600;margin-bottom:8px">☁️ Sincronización</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-success" onclick="syncPush()">⬆️ Subir mi progreso</button>
        <button class="btn btn-secondary" onclick="syncPull()">⬇️ Descargar progreso</button>
      </div>
      <div style="font-size:12px;color:var(--text2);margin-top:6px">${getLastSync() ? 'Última sync: ' + new Date(getLastSync()).toLocaleString('es-CL') : 'Sube tu progreso para verlo desde otro dispositivo'}</div>
    </div>`;
  container.innerHTML = html;
}

function exportData() {
  const data = { exportedAt: new Date().toISOString(), supervisor: state.currentUser, progress: state.progress };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `avance-${state.currentUser}-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.progress) {
        if (data.supervisor && data.supervisor !== state.currentUser && !state.isAdmin) {
          if (!confirm(`Los datos son del supervisor "${data.supervisor}". ¿Importar de todas formas?`)) return;
        }
        Object.assign(state.progress, data.progress);
        saveState();
        render();
        showToast('Datos importados correctamente.', 'success');
      }
    } catch (err) {
      showToast('Error al importar: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function resetData() {
  if (confirm('¿Estás seguro? Se borrará todo el progreso registrado.')) {
    state.progress = {};
    saveState();
    render();
  }
}

// ===================== ADMIN VIEWS =====================

function renderAdminReport() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-admin').classList.add('active');
  state.currentView = 'admin-report';
  const container = document.getElementById('admin-content');
  const dates = getWeekDates(state.selectedWeek);
  const report = getConsolidatedReport();
  const todayDate = new Date();
  const todayIdx = getTodayWeekdayIndex();

  let html = `
    <div class="week-selector">
      <button onclick="adminShiftWeek(-1)">◀</button>
      <span>Semana del ${formatDate(dates[1])}</span>
      <button onclick="adminShiftWeek(1)">▶</button>
    </div>
    <div style="font-size:13px;color:var(--text2);margin-bottom:8px">${formatDateFull(todayDate)}</div>`;

  const totalAll = report.reduce((s, r) => s + r.total, 0);
  const doneAll = report.reduce((s, r) => s + r.done, 0);
  html += `<div class="stats-row">
      <div class="stat">
        <div class="stat-num">${doneAll}</div>
        <div class="stat-label">Total Hecho</div>
      </div>
      <div class="stat">
        <div class="stat-num">${totalAll}</div>
        <div class="stat-label">Total Prog.</div>
      </div>
      <div class="stat">
        <div class="stat-num">${totalAll ? Math.round(doneAll/totalAll*100) : 0}%</div>
        <div class="stat-label">Gral.</div>
      </div>
    </div>`;

  for (const supReport of report) {
    const pct = supReport.total ? Math.round(supReport.done/supReport.total*100) : 0;
    const isGood = pct >= 80;
    const isMid = pct >= 50;
    html += `<div class="card" style="margin-top:12px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <div style="font-weight:700;font-size:15px">${supReport.supervisor.name}</div>
        <div style="font-size:13px;font-weight:600;color:${isGood ? 'var(--success)' : isMid ? 'var(--warning)' : 'var(--danger)'}">${pct}% · ${supReport.done}/${supReport.total}</div>
      </div>
      <div class="progress-bar" style="height:4px">
        <div class="progress-fill" style="width:${pct}%;background:${isGood ? 'var(--success)' : isMid ? 'var(--warning)' : 'var(--danger)'}"></div>
      </div>`;

    if (supReport.pendingActivities.length > 0) {
      html += `<div style="margin-top:10px;font-size:13px;font-weight:600;color:var(--danger)">⏳ Actividades no realizadas:</div>`;
      let lastComp = '';
      for (const p of supReport.pendingActivities) {
        if (p.company !== lastComp) {
          html += `<div style="font-size:12px;color:var(--text2);margin-top:4px">${p.company}</div>`;
          lastComp = p.company;
        }
        html += `<div style="font-size:12px;padding:3px 0;display:flex;justify-content:space-between;border-bottom:1px solid rgba(255,255,255,.03)">
          <span>${p.actName} <span style="color:var(--text2)">(${WEEKDAY_FULL[p.day]})</span></span>
          <span style="color:var(--danger);text-align:right;max-width:40%">${p.depts.join(', ')}</span>
        </div>`;
      }
    } else if (supReport.total > 0) {
      html += `<div style="margin-top:8px;font-size:13px;color:var(--success)">✅ Todas las actividades realizadas</div>`;
    }
    html += `</div>`;
  }

  html += `<div class="export-actions" style="margin-top:16px">
    <button class="btn btn-success" onclick="exportWeeklyReport()">📊 Reporte Semanal + Reprogramar</button>
    <button class="btn btn-secondary" onclick="exportFullReport()">📋 Solo Exportar Excel</button>
    <button class="btn btn-warning" onclick="generateReschedule()">📅 Solo Reprogramar</button>
    <button class="btn btn-primary" onclick="syncPush()">⬆️ Subir datos a la nube</button>
    <button class="btn btn-secondary" onclick="syncPull()">⬇️ Bajar datos de la nube</button>
  </div>`;
  container.innerHTML = html;
}

function adminShiftWeek(dir) {
  const newDate = new Date(state.selectedWeek);
  newDate.setDate(newDate.getDate() + dir * 7);
  state.selectedWeek = newDate;
  saveState();
  renderAdminReport();
}

function renderAdminUpload() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-upload').classList.add('active');
  state.currentView = 'admin-upload';
  const container = document.getElementById('upload-content');
  container.innerHTML = `
    <div style="margin-bottom:16px">
      <h2>Cargar Planificación Semanal</h2>
      <p style="color:var(--text2);font-size:13px">Actualiza las actividades y departamentos desde un archivo JSON.</p>
      <p style="color:var(--warning);font-size:12px;margin-top:4px">Formato: {"EMPRESA": {"activities": [{"name": "..."}], "week": {"ACTIVIDAD": {"fri":[...],"mon":[...],"tue":[...],"wed":[...],"thu":[...]}}}}</p>
    </div>
    <div class="card">
      <div class="card-title">Planificación actual</div>
      <div style="font-size:13px">${Object.keys(activitiesData).length} empresas cargadas</div>
      <div style="font-size:12px;color:var(--text2);margin-top:4px">${Object.values(activitiesData).reduce((s, c) => s + c.activities.length, 0)} actividades totales</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
      <button class="btn btn-primary" onclick="document.getElementById('upload-plan-file').click()">📂 Subir JSON</button>
      <button class="btn btn-success" onclick="exportWeeklyReport()">📊 Reporte + Reprogramar</button>
      <button class="btn btn-secondary" onclick="exportFullReport()">📋 Solo Excel</button>
      <button class="btn btn-warning" onclick="generateReschedule()">📅 Solo Reprogramar</button>
      <button class="btn btn-secondary" onclick="exportPlanTemplate()">📄 Plantilla JSON</button>
      <button class="btn btn-secondary" onclick="resetPlan()">🔄 Restaurar original</button>
    </div>
    <input type="file" id="upload-plan-file" accept=".json" onchange="uploadPlan(event)" style="display:none">`;
}

function uploadPlan(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (data && typeof data === 'object') {
        updateActivitiesData(data);
        showToast(`Planificación actualizada con ${Object.keys(data).length} empresas.`, 'success');
        render();
      }
    } catch (err) {
      showToast('El archivo debe ser JSON válido.', 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function exportPlanTemplate() {
  const tmpl = { "EMPRESA_EJEMPLO": { "activities": [{"name": "ACTIVIDAD 1"}], "week": { "ACTIVIDAD 1": { "fri": ["101"], "mon": ["102"], "tue": ["103"], "wed": ["104"], "thu": ["105"] } } } };
  const blob = new Blob([JSON.stringify(tmpl, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'plantilla-planificacion.json';
  a.click();
  URL.revokeObjectURL(url);
}

function generateReschedule() {
  const dates = getWeekDates(state.selectedWeek);
  const pending = getPendingForReschedule(dates);
  const totalPending = Object.values(pending).reduce((s, comp) => s + Object.keys(comp).length, 0);
  if (totalPending === 0) { showToast('No hay actividades pendientes para reprogramar.', 'warning'); return; }
  const nextMonday = new Date(state.selectedWeek);
  nextMonday.setDate(nextMonday.getDate() + 7);
  const nextDates = getWeekDates(nextMonday);
  const msg = Object.entries(pending).map(([comp, acts]) => {
    const actsList = Object.keys(acts).map(a => `  • ${a} (${acts[a].length} deptos)`).join('\n');
    return `${comp}:\n${actsList}`;
  }).join('\n\n');
  if (!confirm(`Actividades pendientes esta semana:\n\n${msg}\n\n¿Reprogramar para la semana del ${formatDate(nextDates[1])}?`)) return;
  const nextPlan = generateNextWeekPlan(pending);
  updateActivitiesData(nextPlan);
  state.selectedWeek = nextMonday;
  saveState();
  render();
  showToast(`Plan actualizado: ${totalPending} actividades reprogramadas para la semana del ${formatDate(nextDates[1])}.`, 'success');
}

function resetPlan() {
  if (confirm('¿Restaurar los datos de planificación originales?')) {
    localStorage.removeItem('avance-obra-custom-data');
    activitiesData = ACTIVITIES_DATA;
    render();
    showToast('Datos originales restaurados.', 'success');
  }
}

function renderAdminExport() {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById('screen-export').classList.add('active');
  state.currentView = 'admin-export';
  const container = document.getElementById('export-content');
  const today = new Date();
  const report = getConsolidatedReport();
  const totalAll = report.reduce((s, r) => s + r.total, 0);
  const doneAll = report.reduce((s, r) => s + r.done, 0);
  container.innerHTML = `
    <div style="margin-bottom:16px">
      <h2>Panel de Control</h2>
      <p style="color:var(--text2);font-size:13px">Administración general del avance de obra.</p>
    </div>
    <div class="card">
      <div class="card-title">Progreso Global</div>
      <div class="card-value">${doneAll} <small>/ ${totalAll}</small></div>
      <div class="progress-bar" style="margin-top:8px">
        <div class="progress-fill" style="width:${totalAll ? (doneAll/totalAll*100) : 0}%"></div>
      </div>
      <div style="font-size:12px;color:var(--text2);margin-top:4px">${totalAll ? Math.round(doneAll/totalAll*100) : 0}% completado</div>
    </div>
    <div style="margin-top:16px">
      <div style="font-size:14px;font-weight:600;margin-bottom:8px">Exportar / Importar</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-success" onclick="exportWeeklyReport()">📊 Reporte Semanal + Reprogramar</button>
        <button class="btn btn-secondary" onclick="exportFullReport()">📋 Solo Excel</button>
        <button class="btn btn-warning" onclick="generateReschedule()">📅 Solo Reprogramar</button>
        <button class="btn btn-secondary" onclick="exportAllData()">💾 Exportar JSON</button>
        <button class="btn btn-secondary" onclick="document.getElementById('import-all-file').click()">📥 Importar JSON</button>
        <button class="btn btn-secondary" onclick="resetAllData()" style="color:var(--danger)">🗑️ Reiniciar todo</button>
      </div>
      <input type="file" id="import-all-file" accept=".json" onchange="importAllData(event)" style="display:none">
    </div>
    <div style="margin-top:16px">
      <div style="font-size:14px;font-weight:600;margin-bottom:8px">☁️ Sincronización en la nube</div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-primary" onclick="configureSync()">🔧 Configurar sync</button>
        <button class="btn btn-success" onclick="syncPush()">⬆️ Subir datos</button>
        <button class="btn btn-secondary" onclick="syncPull()">⬇️ Descargar datos</button>
      </div>
      <div id="sync-status" style="font-size:12px;color:var(--text2);margin-top:6px">${getSyncToken() ? '✅ Sincronización configurada' : '⚠️ No configurado'}${getLastSync() ? ' · Última sync: ' + new Date(getLastSync()).toLocaleString('es-CL') : ''}</div>
    </div>`;
}

function loadXLSX(cb) {
  if (typeof XLSX !== 'undefined') { cb(); return; }
  const s = document.createElement('script');
  s.src = 'https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js';
  s.onload = cb;
  s.onerror = () => { showToast('Error al cargar librería Excel. Verifica tu conexión.', 'error'); };
  document.head.appendChild(s);
}

function exportFullReport() {
  loadXLSX(() => {
  const dates = getWeekDates(state.selectedWeek);
  const report = getConsolidatedReport();
  const wb = XLSX.utils.book_new();
  const wsData = [['Supervisor', 'Empresa', 'Actividad', 'Día', 'Deptos Pendientes']];
  for (const r of report) {
    if (r.pendingActivities.length === 0) {
      wsData.push([r.supervisor.name, '—', '✅ Todas completadas', '—', '—']);
    }
    for (const p of r.pendingActivities) {
      wsData.push([r.supervisor.name, p.company, p.actName, WEEKDAY_FULL[p.day], p.depts.join(', ')]);
    }
  }
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [{wch:18},{wch:20},{wch:35},{wch:12},{wch:30}];
  XLSX.utils.book_append_sheet(wb, ws, 'Pendientes');
  const summaryData = [['Supervisor', 'Programado', 'Realizado', 'Cumplimiento']];
  for (const r of report) {
    summaryData.push([r.supervisor.name, r.total, r.done, r.total ? Math.round(r.done/r.total*100)+'%' : '0%']);
  }
  const ws2 = XLSX.utils.aoa_to_sheet(summaryData);
  ws2['!cols'] = [{wch:18},{wch:12},{wch:12},{wch:14}];
  XLSX.utils.book_append_sheet(wb, ws2, 'Resumen');
  XLSX.writeFile(wb, `reporte-avance-${new Date().toISOString().slice(0,10)}.xlsx`);
  });
}

function exportWeeklyReport() {
  const dates = getWeekDates(state.selectedWeek);
  const report = getConsolidatedReport();
  const pending = getPendingForReschedule(dates);
  const totalPending = Object.values(pending).reduce((s, comp) => s + Object.keys(comp).length, 0);

  loadXLSX(() => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Resumen
    const s1 = [['Supervisor', 'Programado', 'Realizado', 'Pendiente', 'Cumplimiento']];
    for (const r of report) {
      const pend = r.total - r.done;
      s1.push([r.supervisor.name, r.total, r.done, pend, r.total ? Math.round(r.done/r.total*100)+'%' : '0%']);
    }
    const ws1 = XLSX.utils.aoa_to_sheet(s1);
    ws1['!cols'] = [{wch:20},{wch:12},{wch:12},{wch:12},{wch:14}];
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumen Semanal');

    // Sheet 2: Detalle por actividad
    const s2 = [['Supervisor', 'Empresa', 'Actividad', 'Día', 'Depto', 'Estado']];
    for (const r of report) {
      for (const p of r.pendingActivities) {
        for (const d of p.depts) {
          s2.push([r.supervisor.name, p.company, p.actName, WEEKDAY_FULL[p.day], d, 'Pendiente']);
        }
      }
    }
    // add completed ones with no pending
    for (const r of report) {
      if (r.pendingActivities.length === 0 && r.total > 0) {
        s2.push([r.supervisor.name, '—', '✅ Todas completadas', '—', '—', 'Hecho']);
      }
    }
    const ws2 = XLSX.utils.aoa_to_sheet(s2);
    ws2['!cols'] = [{wch:20},{wch:22},{wch:38},{wch:12},{wch:8},{wch:12}];
    XLSX.utils.book_append_sheet(wb, ws2, 'Detalle');

    // Sheet 3: Reprogramación
    const nextMonday = new Date(state.selectedWeek);
    nextMonday.setDate(nextMonday.getDate() + 7);
    const nextDates = getWeekDates(nextMonday);
    const nextPlan = generateNextWeekPlan(pending);

    const s3 = [['Empresa', 'Actividad', 'Deptos Pendientes', 'Lun ' + nextDates[1].getDate(), 'Mar ' + nextDates[2].getDate(), 'Mié ' + nextDates[3].getDate(), 'Jue ' + nextDates[4].getDate(), 'Vie ' + nextDates[0].getDate()]];
    for (const comp of Object.keys(nextPlan)) {
      const acts = nextPlan[comp].activities || [];
      for (const act of acts) {
        const week = nextPlan[comp].week[act.name];
        if (!week) continue;
        const pendDepts = pending[comp]?.[act.name];
        if (!pendDepts || pendDepts.length === 0) continue;
        s3.push([comp, act.name, pendDepts.join(', '), (week.mon||[]).join(','), (week.tue||[]).join(','), (week.wed||[]).join(','), (week.thu||[]).join(','), (week.fri||[]).join(',')]);
      }
    }
    const ws3 = XLSX.utils.aoa_to_sheet(s3);
    ws3['!cols'] = [{wch:22},{wch:38},{wch:25},{wch:10},{wch:10},{wch:10},{wch:10},{wch:10}];
    XLSX.utils.book_append_sheet(wb, ws3, 'Reprogramación');

    XLSX.writeFile(wb, `reporte-semanal-${new Date().toISOString().slice(0,10)}.xlsx`);
  });

  // Auto-reprogramar después de descargar
  if (totalPending > 0) {
    setTimeout(() => {
      const dates = getWeekDates(state.selectedWeek);
      const pending = getPendingForReschedule(dates);
      const totalPending = Object.values(pending).reduce((s, comp) => s + Object.keys(comp).length, 0);
      if (totalPending === 0) return;
      const nextMonday = new Date(state.selectedWeek);
      nextMonday.setDate(nextMonday.getDate() + 7);
      const nextDates = getWeekDates(nextMonday);
      const msg = Object.entries(pending).map(([comp, acts]) => {
        const actsList = Object.keys(acts).map(a => `  • ${a} (${acts[a].length} deptos)`).join('\n');
        return `${comp}:\n${actsList}`;
      }).join('\n\n');
      if (confirm(`Reporte descargado.\n\nActividades pendientes de esta semana:\n\n${msg}\n\n¿Reprogramar automáticamente para la semana del ${formatDate(nextDates[1])}?`)) {
        const nextPlan = generateNextWeekPlan(pending);
        updateActivitiesData(nextPlan);
        state.selectedWeek = nextMonday;
        saveState();
        render();
        showToast(`Plan actualizado: ${totalPending} actividades reprogramadas.`, 'success');
      }
    }, 500);
  } else {
    setTimeout(() => {
      showToast('No hay actividades pendientes. Todas completadas ✅', 'success');
    }, 500);
  }
}

function exportAllData() {
  const data = {
    exportedAt: new Date().toISOString(),
    progress: state.progress,
    customData: localStorage.getItem('avance-obra-custom-data') ? JSON.parse(localStorage.getItem('avance-obra-custom-data')) : null
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `avance-completo-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importAllData(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(ev) {
    try {
      const data = JSON.parse(ev.target.result);
      if (data.progress) {
        state.progress = data.progress;
        saveState();
      }
      if (data.customData) {
        updateActivitiesData(data.customData);
      }
      render();
      showToast('Datos importados globales correctamente.', 'success');
      } catch (err) {
        showToast('Error: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
  e.target.value = '';
}

function resetAllData() {
  if (confirm('¿Estás seguro? Se borrarán todos los datos de progreso y planificación personalizada.')) {
    state.progress = {};
    saveState();
    localStorage.removeItem('avance-obra-custom-data');
    activitiesData = ACTIVITIES_DATA;
    render();
  }
}

// ===================== NAVIGATION =====================

function updateNav() {
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  let map;
  if (state.isAdmin) {
    map = { 'admin-report': 'nav-admin-report', 'admin-upload': 'nav-admin-upload', 'admin-export': 'nav-admin-export' };
  } else {
    map = { dashboard: 'nav-dashboard', week: 'nav-week', report: 'nav-report', export: 'nav-export' };
  }
  const el = document.getElementById(map[state.currentView]);
  if (el) el.classList.add('active');
}

function navigate(view) {
  try {
    state.currentView = view;
    render();
  } catch (e) {
    console.error('Navigate error:', e);
  }
}

function logout() {
  state.currentUser = null;
  state.isAdmin = false;
  saveState();
  render();
}

function updateHeader() {
  const el = document.getElementById('header-supervisor');
  const title = document.getElementById('header-title');
  if (state.currentUser) {
    if (state.isAdmin) {
      el.textContent = 'Administrador';
      title.textContent = 'Panel General';
    } else {
      const sup = SUPERVISORS.find(s => s.id === state.currentUser);
      el.textContent = sup ? sup.name : 'Orompello Centro';
      title.textContent = 'Avance Diario';
    }
  } else {
    el.textContent = 'Orompello Centro';
    title.textContent = 'Avance Diario';
  }
}

// ===================== EXPOSE GLOBALS =====================

window.render = render;
window.navigate = navigate;
window.logout = logout;
window.toggleActivity = toggleActivity;
window.handleDeptClick = handleDeptClick;
window.handleDeptClickDay = handleDeptClickDay;
window.shiftWeek = shiftWeek;
window.shiftWeekReport = shiftWeek;
window.adminShiftWeek = adminShiftWeek;
window.showDayDetail = showDayDetail;
window.closeDayModal = closeDayModal;
window.exportData = exportData;
window.importData = importData;
window.resetData = resetData;
window.uploadPlan = uploadPlan;
window.exportPlanTemplate = exportPlanTemplate;
window.resetPlan = resetPlan;
window.exportFullReport = exportFullReport;
window.exportWeeklyReport = exportWeeklyReport;
window.exportAllData = exportAllData;
window.exportSupervisorExcel = exportSupervisorExcel;
window.generateReschedule = generateReschedule;
window.showToast = showToast;
window.importAllData = importAllData;
window.resetAllData = resetAllData;
window.syncPush = syncPush;
window.syncPull = syncPull;
window.configureSync = configureSync;

// ===================== INIT =====================

function setupEventListeners() {
  document.getElementById('btn-logout').addEventListener('click', logout);

  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      const view = this.getAttribute('data-view');
      if (view) navigate(view);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  try {
    loadState();
    setupEventListeners();
    render();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
    setTimeout(syncPull, 1500);
  } catch (e) {
    console.error('Init error:', e);
    alert('Error al iniciar la aplicación: ' + e.message);
  }
});
