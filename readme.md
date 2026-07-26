# PulseWatch AI 🖥️📊

**A Real-Time Server Resource Monitoring & Analyzer Dashboard**

Built for the **Code With Affaq Coding Challenge

---

## 📌 Overview

PulseWatch AI is a real-time server resource monitoring dashboard that helps track server health, visualize performance metrics, and predict upcoming resource usage — all built using pure **HTML, CSS (Tailwind), and vanilla JavaScript**, without relying on any JavaScript framework.

The project gives system admins/developers a clean, responsive interface to monitor server load, get instant alerts on abnormal behavior, and anticipate future server strain using a custom-built regression model (no external ML library used).

---

## ⚙️ Usage

1. Clone the repository:
   ```bash
   git clone https://github.com/FaizanSb/PulseWatch-Build-with-AffaqKhan.git

   cd PulseWatch-Build-with-AffaqKhan
   ```

2. Open `index.html` directly in your browser, or run it via a live server extension (VS Code Live Server recommended) for the best experience.
3. Navigate between the three core sections using the sidebar/navbar:
   - **Dashboard** – Get a high-level overview of all server stats at a glance.
   - **Servers** – View individual server cards with detailed live metrics (CPU, RAM, Disk, Network).
   - **Alerts** – See real-time alerts triggered when server metrics cross safe thresholds.
4. Use the **theme toggle button** (🌙/☀️) to switch between dark and light mode anytime.
5. Watch the graphs update live and check the **prediction panel** to see the forecasted load for each server based on historical trend data.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🧩 Dashboard Section | Centralized overview of all servers with summary cards & graphs |
| 🖥️ Servers Section | Individual server cards showing live CPU/RAM/Disk/Network stats |
| 🚨 Alerts Section | Real-time alert system for threshold breaches (high CPU, low memory, etc.) |
| 🌗 Theme Toggle | Smooth dark/light mode switch across the entire app |
| 📈 Graphs & Cards | Data visualized through both graphs and card-based UI |
| 🔮 Custom Regression Model | Predicts next likely server load — built from scratch (no ML library) |
| 🎨 Hover Effects | Polished micro-interactions for a premium feel |
| 📱 Fully Responsive | Works seamlessly across desktop, tablet, and mobile |

---

## 🎯 Benefits

- **Early Problem Detection** – Alerts section helps catch server issues before they escalate into downtime.
- **Data-Driven Decisions** – Visual graphs + predictive trends make it easier to plan scaling or maintenance.
- **Lightweight & Framework-Free** – No React/Vue/Angular overhead; runs fast anywhere, even on low-end machines.
- **Custom Prediction Logic** – Since the regression is hand-built (not a plug-and-play library), it demonstrates real understanding of the underlying math/logic, not just usage of a black-box tool.
- **Great UX** – Card-based + graph-based dual visualization caters to both quick-glance users and detail-oriented users.
- **Portable & Easy to Deploy** – Pure HTML/CSS/JS means it can be hosted for free on Vercel, Netlify, GitHub Pages, or Firebase in minutes.

---

## 🛠️ Tech Stack

- **HTML5** – Structure
- **Tailwind CSS** – Styling & responsiveness
- **JavaScript (Vanilla)** – Logic, DOM manipulation, live data simulation, custom regression algorithm
- **Chart.js** – Graph rendering

---

## 📸 Screenshots

### 1️⃣ Dashboard Section
![Dashboard Screenshot](./screenshots/dashboard.png)

### 2️⃣ Servers Section
![Servers Screenshot](./screenshots/servers.png)

### 3️⃣ Alerts Section
![Alerts Screenshot](./screenshots/alerts.png)

### 4️⃣ Theme Toggle View
![Toggle Theme Screenshot](./screenshots/toggle.png)

---

## 🔗 Links

- **Live Demo:** [https://pulsewatch-mf.vercel.app/](https://pulsewatch-mf.vercel.app/)
- **GitHub Repository:** [https://github.com/FaizanSb/PulseWatch-Build-with-AffaqKhan](https://github.com/FaizanSb/PulseWatch-Build-with-AffaqKhan)

---

## 🙌 Credits

This project was built as part of **Code With Affaq — Coding Challenge #1**.
Big thanks to **Affaq Khan** for the opportunity and guidance!

`#BuildWithAffaq`

---

## 👤 Author

**Muhammad Faizan**
MERN Stack Developer | [GitHub: FaizanSb](https://github.com/FaizanSb)