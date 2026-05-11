# FreightGenie 🚢

A comprehensive **AI-powered shipment compliance and document management system** for exporters and freight forwarders. Automates compliance checks, generates compliance reports, manages documents, and streamlines email communication.

---

## Features ✨

- **🤖 AI Compliance Analysis** – Automated compliance scoring and risk assessment
- **📄 Document Management** – Upload, store, and organize shipping documents (invoices, packing lists, certificates)
- **✅ Compliance Checklist** – Interactive checklist for shipment compliance verification
- **💰 Cost Estimation** – Real-time cost estimates for compliance and shipping
- **📊 Compliance Reports** – AI-generated detailed compliance reports with PDF export
- **✉️ Email Drafts** – Auto-generate professional compliance emails; edit and send to exporters
- **🔔 Real-time Notifications** – Socket.io-based instant notifications and live shipment updates
- **📈 Dashboard** – Comprehensive shipment tracking and analytics
- **🔐 Authentication** – Secure JWT-based auth for exporters and freight forwarders
- **☁️ Cloud Storage** – Cloudinary integration for document uploads
- **📧 Email Service** – Automated email notifications and escalation management

---

## Tech Stack 🛠️

### Backend
- **Node.js + Express** – REST API server
- **MongoDB** – NoSQL database
- **Socket.io** – Real-time communication
- **Cloudinary** – Cloud storage for documents
- **JWT** – Authentication & authorization
- **Nodemailer** – Email service

### Frontend
- **React 18** – UI framework
- **Tailwind CSS** – Styling
- **Axios** – HTTP client
- **Socket.io Client** – Real-time updates
- **React Router** – Routing

---

## Project Structure 📁

```
FreightGenie/
├── backend/
│   ├── server.js                 # Express server entry
│   ├── package.json
│   ├── ai/
│   │   └── complianceAgent.js   # AI compliance analysis
│   ├── config/
│   │   ├── cloudinary.js        # Cloudinary config
│   │   └── db.js                # MongoDB connection
│   ├── controllers/              # Business logic
│   │   ├── authController.js
│   │   ├── complianceController.js
│   │   ├── documentController.js
│   │   ├── emailController.js
│   │   ├── exporterController.js
│   │   ├── notificationController.js
│   │   └── shipmentController.js
│   ├── middleware/               # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── uploadMiddleware.js
│   ├── models/                   # Database schemas
│   │   ├── User.js
│   │   ├── Shipment.js
│   │   └── Notification.js
│   ├── routes/                   # API routes
│   ├── services/                 # Business services
│   │   ├── emailService.js
│   │   ├── pdfService.js
│   │   ├── escalation.service.js
│   │   └── mail.service.js
│   └── reports/                  # Report storage
│
├── frontend/
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── index.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── api/
│   │   │   └── axiosInstance.js  # Configured axios client
│   │   ├── features/
│   │   │   ├── auth/             # Login, Register, Profile
│   │   │   ├── dashboard/        # Main dashboard & analytics
│   │   │   ├── shipment/         # Shipment detail & management
│   │   │   ├── compliance/       # Compliance analysis & reports
│   │   │   ├── email/            # Email draft & sending
│   │   │   ├── exporter/         # Exporter portal
│   │   │   └── (services, hooks, contexts per feature)
│   │   └── shared/               # Shared components
│   │       └── components/       # Navbar, ProtectedRoute, etc.
│   ├── .env                      # Environment variables
│   └── tailwind.config.js
│
└── README.md
```

---

## Installation & Setup 🚀

### Prerequisites
- **Node.js** (v14+)
- **MongoDB** (local or cloud)
- **npm** or **yarn**

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in backend root:
```env
MONGO_URI=mongodb://localhost:27017/freightgenie
JWT_SECRET=your_secret_key
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_password
PORT=5129
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file in frontend root:
```env
REACT_APP_API_URL=http://localhost:5129/api
REACT_APP_SOCKET_URL=http://localhost:5129
```

---

## Running the Project ▶️

### Terminal 1 – Backend
```bash
cd backend
npm start
# Server runs on http://localhost:5129
```

### Terminal 2 – Frontend
```bash
cd frontend
npm start
# App runs on http://localhost:3000
```

The app will auto-open in your browser at **http://localhost:3000**

---

## API Endpoints 📡

### Authentication
- `POST /auth/register` – Register new user
- `POST /auth/login` – Login user
- `GET /auth/profile` – Get user profile

### Shipments
- `GET /shipment` – List all shipments
- `POST /shipment` – Create shipment
- `GET /shipment/:id` – Get shipment details
- `PUT /shipment/:id` – Update shipment

### Compliance
- `POST /compliance/:shipmentId/analyze` – Run AI compliance analysis
- `GET /compliance/:shipmentId` – Get compliance report
- `POST /compliance/:shipmentId/generate-pdf` – Generate PDF report
- `POST /compliance/:shipmentId/approve` – Approve compliance

### Documents
- `POST /document/upload` – Upload document
- `GET /document/:shipmentId` – Get shipment documents

### Email
- `POST /email/:shipmentId/send` – Send compliance email to exporter

### Notifications
- `GET /notification` – Get user notifications
- `POST /notification/:id/mark-read` – Mark notification as read

---

## Key Features in Detail 🎯

### AI Compliance Analysis
- Analyzes uploaded documents (invoices, packing lists, certificates)
- Generates compliance score (0-100)
- Identifies risk levels (low, medium, high)
- Provides detailed compliance report

### Email Management
- AI-generated email drafts based on compliance findings
- Edit and customize emails before sending
- Track email send status
- Escalation workflows for high-risk shipments

### Real-time Updates
- Socket.io connections for live shipment status
- Instant notifications for compliance changes
- Live log streaming of shipment events

### Document Management
- Multi-file upload support
- Cloudinary integration for secure storage
- Document categorization (invoice, packing_list, certificate)

---

## Environment Variables 🔐

### Backend (.env)
```
MONGO_URI          # MongoDB connection string
JWT_SECRET         # Secret key for JWT tokens
CLOUDINARY_NAME    # Cloudinary account name
CLOUDINARY_API_KEY # Cloudinary API key
CLOUDINARY_API_SECRET # Cloudinary secret
SMTP_HOST          # Email SMTP host
SMTP_PORT          # Email SMTP port
SMTP_USER          # Email sender address
SMTP_PASS          # Email password
PORT               # Server port (default: 5129)
```

### Frontend (.env)
```
REACT_APP_API_URL   # Backend API URL (http://localhost:5129/api)
REACT_APP_SOCKET_URL # Socket server URL (http://localhost:5129)
```

**⚠️ Important:** Environment variables are required. Copy values from `.env` before running the project.

---

## Database Schema 📚

### User
- `_id`, `name`, `email`, `password`, `role` (exporter/forwarder), `createdAt`

### Shipment
- `_id`, `shipmentId`, `product`, `origin`, `destination`, `cargoType`, `exporterEmail`, `status`, `documents`, `complianceReport`, `emailDraft`, `pdfReportPath`, `createdAt`

### Notification
- `_id`, `userId`, `message`, `read`, `createdAt`

---

## Development 💻

### Available Scripts

**Backend:**
```bash
npm start          # Start development server
npm run dev        # Start with nodemon (auto-restart)
```

**Frontend:**
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

---

## Troubleshooting 🔧

### Frontend can't reach backend
- Check `REACT_APP_API_URL` in `frontend/.env`
- Ensure backend is running on correct port
- Check CORS settings in backend

### Socket connection fails
- Verify `REACT_APP_SOCKET_URL` in `frontend/.env`
- Ensure backend socket server is running
- Check firewall settings

### MongoDB connection error
- Verify `MONGO_URI` in `backend/.env`
- Ensure MongoDB is running locally or cloud connection is available
- Check connection credentials

---

## Contributing 🤝

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License 📄

This project is licensed under the MIT License.

---

## Support 📞

For issues, questions, or suggestions, please open an issue in the GitHub repository.

---

**Made with ❤️ by FreightGenie Team**
