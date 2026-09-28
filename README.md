# 📚 Ohara Digital Library Portal

![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Spring Security](https://img.shields.io/badge/Spring_Security-6DB33F?style=for-the-badge&logo=springsecurity&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

A full-stack open-access library system built with React (Vite) and Spring Boot REST API.

---

## 🏛️ System Architecture & Backend Overview

While this live demo runs entirely on GitHub Pages using client-side fallback simulation, it is architected to integrate seamlessly with a Spring Boot REST API.

### 🔐 Backend Tech Stack & Security Highlights
- **Framework:** Spring Boot 3.x with Spring Data JPA
- **Security:** Spring Security with Stateless JWT Authentication Filter (`Bearer` tokens)
- **Database:** MySQL relational model for books, users, and borrowing transactions
- **Role-Based Access Control (RBAC):**
  - `ROLE_USER`: Can view catalog, search books, borrow items, and manage personal loans.
  - `ROLE_ADMIN`: Full access + CRUD controls (Create, Edit, Delete volumes in the catalog).

---

## 🎥 Architecture & Security Proof

| Feature | Backend Implementation Details | Frontend Integration |
| :--- | :--- | :--- |
| **Authentication** | `/api/auth/login` issues signed JWTs | Stored in `localStorage`, injected via `Axios` request interceptors |
| **Route Protection** | `SecurityFilterChain` validates claims & `exp` | `ProtectedRoute.jsx` checks roles before granting page entry |
| **API Fallback** | Handled via Custom Exception Handling | React state gracefully falls back to local simulation when offline |

> 📁 **View Backend Codebase:** [Link to your library-backend repository]  
> 📄 **Postman Collection & API Docs:** Located in `/docs/Postman_Collection.json`
