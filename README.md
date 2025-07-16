# Restaurant Reservation System

A full-stack web application for managing restaurant table reservations and events. Users can register, login, make table reservations for specific time slots, and RSVP to restaurant events.

## Project Overview

This system allows customers to:

-   Register and authenticate securely
-   Browse available tables and time slots
-   Make table reservations
-   View and manage their reservations
-   Browse and RSVP to restaurant events

Administrators can:

-   Create and manage events
-   View all reservations
-   Manage restaurant capacity

## Technologies Used

### Backend

-   **FastAPI** - Modern Python web framework
-   **SQLAlchemy** - SQL toolkit and ORM
-   **MySQL** - Database
-   **JWT** - Authentication tokens
-   **Passlib** - Password hashing
-   **Pydantic** - Data validation
-   **CORS Middleware** - Cross-origin requests

### Frontend

-   **React** - UI library
-   **Axios** - HTTP client
-   **Framer Motion** - Animations
-   **Lucide React** - Icons
-   **CSS3** - Styling

## Database Schema

### Users Table

```sql
users (
    id: INTEGER PRIMARY KEY,
    username: STRING(30) UNIQUE,
    password: STRING(100),
    role: STRING(10)
)
```

### Tables Table

```sql
tables (
    id: INTEGER PRIMARY KEY,
    table_no: INTEGER,
    capacity: INTEGER
)
```

### Slots Table

```sql
slots (
    id: INTEGER PRIMARY KEY,
    start_time: DATETIME,
    end_time: DATETIME
)
```

### Table Reservations

```sql
table_reservations (
    id: INTEGER PRIMARY KEY,
    table_id: INTEGER,
    slot_id: INTEGER,
    capacity: INTEGER,
    user_id: INTEGER
)
```

### Events Table

```sql
events (
    id: INTEGER PRIMARY KEY,
    name: STRING(50) UNIQUE,
    description: STRING(200),
    date: STRING(20),
    capacity: INTEGER,
    remaining_capacity: INTEGER
)
```

### Event Reservations

```sql
event_reservations (
    id: INTEGER PRIMARY KEY,
    event_id: INTEGER,
    user_id: INTEGER
)
```

## API Endpoints

### Authentication

#### POST /auth/register

**Purpose:** Register a new user
**Request Body:**

```json
{
    "username": "string",
    "password": "string"
}
```

**Success Response (201):**

```json
{
    "message": "User created successfully",
    "user": {
        "id": 1,
        "username": "john_doe",
        "role": "user"
    }
}
```

**Errors:**

-   400: Username already exists

#### POST /auth/login

**Purpose:** Authenticate user and get access token
**Request Body:** Form data (application/x-www-form-urlencoded)

```
username: string
password: string
```

**Success Response (200):**

```json
{
    "access_token": "jwt_token_here",
    "token_type": "bearer"
}
```

**Errors:**

-   401: Incorrect username or password

#### GET /users/me

**Purpose:** Get current user information
**Headers:** `Authorization: Bearer <token>`
**Success Response (200):**

```json
{
    "id": 1,
    "username": "john_doe",
    "role": "user"
}
```

**Errors:**

-   401: Invalid or expired token

### Tables & Slots

#### GET /tables

**Purpose:** Get all available tables
**Headers:** `Authorization: Bearer <token>`
**Success Response (200):**

```json
[
    {
        "id": 1,
        "table_no": 1,
        "capacity": 4
    }
]
```

#### GET /slots

**Purpose:** Get all available time slots
**Headers:** `Authorization: Bearer <token>`
**Success Response (200):**

```json
[
    {
        "id": 1,
        "start_time": "2025-07-30 15:00:00",
        "end_time": "2025-07-30 16:00:00"
    }
]
```

### Table Reservations

#### POST /reservations

**Purpose:** Create a new table reservation
**Headers:** `Authorization: Bearer <token>`
**Request Body:**

```json
{
    "table_id": 1,
    "slot_id": 1,
    "capacity": 2
}
```

**Success Response (201):**

```json
{
    "message": "Reservation created",
    "reservation": {
        "id": 1,
        "table_id": 1,
        "slot_id": 1,
        "capacity": 2,
        "user_id": 1
    }
}
```

**Errors:**

-   400: Table not found
-   400: Slot not found
-   400: Table already reserved for this slot
-   400: You have already reserved a table at this slot

#### GET /reservations

**Purpose:** Get current user's reservations
**Headers:** `Authorization: Bearer <token>`
**Success Response (200):**

```json
[
    {
        "id": 1,
        "table_id": 1,
        "slot_id": 1,
        "capacity": 2,
        "user_id": 1
    }
]
```

#### DELETE /reservations/{id}

**Purpose:** Cancel a reservation
**Headers:** `Authorization: Bearer <token>`
**Success Response (200):**

```json
{
    "message": "Reservation deleted"
}
```

**Errors:**

-   400: Reservation not found
-   400: You can only delete your own reservations

### Events

#### GET /events

**Purpose:** Get all events
**Headers:** `Authorization: Bearer <token>`
**Success Response (200):**

```json
[
    {
        "id": 1,
        "name": "Wine Tasting",
        "description": "Premium wine tasting event",
        "date": "2025-08-15",
        "capacity": 50,
        "remaining_capacity": 30
    }
]
```

#### POST /events

**Purpose:** Create a new event (Admin only)
**Headers:** `Authorization: Bearer <token>`
**Request Body:**

```json
{
    "name": "Wine Tasting",
    "description": "Premium wine tasting event",
    "date": "2025-08-15",
    "capacity": 50
}
```

**Success Response (201):**

```json
{
    "message": "Event created",
    "event": {
        "id": 1,
        "name": "Wine Tasting",
        "description": "Premium wine tasting event",
        "date": "2025-08-15",
        "capacity": 50,
        "remaining_capacity": 50
    }
}
```

**Errors:**

-   400: You are not an admin
-   400: Event already exists
-   400: Invalid date (past date)
-   400: Invalid capacity

#### POST /events/{id}/rsvp

**Purpose:** RSVP to an event
**Headers:** `Authorization: Bearer <token>`
**Success Response (201):**

```json
{
    "message": "RSVP successful",
    "reservation": {
        "id": 1,
        "event_id": 1,
        "user_id": 1
    }
}
```

**Errors:**

-   400: Event not found
-   400: Event is already full
-   400: You have already RSVP'd to this event

#### DELETE /events/{event_id}/rsvp

**Purpose:** Cancel event RSVP
**Headers:** `Authorization: Bearer <token>`
**Success Response (200):**

```json
{
    "message": "RSVP cancelled"
}
```

#### GET /events/my-rsvps

**Purpose:** Get current user's event RSVPs
**Headers:** `Authorization: Bearer <token>`
**Success Response (200):**

```json
[
    {
        "id": 1,
        "event_id": 1,
        "user_id": 1
    }
]
```

## Frontend Usage Guide

### Getting Started

1. **Installation**

    ```bash
    cd frontend
    npm install
    npm start
    ```

2. **Environment Setup**
   Create a `.env` file in the frontend directory:
    ```
    REACT_APP_API_URL=http://...
    ```

### User Authentication

1. **Registration**

    - Navigate to `/register`
    - Enter username and password
    - Click "Sign Up"
    - Redirected to login page on success

2. **Login**
    - Navigate to `/login`
    - Enter credentials
    - Click "Sign In"
    - Redirected to dashboard on success

### Dashboard

-   **Main Hub** - Overview of available features
-   **Quick Access** - Navigate to Events or Tables
-   **User Info** - Display current user and role

### Table Reservations

1. **View Tables**

    - Navigate to `/tables`
    - See all available tables with capacity

2. **View Time Slots**

    - Click "View Slots" to see available time slots
    - Slots show date and time ranges

3. **Make Reservation**

    - Click on a table to see available slots
    - OR click on a slot to see available tables
    - Select table and slot combination
    - Enter number of guests
    - Confirm reservation

4. **Manage Reservations**
    - View "My Reservations" section
    - Cancel reservations with trash icon

### Events

1. **Browse Events**

    - Navigate to `/events`
    - View all upcoming events
    - See event details, date, and remaining capacity

2. **RSVP to Events**

    - Click "RSVP" on available events
    - Confirmation message on success

3. **Manage RSVPs**

    - View "My RSVPs" section
    - Cancel RSVPs with cancel button

4. **Create Events (Admin Only)**
    - Click "Create Event" button
    - Fill in event details
    - Set date and capacity
    - Submit to create

### Navigation

-   **Navbar** - Always visible when logged in
-   **Dashboard** - Home icon
-   **Events** - Calendar icon
-   **Tables** - Table icon
-   **Logout** - Log out icon
-   **User Info** - Shows username and role

### Error Handling

-   **Authentication Errors** - Redirected to login
-   **Validation Errors** - Displayed in forms
-   **Network Errors** - User-friendly error messages
-   **Loading States** - Spinners during API calls

### Responsive Design

-   **Mobile Friendly** - Responsive layout
-   **Touch Interactions** - Mobile-optimized buttons
-   **Animations** - Smooth transitions with Framer Motion

## Running the Project

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Database Setup

```bash
cd backend
python seed.py  # Optional: populate with sample data
```

The application will be available at:

-   Frontend: http://localhost:3000
-   Backend API: http://localhost:8000
-   API Documentation: http://localhost:8000/docs
