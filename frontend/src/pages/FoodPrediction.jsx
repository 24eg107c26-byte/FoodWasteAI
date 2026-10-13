import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/prediction.css";

const DONOR_ID = 1;

const FOOD_TYPES = ["Rice", "Chapati", "Dal", "Biryani", "Pasta", "Vegetables"];
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner"];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const todayString = () => new Date().toLocaleDateString("en-CA");
const todayIndex = () => (new Date().getDay() + 6) % 7;

function FoodPrediction() {
  const [form, setForm] = useState({
    foodType: "Rice",
    mealType: "Lunch",
    dayOfWeek: String(todayIndex()),
    numberOfCustomers: "",
    quantityPrepared: "",
    quantityConsumed: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const customers = Number(form.numberOfCustomers);
    const prepared = Number(form.quantityPrepared);
    const dayIndex = Number(form.dayOfWeek);

    if (!Number.isInteger(customers) || customers <= 0) {
      setError("Number of customers must be a whole number greater than 0.");
      return;
    }

    if (!Number.isFinite(prepared) || prepared <= 0) {
      setError("Quantity prepared must be greater than 0.");
      return;
    }

    if (
      form.quantityConsumed !== "" &&
      (!Number.isFinite(Number(form.quantityConsumed)) ||
        Number(form.quantityConsumed) < 0)
    ) {
      setError("Quantity consumed cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      const recordResponse = await api.post("/food-records", {
        donorId: DONOR_ID,
        foodType: form.foodType,
        quantityPrepared: prepared,
        quantityConsumed:
          form.quantityConsumed === "" ? 0 : Number(form.quantityConsumed),
        numberOfCustomers: customers,
        mealType: form.mealType,
        dayOfWeek: DAYS[dayIndex],
        recordDate: todayString(),
      });

      const foodRecordId = recordResponse.data.id;

      if (!foodRecordId) {
        throw new Error("The backend did not return an id for the food record.");
      }

      const predictionResponse = await api.post("/predictions/predict", {
        foodRecordId,
        food_type: form.foodType,
        meal_type: form.mealType,
        day_of_week: dayIndex,
        number_of_customers: customers,
        quantity_prepared: prepared,
      });

      setResult(predictionResponse.data);
    } catch (err) {
      if (err.response) {
        const data = err.response.data;
        setError(
          (data && (data.message || data.error)) ||
            `Request failed (status ${err.response.status}).`
        );
      } else if (err.request) {
        setError("Cannot reach the Spring Boot backend. Is it running on port 8080?");
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError("");
  };

  const prepared = result ? Number(result.quantity_prepared) || 0 : 0;
  const consumption = result ? Number(result.predicted_consumption) || 0 : 0;
  const surplus = result ? Number(result.predicted_surplus) || 0 : 0;

  const safeSurplus = Math.max(0, Math.min(surplus, prepared));
  const surplusPercent =
    prepared > 0 ? Math.round((safeSurplus / prepared) * 100) : 0;

  return (
    <main className="fp-page">
      <header className="fp-header">
        <div className="fp-breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span>Food Prediction</span>
        </div>

        <div className="fp-heading-row">
          <div>
            <span className="fp-eyebrow">SMART FOOD MANAGEMENT</span>
            <h1>Food Surplus Prediction</h1>
            <p>
              Make smarter food decisions with AI-powered surplus estimates.
              Plan better, donate more, and waste less.
            </p>
          </div>

          <div className="fp-header-art" aria-hidden="true">
            <span className="fp-art-spark">✳</span>
            <span className="fp-art-leaf">❧</span>
            <span className="fp-art-circle" />
          </div>
        </div>

        <div className="fp-flow">
          <span>01</span> Food details
          <i>→</i>
          <span>02</span> AI prediction
          <i>→</i>
          <span>03</span> Reduce waste
        </div>
      </header>

      {error && (
        <div className="fp-error" role="alert">
          <span className="fp-error-icon">!</span>
          <span>{error}</span>
        </div>
      )}

      <div className="fp-layout">
        <form className="fp-card fp-form-card" onSubmit={handleSubmit}>
          <div className="fp-card-heading">
            <div className="fp-heading-icon">▤</div>
            <div>
              <h2>Food details</h2>
              <p>Enter information about the meal you've prepared.</p>
            </div>
          </div>

          <div className="fp-form-grid">
            <label className="fp-field">
              <span>Food type</span>
              <select
                name="foodType"
                value={form.foodType}
                onChange={handleChange}
              >
                {FOOD_TYPES.map((food) => (
                  <option key={food} value={food}>{food}</option>
                ))}
              </select>
            </label>

            <label className="fp-field">
              <span>Meal type</span>
              <select
                name="mealType"
                value={form.mealType}
                onChange={handleChange}
              >
                {MEAL_TYPES.map((meal) => (
                  <option key={meal} value={meal}>{meal}</option>
                ))}
              </select>
            </label>

            <label className="fp-field fp-field-full">
              <span>Day of the week</span>
              <select
                name="dayOfWeek"
                value={form.dayOfWeek}
                onChange={handleChange}
              >
                {DAYS.map((day, index) => (
                  <option key={day} value={index}>{day}</option>
                ))}
              </select>
            </label>

            <label className="fp-field fp-field-full">
              <span>Expected number of customers</span>
              <input
                type="number"
                name="numberOfCustomers"
                min="1"
                step="1"
                placeholder="e.g. 150 customers"
                value={form.numberOfCustomers}
                onChange={handleChange}
                required
              />
              <small>Enter the expected number of people eating.</small>
            </label>

            <label className="fp-field fp-field-full">
              <span>Quantity prepared <i>(portions)</i></span>
              <input
                type="number"
                name="quantityPrepared"
                min="0.01"
                step="any"
                placeholder="e.g. 180 portions"
                value={form.quantityPrepared}
                onChange={handleChange}
                required
              />
            </label>

            <label className="fp-field fp-field-full">
              <span>Quantity consumed <i>(optional)</i></span>
              <input
                type="number"
                name="quantityConsumed"
                min="0"
                step="any"
                placeholder="Leave blank if not known yet"
                value={form.quantityConsumed}
                onChange={handleChange}
              />
              <small>If unknown, the record will save 0 for this field.</small>
            </label>
          </div>

          <div className="fp-form-footer">
            <p><span>✳</span> Your details will be used to request an AI estimate.</p>

            <button type="submit" className="fp-button" disabled={loading}>
              {loading ? (
                <>
                  <span className="fp-button-spinner" />
                  Generating prediction...
                </>
              ) : (
                <>Predict surplus <span>→</span></>
              )}
            </button>
          </div>
        </form>

        <section className="fp-card fp-result-card">
          <div className="fp-card-heading">
            <div className="fp-heading-icon fp-result-icon">✳</div>
            <div>
              <h2>AI prediction result</h2>
              <p>Your estimated food consumption and surplus.</p>
            </div>
          </div>

          {loading && (
            <div className="fp-empty-state">
              <div className="fp-ai-loader"><span>✳</span></div>
              <h3>Analysing your food data</h3>
              <p>The AI service is generating your prediction. This may take a moment.</p>
            </div>
          )}

          {!loading && !result && (
            <div className="fp-empty-state">
              <div className="fp-empty-illustration">
                <span>♧</span>
                <i>✳</i>
              </div>
              <h3>Your results will appear here</h3>
              <p>
                Complete the food details and select Predict surplus to see
                your AI-generated estimate.
              </p>
              <div className="fp-empty-tip">
                <span>TIP</span>
                More accurate input records can help you evaluate your food planning.
              </div>
            </div>
          )}

          {result && !loading && (
            <>
              <div className="fp-result-success">
                <span>✓</span> Prediction generated successfully
              </div>

              <div className="fp-stats">
                <div className="fp-stat fp-stat-consumed">
                  <span className="fp-stat-label">Predicted consumption</span>
                  <strong className="fp-stat-value">{consumption.toFixed(1)}</strong>
                  <span className="fp-stat-unit">{result.unit}</span>
                  <span className="fp-stat-caption">Expected to be consumed</span>
                </div>

                <div className="fp-stat fp-stat-surplus">
                  <span className="fp-stat-label">Predicted surplus</span>
                  <strong className="fp-stat-value">{surplus.toFixed(1)}</strong>
                  <span className="fp-stat-unit">{result.unit}</span>
                  <span className="fp-stat-caption">Potentially left over</span>
                </div>
              </div>

              <div className="fp-breakdown">
                <div className="fp-breakdown-heading">
                  <h3>Prepared food breakdown</h3>
                  <span>{prepared} {result.unit}</span>
                </div>

                <div className="fp-bar" aria-label="Estimated food breakdown">
                  <div
                    className="fp-bar-consumed"
                    style={{ width: `${100 - surplusPercent}%` }}
                  />
                  <div
                    className="fp-bar-surplus"
                    style={{ width: `${surplusPercent}%` }}
                  />
                </div>

                <div className="fp-legend">
                  <span><i className="fp-dot fp-dot-consumed" /> Predicted consumption</span>
                  <span><i className="fp-dot fp-dot-surplus" /> Potential surplus</span>
                </div>

                <div className="fp-surplus-callout">
                  <div className="fp-callout-icon">↗</div>
                  <div>
                    <strong>Approximately {surplusPercent}% potential surplus</strong>
                    <p>About {surplus.toFixed(1)} {result.unit} may remain, according to this estimate.</p>
                  </div>
                </div>
              </div>

              <div className="fp-saved">
                <span>✓</span>
                <div>
                  <strong>Record saved successfully</strong>
                  <p>
                    Prediction #{result.id} · Food record #{result.foodRecordId}
                  </p>
                </div>
              </div>

              <p className="fp-note">
                This is an estimate from a model trained on synthetic data,
                not a guarantee of actual consumption or surplus.
              </p>

              <button
                type="button"
                className="fp-button-secondary"
                onClick={handleReset}
              >
                Clear result
              </button>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

export default FoodPrediction;