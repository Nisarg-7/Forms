from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, func, event
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from datetime import datetime
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

# Database Configuration
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/forms_db"
)

print(f"Connecting to database: {DATABASE_URL.replace('nick123', '****')}")

try:
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        echo=False
    )
    
    # Test connection
    with engine.connect() as conn:
        from sqlalchemy import text
        conn.execute(text("SELECT 1"))
        print("✓ Database connection successful!")
except Exception as e:
    print(f"✗ Database connection failed: {e}")
    raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Database Models
class FormSession(Base):
    __tablename__ = "form_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), unique=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    submitted_at = Column(DateTime, nullable=True)
    is_submitted = Column(Integer, default=0)

class FormAnswer(Base):
    __tablename__ = "form_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(String(36), index=True)
    question_number = Column(Integer)
    answer = Column(Text)
    saved_at = Column(DateTime, default=datetime.utcnow)

# Create tables
try:
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created/verified successfully!")
except Exception as e:
    print(f"✗ Error creating tables: {e}")
    raise

# FastAPI app
app = FastAPI(title="Form API")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class InitFormRequest(BaseModel):
    pass

class SaveAnswerRequest(BaseModel):
    session_id: str
    question_number: int
    answer: str

class SubmitFormRequest(BaseModel):
    session_id: str

class InitFormResponse(BaseModel):
    session_id: str
    message: str

class FormAnswerResponse(BaseModel):
    status: str
    message: str

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Routes

@app.get("/")
async def root():
    return {"message": "Form API is running"}

@app.post("/api/forms/init")
async def initialize_form(request: InitFormRequest, db: Session = Depends(get_db)):
    """Initialize a new form session"""
    try:
        session_id = str(uuid.uuid4())
        
        # Create new form session
        form_session = FormSession(session_id=session_id)
        db.add(form_session)
        db.commit()
        
        return {
            "session_id": session_id,
            "message": "Form session initialized"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/forms/save-answer")
async def save_answer(request: SaveAnswerRequest, db: Session = Depends(get_db)):
    """Save individual answer to database"""
    try:
        # Check if answer already exists for this question
        existing_answer = db.query(FormAnswer).filter(
            FormAnswer.session_id == request.session_id,
            FormAnswer.question_number == request.question_number
        ).first()
        
        if existing_answer:
            # Update existing answer
            existing_answer.answer = request.answer
            existing_answer.saved_at = datetime.utcnow()
        else:
            # Create new answer
            form_answer = FormAnswer(
                session_id=request.session_id,
                question_number=request.question_number,
                answer=request.answer
            )
            db.add(form_answer)
        
        db.commit()
        
        return {
            "status": "success",
            "message": f"Answer for question {request.question_number} saved"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/forms/submit")
async def submit_form(request: SubmitFormRequest, db: Session = Depends(get_db)):
    """Submit the complete form"""
    try:
        # Get the form session
        form_session = db.query(FormSession).filter(
            FormSession.session_id == request.session_id
        ).first()
        
        if not form_session:
            raise HTTPException(status_code=404, detail="Form session not found")
        
        # Mark as submitted
        form_session.is_submitted = 1
        form_session.submitted_at = datetime.utcnow()
        db.commit()
        
        # Get all answers for this session
        answers = db.query(FormAnswer).filter(
            FormAnswer.session_id == request.session_id
        ).all()
        
        return {
            "status": "success",
            "message": "Form submitted successfully",
            "submission_id": request.session_id,
            "answers_count": len(answers)
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/forms/{session_id}")
async def get_form_data(session_id: str, db: Session = Depends(get_db)):
    """Get all data for a specific form session"""
    try:
        form_session = db.query(FormSession).filter(
            FormSession.session_id == session_id
        ).first()
        
        if not form_session:
            raise HTTPException(status_code=404, detail="Form session not found")
        
        answers = db.query(FormAnswer).filter(
            FormAnswer.session_id == session_id
        ).all()
        
        answers_data = [
            {
                "question_number": answer.question_number,
                "answer": answer.answer,
                "saved_at": answer.saved_at
            }
            for answer in answers
        ]
        
        return {
            "session_id": session_id,
            "created_at": form_session.created_at,
            "submitted_at": form_session.submitted_at,
            "is_submitted": form_session.is_submitted,
            "answers": answers_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
