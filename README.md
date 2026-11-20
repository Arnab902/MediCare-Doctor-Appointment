
# MediCare – Doctor Appointment Booking Platform

A full-stack doctor appointment booking platform built using **Java, Spring Boot, Microservices, React, and PostgreSQL**. MediCare connects patients, doctors, and administrators through a secure and user-friendly platform.

**Repository:** [MediCare – Doctor Appointment Platform](https://github.com/Arnab902/MediCare-Doctor-Appointment)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Microservices](#microservices)
- [Getting Started](#getting-started)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Security](#security)
- [Future Improvements](#future-improvements)
- [Author](#author)

---

## Overview

MediCare is designed to simplify the doctor appointment booking process.

Patients can register, explore doctors, check availability, book appointments, and manage their consultations.

Doctors can manage their profiles, consultation locations, availability, and appointment requests.

Administrators can approve doctor registrations, manage user accounts, and monitor appointments.

The backend follows a **microservices architecture**, with independent services communicating through REST APIs.

## Features

### Patient Module
- Patient registration and login.
- Browse and view doctor profiles.
- Select consultation types: Video or In-Person.
- Book appointments for self or another person.
- View appointment history.
- Cancel and request appointment rescheduling.
- Join video consultations.

### Doctor Module
- Doctor registration and profile management.
- Admin approval workflow.
- Manage consultation locations and fees.
- Manage appointment availability.
- View appointment requests.
- Accept or reject appointments.
- Manage appointment status.

### Admin Module
- Admin dashboard.
- Approve doctor registrations.
- Manage patient and doctor accounts.
- Block and unblock users.
- View all appointments.

### Platform Features
- JWT-based authentication.
- Role-based authorization.
- Microservices architecture.
- Service discovery using Eureka.
- Inter-service communication using OpenFeign.
- Separate PostgreSQL databases.
- Centralized API Gateway.

## Technology Stack

| Category | Technologies |
|---|---|
| Backend | Java, Spring Boot |
| Frontend | React, JavaScript, HTML, CSS |
| Security | Spring Security, JWT |
| Microservices | Spring Cloud |
| API Gateway | Spring Cloud Gateway |
| Service Discovery | Netflix Eureka |
| Inter-service Communication | OpenFeign |
| ORM | Hibernate, Spring Data JPA |
| Database | PostgreSQL |
| Build Tool | Maven |
| Frontend Tool | Vite |
| API Testing | Postman |
| IDE | IntelliJ IDEA |
| Version Control | Git, GitHub |

## System Architecture

```text
                  React Frontend
                        |
                        v
                   API Gateway
                     :3333
                        |
       +----------------+----------------+
       |                |                |
       v                v                v
  Auth Service    Patient Service   Doctor Service
    :8084             :8081             :8082
       |                |                |
       v                v                v
    auth_db          patientdb         doctor_db
                        |
                        v
                Appointment Service
                       :8083
                        |
                        v
                 appointmentdb

                Eureka Server
                    :8761
```

The API Gateway acts as the main entry point for frontend requests. Eureka handles service registration and discovery, while OpenFeign supports communication between backend services.

## Microservices

| Service | Port | Responsibility |
|---|---:|---|
| API Gateway | 3333 | Request routing and gateway security |
| Auth Service | 8084 | Registration, login and authentication |
| Patient Service | 8081 | Patient profile management |
| Doctor Service | 8082 | Doctor profiles and availability |
| Appointment Service | 8083 | Appointment booking and management |
| Eureka Server | 8761 | Service discovery |

## Getting Started

### Prerequisites

Make sure you have installed:

- Java (version compatible with the project configuration)
- Maven
- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/Arnab902/MediCare-Doctor-Appointment.git
cd MediCare-Doctor-Appointment
```

### 2. Configure PostgreSQL

Create the databases required by the backend services:

- `auth_db`
- `patientdb`
- `doctor_db`
- `appointmentdb`

Make sure the database names match your service configuration.

### 3. Configure Environment Variables

Configure the database credentials and JWT secret using environment variables.

Typical configuration values include:

```text
DB_URL
DB_USERNAME
DB_PASSWORD
JWT_SECRET
```

Check the `application.yml` or `application.properties` files in each service for the exact variable names.

**Important:** Never commit real passwords, database credentials, or JWT secrets to GitHub.

### 4. Start Backend Services

Start the services in the following order:

1. Eureka Server
2. Auth Service
3. Patient Service
4. Doctor Service
5. Appointment Service
6. API Gateway

Run each Spring Boot application from its respective project directory:

```bash
mvn spring-boot:run
```

On Windows Command Prompt:

```cmd
mvnw.cmd spring-boot:run
```

You can also run the main Spring Boot classes directly through IntelliJ IDEA.

### 5. Start the Frontend

Navigate to the frontend directory:

```bash
cd doctor-appointment-ui
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal.

Make sure the frontend API base URL points to the API Gateway running on port `3333`.

## Security

MediCare implements several security features:

- JWT-based authentication.
- Role-based access control for PATIENT, DOCTOR, and ADMIN.
- Centralized authentication through Auth Service.
- Protected backend endpoints.
- Account blocking and unblocking.
- Doctor approval before becoming available for bookings.
- Service-level authorization checks.

## Future Improvements

- Online payment integration.
- Enhanced video consultation functionality.
- Email and in-app notifications.
- Docker containerization.
- Cloud deployment.
- Performance optimization and monitoring.

## Author

**Arnab Bhattacharya**


- GitHub: [Arnab902](https://github.com/Arnab902)
- Project: [MediCare – Doctor Appointment Booking Platform](https://github.com/Arnab902/MediCare-Doctor-Appointment)

---

If you find this project interesting, feel free to explore the repository!
