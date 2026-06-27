# 📈 Quantitative Probability Laboratory

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)

A full-stack, event-driven web application engineered to mathematically model stochastic processes, calculate statistical variance, and visualize macroeconomic risk profiles. 

This platform acts as a high-volume computational engine, processing thousands of simulated probability paths across various statistical environments and broadcasting live execution telemetry via WebSockets.

---

## 📑 Table of Contents
- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [Technology Stack](#-technology-stack)
- [Installation & Setup](#-installation--setup)
- [Usage & Visuals](#-usage--visuals)

---

## 🔬 About the Project

The Quantitative Probability Laboratory was built to explore the mathematics of risk, variance, and expectation. By combining advanced statistical algorithms with a modern, real-time web architecture, the application allows users to test mathematical theorems—such as the Law of Large Numbers and Absorbing Markov Chains—against thousands of rapid iterations. 

Instead of operating in isolated environments, all simulations are aggregated into a central database, creating a macro-level view of systemic risk and expected values over time.

---

## ✨ Key Features

* **Monte Carlo Portfolio Engine:** Processes thousands of simulated investment lifetimes using Geometric Brownian Motion and Box-Muller transforms to map long-term asset trajectories.
* **Absorbing Markov Chains:** Visualizes the "Gambler's Ruin" paradox, computing both theoretical probability matrices and empirical outcomes against finite bankrolls.
* **Hypergeometric Visualizers:** Mathematically accurate simulation environments for Plinko (Galton Boards) and Matrix grid navigation modeling.
* **Real-Time Global Telemetry:** Implements a persistent, two-way WebSocket stream to broadcast live macro-evaluation statistics across all active concurrent user sessions without requiring page refreshes.
* **Smart Analytics Ledger:** A backend aggregation system utilizing optimized SQL pipelines (`COALESCE`, `UNION ALL`) to compile runtime statistics, profit/loss differentials, and systemic bankruptcy indices.

---

## 🏗 System Architecture

The application follows a decoupled, event-driven client-server architecture:

1. **The Client (React):** Handles dynamic data visualization using Recharts and manages stateful form inputs for complex mathematical parameters.
2. **The Engine (Node/Express):** Handles the raw computational load, executing deep `for` loops for Monte Carlo iterations before normalizing the data into JSON structures.
3. **The Ledger (PostgreSQL):** A strictly typed relational database ensuring persistent storage of simulation histories, configuration payloads (JSONB), and user authentication states.
4. **The Event Bus (Socket.io):** A WebSockets layer wrapping the Express server, pushing asynchronous execution broadcasts to the frontend to maintain a live, global ticker tape.

---

## 💻 Technology Stack

**Frontend**
* React.js (Vite)
* Tailwind CSS (Styling)
* Recharts (D3-based Data Visualization)
* Socket.io-client
* Lucide React (Iconography)

**Backend**
* Node.js & Express.js
* PostgreSQL (node-postgres `pg`)
* Socket.io (WebSocket Server)
* JSON Web Tokens (JWT) & Bcrypt (Authentication)

---

## 🚀 Installation & Setup

To run the Quantitative Engine locally on your workstation, follow these steps:

### Prerequisites
* Node.js (v16 or higher)
* PostgreSQL installed and running locally

### 1. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/probability-lab.git
cd probability-lab
```

### 2. Configure the Backend
Navigate to the server directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/probability_lab
JWT_SECRET=your_development_secret_key
PORT=5000
```

Initialize your PostgreSQL database by running the schema commands found in `backend/schema.sql` (or create the tables manually based on the project requirements).

Start the backend server:
```bash
npm start
```

### 3. Configure the Frontend
Open a new terminal window and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```
The application will now be available at `http://localhost:5173` (or the port specified by Vite).

---

## 📊 Usage & Visuals

### The Analytical Command Center
Aggregates lifetime processing nodes and displays the live global execution feed.
<img width="1442" height="750" alt="Screenshot 2026-06-28 at 1 15 04 AM" src="https://github.com/user-attachments/assets/09b65e8f-51af-4627-a46b-660c9030ebf9" />


### Monte Carlo Portfolio Variance
Maps structural variance across decades of simulated market returns.
<img width="1453" height="748" alt="Screenshot 2026-06-28 at 1 19 32 AM" src="https://github.com/user-attachments/assets/8900c6cd-a29f-4faf-bb2b-bd8a0ba7f886" />


### Absorbing Markov Chains
Proves the mathematical certainty of capital exhaustion against infinite bankrolls.
<img width="1457" height="745" alt="Screenshot 2026-06-28 at 1 20 56 AM" src="https://github.com/user-attachments/assets/782ccf7c-3232-4d32-9fd7-66471a6111b7" />
