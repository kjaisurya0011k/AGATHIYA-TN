import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "./Navbar.css";
import { GraduationCap } from "lucide-react";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.pathname === "/" && location.hash) {
      const id = location.hash.slice(1);

      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }
  }, [location.pathname, location.hash]);

  const scrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate(`/#${id}`);
      return;
    }

    if (id === "home") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  return (
    <nav
      className="navbar"
      style={{ position: "sticky", top: 0, zIndex: 1000 }}
    >
      <Link
        to="/"
        className="navbar-brand-clean"
        onClick={(event) => {
          if (location.pathname === "/") {
            event.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      >
        <span className="brand-badge-square" aria-label="EEE-TN education logo">
          <GraduationCap size={23} strokeWidth={2.2} />
        </span>
        <span className="brand-name-text">EEE-TN</span>
      </Link>

      <div className="desktop-nav-clean">
        <button
          type="button"
          className="navbar-link-btn"
          onClick={() => scrollToSection("home")}
        >
          Home
        </button>

        <button
          type="button"
          className="navbar-link-btn"
          onClick={() => scrollToSection("about")}
        >
          About
        </button>

        <button
          type="button"
          className="navbar-link-btn"
          onClick={() => scrollToSection("career")}
        >
          Career
        </button>

        <button
          type="button"
          className="navbar-link-btn"
          onClick={() => scrollToSection("colleges")}
        >
          Colleges
        </button>
      </div>

      <div className="navbar-actions-clean">
        <div className="nav-auth-buttons">
          <Link to="/login" className="btn-nav-login">
            Login
          </Link>

          <Link to="/register" className="btn-nav-getstarted">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;