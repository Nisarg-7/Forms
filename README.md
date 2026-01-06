# Multi-Page Form Application Setup Guide

## Overview
This is a 4-page form application with:
- **Frontend**: HTML, CSS, JavaScript with auto-save functionality
- **Backend**: FastAPI with PostgreSQL database
- **Features**: Auto-save answers, form session tracking, form submission

## Prerequisites
- Python 3.8+ installed
- PostgreSQL database installed and running
- pip (Python package manager)

## Setup Instructions

### 1. Database Setup

#### Create PostgreSQL Database
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE forms_db;

# Exit psql
\q
```

Or using pgAdmin, create a new database named `forms_db`.

### 2. Python Environment Setup

#### Create Virtual Environment
```bash
# Navigate to project directory
cd "c:\Users\HP\OneDrive\Desktop\Forms"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

#### Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Configure Database Connection

Edit the `.env` file in the project root:
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/forms_db
```

Replace:
- `postgres` with your PostgreSQL username
- `password` with your PostgreSQL password
- `localhost` with your database host if different
- `5432` with your database port if different
- `forms_db` with your database name

### 4. Start the Backend Server

```bash
# Make sure virtual environment is activated
python main.py
```

The API will run at `http://localhost:8000`

You can view API documentation at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

### 5. Open the Frontend

1. Open `index.html` in your web browser
2. Or run a local web server:
```bash
# Using Python's built-in server
python -m http.server 8001
```
Then open: http://localhost:8001

## How It Works

### Frontend Features
1. **4-Page Form**: Each page has one question
   - Page 1: "What is your full name?"
   - Page 2: "What is your email address?"
   - Page 3: "What is your profession?"
   - Page 4: "What is your feedback or comments?"

2. **Navigation**:
   - Previous button disabled on Page 1
   - Next button on Pages 1-3
   - Submit button on Page 4

3. **Auto-Save**:
   - Answers are automatically saved when:
     - User leaves the textarea field (blur event)
     - User stops typing for 1 second (debounced input)
     - User navigates to another page
   - Progress bar shows completion status

4. **Success Page**: Displayed after successful form submission

### Backend Features
1. **Form Session Management**:
   - Creates a unique session ID when form initializes
   - Tracks session creation and submission time
   - Stores all answers linked to session ID

2. **Answer Storage**:
   - Each answer saved individually in the database
   - Answers can be saved at any time during form completion
   - Form data persists even if user closes the browser

3. **Form Submission**:
   - Marks form as submitted
   - Records submission timestamp
   - Returns confirmation with answer count

4. **Data Retrieval**:
   - API endpoint to retrieve all data for a session
   - Useful for viewing saved responses

## Database Schema

### form_sessions Table
```sql
CREATE TABLE form_sessions (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(36) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    is_submitted INTEGER DEFAULT 0
);
```

### form_answers Table
```sql
CREATE TABLE form_answers (
    id SERIAL PRIMARY KEY,
    session_id VARCHAR(36) NOT NULL,
    question_number INTEGER NOT NULL,
    answer TEXT NOT NULL,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Initialize Form
```
POST /api/forms/init
Response: { "session_id": "uuid", "message": "Form session initialized" }
```

### Save Answer
```
POST /api/forms/save-answer
Body: {
    "session_id": "uuid",
    "question_number": 1,
    "answer": "user answer text"
}
Response: { "status": "success", "message": "..." }
```

### Submit Form
```
POST /api/forms/submit
Body: { "session_id": "uuid" }
Response: { "status": "success", "message": "...", "submission_id": "...", "answers_count": 4 }
```

### Get Form Data
```
GET /api/forms/{session_id}
Response: {
    "session_id": "uuid",
    "created_at": "timestamp",
    "submitted_at": "timestamp",
    "is_submitted": 1,
    "answers": [
        {
            "question_number": 1,
            "answer": "John Doe",
            "saved_at": "timestamp"
        },
        ...
    ]
}
```

## Troubleshooting

### Port Already in Use
If port 8000 is already in use:
```bash
# In main.py, change the port:
uvicorn.run(app, host="0.0.0.0", port=8001)
```

### Database Connection Error
- Check PostgreSQL is running
- Verify DATABASE_URL in .env is correct
- Ensure database exists
- Check PostgreSQL username and password

### CORS Errors
- Backend has CORS enabled for all origins
- If still getting errors, check browser console for specific error

### Auto-Save Not Working
- Check browser console for JavaScript errors
- Verify backend is running
- Ensure API_URL in index.html matches backend URL

## File Structure
```
Forms/
├── index.html          # Frontend form
├── main.py             # FastAPI backend
├── requirements.txt    # Python dependencies
├── .env               # Database configuration
└── README.md          # This file
```

## Future Enhancements
- Add form validation on frontend
- Add email notifications on submission
- Add form analytics dashboard
- Add user authentication
- Add form templates
- Implement form versioning

---

**Questions?** Check the API documentation at http://localhost:8000/docs while the server is running.
