# Lumora Admin Dashboard (Lumora.FE.Admin)

Welcome to **Lumora.FE.Admin**, the administration and merchant dashboard frontend for the Lumora E-commerce Platform. Built on **Nuxt 3**, this dashboard provides full control over products, inventory, orders, and system operations.

---

## 🛠️ Technology Stack

- **Framework**: Nuxt 3 (Vue 3, TypeScript)
- **Styling**: Tailwind CSS
- **Real-time**: SignalR Client for live operations and monitoring hubs
- **Testing**: Playwright for regression and interface verification

---

## 📦 What This Application Contains

- **Administrative Auth & Security**: Secure admin login, session management, and permission-gated routing.
- **Operational Management Screens**: Full CRUD and control interfaces for managing:
  - **Users & Roles**: Role-Based Access Control (RBAC) definitions.
  - **Catalog**: Products, categories, and attributes.
  - **Inventory**: Warehouse stocks and dynamic adjustments.
  - **Sales**: Orders, shipment tracking, and payment gateways status.
  - **Feedback**: Customer product reviews and approvals.
  - **System Monitoring**: Live operations, logs, and system events.
- **API Proxy**: Pre-configured server-side proxying to route backend API requests and SignalR WebSockets securely.

---

## 🚀 Getting Started

### 1. Installation
Install dependencies:
```bash
npm install
```

### 2. Development Server
Run the application locally:
```bash
npm run dev
```

### 3. Build for Production
Compile the app for production deployment:
```bash
npm run build
npm run preview
```

---

## 🔗 Backend Connection

This administration client is paired with the **Lumora Backend API** (`Lumora.BE`).
- Ensure the backend is running to allow the proxy to forward requests.
- Endpoint authorization actions are bound to the user permissions configured in the admin console.
