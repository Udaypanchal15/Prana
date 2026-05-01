from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from config import config
from routes import auth, patients, vitals, predictions, alerts

app = FastAPI(
    title="Prana Health API",
    description="AI-Powered Chronic Patient Monitoring & Early Health Risk Prediction System",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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