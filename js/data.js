const SUPERVISORS = [
  { id: 'hernan-castro', name: 'Hernán Castro' },
  { id: 'oscar-navarrete', name: 'Óscar Navarrete' },
  { id: 'oscar-carrasco', name: 'Óscar Carrasco' }
];

const ADMIN = { id: 'admin', name: 'Administrador' };

const WEEKDAYS = ['fri', 'mon', 'tue', 'wed', 'thu'];
const WEEKDAY_LABELS = { fri: 'Vie', mon: 'Lun', tue: 'Mar', wed: 'Mié', thu: 'Jue' };
const WEEKDAY_FULL = { fri: 'Viernes', mon: 'Lunes', tue: 'Martes', wed: 'Miércoles', thu: 'Jueves' };

const SUPERVISOR_COMPANIES = {
  'hernan-castro': ['AGUA DULCE', 'C. BUFFALO', 'VICTOR DURAN', 'HERNAN CASTRO'],
  'oscar-navarrete': ['AGUA DULCE', 'C. BUFFALO', 'CHILTERMIC', 'KINETTA', 'MUEBLES NORTON', 'TATTER & BAEZA', 'OSCAR NAVARRETE'],
  'oscar-carrasco': ['C. BUFFALO', 'CHILTERMIC', 'MUEBLES NORTON', 'OSCAR CARRASCO']
};

const ACTIVITIES_DATA = {
  "AGUA DULCE": {
    activities: [
      { name: "DUCTOS SANITARIOS SHAFT" },
      { name: "DISTRIBUCIÓN AP TABIQUERÍA" },
      { name: "INSTALACIÓN DE RECEPTACULO Y TINAS" },
      { name: "WC" },
      { name: "VANITORIO" },
      { name: "GRIFERÍA RECEPTÁCULO Y TINA" },
      { name: "GRIFERÍA VANITORIO" },
      { name: "GRIFERÍA LAVAPLATOS" },
      { name: "MON1IT + GRIFERÍA LAVADORA" }
    ],
    week: {
      "DUCTOS SANITARIOS SHAFT": { fri: ["1401"], mon: ["1402"], tue: ["1403"], wed: ["1404"], thu: ["1401","1402"] },
      "DISTRIBUCIÓN AP TABIQUERÍA": { fri: [], mon: ["1301"], tue: ["1302"], wed: ["1303"], thu: ["1304"] },
      "INSTALACIÓN DE RECEPTACULO Y TINAS": { fri: ["701"], mon: ["604","605","702"], tue: ["703"], wed: ["704"], thu: ["705","706"] }
    }
  },
  "C. BUFFALO": {
    activities: [
      { name: "YESO DE CIELOS Y MUROS" },
      { name: "PRIMERA MANO PINTURA CLOSET" },
      { name: "PREPARACIÓN CIELO BAÑO" },
      { name: "PREPARACIÓN CIELO ZONAS SECAS + LOSALIN" },
      { name: "PINTURA CIELO BAÑO" },
      { name: "ENTREGA CANCHA PAPEL" },
      { name: "MANO DE TERMINACION PINTURA CLOSET" },
      { name: "PINTURA DE COCINA" }
    ],
    week: {
      "YESO DE CIELOS Y MUROS": { fri: [], mon: ["1401"], tue: ["1402"], wed: ["1403"], thu: ["1404"] },
      "PRIMERA MANO PINTURA CLOSET": { fri: ["901","902"], mon: ["903","904"], tue: ["905","906"], wed: ["1001","1002"], thu: ["1003","1004","1005"] },
      "PREPARACIÓN CIELO BAÑO": { fri: ["501","502","503"], mon: ["504","505","506"], tue: ["601","602","603"], wed: ["604","605","606"], thu: ["701","702","703"] },
      "PREPARACIÓN CIELO ZONAS SECAS + LOSALIN": { fri: ["501","504"], mon: ["505","506"], tue: ["601","602"], wed: ["603","604"], thu: ["605","606"] },
      "PINTURA CIELO BAÑO": { fri: [], mon: [], tue: ["201","202","203"], wed: ["301","302","303"], thu: ["304","305","306"] },
      "ENTREGA CANCHA PAPEL": { fri: [], mon: [], tue: [], wed: [], thu: ["201","202","203"] }
    }
  },
  "CHILTERMIC": {
    activities: [
      { name: "DUCTOS VENTILACIÓN SHAFT" },
      { name: "DUCTO CAMPANA" }
    ],
    week: {
      "DUCTOS VENTILACIÓN SHAFT": { fri: ["1401"], mon: ["1402"], tue: ["1301","1403"], wed: ["1304","1404"], thu: ["1401","1402"] }
    }
  },
  "KINETTA": {
    activities: [
      { name: "INSTALACIÓN DE VENTANAS" }
    ],
    week: {
      "INSTALACIÓN DE VENTANAS": { fri: ["1303","1304"], mon: ["1401"], tue: ["1402"], wed: ["1403"], thu: ["1404"] }
    }
  },
  "VICTOR DURAN": {
    activities: [
      { name: "BARANDA METÁLICA" },
      { name: "DUCTO BASURA" },
      { name: "MARCO METALICO BODEGAS" }
    ],
    week: {
      "BARANDA METÁLICA": { fri: [], mon: [], tue: [], wed: ["1301","1302","1303","1304","1401","1402","1403","1404"], thu: ["1101","1103"] }
    }
  },
  "MUEBLES NORTON": {
    activities: [
      { name: "MUEBLE BASE COCINA" },
      { name: "MUEBLE AÉREO COCINA" },
      { name: "CENEFA MUEBLE COCINA" },
      { name: "BASE PISO MUEBLE CLOSET" },
      { name: "PIERNA MUEBLE CLOSET" },
      { name: "CENEFA MUEBLE CLOSET" },
      { name: "ESTRUCTURA INTERIOR CLOSET" },
      { name: "PUERTA CLOSET" }
    ],
    week: {
      "MUEBLE BASE COCINA": { fri: ["504","603","604"], mon: ["605","606"], tue: ["701","702"], wed: ["703","704"], thu: ["705","706"] },
      "MUEBLE AÉREO COCINA": { fri: ["504","603","604"], mon: ["605","606"], tue: ["701","702"], wed: ["703","704"], thu: ["705","706"] },
      "CENEFA MUEBLE COCINA": { fri: ["504","603","604"], mon: ["605","606"], tue: ["701","702"], wed: ["703","704"], thu: ["705","706"] },
      "BASE PISO MUEBLE CLOSET": { fri: [], mon: [], tue: [], wed: [], thu: [] },
      "PIERNA MUEBLE CLOSET": { fri: [], mon: [], tue: [], wed: [], thu: [] },
      "CENEFA MUEBLE CLOSET": { fri: [], mon: [], tue: [], wed: [], thu: [] },
      "ESTRUCTURA INTERIOR CLOSET": { fri: ["504","601"], mon: ["602"], tue: ["603"], wed: ["604"], thu: ["605","606"] }
    }
  },
  "TATTER & BAEZA": {
    activities: [
      { name: "INSTALACIÓN ELECTRICA TABIQUERÍA" },
      { name: "HORNO" },
      { name: "ENCIMERA" },
      { name: "CAMPANA" }
    ],
    week: {
      "INSTALACIÓN ELECTRICA TABIQUERÍA": { fri: [], mon: ["1301"], tue: ["1302"], wed: ["1303","1401","1402"], thu: ["1304","1403","1404"] }
    }
  },
  "HERNAN CASTRO": {
    activities: [
      { name: "PICADO Y DESBASTE DE CIELO Y MUROS" },
      { name: "DESPEJE Y REPARACIÓN DESPICHES TERRAZA" },
      { name: "TRAZADO" },
      { name: "DESPEJE Y CENTRADO TUBERIAS ELECT." },
      { name: "DESPEJE Y CENTRADO TUBERIAS AP" },
      { name: "RASGOS DE VENTANAS Y PUERTAS" },
      { name: "CORONACIÓN DE VIGA BALCÓN" },
      { name: "MAQUILLAJE MURO BAÑO Y COCINA" },
      { name: "IMPERMEABILIZACIÓN DE VENTANAS" },
      { name: "INSTALACIÓN DE VENTANAS" },
      { name: "CANAL SUPERIOR TABIQUERÍA" },
      { name: "YESO DE CIELOS Y MUROS" },
      { name: "DUCTOS SANITARIOS SHAFT" },
      { name: "DUCTOS VENTILACIÓN SHAFT" },
      { name: "BARANDA METÁLICA" }
    ],
    week: {
      "PICADO Y DESBASTE DE CIELO Y MUROS": { fri: [], mon: [], tue: [], wed: [], thu: ["1404"] },
      "DESPEJE Y REPARACIÓN DESPICHES TERRAZA": { fri: [], mon: [], tue: [], wed: [], thu: ["1403","1404"] },
      "TRAZADO": { fri: [], mon: [], tue: [], wed: [], thu: ["1403","1404"] },
      "RASGOS DE VENTANAS Y PUERTAS": { fri: ["1403","1404"], mon: ["1401","1402"], tue: ["1403","1404"], wed: [], thu: [] },
      "CORONACIÓN DE VIGA BALCÓN": { fri: [], mon: [], tue: ["1403","1404"], wed: [], thu: [] },
      "MAQUILLAJE MURO BAÑO Y COCINA": { fri: [], mon: ["1401","1402"], tue: ["1403","1404"], wed: [], thu: [] },
      "IMPERMEABILIZACIÓN DE VENTANAS": { fri: [], mon: [], tue: [], wed: ["1401","1402","1403","1404","1401","1402"], thu: ["1403","1404"] },
      "INSTALACIÓN DE VENTANAS": { fri: ["1303","1304"], mon: ["1401"], tue: ["1402"], wed: ["1403"], thu: ["1404"] },
      "CANAL SUPERIOR TABIQUERÍA": { fri: ["1401","1402","1403","1404"], mon: [], tue: [], wed: ["1401","1402","1403","1404"], thu: [] },
      "YESO DE CIELOS Y MUROS": { fri: [], mon: ["1401"], tue: ["1402"], wed: ["1403"], thu: ["1404"] },
      "DUCTOS SANITARIOS SHAFT": { fri: ["1401"], mon: ["1402"], tue: ["1403"], wed: ["1404"], thu: ["1401","1402"] },
      "DUCTOS VENTILACIÓN SHAFT": { fri: ["1401"], mon: ["1402"], tue: ["1301","1403"], wed: ["1304","1404"], thu: ["1401","1402"] },
      "BARANDA METÁLICA": { fri: [], mon: [], tue: [], wed: ["1301","1302","1303","1304","1401","1402","1403","1404"], thu: ["1101","1103"] }
    }
  },
  "OSCAR NAVARRETE": {
    activities: [
      { name: "ESTRUCTURA VOLCOMETAL TABIQUERÍA" },
      { name: "INSTALACIÓN ELECTRICA TABIQUERÍA" },
      { name: "PRIMERA CARA VOLCANITA" },
      { name: "DISTRIBUCIÓN AP TABIQUERÍA" },
      { name: "LANA FISITERM TABIQUERÍA" },
      { name: "SEGUNDA CARA VOLCANITA" },
      { name: "LANA FISITERM SHAFT" },
      { name: "VOLCOPANEL SHAFT" },
      { name: "IMPERMEABILIZACIÓN DE TERRAZA" },
      { name: "IMPERMEABILIZACIÓN BAÑOS Y COCINA" },
      { name: "ENCATRADO RECEPTACULO" },
      { name: "HUINCHA Y PASTA TABIQUERÍA" },
      { name: "PORCELANATO DE LIVING Y COCINA" },
      { name: "PORCELANATO TERRAZA" },
      { name: "PORCELANATO DE BAÑO" },
      { name: "NIVELACION DE PISO DORMITORIOS" },
      { name: "PRIMERA MANO PINTURA CLOSET" },
      { name: "VIGONES DE BAÑO" },
      { name: "CORNISAS DE BAÑO" },
      { name: "INSTALACIÓN DE RECEPTACULO Y TINAS" },
      { name: "BOTA AGUAS RECEPTÁCULO Y TINAS" },
      { name: "MUEBLE BASE COCINA" },
      { name: "MUEBLE AÉREO COCINA" },
      { name: "CENEFA MUEBLE COCINA" },
      { name: "BASE PISO MUEBLE CLOSET" },
      { name: "PIERNA MUEBLE CLOSET" },
      { name: "CENEFA MUEBLE CLOSET" },
      { name: "VIGONES ZONAS SECAS" },
      { name: "CORNISAS ZONAS SECAS" },
      { name: "REMATE VIGONES Y CORNISAS" },
      { name: "PREPARACIÓN CIELO BAÑO" }
    ],
    week: {
      "ESTRUCTURA VOLCOMETAL TABIQUERÍA": { fri: ["1301"], mon: ["1302"], tue: ["1303"], wed: ["1304","1401","1402"], thu: ["1403","1404"] },
      "INSTALACIÓN ELECTRICA TABIQUERÍA": { fri: [], mon: ["1301"], tue: ["1302"], wed: ["1303","1401","1402"], thu: ["1304","1403","1404"] },
      "PRIMERA CARA VOLCANITA": { fri: ["1301"], mon: ["1302"], tue: ["1303"], wed: ["1304","1401","1402"], thu: ["1403","1404"] },
      "DISTRIBUCIÓN AP TABIQUERÍA": { fri: [], mon: ["1301"], tue: ["1302"], wed: ["1303"], thu: ["1304"] },
      "SEGUNDA CARA VOLCANITA": { fri: ["1004","1101"], mon: ["1102","1103"], tue: ["1202"], wed: ["1203"], thu: ["1204"] },
      "LANA FISITERM SHAFT": { fri: ["906","1004","1005","1101"], mon: ["1103","1201"], tue: [], wed: ["1202","1203","1204"], thu: [] },
      "VOLCOPANEL SHAFT": { fri: ["1004","1005"], mon: ["1101"], tue: ["1103"], wed: ["1201","1202"], thu: ["1203","1204"] },
      "IMPERMEABILIZACIÓN BAÑOS Y COCINA": { fri: ["1101","1102"], mon: [], tue: ["1103","1104","1105"], wed: [], thu: [] },
      "ENCATRADO RECEPTACULO": { fri: ["1004","1005"], mon: [], tue: ["1101","1102"], wed: ["1103","1104","1105"], thu: [] },
      "HUINCHA Y PASTA TABIQUERÍA": { fri: ["1003","1004"], mon: ["1005"], tue: ["1101","1102"], wed: ["1103"], thu: ["1104","1105"] },
      "PORCELANATO DE LIVING Y COCINA": { fri: ["1002"], mon: ["1003","1004"], tue: ["1005","1101"], wed: ["1102","1103"], thu: ["1104","1105"] },
      "PORCELANATO TERRAZA": { fri: ["804","805","806","1001","1002"], mon: ["1003","1004"], tue: ["1005","1101"], wed: ["1102","1103"], thu: ["1104","1105"] },
      "PORCELANATO DE BAÑO": { fri: ["1001","1002"], mon: ["1003","1004"], tue: ["1005","1101"], wed: ["1102","1103"], thu: ["1104","1105"] },
      "NIVELACION DE PISO DORMITORIOS": { fri: ["1004","1005","1101","1102","1103","1104","1105"], mon: [], tue: [], wed: [], thu: [] },
      "PRIMERA MANO PINTURA CLOSET": { fri: ["901","902"], mon: ["903","904"], tue: ["905","906"], wed: ["1001","1002"], thu: ["1003","1004","1005"] },
      "VIGONES DE BAÑO": { fri: ["803","804"], mon: ["901"], tue: ["902"], wed: ["903","904"], thu: ["905","906"] },
      "CORNISAS DE BAÑO": { fri: [], mon: ["803"], tue: ["804"], wed: ["805"], thu: ["806"] },
      "INSTALACIÓN DE RECEPTACULO Y TINAS": { fri: ["701"], mon: ["604","605","702"], tue: ["703"], wed: ["704"], thu: ["705","706"] },
      "BOTA AGUAS RECEPTÁCULO Y TINAS": { fri: ["401","402","403"], mon: ["404","405","406"], tue: ["501","502","503"], wed: ["504","505","506"], thu: ["601","602","603"] },
      "MUEBLE BASE COCINA": { fri: ["504","603","604"], mon: ["605","606"], tue: ["701","702"], wed: ["703","704"], thu: ["705","706"] },
      "MUEBLE AÉREO COCINA": { fri: ["504","603","604"], mon: ["605","606"], tue: ["701","702"], wed: ["703","704"], thu: ["705","706"] },
      "CENEFA MUEBLE COCINA": { fri: ["504","603","604"], mon: ["605","606"], tue: ["701","702"], wed: ["703","704"], thu: ["705","706"] },
      "VIGONES ZONAS SECAS": { fri: [], mon: [], tue: [], wed: ["801","802","803","804","805","806"], thu: [] },
      "REMATE VIGONES Y CORNISAS": { fri: ["601","602"], mon: ["504","603","604"], tue: ["605","606"], wed: ["701","702"], thu: ["703","704"] },
      "PREPARACIÓN CIELO BAÑO": { fri: ["501","502","503"], mon: ["504","505","506"], tue: ["601","602","603"], wed: ["604","605","606"], thu: ["701","702","703"] }
    }
  },
  "OSCAR CARRASCO": {
    activities: [
      { name: "MUEBLE BASE COCINA" },
      { name: "MUEBLE AÉREO COCINA" },
      { name: "CENEFA MUEBLE COCINA" },
      { name: "BASE PISO MUEBLE CLOSET" },
      { name: "PIERNA MUEBLE CLOSET" },
      { name: "CENEFA MUEBLE CLOSET" },
      { name: "PREPARACIÓN CIELO BAÑO" },
      { name: "ESTRUCTURA INTERIOR CLOSET" },
      { name: "PREPARACIÓN CIELO ZONAS SECAS + LOSALIN" },
      { name: "ZÓCALO DE BAÑO" },
      { name: "REVESTIMIENTO MURO PVC BAÑO" },
      { name: "REVESTIMIENTO DE ZÓCALO" },
      { name: "REVESTIMIENTO MURO PVC SALPICADERO" },
      { name: "PUERTAS DE ACCESO PROVISORIA" },
      { name: "PUERTAS DE BAÑO Y DORMITORIO" },
      { name: "PINTURA CIELO BAÑO" },
      { name: "REVESTIMIENTO ENDOLADO VENTANA" },
      { name: "ENTREGA CANCHA PAPEL" },
      { name: "PUERTA CLOSET" },
      { name: "PILASTRAS PUERTAS DE BAÑO Y DORMITORIO" }
    ],
    week: {
      "MUEBLE BASE COCINA": { fri: ["504","603","604"], mon: ["605","606"], tue: ["701","702"], wed: ["703","704"], thu: ["705","706"] },
      "MUEBLE AÉREO COCINA": { fri: ["504","603","604"], mon: ["605","606"], tue: ["701","702"], wed: ["703","704"], thu: ["705","706"] },
      "CENEFA MUEBLE COCINA": { fri: ["504","603","604"], mon: ["605","606"], tue: ["701","702"], wed: ["703","704"], thu: ["705","706"] },
      "PREPARACIÓN CIELO BAÑO": { fri: ["501","502","503"], mon: ["504","505","506"], tue: ["601","602","603"], wed: ["604","605","606"], thu: ["701","702","703"] },
      "ESTRUCTURA INTERIOR CLOSET": { fri: ["504","601"], mon: ["602"], tue: ["603"], wed: ["604"], thu: ["605","606"] },
      "PREPARACIÓN CIELO ZONAS SECAS + LOSALIN": { fri: ["501","504"], mon: ["505","506"], tue: ["601","602"], wed: ["603","604"], thu: ["605","606"] },
      "ZÓCALO DE BAÑO": { fri: [], mon: ["601","602","603"], tue: ["604","605","606"], wed: [], thu: [] },
      "REVESTIMIENTO MURO PVC BAÑO": { fri: ["202","301","302"], mon: ["303","304"], tue: ["305","306"], wed: ["401","402","403"], thu: ["404","405","406"] },
      "REVESTIMIENTO DE ZÓCALO": { fri: ["202","301","302"], mon: ["303","304"], tue: ["305","306"], wed: ["401","402","403"], thu: ["404","405","406"] },
      "REVESTIMIENTO MURO PVC SALPICADERO": { fri: ["201","202","203","301","302"], mon: ["303","304"], tue: ["305","306"], wed: ["401","402","403"], thu: ["404","405","406"] },
      "PUERTAS DE BAÑO Y DORMITORIO": { fri: ["203","301","302"], mon: ["303","304","305"], tue: ["306","401","402"], wed: ["403","404","405","406"], thu: ["501","502","503","504"] },
      "PINTURA CIELO BAÑO": { fri: [], mon: [], tue: ["201","202","203"], wed: ["301","302","303"], thu: ["304","305","306"] },
      "ENTREGA CANCHA PAPEL": { fri: [], mon: [], tue: [], wed: [], thu: ["201","202","203"] },
      "PILASTRAS PUERTAS DE BAÑO Y DORMITORIO": { fri: [], mon: [], tue: [], wed: ["201","202","203"], thu: [] }
    }
  }
};

let activitiesData = ACTIVITIES_DATA;

function getMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0,0,0,0);
  return d;
}

function getWeekDates(monday) {
  const dates = [];
  const days = [5, 1, 2, 3, 4]; // fri, mon, tue, wed, thu (ISO: 5=Friday, 1=Monday...)
  for (const d of days) {
    const date = new Date(monday);
    const target = d;
    const current = date.getDay();
    const diff = target - current;
    date.setDate(date.getDate() + diff);
    dates.push(date);
  }
  return dates;
}

function getWeekKey(monday) {
  return monday.toISOString().slice(0, 10);
}

function formatDate(date) {
  return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
}

function formatDateFull(date) {
  return date.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
}

function getTodayWeekdayIndex() {
  const day = new Date().getDay();
  const map = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 0, 6: 0, 0: 0 };
  return map[day] ?? 0;
}

function updateActivitiesData(newData) {
  activitiesData = newData;
  localStorage.setItem('avance-obra-custom-data', JSON.stringify(newData));
}

function loadCustomData() {
  try {
    const saved = localStorage.getItem('avance-obra-custom-data');
    if (saved) {
      activitiesData = JSON.parse(saved);
    }
  } catch(e) {}
}

function getPendingForReschedule(dates) {
  const pending = {};
  for (const sup of SUPERVISORS) {
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
            if (!isDeptDone(sup.id, act.name, d, date)) {
              if (!pending[comp]) pending[comp] = {};
              if (!pending[comp][act.name]) pending[comp][act.name] = [];
              if (!pending[comp][act.name].includes(d)) {
                pending[comp][act.name].push(d);
              }
            }
          }
        }
      }
    }
  }
  return pending;
}

function generateNextWeekPlan(pending) {
  const nextData = JSON.parse(JSON.stringify(activitiesData));
  const companiesWithPending = Object.keys(pending);
  const allCompanies = Object.keys(nextData);
  for (const comp of allCompanies) {
    const acts = nextData[comp].activities || [];
    for (const act of acts) {
      const actName = act.name;
      if (companiesWithPending.includes(comp) && pending[comp][actName]) {
        const depts = pending[comp][actName];
        nextData[comp].week[actName] = {
          fri: [], mon: [], tue: [], wed: [], thu: []
        };
        const dayKeys = ['fri', 'mon', 'tue', 'wed', 'thu'];
        const perDay = Math.ceil(depts.length / 5);
        depts.forEach((d, idx) => {
          const dayIdx = Math.min(Math.floor(idx / perDay), 4);
          nextData[comp].week[actName][dayKeys[dayIdx]].push(d);
        });
      } else {
        nextData[comp].week[actName] = {
          fri: [], mon: [], tue: [], wed: [], thu: []
        };
      }
    }
  }
  return nextData;
}

loadCustomData();
