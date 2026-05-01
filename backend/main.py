from fastapi import FastAPI, Request
from twilio.rest import Client
import requests
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="ChroniCare Backend")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to ChroniCare Backend API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# --- Alert Endpoints ---
TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_FROM_NUMBER = os.getenv("TWILIO_FROM_NUMBER", "")
TO_NUMBER = os.getenv("TO_NUMBER", "")
PUSHBULLET_TOKEN = os.getenv("PUSHBULLET_TOKEN", "")

@app.post("/call-alert")
async def call_alert(request: Request):
    data = await request.json()
    risk_score = data.get("risk_score", "unknown")
    patient_name = data.get("patient_name", "Unknown Patient")
    
    twiml_msg = f'''<Response>
    <Pause length="3"/>
    <Say voice="alice" language="en-IN">
        Critical Alert. Critical Alert.
    </Say>
    <Pause length="1"/>
    <Say voice="alice" language="en-IN">
        ChroniCare AI has detected a medical emergency.
        Patient {patient_name} is in the danger zone.
        Risk score is {risk_score} out of 100.
    </Say>
    <Pause length="1"/>
    <Say voice="alice" language="en-IN">
        Critical vitals detected.
        Ejection fraction is critically low.
        Serum creatinine is dangerously elevated.
        Heart rate is dangerously high.
        Immediate intervention is required.
    </Say>
    <Pause length="1"/>
    <Say voice="alice" language="en-IN">
        Repeating. Patient {patient_name}.
        Risk score {risk_score} out of 100.
        Please respond immediately.
        This is ChroniCare AI Patient Monitoring System.
    </Say>
</Response>'''

    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    call = client.calls.create(
        twiml=twiml_msg,
        to=TO_NUMBER,
        from_=TWILIO_FROM_NUMBER
    )
    
    return {"status": "call_initiated", "call_sid": call.sid}

@app.post("/pushbullet-alert")
async def pushbullet_alert(request: Request):
    data = await request.json()
    message = data.get("message", "Critical patient alert")
    
    headers = {
        "Access-Token": PUSHBULLET_TOKEN,
        "Content-Type": "application/json"
    }
    payload = {
        "type": "note",
        "title": "🚨 ChroniCare — CRITICAL PATIENT ALERT",
        "body": message
    }
    
    response = requests.post("https://api.pushbullet.com/v2/pushes", headers=headers, json=payload)
    return {"status": "push_sent", "details": response.json()}

@app.post("/medicine-call")
async def medicine_call(request: Request):
    data = await request.json()
    medicine_name = data.get("medicine_name", "your medicine")
    dosage = data.get("dosage", "prescribed dosage")
    instructions = data.get("instructions", "")
    
    instruction_twiml = f"Special note: {instructions}." if instructions else ""
    
    twiml_msg = f'''<Response>
    <Pause length="3"/>
    <Say voice="alice" language="en-IN">
        Hello! This is ChroniCare, your AI health assistant.
        This is a reminder to take your medicine.
        Medicine name: {medicine_name}.
        Dosage: {dosage}.
        {instruction_twiml}
        Please take your medicine now and stay healthy.
        Have a great day. Goodbye.
    </Say>
</Response>'''

    client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    call = client.calls.create(
        twiml=twiml_msg,
        to=TO_NUMBER,
        from_=TWILIO_FROM_NUMBER
    )
    
    return {"status": "reminder_call_sent", "call_sid": call.sid}
