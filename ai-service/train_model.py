
import pandas as pd
import joblib

from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import numpy as np


# Define project paths
BASE_DIR = Path(__file__).parent
DATA_PATH = BASE_DIR / "data" / "food_consumption.csv"
MODEL_DIR = BASE_DIR / "model"
MODEL_PATH = MODEL_DIR / "food_consumption_model.joblib"

# Load dataset
df = pd.read_csv(DATA_PATH)

print("Dataset loaded successfully!")
print("Dataset shape:", df.shape)

# Features used to predict food consumption
X = df[
    [
        "food_type",
        "meal_type",
        "day_of_week",
        "number_of_customers",
        "quantity_prepared",
    ]
]

# Target variable
y = df["quantity_consumed"]

# Convert categorical columns to numerical values
categorical_features = ["food_type", "meal_type"]
numerical_features = [
    "day_of_week",
    "number_of_customers",
    "quantity_prepared",
]

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(handle_unknown="ignore"),
            categorical_features,
        ),
        ("numerical", "passthrough", numerical_features),
    ]
)

# Build preprocessing + Random Forest pipeline
model = Pipeline(
    steps=[
        ("preprocessor", preprocessor),
        (
            "regressor",
            RandomForestRegressor(
                n_estimators=200,
                random_state=42,
                min_samples_leaf=2,
                n_jobs=-1,
            ),
        ),
    ]
)

# Split into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train the model
print("\nTraining Random Forest model...")
model.fit(X_train, y_train)

# Evaluate on held-out test data
y_pred = model.predict(X_test)

mae = mean_absolute_error(y_test, y_pred)
mse = mean_squared_error(y_test, y_pred)
rmse = np.sqrt(mse)
r2 = r2_score(y_test, y_pred)

print("\nModel Evaluation Results")
print("------------------------")
print(f"MAE  : {mae:.2f}")
print(f"MSE  : {mse:.2f}")
print(f"RMSE : {rmse:.2f}")
print(f"R²   : {r2:.4f}")

# Save the trained pipeline
MODEL_DIR.mkdir(parents=True, exist_ok=True)
joblib.dump(model, MODEL_PATH)

print("\nModel saved successfully!")
print("Model path:", MODEL_PATH)

# Demonstrate one prediction
sample = pd.DataFrame(
    [
        {
            "food_type": "Rice",
            "meal_type": "Lunch",
            "day_of_week": 0,
            "number_of_customers": 150,
            "quantity_prepared": 180.0,
        }
    ]
)

predicted_consumption = float(model.predict(sample)[0])
predicted_surplus = max(0.0, 180.0 - predicted_consumption)

print("\nSample Prediction")
print("-----------------")
print(f"Food prepared       : 180 portions")
print(f"Predicted consumed  : {predicted_consumption:.2f} portions")
print(f"Predicted surplus   : {predicted_surplus:.2f} portions")
