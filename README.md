# 🫀 PRANA: AI-Powered Clinical Vitals Dashboard

<div align="center">
  <img src="https://img.shields.io/badge/Status-Active-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=for-the-badge" />
</div>

<br />

PRANA is a high-fidelity, real-time patient monitoring dashboard designed to predict and simulate patient deterioration before it's too late. Powered by **Random Forest** and **SHAP Explainability**, the platform monitors chronic patients using clinical vitals, detecting early signs of heart failure and delivering actionable risk scores to doctors in real time.

---

## ✨ Features

- **📊 Live Patient Vitals Grid:** Real-time tracking of Heart Rate, Ejection Fraction, Serum Creatinine, Serum Sodium, Blood Pressure, and Blood Glucose.
- **📈 Pure SVG Sparklines:** Custom, dynamic SVG trend charts that update smoothly without heavy third-party charting libraries.
- **🧠 SHAP Explainability:** Transparent risk scoring with AI factors breaking down exactly *why* a patient's risk score is changing.
- **🚨 Multi-Stage Emergency Alerts:** Automated sequence triggering Red Danger UI banners, Toast notifications, and critical status modals.
- **📞 Automated Twilio Voice Calls:** Automatically dispatches a TwiML voice call to emergency contacts reading the exact critical vitals when a patient enters the danger zone.
- **📱 Pushbullet Notifications:** Instantly sends detailed Push notifications to doctors' phones for immediate medical intervention.

---

## 🛠️ Technology Stack

### Frontend Architecture
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![React Router](https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&logo=react-router&logoColor=white)

- **React 19 & Vite:** Lightning-fast frontend tooling and component rendering.
- **Tailwind CSS v4:** Utility-first styling for beautiful, responsive glassmorphism designs.
- **Lucide React:** Beautiful, consistent iconography.

### Backend & Integrations
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Twilio](https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=Twilio&logoColor=white)
![Pushbullet](https://img.shields.io/badge/Pushbullet-4AB367?style=for-the-badge&logo=Pushbullet&logoColor=white)
![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)

- **FastAPI:** High-performance async Python backend server.
- **Twilio API:** Integrated TwiML voice broadcasting.
- **Pushbullet API:** Real-time push notifications.
- **Google Vertex AI:** Underpins the clinical consultation and clinical summary logic.

---

## 🚀 Getting Started

### 1. Start the Frontend
```bash
cd chronicare
npm install
npm run dev
```

### 2. Start the Backend
Navigate to your backend directory and start the FastAPI server:
```bash
cd cognitionx-backend
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 🎮 Simulation Scenarios

The dashboard includes a built-in simulation engine to test different clinical states:
- **🟢 Healthy Patient:** Baseline normal ranges.
- **🟡 Early Warning:** Subtle deterioration mimicking early heart failure signs.
- **🔴 Critical Patient:** Immediate jump into danger thresholds triggering Twilio/Pushbullet APIs.
- **🟠 Deteriorating (Real-Time):** A dynamic interval simulation where vitals slowly degrade over time until the critical threshold automatically trips.
