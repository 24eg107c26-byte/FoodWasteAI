import { useEffect, useState } from "react";
import api from "./../services/api";
import { useAuth } from "../context/AuthContext";
import "../styles/donations.css";

function Donations() {
  const { user } = useAuth();
  const isDonor = user?.role === "DONOR";
  const isRecipient = user?.role === "RECIPIENT";

  const [donations, setDonations] = useState([]);
  const [foodType, setFoodType] = useState("Rice");
  const [quantity, setQuantity] = useState("");
  const [pickupLocation, setPickupLocation] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const minDate = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0")
  ].join("-");

  const errorText = (error, fallback) =>
    error.response?.data?.message ||
    error.response?.data?.detail ||
    error.response?.data?.error ||
    fallback;

  const fetchDonations = async () => {
    try {
      const response = await api.get("/donations");
      setDonations(response.data);
    } catch (error) {
      setMessage("Unable to load donations. Check the backend.");
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      await api.post("/donations", {
        foodType,
        quantity: Number(quantity),
        pickupLocation,
        expiryDate
      });

      setMessage("Food donation added successfully!");
      setQuantity("");
      setPickupLocation("");
      setExpiryDate("");

      await fetchDonations();
    } catch (error) {
      setMessage(errorText(error, "Failed to add donation. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (id) => {
    setMessage("");

    try {
      await api.post(`/donations/${id}/claim`);
      setMessage("Donation claimed successfully!");
      await fetchDonations();
    } catch (error) {
      setMessage(errorText(error, "Unable to claim this donation."));
    }
  };

  return (
    <main className="donations-page">
      <section className="donations-hero">
        <div className="donations-hero-content">
          <span className="donations-eyebrow">FOOD WASTE REDUCTION</span>
          <h1>Food Donations</h1>
          <p>
            Every meal shared makes a difference. Connect surplus food
            with people who need it.
          </p>

          <div className="donations-hero-points">
            <span>♻ Reduce waste</span>
            <span>♥ Support communities</span>
          </div>
        </div>

        <div className="donations-hero-icon" aria-hidden="true">
          <span>🥗</span>
        </div>
      </section>

      {message && (
        <div className="donations-message" role="status">
          <span>{message}</span>
          <button
            type="button"
            className="donations-message-close"
            onClick={() => setMessage("")}
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {isDonor && (
        <section className="donations-panel">
          <div className="donations-section-heading">
            <div className="donations-heading-icon">＋</div>
            <div>
              <h2>Donate Surplus Food</h2>
              <p>Provide a few details to share your available food.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="donations-form">
            <div className="donations-field">
              <label htmlFor="donation-food-type">Food Type</label>
              <select
                id="donation-food-type"
                value={foodType}
                onChange={(e) => setFoodType(e.target.value)}
                required
              >
                <option>Rice</option>
                <option>Chapati</option>
                <option>Dal</option>
                <option>Biryani</option>
                <option>Pasta</option>
                <option>Vegetables</option>
              </select>
            </div>

            <div className="donations-field">
              <label htmlFor="donation-quantity">Quantity (kg)</label>
              <input
                id="donation-quantity"
                type="number"
                min="0.1"
                step="0.1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 5"
              />
            </div>

            <div className="donations-field donations-field-full">
              <label htmlFor="donation-location">Pickup Location</label>
              <input
                id="donation-location"
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="Enter the complete pickup address"
              />
            </div>

            <div className="donations-field donations-field-full">
              <label htmlFor="donation-expiry">Expiry Date</label>
              <input
                id="donation-expiry"
                type="date"
                min={minDate}
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            <div className="donations-field-full">
              <button
                type="submit"
                className="donations-primary-button"
                disabled={loading}
              >
                {loading ? "Submitting donation..." : "Donate Food →"}
              </button>
            </div>
          </form>
        </section>
      )}

      <section className="donations-list-section">
        <div className="donations-list-heading">
          <div>
            <span className="donations-eyebrow">MAKE A DIFFERENCE</span>
            <h2>Available Donations</h2>
            <p>Explore food donations and their current status.</p>
          </div>
          <span className="donations-count">
            {donations.length} {donations.length === 1 ? "listing" : "listings"}
          </span>
        </div>

        {donations.length === 0 ? (
          <div className="donations-empty">
            <div className="donations-empty-icon">🍽️</div>
            <h3>No donations to display</h3>
            <p>New food donations will appear here when available.</p>
          </div>
        ) : (
          <div className="donations-grid">
            {donations.map((donation) => {
              const available = donation.status === "AVAILABLE";

              return (
                <article className="donation-card" key={donation.id}>
                  <div className="donation-card-top">
                    <div className="donation-food-icon">🍲</div>
                    <span
                      className={`donation-status ${
                        available ? "is-available" : "is-other"
                      }`}
                    >
                      {donation.status}
                    </span>
                  </div>

                  <h3>{donation.foodType}</h3>

                  <div className="donation-quantity">
                    <strong>{donation.quantity}</strong>
                    <span>kg available</span>
                  </div>

                  <div className="donation-details">
                    <div className="donation-detail-row">
                      <span className="donation-detail-icon">⌖</span>
                      <div>
                        <small>Pickup location</small>
                        <p>{donation.pickupLocation}</p>
                      </div>
                    </div>

                    <div className="donation-detail-row">
                      <span className="donation-detail-icon">◷</span>
                      <div>
                        <small>Expiry date</small>
                        <p>{donation.expiryDate}</p>
                      </div>
                    </div>
                  </div>

                  {isRecipient && (
                    <button
                      type="button"
                      className="donations-claim-button"
                      onClick={() => handleClaim(donation.id)}
                      disabled={!available}
                    >
                      {available ? "Claim Donation →" : "Not Available"}
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default Donations;