import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import "../styles/dashboard.css";
import { useAuth } from "../context/AuthContext";

function Dashboard() {
  const { user } = useAuth();
  const canPredict = user && (user.role === "DONOR" || user.role === "ADMIN");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/dashboard/stats");
      setStats(response.data);
    } catch (err) {
      if (err.response) {
        setError(`Could not load statistics (status ${err.response.status}).`);
      } else {
        setError("Cannot reach the Spring Boot backend. Is it running on port 8080?");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const total = stats ? Number(stats.totalDonations) || 0 : 0;
  const available = stats ? Number(stats.availableDonations) || 0 : 0;
  const claimed = stats ? Number(stats.claimedDonations) || 0 : 0;
  const surplus = stats ? Number(stats.totalPredictedSurplus) || 0 : 0;
  const predictions = stats ? Number(stats.totalPredictions) || 0 : 0;

  const claimedPercent =
    total > 0 ? Math.min(100, Math.round((claimed / total) * 100)) : 0;

  const cards = [
    {
      label: "Total donations",
      value: total,
      icon: "▤",
      detail: "All recorded donations",
      className: "db-total",
    },
    {
      label: "Available donations",
      value: available,
      icon: "↗",
      detail: "Food ready to be claimed",
      className: "db-available",
    },
    {
      label: "Claimed donations",
      value: claimed,
      icon: "✓",
      detail: "Successfully claimed",
      className: "db-claimed",
    },
    {
      label: "Predicted surplus",
      value: surplus.toLocaleString(),
      icon: "✳",
      detail: `${predictions} AI prediction${predictions === 1 ? "" : "s"} recorded`,
      className: "db-surplus",
    },
  ];

  return (
    <main className="db-page">
      <section className="db-welcome">
        <div className="db-welcome-copy">
          <span className="db-eyebrow">YOUR IMPACT AT A GLANCE</span>
          <h1>Dashboard</h1>
          <p>
            Track food donations, monitor surplus, and help build a world
            where good food goes further.
          </p>
        </div>

        <button
          className="db-refresh"
          onClick={loadStats}
          disabled={loading}
        >
          <span className={loading ? "db-refresh-icon db-spinning" : "db-refresh-icon"}>
            ↻
          </span>
          {loading ? "Refreshing..." : "Refresh data"}
        </button>
      </section>

      {error && (
        <div className="db-error" role="alert">
          <span>!</span>
          {error}
          <button onClick={loadStats}>Try again</button>
        </div>
      )}

      {loading && !stats && (
        <div className="db-loading">
          <span className="db-loader" />
          <p>Loading your dashboard...</p>
        </div>
      )}

      {stats && (
        <>
          <section className="db-stats-section">
            <div className="db-section-heading">
              <div>
                <h2>Platform overview</h2>
                <p>Here's how your food-sharing activity is looking.</p>
              </div>
              <span className="db-live-label">
                <span /> Updated statistics
              </span>
            </div>

            <div className="db-grid">
              {cards.map((card, index) => (
                <article
                  className={`db-card ${card.className}`}
                  key={card.label}
                  style={{ "--db-card-index": index }}
                >
                  <div className="db-card-top">
                    <span className="db-label">{card.label}</span>
                    <span className="db-card-icon">{card.icon}</span>
                  </div>

                  <strong className="db-value">{card.value}</strong>
                  <span className="db-sub">{card.detail}</span>
                  <div className="db-card-accent" />
                </article>
              ))}
            </div>
          </section>

          <section className="db-panel">
            <div className="db-panel-heading">
              <div className="db-panel-icon">♡</div>
              <div>
                <h2>Donation progress</h2>
                <p>See how much of the recorded food supply has been claimed.</p>
              </div>
            </div>

            <div className="db-progress-summary">
              <div>
                <strong>{claimedPercent}%</strong>
                <span>of total donations claimed</span>
              </div>
              <span className="db-progress-count">
                {claimed} <span>of</span> {total}
              </span>
            </div>

            <div
              className="db-bar"
              role="progressbar"
              aria-label="Percentage of donations claimed"
              aria-valuenow={claimedPercent}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="db-bar-fill"
                style={{ width: `${claimedPercent}%` }}
              />
            </div>

            <div className="db-progress-legend">
              <span><i className="db-legend-claimed" /> Claimed</span>
              <span><i className="db-legend-remaining" /> Other donations</span>
            </div>

            {total === 0 && (
              <p className="db-empty-note">
                No donations have been recorded yet. Once donations are
                added, your progress will appear here.
              </p>
            )}
          </section>

          <section className="db-next-steps">
            <div>
              <span className="db-eyebrow">KEEP THE MOMENTUM GOING</span>
              <h2>Turn surplus into something meaningful.</h2>
              <p>
                {canPredict
                  ? "Explore available food, or use AI to estimate potential surplus and support better food planning."
                  : "Explore available food and follow the donations you have claimed."}
              </p>
            </div>

            <div className="db-next-actions">
              <Link to="/donations" className="db-primary-link">
                Explore donations <span>→</span>
              </Link>
              {canPredict && (
                <Link to="/predict" className="db-secondary-link">
                  AI prediction <span>↗</span>
                </Link>
              )}
            </div>
          </section>

          <p className="db-note">
            AI-predicted surplus represents the sum of recorded predictions,
            including test runs. These are estimates from a model trained
            on synthetic data, not measured food quantities.
          </p>
        </>
      )}
    </main>
  );
}

export default Dashboard;