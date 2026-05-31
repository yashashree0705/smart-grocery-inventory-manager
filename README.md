# ?? Smart Grocery & Pantry Inventory Manager

A full-stack, real-time web application designed to optimize pantry management, reduce domestic food waste, and automate grocery planning through intelligent threshold tracking and category visual analytics.

---

## ?? Problem Statement
Managing a household kitchen or small-scale pantry efficiently is challenging. Lack of visibility into ingredient expiration dates leads to significant financial and food waste, while manual inventory checks often cause critical shortages of everyday essentials. This project solves these pain points by offering an automated dashboard that tracks inventory volumes, warns users of impending item expiries, and dynamically compiles restock checklists based on user-defined safe-stock thresholds.

---

## ? Core Features
* **Secure Authentication Portal:** JWT-secured user registration and login access layers.
* **Pantry Store Matrix:** Complete CRUD operations to monitor, search, filter, and adjust item stock quantities effortlessly.
* **Top Visual Analytics:** Interactive horizontal data bar graphs displaying category volume tracking and distribution ratios.
* **Live Status Metrics Counters:** High-level summary alerts tracking total unique items, low-stock shortages, and critical expiries.
* **Automated Shopping Log:** A dynamically updated procurement checklist tracking items that fall below safety limits, calculating the exact quantity required to replenish stocks.
* **Data Portability Engine:** One-click CSV spreadsheet compilation to export current pantry data arrays instantly.

---

## ??? Tech Stack
* **Frontend Engine:** React.js (Single Page Application architecture built via Vite)
* **Backend Server:** Node.js runtime environment layered with the Express.js framework
* **Database Management:** MongoDB Atlas/Community Server interacting via the Mongoose ODM
* **State Security:** JSON Web Tokens (JWT) for secure authentication management, and Bcrypt.js for database-side password hashing

---

## ??? System Architecture & Workflow
The application follows a standard decoupled Client-Server architecture:
1. The **React Single Page Application (SPA)** sends authenticated requests containing a JWT bearer token inside the HTTP authorization headers.
2. The **Express API Server** interceptor validates the token using custom routing middleware.
3. Upon validation, the controller executes the target business logic, performing transactional lookups or modifications against the **MongoDB database collection clusters**.

---

## ?? Project Directory Map
```text
Smart-Grocery-Inventory-Manager/
??? client/                  # Frontend Application Root Folder
?   ??? public/              # Static public assets
?   ??? src/
?   ?   ??? components/      # Reusable visual interface widgets
?   ?   ??? pages/           # Layout page contextual layouts
?   ?   ??? App.jsx          # Core logical container and layout controller
?   ?   ??? main.jsx         # DOM mounting bootstrap script
?   ??? indexhtml            # Client layout template wrapper
?   ??? vite.config.js       # Compiler dev server setups
??? server/                  # Backend Application Root Folder
?   ??? config/              # Mongoose database initialization code
?   ??? controllers/         # Structural request flow handlers
?   ??? middleware/          # Security protection validation checks
?   ??? models/              # Schema blueprints defining document objects
?   ??? routes/              # Explicit API URI endpoint mappings
?   ??? .env.example         # Production variable templates
?   ??? server.js            # Main runtime server execution entrypoint
??? .gitignore               # Build target exclusions list
??? README.md                # Repository documentation page

