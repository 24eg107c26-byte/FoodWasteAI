
import pandas as pd
import numpy as np
from pathlib import Path

# Reproducible synthetic dataset
np.random.seed(42)

NUM_RECORDS = 2000

food_types = ["Rice", "Biryani", "Chapati", "Dal", "Vegetables", "Pasta"]
meal_types = ["Breakfast", "Lunch", "Dinner"]

data = []

for _ in range(NUM_RECORDS):
    food_type = np.random.choice(food_types)
    meal_type = np.random.choice(meal_types)
    day_of_week = np.random.randint(0, 7)

    number_of_customers = np.random.randint(30, 301)

    # Portions prepared based on expected demand
    quantity_prepared = number_of_customers * np.random.uniform(0.8, 1.2)

    # Simulated influences on consumption
    meal_factor = {
        "Breakfast": 0.82,
        "Lunch": 0.92,
        "Dinner": 0.87
    }[meal_type]

    food_factor = {
        "Rice": 0.95,
        "Biryani": 0.90,
        "Chapati": 0.88,
        "Dal": 0.91,
        "Vegetables": 0.80,
        "Pasta": 0.86
    }[food_type]

    weekend_factor = 1.05 if day_of_week >= 5 else 1.0

    # Generate simulated actual consumption with random variation
    consumption_ratio = (
        meal_factor * food_factor * weekend_factor
        + np.random.normal(0, 0.04)
    )

    consumption_ratio = np.clip(consumption_ratio, 0.50, 1.0)

    quantity_consumed = min(
        quantity_prepared,
        quantity_prepared * consumption_ratio
    )

    data.append({
        "food_type": food_type,
        "meal_type": meal_type,
        "day_of_week": day_of_week,
        "number_of_customers": number_of_customers,
        "quantity_prepared": round(quantity_prepared, 2),
        "quantity_consumed": round(quantity_consumed, 2)
    })

df = pd.DataFrame(data)

output_path = Path(__file__).parent / "food_consumption.csv"
df.to_csv(output_path, index=False)

print("Dataset created successfully!")
print(f"Total records: {len(df)}")
print(f"Saved to: {output_path}")
print("\nFirst 5 records:")
print(df.head())
print("\nDataset summary:")
print(df.describe())
