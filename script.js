// ============ STATE (starting values) ============
let cpu = 45;
let ram = 68;
let disk = 72;
let network = 125;
let temp = 46; // NOTE: variable name is "temp", used consistently everywhere below

let history = { cpu: [], ram: [], network: [], disk: [] };
let alertLog = [];
let lastAlertTime = { cpu: 0, ram: 0, disk: 0, temp: 0 };
const COOLDOWN = 15000; // 15 seconds between repeat alerts of the same type

// ============ HELPER FUNCTIONS ============

// Moves a value slightly up/down instead of pure random jumps
function randomWalk(value, min, max, step) {
  let change = (Math.random() - 0.5) * step;
  let next = value + change;
  if (next < min) next = min;
  if (next > max) next = max;
  return Math.round(next * 10) / 10;
}

// Updates a status label + color based on a threshold
function setStatus(elementId, value, threshold) {
  const el = document.getElementById(elementId);
  if (value > threshold) {
    el.textContent = "Warning";
    el.className = "text-[10px] text-yellow-400";
  } else {
    el.textContent = "Healthy";
    el.className = "text-[10px] text-green-400";
  }
}

// Linear regression trend prediction
function predictTrend(values) {
  const n = values.length;
  if (n < 4) return "Collecting data for prediction...";

  const xs = values.map((_, i) => i);
  const ys = values;

  const xMean = xs.reduce((a, b) => a + b, 0) / n;
  const yMean = ys.reduce((a, b) => a + b, 0) / n;

  let num = 0, den = 0;
  for (let i = 0; i < n; i++) {
    num += (xs[i] - xMean) * (ys[i] - yMean);
    den += (xs[i] - xMean) ** 2;
  }
  const slope = den === 0 ? 0 : num / den;
  const intercept = yMean - slope * xMean;
  const predicted = Math.round(slope * (n - 1 + 5) + intercept);

  if (slope > 0.8 && predicted >= 80) {
    return `⚠ CPU rising fast — could hit ${predicted}% soon. Consider action.`;
  } else if (slope > 0.3) {
    return `CPU trending upward, projected ~${predicted}% shortly.`;
  } else if (slope < -0.3) {
    return `CPU trending downward, projected ~${predicted}% shortly.`;
  } else {
    return `CPU is stable around current levels.`;
  }
}

// ============ ALERT SOUND ============
// Put a short beep file at assets/alert-beep.mp3 (any free notification sound works)
const alertSound = new Audio("/assets/beepAlarm.mp3");

function playAlertSound() {
  alertSound.currentTime = 0; // taake baar baar bajay
  alertSound.play().catch(() => {
    // Browsers block autoplay until the user interacts with the page once — normal, not a bug

  });
}

// ============ BELL BADGE ============
const alertBadge = document.getElementById("alertBadge");

function updateAlertBadge() {
  if (alertLog.length > 0) {
    alertBadge.textContent = alertLog.length;
    alertBadge.classList.remove("hidden");
  } else {
    alertBadge.classList.add("hidden");
  }
}

// ============ ALERTS ============

function canAlert(key) {
  const now = Date.now();
  if (now - lastAlertTime[key] > COOLDOWN) { // check cooldown
    lastAlertTime[key] = now;
    return true;
  }
  return false;
}

function pushAlert(type, message) {
  const alert = {
    type: type,
    message: message,
    time: new Date().toLocaleTimeString()
  };
  alertLog.unshift(alert);
  alertLog = alertLog.slice(0, 10);

  renderAlerts();
  playAlertSound();
  updateAlertBadge();

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("PulseWatch Alert", { body: message });
  }
}

function renderAlerts() {
  const list = document.getElementById("alertsList");
  const empty = document.getElementById("alertsEmptyState");

  if (alertLog.length === 0) {
    empty.classList.remove("hidden");
    list.classList.add("hidden");
    list.innerHTML = "";
    return;
  }

  empty.classList.add("hidden");
  list.classList.remove("hidden");

  // "alert-new" class sirf sabse naye (index 0) alert pe lagti hai,
  // isliye sirf wahi pulse/animate hoga, purane cards dobara nahi hilenge
  list.innerHTML = alertLog.map((a, i) => `
    <div class="flex items-center justify-between text-xs bg-bgmain rounded-lg px-3 py-2 ${i === 0 ? "alert-new" : ""}">
      <span class="${a.type === "danger" ? "text-red-400" : "text-yellow-400"}">
        ● ${a.message}
      </span>
      <span class="text-slate-500">${a.time}</span>
    </div>
  `).join("");
}

function checkAlerts() {
  if (cpu > 80 && canAlert("cpu")) pushAlert("danger", `High CPU usage: ${cpu}%`);
  if (ram > 85 && canAlert("ram")) pushAlert("warning", `Memory warning: ${ram}%`);
  if (disk > 90 && canAlert("disk")) pushAlert("danger", `Disk critical: ${disk}%`);
  if (temp > 60 && canAlert("temp")) pushAlert("warning", `Temperature high: ${temp}°C`);
}

// ============ CHARTS ============

function makeChart(canvasId, color) {
  const ctx = document.getElementById(canvasId).getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        data: [],
        borderColor: color,
        backgroundColor: color + "22",
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.35,
        fill: true
      }]
    },
    options: {
      responsive: true,
      scales: { x: { display: false }, y: { display: false } },
      plugins: { legend: { display: false } }
    }
  });
}

const cpuChart = makeChart("cpuChart", "#3B82F6");
const ramChart = makeChart("ramChart", "#8B5CF6");
const networkChart = makeChart("networkChart", "#22C55E");
const diskChart = makeChart("diskChart", "#EF4444");

// ============ MAIN UPDATE LOOP ============

function updateCards() {
  cpu = randomWalk(cpu, 10, 95, 6);
  ram = randomWalk(ram, 20, 95, 4);
  disk = randomWalk(disk, 30, 98, 1.5);
  network = randomWalk(network, 20, 300, 25);
  temp = randomWalk(temp, 30, 75, 2);

  document.getElementById("cpuValue").textContent = cpu + "%";
  document.getElementById("ramValue").textContent = ram + "%";
  document.getElementById("diskValue").textContent = disk + "%";
  document.getElementById("networkValue").textContent = network + " Mbps";
  document.getElementById("tempValue").textContent = temp + "°C";

  setStatus("cpuStatus", cpu, 80);
  setStatus("ramStatus", ram, 85);
  setStatus("diskStatus", disk, 90);
  setStatus("networkStatus", network, 250);
  setStatus("tempStatus", temp, 60);

  history.cpu.push(cpu);
  history.ram.push(ram);
  history.network.push(network);
  history.disk.push(disk);

  Object.keys(history).forEach(key => {
    if (history[key].length > 20) history[key].shift();
  });

  // FIX: sirf inner span update hoga ab, tooltip icon/div safe rahega
  document.getElementById("predictionText").textContent = predictTrend(history.cpu);

  cpuChart.data.labels = history.cpu.map((_, i) => i);
  cpuChart.data.datasets[0].data = history.cpu;
  cpuChart.update("none");

  ramChart.data.labels = history.ram.map((_, i) => i);
  ramChart.data.datasets[0].data = history.ram;
  ramChart.update("none");

  networkChart.data.labels = history.network.map((_, i) => i);
  networkChart.data.datasets[0].data = history.network;
  networkChart.update("none");

  diskChart.data.labels = history.disk.map((_, i) => i);
  diskChart.data.datasets[0].data = history.disk;
  diskChart.update("none");

  checkAlerts();

  // Servers ke apne cpu/ram bhi thoda fluctuate karein — offline node ko chhod kar
  updateServersData();
}

// ============ CLOCK ============

function updateClock() {
  document.getElementById("currentTime").textContent =
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ============ SIDEBAR OPEN/CLOSE ============

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sidebarClose = document.getElementById("sidebarClose");
const menuBtn = document.getElementById("menuBtn");

function openSidebar() {
  sidebar.classList.remove("-translate-x-full");
  sidebarOverlay.classList.remove("hidden");
}

function closeSidebar() {
  sidebar.classList.add("-translate-x-full");
  sidebarOverlay.classList.add("hidden");
}

menuBtn.addEventListener("click", openSidebar);
sidebarClose.addEventListener("click", closeSidebar);
sidebarOverlay.addEventListener("click", closeSidebar); // bahar tap karo to bhi band ho

// ============ PAGE SWITCHING ============

const navLinks = document.querySelectorAll(".nav-link");
const pageSections = document.querySelectorAll(".page-section");

function setActiveLink(sectionId) {
  navLinks.forEach(link => {
    link.classList.toggle("active-link", link.dataset.section === sectionId);
  });
}

function showPage(sectionId) {
  pageSections.forEach(sec => {
    sec.classList.toggle("hidden", sec.id !== sectionId);
  });
  setActiveLink(sectionId);
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// FIX: pehle ye listener 2 baar attach ho raha tha — ab sirf ek baar
navLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    showPage(link.dataset.section);
    closeSidebar(); // mobile pe link dabate hi sidebar khud band ho jaye
  });
});

// Bell icon pe click karne se alerts page khulega
// (active-link class involve nahi hoti isme, sirf page switch hota hai)
const bellIcon = document.querySelector('[data-section="alertsSection"].cursor-pointer');

bellIcon.addEventListener("click", () => {
  showPage(bellIcon.dataset.section);
  closeSidebar();
});

// ============ SERVERS PAGE ============

const serversData = [
  { name: "Web Server 01",    location: "US-East",    status: "online",  cpu: 42, ram: 61 },
  { name: "Database Primary", location: "US-East",    status: "online",  cpu: 58, ram: 74 },
  { name: "Cache Server",     location: "EU-West",    status: "online",  cpu: 23, ram: 40 },
  { name: "Backup Node",      location: "AP-South",   status: "warning", cpu: 81, ram: 88 },
  { name: "API Gateway",      location: "US-West",    status: "online",  cpu: 35, ram: 52 },
  { name: "Worker Node 02",   location: "EU-Central", status: "offline", cpu: 0,  ram: 0  }
];

function statusBadge(status) {
  const map = {
    online:  "bg-green-400/15 text-green-400",
    warning: "bg-yellow-400/15 text-yellow-400",
    offline: "bg-red-400/15 text-red-400"
  };
  return map[status] || map.online;
}

function renderServers() {
  const grid = document.getElementById("serversGrid");
  grid.innerHTML = serversData.map(s => `
    <div class="bg-card rounded-xl p-4 chart-card">
      <div class="flex items-center justify-between mb-2">
        <p class="font-medium text-sm">${s.name}</p>
        <span class="text-[10px] px-2 py-0.5 rounded-full capitalize ${statusBadge(s.status)}">${s.status}</span>
      </div>
      <p class="text-xs text-slate-400 mb-3">${s.location}</p>
      <div class="flex items-center justify-between text-xs text-slate-400">
        <span>CPU ${s.cpu}%</span>
        <span>RAM ${s.ram}%</span>
      </div>
    </div>
  `).join("");

  document.getElementById("serverCount").textContent = `${serversData.length} servers`;
}

// Server ke apne cpu/ram values ko live fluctuate karta hai (offline server ko 0/0 pe fix rakhta hai)
// aur phir grid ko re-render karta hai, taake numbers "fix" na rahein.
function updateServersData() {
  serversData.forEach(s => {
    if (s.status === "offline") {
      s.cpu = 0;
      s.ram = 0;
      return;
    }
    s.cpu = randomWalk(s.cpu, 10, 95, 5);
    s.ram = randomWalk(s.ram, 15, 95, 4);
  });
  renderServers();
}

// ============ CLEAR ALERTS ============
// FIX: pehle 2 alag listeners is button pe lagay hue thay, ab sirf ek —
// alertLog reset karta hai, list re-render karta hai, aur badge bhi hide karta hai
document.getElementById("clearAlertsBtn").addEventListener("click", () => {
  alertLog = [];
  renderAlerts();
  updateAlertBadge();
});

// ============ THEME TOGGLE ============

const themeToggle = document.getElementById("themeToggle");
const htmlEl = document.documentElement; // <html> tag

function applyTheme(theme) {
  if (theme === "light") {
    htmlEl.classList.add("light-theme");
    themeToggle.textContent = "☀️";
  } else {
    htmlEl.classList.remove("light-theme");
    themeToggle.textContent = "🌙";
  }
}

themeToggle.addEventListener("click", () => {
  const isLight = htmlEl.classList.contains("light-theme");
  const newTheme = isLight ? "dark" : "light";
  applyTheme(newTheme);
  localStorage.setItem("pulsewatch-theme", newTheme);
});

// ============ INIT ============

if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

// Page load pe: pehle se saved theme yaad rakho
const savedTheme = localStorage.getItem("pulsewatch-theme") || "dark";
applyTheme(savedTheme);

// Default page: Dashboard
showPage("dashboardSection");

// Servers grid render (static dummy data — API aane pe yahan replace karna)
renderServers();

updateClock();
setInterval(updateClock, 1000);

updateCards(); // run once immediately so page isn't empty on load
setInterval(updateCards, 2000);