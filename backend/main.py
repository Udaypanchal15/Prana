from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from pydantic import BaseModel
import joblib
import numpy as np

from config import config
from routes import auth, patients, vitals, predictions, alerts

app = FastAPI(
    title="Prana Health API",
    description="AI-Powered Chronic Patient Monitoring & Early Health Risk Prediction System",
    version="1.0.0"
)

)

# Load ML Model
try:
    model_path = os.path.join(os.path.dirname(__file__), "..", "heart_failure_model.pkl")
    model = joblib.load(model_path)
except Exception as e:
    print(f"Error loading model: {e}")
    model = None

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(patients.router)
app.include_router(vitals.router)
app.include_router(predictions.router)
app.include_router(alerts.router)

@app.get("/")
async def root():
    return {
        "message": "Prana Health API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

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

# --- ML Prediction Endpoint ---
class HeartFailureInput(BaseModel):
    age: float
    anaemia: int
    creatinine_phosphokinase: float
    diabetes: int
    ejection_fraction: float
    high_blood_pressure: int
    platelets: float
    serum_creatinine: float
    serum_sodium: float
    sex: int
    smoking: int
    time: float

@app.post("/predict")
async def predict_heart_failure(data: HeartFailureInput):
    if model is None:
        return {"error": "Model not loaded properly on the server."}
        
    # Prepare features in exact order
    features = np.array([
        data.age,
        data.anaemia,
        data.creatinine_phosphokinase,
        data.diabetes,
        data.ejection_fraction,
        data.high_blood_pressure,
        data.platelets,
        data.serum_creatinine,
        data.serum_sodium,
        data.sex,
        data.smoking,
        data.time
    ])
    
    # Scale features using provided StandardScaler parameters
    means = np.array([6.10725272e+01, 4.47698745e-01, 6.02790795e+02, 4.47698745e-01,
                      3.78870293e+01, 3.72384937e-01, 2.63670546e+05, 1.39171548e+00,
                      1.36527197e+02, 6.40167364e-01, 3.17991632e-01, 1.27217573e+02])
    stds = np.array([1.14198983e+01, 4.97257055e-01, 1.01024275e+03, 4.97257055e-01,
                     1.19696181e+01, 4.83440168e-01, 9.92021416e+04, 1.08677904e+00,
                     4.41638885e+00, 4.79951154e-01, 4.65696203e-01, 7.74132714e+01])
    
    scaled_features = (features - means) / stds
    scaled_features = scaled_features.reshape(1, -1)
    
    # Predict probabilities
    probability = float(model.predict_proba(scaled_features)[0][1])
    
    # Calculate risk score (0-100)
    risk_score = round(probability * 100, 2)
    
    status = "SURVIVE" if probability < 0.5 else "DETERIORATE"
    
    return {
        "probability": probability,
        "risk_score": risk_score,
        "prediction": status
    }
>>>>>>> 565a49548386b425830550997b65f0050542b4eb
