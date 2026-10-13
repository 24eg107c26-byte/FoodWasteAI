import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/history.css";
import "../styles/admin.css";

const today = () => new Date().toLocaleDateString("en-CA");

function displayStatus(d) {
  if (d.status === "AVAILABLE" && d.expiryDate < today()) return "EXPIRED";
  return d.status;
}

const formatDate = (value) =>
  value ? String(value).replace("T", " ").slice(0, 16) : "-";

function BarList({ items, unit, colorClass }) {
  const max = Math.max(0, ...items.map((i) => i.value));

  if (items.length === 0) {
    return <p className="hs-muted">No data yet.</p>;
  }

  return (
    <div>
      {items.map((i) => (
        <div className="rp-row" key={i.label}>
          <span className="rp-label">{i.label}</span>
          <div className="rp-track">
            <div
              className={`rp-fill ${colorClass || ""}`}
              style={{
                width: `${max > 0 ? (i.value / max) * 100 : 0}%`,
              }}
            />
          </div>
          <span className="rp-value">
            {i.value}
            {unit ? ` ${unit}` : ""}
          </span>
        </div>
      ))}
    </div>
  );
}

function AdminPanel() {
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [donations, setDonations] = useState([]);
  const [predictions, setPredictions] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");

      try {
        const [u, d, p, r] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/donations"),
          api.get("/admin/predictions"),
          api.get("/admin/reports"),
        ]);

        setUsers(u.data);
        setDonations(d.data);
        setPredictions(p.data);
        setReports(r.data);
      } catch (err) {
        if (err.response) {
          setError(
            `Could not load admin data (status ${err.response.status}).`
          );
        } else {
          setError(
            "Cannot reach the Spring Boot backend. Is it running on port 8080?"
          );
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleVerify = async (id) => {
    setMessage("");
    setBusyId(id);

    try {
      const response = await api.post(`/admin/users/${id}/verify`);

      setUsers((list) =>
        list.map((u) => (u.id === id ? response.data : u))
      );

      setMessage(`${response.data.name} has been verified.`);
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
          "Could not verify this user. Please try again."
      );
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = users.filter(
    (u) => u.role === "RECIPIENT" && !u.verified
  ).length;

  const tabs = [
    { key: "users", label: "Users", count: users.length },
    { key: "donations", label: "Donations", count: donations.length },
    { key: "predictions", label: "AI Predictions", count: predictions.length },
    { key: "reports", label: "Reports" },
  ];

  return (
    <div className="ad-dashboard">
      <header className="ad-header">
        <div className="ad-brand">
          <div className="ad-brand-icon">✳</div>
          <div>
            <div className="ad-brand-name">FoodWasteAI</div>
            <div className="ad-brand-caption">
              Together Against Food Waste
            </div>
          </div>
        </div>
        <span className="ad-admin-label">
          <span className="ad-online-dot" />
          Administrator
        </span>
      </header>

      <main className="ad-main">
        <section className="ad-welcome">
          <div>
            <span className="ad-eyebrow">ADMINISTRATION</span>
            <h1>Admin Dashboard</h1>
            <p>
              Manage your community, monitor donations, and track AI
              predictions from one place.
            </p>
          </div>
          <div className="ad-welcome-icon">🌱</div>
        </section>

        {error && <div className="ad-alert ad-alert-error">{error}</div>}
        {message && (
          <div className="ad-alert ad-alert-success" role="status">
            {message}
          </div>
        )}

        <section className="ad-stats">
          <div className="ad-stat-card ad-stat-green">
            <div className="ad-stat-top">
              <span className="ad-stat-icon">♧</span>
              <span className="ad-stat-caption">COMMUNITY</span>
            </div>
            <p>Total Users</p>
            <strong>{loading ? "—" : users.length}</strong>
            <span className="ad-stat-foot">Registered accounts</span>
          </div>

          <div className="ad-stat-card ad-stat-blue">
            <div className="ad-stat-top">
              <span className="ad-stat-icon">▤</span>
              <span className="ad-stat-caption">FOOD SHARING</span>
            </div>
            <p>Total Donations</p>
            <strong>{loading ? "—" : donations.length}</strong>
            <span className="ad-stat-foot">Food donation records</span>
          </div>

          <div className="ad-stat-card ad-stat-orange">
            <div className="ad-stat-top">
              <span className="ad-stat-icon">◷</span>
              <span className="ad-stat-caption">ACTION NEEDED</span>
            </div>
            <p>Pending Verifications</p>
            <strong>{loading ? "—" : pendingCount}</strong>
            <span className="ad-stat-foot">Recipients awaiting review</span>
          </div>

          <div className="ad-stat-card ad-stat-purple">
            <div className="ad-stat-top">
              <span className="ad-stat-icon">✧</span>
              <span className="ad-stat-caption">ARTIFICIAL INTELLIGENCE</span>
            </div>
            <p>AI Predictions</p>
            <strong>{loading ? "—" : predictions.length}</strong>
            <span className="ad-stat-foot">Prediction records</span>
          </div>
        </section>

        <section className="ad-workspace">
          <div className="ad-section-heading">
            <div>
              <span className="ad-eyebrow">MANAGEMENT CENTER</span>
              <h2>Platform Overview</h2>
            </div>
            <span className="ad-live-badge">
              <span className="ad-online-dot" />
              Live data
            </span>
          </div>

          <nav className="ad-tabs" aria-label="Admin sections">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={
                  tab === t.key ? "ad-tab ad-tab-active" : "ad-tab"
                }
                onClick={() => setTab(t.key)}
                aria-current={tab === t.key ? "page" : undefined}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className="ad-tab-count">{t.count}</span>
                )}
                {t.key === "users" && pendingCount > 0 && (
                  <span className="ad-tab-alert">{pendingCount}</span>
                )}
              </button>
            ))}
          </nav>

          {loading && (
            <div className="ad-empty-state">
              <div className="ad-loader" />
              <p>Loading your dashboard...</p>
            </div>
          )}

          {!loading && !error && (
            <>
              {tab === "users" && (
                <div className="ad-content-heading">
                  <div>
                    <h3>Registered Users</h3>
                    <p>Review accounts and verify recipient organizations.</p>
                  </div>
                  {pendingCount > 0 && (
                    <span className="ad-pending-summary">
                      {pendingCount} awaiting verification
                    </span>
                  )}
                </div>
              )}

              {tab === "donations" && (
                <div className="ad-content-heading">
                  <div>
                    <h3>Donation Records</h3>
                    <p>Monitor food availability and donation status.</p>
                  </div>
                </div>
              )}

              {tab === "predictions" && (
                <div className="ad-content-heading">
                  <div>
                    <h3>AI Prediction Records</h3>
                    <p>Review the recorded consumption and surplus estimates.</p>
                  </div>
                </div>
              )}

              {tab === "reports" && (
                <div className="ad-content-heading">
                  <div>
                    <h3>Reports & Analytics</h3>
                    <p>Explore donation activity, user roles, and predicted surplus.</p>
                  </div>
                </div>
              )}

              {tab === "reports" && reports && (
                <div className="rp-grid">
                  <div className="rp-card">
                    <h2>Donations by Status</h2>
                    <BarList
                      items={Object.entries(
                        reports.donationsByStatus || {}
                      ).map(([label, value]) => ({ label, value }))}
                    />
                  </div>

                  <div className="rp-card">
                    <h2>Users by Role</h2>
                    <BarList
                      colorClass="rp-fill-blue"
                      items={Object.entries(
                        reports.usersByRole || {}
                      ).map(([label, value]) => ({ label, value }))}
                    />
                  </div>

                  <div className="rp-card rp-wide">
                    <h2>Predicted Surplus by Food Type</h2>
                    <BarList
                      colorClass="rp-fill-orange"
                      unit="portions"
                      items={(reports.surplusByFoodType || []).map((s) => ({
                        label: `${s.foodType} (${s.predictions})`,
                        value: s.totalSurplus,
                      }))}
                    />
                    <p className="rp-note">
                      The number in brackets indicates how many predictions
                      were made. Values are AI estimates from a model trained
                      on synthetic data.
                    </p>
                  </div>
                </div>
              )}

              {tab === "reports" && !reports && (
                <div className="ad-empty-state">
                  <p>Report data is not available.</p>
                </div>
              )}

              {tab !== "reports" && (
                <div className="ad-table-wrap">
                  {tab === "users" && (
                    <table className="ad-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Phone</th>
                          <th>Location</th>
                          <th>Verification</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td className="ad-id">#{u.id}</td>
                            <td className="ad-name-cell">{u.name}</td>
                            <td>{u.email}</td>
                            <td>
                              <span
                                className={`ad-role ad-role-${(
                                  u.role || ""
                                ).toLowerCase()}`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td>{u.phone || "—"}</td>
                            <td>{u.location || "—"}</td>
                            <td>
                              {u.role === "RECIPIENT" ? (
                                <span
                                  className={
                                    u.verified
                                      ? "ad-flag ad-flag-yes"
                                      : "ad-flag ad-flag-no"
                                  }
                                >
                                  <span className="ad-flag-dot" />
                                  {u.verified ? "Verified" : "Pending"}
                                </span>
                              ) : (
                                <span className="ad-not-applicable">—</span>
                              )}
                            </td>
                            <td>
                              {u.role === "RECIPIENT" && !u.verified ? (
                                <button
                                  className="ad-verify-btn"
                                  disabled={busyId === u.id}
                                  onClick={() => handleVerify(u.id)}
                                >
                                  {busyId === u.id ? (
                                    "Saving..."
                                  ) : (
                                    <>
                                      <span>✓</span> Verify
                                    </>
                                  )}
                                </button>
                              ) : (
                                <span className="ad-not-applicable">—</span>
                              )}
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr>
                            <td colSpan="8" className="ad-table-empty">
                              No users found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {tab === "donations" && (
                    <table className="ad-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Food</th>
                          <th>Quantity</th>
                          <th>Pickup</th>
                          <th>Expiry</th>
                          <th>Status</th>
                          <th>Donor</th>
                          <th>Recipient</th>
                          <th>Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {donations.map((d) => {
                          const status = displayStatus(d);
                          return (
                            <tr key={d.id}>
                              <td className="ad-id">#{d.id}</td>
                              <td className="ad-name-cell">{d.foodType}</td>
                              <td>{d.quantity} kg</td>
                              <td>{d.pickupLocation}</td>
                              <td>{d.expiryDate}</td>
                              <td>
                                <span
                                  className={`hs-badge hs-${status.toLowerCase()}`}
                                >
                                  {status}
                                </span>
                              </td>
                              <td>#{d.donorId}</td>
                              <td>{d.recipientId ? `#${d.recipientId}` : "—"}</td>
                              <td>{formatDate(d.createdAt)}</td>
                            </tr>
                          );
                        })}
                        {donations.length === 0 && (
                          <tr>
                            <td colSpan="9" className="ad-table-empty">
                              No donations found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}

                  {tab === "predictions" && (
                    <table className="ad-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Food Record</th>
                          <th>Predicted Consumption</th>
                          <th>Predicted Surplus</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {predictions.map((p) => (
                          <tr key={p.id}>
                            <td className="ad-id">#{p.id}</td>
                            <td>#{p.foodRecordId}</td>
                            <td>{Number(p.predictedConsumption).toFixed(1)}</td>
                            <td>{Number(p.predictedSurplus).toFixed(1)}</td>
                            <td>{formatDate(p.predictionDate)}</td>
                          </tr>
                        ))}
                        {predictions.length === 0 && (
                          <tr>
                            <td colSpan="5" className="ad-table-empty">
                              No predictions found.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </section>

        <footer className="ad-footer">
          <span>FoodWasteAI</span>
          <span>Building a greener future, one donation at a time.</span>
        </footer>
      </main>
    </div>
  );
}

export default AdminPanel;