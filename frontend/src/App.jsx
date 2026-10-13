import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import FoodPrediction from "./pages/FoodPrediction";
import Donations from "./pages/Donations";
import Dashboard from "./pages/Dashboard";
import MyDonations from "./pages/MyDonations";
import AdminPanel from "./pages/AdminPanel";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "./styles/auth.css";
import "./styles/layout.css";

function NavBar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navClass = ({ isActive }) =>
    `fw-nav-link${isActive ? " fw-nav-active" : ""}`;

  return (
    <header className="fw-header">
      <nav className="fw-navbar">
        <Link to="/" className="fw-brand">
          <span className="fw-brand-icon">✿</span>
          <span className="fw-brand-text">
            <strong>FoodWasteAI</strong>
            <small>Save food. Share hope.</small>
          </span>
        </Link>

        <div className="fw-nav-links">
          <NavLink to="/" end className={navClass}>
            Home
          </NavLink>

          {user && (
            <NavLink to="/dashboard" className={navClass}>
              Dashboard
            </NavLink>
          )}

          {user &&
            (user.role === "DONOR" || user.role === "ADMIN") && (
              <NavLink to="/predict" className={navClass}>
                Food Prediction
              </NavLink>
            )}

          {user && (
            <NavLink to="/donations" className={navClass}>
              Donations
            </NavLink>
          )}

          {user &&
            (user.role === "DONOR" || user.role === "RECIPIENT") && (
              <NavLink to="/my-donations" className={navClass}>
                {user.role === "DONOR" ? "My Donations" : "My Claims"}
              </NavLink>
            )}

          {user && user.role === "ADMIN" && (
            <NavLink to="/admin" className={navClass}>
              Admin
            </NavLink>
          )}
        </div>

        <div className="fw-nav-account">
          {user ? (
            <>
              <div className="fw-user-info">
                <span className="fw-user-avatar">
                  {(user.name || "U").charAt(0).toUpperCase()}
                </span>
                <span className="fw-user-text">
                  <strong>{user.name}</strong>
                  <small>{user.role}</small>
                </span>
              </div>

              <button className="fw-logout-btn" onClick={handleLogout}>
                Logout ↗
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className={`fw-login-link${
                  location.pathname === "/login" ? " fw-login-current" : ""
                }`}
              >
                Login
              </Link>
              <Link to="/register" className="fw-register-btn">
                Get Started <span>→</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function Home() {
  const { user } = useAuth();

  return (
    <main className="fw-home">
      <section className="fw-hero">
        <div className="fw-hero-content">
          <div className="fw-pill">
            <span className="fw-pill-dot" />
            TECHNOLOGY FOR A GREENER TOMORROW
          </div>

          <h1>
            Good food deserves
            <br />
            <span>a second chance.</span>
          </h1>

          <p className="fw-hero-description">
            Predict food surplus with AI, connect surplus food with people
            who need it, and turn everyday actions into a meaningful
            difference.
          </p>

          <div className="fw-hero-actions">
            {user ? (
              <>
                <Link to="/dashboard" className="fw-primary-btn">
                  Go to Dashboard <span>→</span>
                </Link>
                <Link to="/donations" className="fw-secondary-btn">
                  Explore Donations
                </Link>
              </>
            ) : (
              <>
                <Link to="/register" className="fw-primary-btn">
                  Get Started <span>→</span>
                </Link>
                <Link to="/login" className="fw-secondary-btn">
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="fw-hero-note">
            <span>✓</span> Reduce waste
            <span className="fw-note-divider">·</span>
            <span>✓</span> Share surplus
            <span className="fw-note-divider">·</span>
            <span>✓</span> Make an impact
          </div>
        </div>

        <div className="fw-hero-visual" aria-hidden="true">
          <div className="fw-visual-orbit fw-orbit-one" />
          <div className="fw-visual-orbit fw-orbit-two" />

          <div className="fw-visual-card">
            <div className="fw-visual-label">
              <span className="fw-visual-status" />
              SMARTER FOOD MANAGEMENT
            </div>

            <div className="fw-plate">
              <span>🥗</span>
            </div>

            <div className="fw-visual-message">
              <strong>Every meal matters.</strong>
              <span>Predict. Donate. Make a difference.</span>
            </div>

            <div className="fw-visual-bottom">
              <span>AI-powered insights</span>
              <span>✳</span>
            </div>
          </div>

          <div className="fw-float-card fw-float-top">
            <span className="fw-float-icon">♻</span>
            <span>
              <strong>Waste less</strong>
              <small>Live sustainably</small>
            </span>
          </div>

          <div className="fw-float-card fw-float-bottom">
            <span className="fw-float-icon">♡</span>
            <span>
              <strong>Share more</strong>
              <small>Help your community</small>
            </span>
          </div>

          <span className="fw-deco-leaf fw-leaf-one">✿</span>
          <span className="fw-deco-leaf fw-leaf-two">✦</span>
        </div>
      </section>

      <section className="fw-features">
        <div className="fw-section-heading">
          <span>WHAT WE DO</span>
          <h2>Small actions. Lasting impact.</h2>
          <p>
            Bringing technology and people together to make food sharing
            smarter.
          </p>
        </div>

        <div className="fw-feature-grid">
          <article className="fw-feature-card">
            <div className="fw-feature-icon fw-feature-green">✧</div>
            <span className="fw-feature-number">01 / PREDICT</span>
            <h3>Predict with AI</h3>
            <p>
              Estimate food consumption and potential surplus to make
              better-informed decisions.
            </p>
            {user &&
              (user.role === "DONOR" || user.role === "ADMIN") && (
                <Link to="/predict" className="fw-feature-link">
                  Explore prediction <span>→</span>
                </Link>
              )}
          </article>

          <article className="fw-feature-card">
            <div className="fw-feature-icon fw-feature-orange">↗</div>
            <span className="fw-feature-number">02 / CONNECT</span>
            <h3>Share surplus food</h3>
            <p>
              Help connect available food donations with recipient
              organizations in your community.
            </p>
            {user && (
              <Link to="/donations" className="fw-feature-link">
                Explore donations <span>→</span>
              </Link>
            )}
          </article>

          <article className="fw-feature-card">
            <div className="fw-feature-icon fw-feature-purple">♡</div>
            <span className="fw-feature-number">03 / CONTRIBUTE</span>
            <h3>Make a difference</h3>
            <p>
              Turn surplus food into an opportunity to support people and
              reduce avoidable waste.
            </p>
            {user && (
              <Link to="/dashboard" className="fw-feature-link">
                View dashboard <span>→</span>
              </Link>
            )}
          </article>
        </div>
      </section>

      <section className="fw-bottom-banner">
        <div>
          <span>BETTER FOOD FUTURES START HERE</span>
          <h2>Let's make every meal count.</h2>
          <p>Join a smarter, more sustainable food-sharing community.</p>
        </div>

        <Link
          to={user ? "/donations" : "/register"}
          className="fw-banner-btn"
        >
          {user ? "Explore Donations" : "Join the Community"} <span>→</span>
        </Link>
      </section>

      <footer className="fw-footer">
        <Link to="/" className="fw-footer-brand">
          ✿ FoodWasteAI
        </Link>
        <span>Powered by AI. Driven by purpose.</span>
        <span>Building a greener tomorrow.</span>
      </footer>
    </main>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/predict"
            element={
              <ProtectedRoute roles={["DONOR", "ADMIN"]}>
                <FoodPrediction />
              </ProtectedRoute>
            }
          />

          <Route
            path="/donations"
            element={
              <ProtectedRoute>
                <Donations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-donations"
            element={
              <ProtectedRoute roles={["DONOR", "RECIPIENT"]}>
                <MyDonations />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;