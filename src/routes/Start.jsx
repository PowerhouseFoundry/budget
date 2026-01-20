// src/routes/Start.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Start.css";

export default function Start() {
  const navigate = useNavigate();
  const [showHowTo, setShowHowTo] = useState(false);

  const resetGame = () => {
    try {
      localStorage.setItem("month", "0");
      localStorage.removeItem("contracts");
      localStorage.removeItem("readMessageIds");
      localStorage.removeItem("food_extras");
      localStorage.removeItem("leis_upgrades");
      Object.keys(localStorage).forEach((k) => {
        if (k.startsWith("leis_activities_m")) localStorage.removeItem(k);
      });
    } catch (e) {}
  };

  const startGame = () => {
    resetGame();
    navigate("/character");
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowHowTo(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="start-screen">
      {/* The artwork scales to fit the screen without cropping */}
      <div className="start-stage">
        <img
          className="start-art"
          src="/images/start-screen.png"
          alt="Budgeting Challenge start screen"
          draggable="false"
        />

        {/* Click targets overlayed in the exact button area */}
        <button type="button" className="hit hit-start" onClick={startGame}>
          <span className="sr-only">Start Challenge</span>
        </button>

        <button
          type="button"
          className="hit hit-howto"
          onClick={() => setShowHowTo(true)}
        >
          <span className="sr-only">How to Play</span>
        </button>
      </div>

      {/* How to play modal */}
      {showHowTo && (
        <div
          className="howto-backdrop"
          role="dialog"
          aria-modal="true"
          aria-label="How to play"
          onMouseDown={() => setShowHowTo(false)}
        >
          <div className="howto-modal" onMouseDown={(e) => e.stopPropagation()}>
            <div className="howto-header">
              <h2>How to Play</h2>
              <button
                type="button"
                className="howto-close"
                onClick={() => setShowHowTo(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <ol className="howto-rules">
              <li>Review your spending and choices each month.</li>
              <li>
                Keep your <strong>Money</strong>, <strong>Health</strong> and{" "}
                <strong>Wellbeing</strong> above zero — don’t let any stay at zero
                for over a month.
              </li>
              <li>Make smart swaps to stay steady and succeed.</li>
            </ol>

            <div className="howto-actions">
              <button type="button" className="howto-primary" onClick={startGame}>
                ▶ Start Challenge
              </button>
              <button
                type="button"
                className="howto-secondary"
                onClick={() => setShowHowTo(false)}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
