# 🏥 OPD Management System — Aligarh Muslim University

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.4-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.org/)
[![React](https://img.shields.io/badge/React-19.2-blue.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4.0-38bdf8.svg)](https://tailwindcss.com/)
[![Database](https://img.shields.io/badge/Database-PostgreSQL%20%7C%20H2-336791.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-Academic-lightgrey.svg)]()

A modern, responsive, full-stack **Outpatient Department (OPD) Management System** designed and engineered according to the official Software Engineering Project Framework for the **Department of Computer Science, Aligarh Muslim University (AMU)**, modeled around **Jawaharlal Nehru Medical College & Hospital (JNMC)**.

---

## 📌 Key Architectural Innovations

1. **Persistent Patient Identity (PID) vs. Dynamic Institutional Validity**:
   - Patient enrollment is **100% free** and issues a lifetime permanent identifier (`PID-xxxx`).
   - Fee charges only occur upon booking a specific consultation slot.
   - **Graceful Expiration**: If an AMU Student or Employee tenure expires, their persistent `PID` and complete longitudinal EHR history remain intact, while their appointment scheduling automatically reverts to standard citizen priority (`N` series) and fees.
2. **Anti-Starvation Fairness Priority Queue Engine**:
   - Token Series:
     - `E-xxx`: AMU Employees (Priority Weight: 300)
     - `S-xxx`: AMU Students (Priority Weight: 200)
     - `N-xxx`: Normal Citizens / General Public (Priority Weight: 100)
   - **Fairness Guarantee**: After every 2 consecutive priority tokens (`S`/`E`) served, the dispatch engine automatically pulls the next waiting Normal Citizen (`N`) token to prevent queue starvation.
3. **Guardian-Linked Pediatric Booking (Age ≤ 8 Years)**:
   - Guardians can register and book consultations for young children without creating separate login credentials.
   - Assigns a dedicated child `PID-xxxx` linked directly to the parent's `PID`.
4. **Longitudinal EHR & Digital Prescription Engine**:
   - Complete historical medical visits timeline, clinical observations, and diagnosis.
   - Digital prescription builder with a printable AMU J.N. Medical College & Hospital prescription format.
5. **Integrated Diagnostic Requisitions & Tamper-Proof Finalization**:
   - Covers three primary hospital disciplines: **Blood / Laboratory**, **X-Ray / Radiology**, and **Ultrasound (USG)**.
   - Once a laboratory or radiology report is finalized by diagnostic personnel, it is cryptographically locked against any subsequent edits.
6. **Public "Now Serving" TV Waiting Lounge Monitor**:
   - Full-screen clinic display board (`/lobby`) with real-time room status, token call pulse, and next-in-line counters.

---

## 🏗️ Tech Stack

- **Backend**: Java 17, Spring Boot 3.2.4, Spring Security 6 (Stateless JWT Authentication), Spring Data JPA, Hibernate 6, Maven 3.9.9.
- **Frontend**: React 19, Vite 8, Tailwind CSS v4, Lucide React Icons, Axios.
- **Database**:
  - Dual Profile: Pre-configured In-Memory PostgreSQL-compatible store (for zero-config evaluation) and live PostgreSQL profile (`application-postgres.properties`).

---

## ⚡ 1-Click Interactive Demo Accounts

The system comes pre-seeded with active demonstration accounts. Click the **"⚡ Switch Role Demo"** dropdown in the navigation bar to preview any role:

| Role | Name | Email | Password | Features / Focus |
| :--- | :--- | :--- | :--- | :--- |
| **AMU Student** | Altaf Khan | `altaf.student@amu.ac.in` | `pat123` | Permanent `PID-1001`, active enrollment, priority `S-001`, 100% fee waiver |
| **AMU Employee** | Syed Kamran Ali | `kamran.emp@amu.ac.in` | `pat123` | Permanent `PID-1002`, active staff tenure, urgent token `E-001` |
| **Normal Citizen** | Ramesh Kumar Sharma | `ramesh.sharma@gmail.com` | `pat123` | Permanent `PID-1003`, standard fee, fair queue token `N-001` |
| **OPD Doctor** | Prof. Zameer Ahmed | `zahmed@amu.ac.in` | `doc123` | Internal Medicine (Room 102), live queue caller, prescription builder |
| **Pediatric Doctor** | Dr. Fatima Zahra | `fzahra@amu.ac.in` | `doc123` | Pediatrics (Room 202), child consultations under guardian-linked PIDs |
| **Diagnostic Staff** | Dr. Asma Parveen | `lab@amu.ac.in` | `lab123` | Pathology & Radiology Labs, report submission & tamper lock |
| **OPD Receptionist** | Farhan Akhtar | `reception@amu.ac.in` | `rec123` | Walk-in registration counter, on-spot payment, printable token slips |
| **Hospital Admin** | System Administrator | `admin@amu.ac.in` | `admin123` | Hospital rosters, departments, user roles, and audit statistics |

---

## 🚀 Getting Started

### Prerequisites
- **Java 17+** (JDK)
- **Node.js 18+** & **npm**
- **Git**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/<YOUR_USERNAME>/OPD_Management_System.git
cd OPD_Management_System
```

---

### Step 2: Run the Backend (Spring Boot)
```bash
cd backend
# Windows:
mvnw.cmd spring-boot:run

# Linux / macOS:
chmod +x mvnw
./mvnw spring-boot:run
```
- The backend will start on **`http://localhost:8080`**.
- Database console: **`http://localhost:8080/h2-console`** (`jdbc:h2:mem:opd_db`, username: `sa`, password: blank).

---

### Step 3: Run the Frontend (React + Vite)
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
- Open your browser at **`http://localhost:5173/`**.
- Public Waiting Lounge Board: **`http://localhost:5173/lobby`**.

---

## 📂 Project Structure

```
OPD_Management_System/
├── backend/
│   ├── src/main/java/com/amu/opd/
│   │   ├── config/          # Spring Security & JWT Filter
│   │   ├── controller/      # REST API Controllers (Auth, Patient, Queue, Doctor, etc.)
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entity/          # JPA Hibernate Entities
│   │   ├── repository/      # Spring Data Repositories
│   │   ├── service/         # Business Logic & Anti-Starvation Scheduler
│   │   ├── util/            # JWT and ID Generation Utilities
│   │   └── OpdApplication.java
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── application-postgres.properties
│   ├── mvnw & mvnw.cmd      # Maven Wrappers
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios API Client
│   │   ├── components/      # Navbar, Prescription Print Modal
│   │   ├── context/         # AuthContext & 1-Click Demo Login
│   │   ├── pages/           # Portals for Patient, Doctor, Diagnostic, Admin, Reception
│   │   ├── App.jsx
│   │   └── index.css        # Tailwind CSS
│   ├── package.json
│   └── vite.config.js
├── OPD_Management_System_Synopsis.pdf
├── OPD_Management_System_Synopsis.docx
├── OPD_Management_System_Presentation_LargeFont.pptx
├── README.md
└── .gitignore
```

---

## 📜 Academic Submission & Credits
Developed as part of the Software Engineering Project curriculum:
- **Institution**: Department of Computer Science, Aligarh Muslim University (AMU)
- **Domain**: Hospital & Outpatient Healthcare Automation
