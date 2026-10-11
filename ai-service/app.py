
from pathlib import Path

import joblib
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="FoodWasteAI Prediction API")

BASE_DIR = Path(__file__).parent
MODEL_PATH = BASE_DIR / "model" / "food_consumption_model.joblib"

model = joblib.load(MODEL_PATH)


class PredictionInput(BaseModel):
    food_type: str
    meal_type: str
    day_of_week: int = Field(ge=0, le=6)
    number_of_customers: int = Field(gt=0)
    quantity_prepared: float = Field(gt=0)


@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "FoodWasteAI AI Service",
        "model_loaded": True,
    }


@app.post("/predict")
def predict(data: PredictionInput):
    input_data = pd.DataFrame([data.model_dump()])

    predicted_consumption = float(model.predict(input_data)[0])

    # Keep the result within physically possible limits.
    predicted_consumption = max(
        0.0,
        min(data.quantity_prepared, predicted_consumption),
    )

    predicted_surplus = data.quantity_prepared - predicted_consumption

    return {
        "food_type": data.food_type,
        "quantity_prepared": data.quantity_prepared,
        "predicted_consumption": round(predicted_consumption, 2),
        "predicted_surplus": round(predicted_surplus, 2),
        "unit": "portions",
    }
