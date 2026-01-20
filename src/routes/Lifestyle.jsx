// src/routes/Lifestyle.jsx
import { useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import "./Lifestyle.css";

const OPTIONS = [
  {
    id: "benefits",
    title: "Benefits",
    icon: "🧾",
    desc: "Low income, basic stability. Focus on careful planning and essentials.",
    pay: "£0/mo",
    hours: "—",
    tag: "Careful budget",
  },
  {
    id: "parttime",
    title: "Part-time",
    icon: "🕒",
    desc: "Moderate income with some flexibility. Balance work and life.",
    pay: "£900/mo",
    hours: "≈ 20 hrs/wk",
    tag: "Balance & routine",
  },
  {
    id: "fulltime",
    title: "Full-time",
    icon: "💼",
    desc: "Higher income but more pressure and bills to manage.",
    pay: "£1,400/mo",
    hours: "≈ 37 hrs/wk",
    tag: "Higher pressure",
  },
];

export default function Lifestyle() {
  const navigate = useNavigate();
  const { dispatch } = useOutletContext() || {};
  const [pick, setPick] = useState(localStorage.getItem("lifestyle") || "");

  const confirm = () => {
    if (!pick) {
      alert("Choose one option to continue");
      return;
    }

    localStorage.setItem("lifestyle", pick);
    localStorage.setItem("week", "1");

    // ✅ CRITICAL: sync lifestyle into state AND clear inbox so it reseeds correctly
    if (typeof dispatch === "function") {
      dispatch({
        type: "PATCH_STATE",
        payload: {
          lifestyle: pick,
          inbox: [], // force INBOX_SEED_IF_EMPTY to run with correct lifestyle
        },
      });
    }

    navigate("/inbox");
  };

  const name = localStorage.getItem("playerName") || "Player";

  return (
    <div className="ls-screen">
      <div className="ls-stage">
        <div className="ls-card">
          <div className="ls-head">
            <h2 className="ls-title">Choose your lifestyle</h2>
            <p className="ls-sub">
              Okay <strong>{name}</strong>, pick one to start your year. You can succeed
              with any choice.
            </p>
          </div>

          <div className="ls-grid" role="list">
            {OPTIONS.map((o) => (
              <button
                key={o.id}
                type="button"
                role="listitem"
                className={"ls-option" + (pick === o.id ? " is-active" : "")}
                onClick={() => setPick(o.id)}
              >
                <div className="ls-option-glow" aria-hidden="true" />

                <div className="ls-top">
                  <div className="ls-icon" aria-hidden="true">
                    {o.icon}
                  </div>
                  <div className="ls-toptext">
                    <h3 className="ls-option-title">{o.title}</h3>
                    <div className="ls-tag">{o.tag}</div>
                  </div>
                </div>

                <p className="ls-desc">{o.desc}</p>

                <div className="ls-metrics">
                  <span className="ls-pill">{o.pay}</span>
                  <span className="ls-pill">{o.hours}</span>
                </div>
              </button>
            ))}
          </div>

          <div className="ls-actions">
            <button type="button" className="ls-continue" onClick={confirm}>
              <span className="ls-play" aria-hidden="true">
                ▶
              </span>
              Go to Inbox
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
