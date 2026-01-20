// src/routes/CharacterSelect.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CharacterSelect.css";
import ScoreAvatar from "../components/ScoreAvatar";

export default function CharacterSelect() {
  const navigate = useNavigate();

  const [name, setName] = useState(localStorage.getItem("playerName") || "");
  const [avatarGender, setAvatarGender] = useState(
    localStorage.getItem("avatar_gender") || "male"
  );

  const saveAndContinue = () => {
    const clean = name.trim();
    if (!clean) {
      alert("Please enter your name");
      return;
    }

    localStorage.setItem("playerName", clean);
    localStorage.setItem("player_name", clean);
    localStorage.setItem("avatar_gender", avatarGender);

    navigate("/lifestyle");
  };

  return (
    <div className="cs-screen">
      <div className="cs-stage">
        <div className="cs-card">
          <div className="cs-head">
            <h2 className="cs-title">Choose your character</h2>
            <p className="cs-sub">
              Type your name, then pick a character to start your 12-month challenge.
            </p>
          </div>

          {/* Name input */}
          <div className="cs-form">
            <label htmlFor="playerName" className="cs-label">
              Your name
            </label>
            <input
              id="playerName"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type your name"
              className="cs-input"
            />
          </div>

          {/* Avatar picker */}
          <div className="cs-picker">
            <div className="cs-picker-head">
              <h3 className="cs-picker-title">Pick a character</h3>
              <p className="cs-picker-text">
                Your character reacts to your Money, Health and Wellbeing as you play.
              </p>
            </div>

            <div className="cs-avatars">
              <button
                type="button"
                className={"cs-avatar" + (avatarGender === "male" ? " is-active" : "")}
                onClick={() => setAvatarGender("male")}
              >
                <div className="cs-avatar-glow" aria-hidden="true" />
                <ScoreAvatar gender="male" money={0} health={70} wellbeing={70} size={240} />
                <div className="cs-avatar-label">Character 1</div>
              </button>

              <button
                type="button"
                className={
                  "cs-avatar" + (avatarGender === "female" ? " is-active" : "")
                }
                onClick={() => setAvatarGender("female")}
              >
                <div className="cs-avatar-glow" aria-hidden="true" />
                <ScoreAvatar gender="female" money={0} health={70} wellbeing={70} size={240} />
                <div className="cs-avatar-label">Character 2</div>
              </button>
            </div>
          </div>

          <div className="cs-actions">
            <button type="button" className="cs-continue" onClick={saveAndContinue}>
              <span className="cs-play" aria-hidden="true">▶</span>
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
