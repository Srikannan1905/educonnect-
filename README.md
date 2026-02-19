# EduConnect - Learning Platform

A full-stack web application for offline/online learning, featuring center listings, course catalog, booking system, and user/admin dashboards.

## Features
- **User Roles**: Student, Admin, Staff.
- **Course Management**: Create, Read, Update, Delete courses (Admin).
- **Booking System**: Book demo classes with date/time selection.
- **Payments**: Simulated payment gateway (Credit Card/UPI) for purchasing courses.
- **Dashboards**:
    - **Student**: View bookings, purchased courses, and payment history.
    - **Admin**: Manage courses, users, gallery, visualize statistics, and receive real-time notifications for new bookings.
- **Gallery**: Manage photo uploads.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, React Router, Axios, Lucide React (Icons).
- **Backend**: Node.js, Express.js, SQLite (Sequelize ORM).
- **Database**: SQLite (Zero-config, file-based).

## Rapid Start (Windows)
Double-click the `start_app.bat` file in the root directory to start both backend and frontend servers.

## Manual Setup

### 1. Backend
Navigate to the `backend` directory:
```bash
cd backend
npm install
npm start
# Server runs on http://localhost:5000
```
*Note: The database (`database.sqlite`) is automatically created and synced on first run.*

### 2. Frontend
Navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:3000
```

## Admin Credentials
- **Email**: `admin@educonnect.com`
- **Password**: `admin123`

## API Endpoints
- **Auth**: Login, Register, Profile.
- **Courses**: CRUD operations.
- **Bookings**: specific endpoints for demo booking.
- **Payments**: Process payments and view history.
- **Notifications**: Admin notifications for new events.

## How to Change WhatsApp Number

You can change the WhatsApp number displayed on the site in two ways:

### 1. Via Admin Dashboard (Recommended)
This updates the number dynamically without touching the code.
1. Log in as **Admin** (Default: `admin@educonnect.com` / `admin123`).
2. Go to the **Dashboard**.
3. Click on the **Settings** tab (bottom of the sidebar).
4. Update the **WhatsApp Number** field.
5. Click **Save Changes**.

### 2. Via Code (Default Value)
The code has a fallback number if the database setting is empty. line 174
- File: `frontend/src/pages/Home.jsx`
- Look for: `const [whatsappNumber, setWhatsappNumber] = useState('...');`
- Update the number in the `useState` hook.

## Manual Restart

If you prefer running commands manually instead of using the batch file:

1.  **Stop existing servers**:
    - Close any open terminal windows running Node.js.
    - Or run: `taskkill /F /IM node.exe`

2.  **Start Backend**:
    ```bash
    cd backend
    npm start
    ```

3.  **Start Frontend**:
    - Open a new terminal.
    ```bash
    cd frontend
    npm run dev
    ```
