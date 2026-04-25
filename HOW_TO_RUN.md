# How to Run EduConnect

Follow these steps to run the EduConnect project from your terminal.

## Prerequisites
- **Node.js**: Ensure you have Node.js installed on your system. (Download from [nodejs.org](https://nodejs.org/))

## Running the Application

This project is a full-stack application consisting of two parts: the **Backend** (Node.js/Express) and the **Frontend** (React/Vite). You will need to run both simultaneously in separate terminal windows.

---

### Step 1: Start the Backend Server

1. Open your terminal.
2. Navigate to the `backend` folder from the root of the project:
   ```bash
   cd backend
   ```
3. Install the necessary dependencies (you only need to do this once):
   ```bash
   npm install
   ```
4. Start the backend server:
   ```bash
   npm start
   ```
5. **Success:** You should see a message indicating the server is running on port 5000 and the MongoDB/SQLite database is connected. 
6. **Keep this terminal window open** and running in the background.

---

### Step 2: Start the Frontend Application

1. Open a **second, new terminal** window.
2. Navigate to the `frontend` folder from the root of the project:
   ```bash
   cd frontend
   ```
3. Install the necessary frontend dependencies (you only need to do this once):
   ```bash
   npm install
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
5. **Success:** The terminal will provide a local URL, typically `http://localhost:3000` or `http://localhost:5173`. Open this URL in your web browser to view the application.
6. **Keep this terminal window open** as well.

---

## Stopping the Servers

When you are finished, you can stop the servers by going to each of the two terminal windows and pressing:
`Ctrl + C`

You may be asked to "Terminate batch job (Y/N)?". Type `Y` and press `Enter`.

---

## Admin Login Credentials

Once the application is running, you can log in as an administrator to manage the platform using these default credentials:
- **Email:** `admin@educonnect.com`
- **Password:** `admin123`
