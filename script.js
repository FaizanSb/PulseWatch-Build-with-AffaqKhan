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

// Linear regression trend prediction (see earlier explanation for the math)
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

// ============ ALERTS ============

function canAlert(key) {
  const now = Date.now();
  if (now - lastAlertTime[key] > COOLDOWN) {
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

  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("PulseWatch Alert", { body: message });
  }
}

function renderAlerts() {
  const list = document.getElementById("alertsList");
  if (alertLog.length === 0) {
    list.innerHTML = `<p class="text-slate-500 text-xs">No alerts yet.</p>`;
    return;
  }
  list.innerHTML = alertLog.map(a => `
    <div class="flex items-center justify-between text-xs bg-bgmain rounded-lg px-3 py-2">
      <span class="${a.type === 'danger' ? 'text-red-400' : 'text-yellow-400'}">● ${a.message}</span>
      <span class="text-slate-500">${a.time}</span>
    </div>
  `).join("");
}

// BUG FIX: was checking "temperature" (undefined) — now correctly checks "temp"
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

  document.getElementById("predictionBanner").textContent = predictTrend(history.cpu);

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
}

// ============ CLOCK ============

function updateClock() {
  document.getElementById("currentTime").textContent =
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ============ MOBILE SIDEBAR TOGGLE ============

document.getElementById("menuBtn").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("-translate-x-full");
});

// ============ SCROLL-SPY (highlight active sidebar link) ============
// Intersection Observer browser ko batata hai "ye element abhi screen pe
// dikh raha hai ya nahi" — bina humein manually scroll position calculate
// karne ki zaroorat ke. Jab koi section screen ke beech mein aata hai,
// hum us se match karne wala sidebar link "active-link" bana dete hain.

const navLinks = document.querySelectorAll(".nav-link");

function setActiveLink(sectionId) {
  navLinks.forEach(link => {
    if (link.dataset.section === sectionId) {
      link.classList.add("active-link");
    } else {
      link.classList.remove("active-link");
    }
  });
}

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach(entry => {
      // isIntersecting = true jab section screen ke observe-window mein aa jaye
      if (entry.isIntersecting) {
        setActiveLink(entry.target.id);
      }
    });
  },
  {
    // rootMargin screen ke top/bottom se thora area "kaat" deta hai —
    // isse section tab "active" mana jayega jab wo screen ke upper-mid area mein ho,
    // sirf ek pixel dikhne pe nahi
    rootMargin: "-20% 0px -70% 0px"
  }
);

document.querySelectorAll("main section").forEach(section => {
  sectionObserver.observe(section);
});

// ============ INIT ============

if ("Notification" in window && Notification.permission === "default") {
  Notification.requestPermission();
}

updateClock();
setInterval(updateClock, 1000);

updateCards(); // run once immediately so page isn't empty on load
setInterval(updateCards, 2000);

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

// Page load pe: pehle se saved theme yaad rakho (localStorage)
const savedTheme = localStorage.getItem("pulsewatch-theme") || "dark";
applyTheme(savedTheme);

// Button click pe: mood switch karo aur yaad rakh lo
themeToggle.addEventListener("click", () => {
  const isLight = htmlEl.classList.contains("light-theme");
  const newTheme = isLight ? "dark" : "light";
  applyTheme(newTheme);
  localStorage.setItem("pulsewatch-theme", newTheme);
});