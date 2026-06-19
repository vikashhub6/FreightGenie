# FreightGenie 🚢✨
### AI-Powered Freight Management SaaS for Freight Forwarders

FreightGenie is a **company-based SaaS platform** where freight forwarding companies register their workspace, onboard their team (with admin approval), and manage shipments end-to-end — from document collection to AI compliance analysis.

---

## 🏢 How It Works (SaaS Model)

FreightGenie is built for **freight forwarding companies**, not individual users.

| Role | What they can do |
|------|-----------------|
| **Company Admin** | Registers the company, approves new team members, manages all shipments |
| **Forwarder (Employee)** | Joins existing company workspace, creates & manages shipments |
| **Exporter** | No account needed — receives a secure link to upload shipping documents |

### Onboarding Flow
1. **Company registers** → Admin creates workspace with company name + company email config
2. **New employee registers** → Enters same company name → goes into **pending approval**
3. **Admin gets email notification** → "New user X has requested to join your workspace"
4. **Admin approves from Admin Panel** → Approval email sent to the user automatically
5. **User receives approval email** → Can now login and access the dashboard
6. **Exporter** → Receives a secure token link, uploads docs directly — no signup required

---

## 🚀 Features

- **AI Compliance Analysis** — Upload shipping documents, get instant compliance score (0–100) with detailed flags
- **Real-time Tracking** — Live shipment status via WebSocket
- **Cost Estimates** — Auto-generated breakdown for customs, freight, insurance, handling
- **Auto Email Drafts** — AI writes compliance summary emails, sent from your company email
- **Exporter Self-Upload** — Secure token link for exporters to upload docs (no account needed)
- **Business Analytics** — Server-side charts (route analysis, cargo breakdown, monthly trends, compliance distributions)
- **Admin Panel** — Approve/reject users, manage company-wide shipments

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18, React Router v6, Socket.IO Client, Recharts, Axios |
| Backend | Python FastAPI, Uvicorn |
| Database | MongoDB (PyMongo) |
| AI | Claude API (compliance analysis, email drafts) |
| Storage | Cloudinary (document & chart uploads) |
| Analytics | Pandas, NumPy, Seaborn, Matplotlib |
| Deploy | Railway (backend), Vercel/Netlify (frontend) |

---

## 📁 Project Structure

```
FreightGenie/
├── backend/
│   ├── app/
│   │   ├── routers/          # FastAPI route handlers
│   │   ├── controllers/      # Business logic layer
│   │   ├── services/         # AI, analytics, cloudinary, email
│   │   └── main.py
│   ├── api.py
│   └── requirements.txt
│
└── frontend/
    └── src/
        ├── features/
        │   ├── auth/          # Login, Register (with company onboarding), Profile
        │   ├── dashboard/     # Main dashboard with workspace tabs
        │   ├── shipment/      # Create & track shipments
        │   ├── compliance/    # Compliance report & checklist
        │   ├── analytics/     # Analytics dashboard
        │   ├── email/         # Email draft feature
        │   ├── exporter/      # Exporter upload portal (no auth)
        │   ├── admin/         # Admin panel (user approval, management)
        │   └── landing/       # Public landing page
        └── App.jsx
```

---

## ⚙️ Setup

### Backend

```bash
cd backend
pip install -r requirements.txt
```

`.env` in `backend/`:

```env
MONGO_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ANTHROPIC_API_KEY=your_anthropic_key
SECRET_KEY=your_jwt_secret
```

```bash
uvicorn api:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

`.env` in `frontend/`:

```env
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000
```

---

## 🔑 Shipment Workflow

1. **Forwarder creates shipment** → unique PIN generated
2. **Exporter receives secure link** → uploads shipping documents
3. **AI analyzes documents** → compliance score + flagged issues
4. **Team reviews report** → approves and sends email from company email
5. **Analytics auto-update** → charts regenerated and stored on Cloudinary

---

## 📦 Backend Dependencies

```
fastapi>=0.110.0
uvicorn[standard]>=0.27.0
pymongo>=4.6.0
cloudinary>=1.36.0
pandas>=2.0.0
numpy>=1.24.0
seaborn>=0.12.0
matplotlib>=3.7.0
python-dotenv>=1.0.0
reportlab>=4.0.0
```

---

## 🙋 Author

Built by **[@vikashhub6](https://github.com/vikashhub6)**

---

> *FreightGenie — Ship smarter, not harder.*
