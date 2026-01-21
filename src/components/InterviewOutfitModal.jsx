import { useEffect, useMemo, useState } from "react";
import "./InterviewOutfitModal.css";

const SECTIONS = ["tops", "bottoms", "shoes", "jacket"];
const LABELS = { tops: "Tops", bottoms: "Bottoms", shoes: "Shoes", jacket: "Jacket" };

// Original-style pricing (edit these whenever)
const PRICES = {
  tops: [35, 25, 18, 10],
  bottoms: [40, 28, 20, 12],
  shoes: [45, 30, 22, 14],
  jacket: [60, 45, 30, 18],
};

// Scoring (0–100 total)
const SCORES = {
  tops: [30, 22, 14, 6],
  bottoms: [30, 22, 14, 6],
  shoes: [25, 18, 12, 5],
  jacket: [15, 10, 6, 2],
};

const tierFromIndex = (i) => {
  if (i === 1 || i === 5) return 1;
  if (i === 2 || i === 6) return 2;
  if (i === 3 || i === 7) return 3;
  return 4; // 4 or 8
};

const DESCRIPTORS = {
  tops: [
    "Smart shirt / blouse (very interview-ready)",
    "Plain tidy top (good choice)",
    "Casual neat top (ok, but not ideal)",
    "Too casual for an interview",
  ],
  bottoms: [
    "Smart trousers / skirt (very interview-ready)",
    "Plain tidy bottoms (good choice)",
    "Casual neat bottoms (ok, but not ideal)",
    "Too casual for an interview",
  ],
  shoes: [
    "Smart shoes (very interview-ready)",
    "Tidy shoes (good choice)",
    "Casual shoes (ok, but not ideal)",
    "Not suitable for interview",
  ],
  jacket: [
    "Blazer / suit jacket (very interview-ready)",
    "Smart coat (good choice)",
    "Tidy jacket (ok, but not ideal)",
    "Sporty/casual coat (not ideal)",
  ],
};

function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
function normGender(g) {
  const x = String(g || "").toLowerCase();
  if (x.includes("f")) return "female";
  return "male";
}

export default function InterviewOutfitModal({ open, onClose, onConfirm, gender }) {
  const resolvedGender = normGender(
    gender || localStorage.getItem("avatar_gender") || "male"
  );

  // "pick" (first screen) OR a section key
  const [stage, setStage] = useState("pick");

  // browsing index per section (arrows move this; does NOT auto-select)
  const [indexBySection, setIndexBySection] = useState({
    tops: 0,
    bottoms: 0,
    shoes: 0,
    jacket: 0,
  });

  // chosen item per section
  const [chosen, setChosen] = useState({
    tops: null,
    bottoms: null,
    shoes: null,
    jacket: null,
  });

  useEffect(() => {
    if (!open) return;
    setStage("pick");
    setIndexBySection({ tops: 0, bottoms: 0, shoes: 0, jacket: 0 });
    setChosen({ tops: null, bottoms: null, shoes: null, jacket: null });
  }, [open]);

  const itemsFor = (section) => {
    // IMPORTANT: uses "jacket" not "coat"
    const base = `${section}_${resolvedGender}_`;

    // ✅ NOW 1..8 (and 5–8 reuse the same tier as 1–4)
    return [1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
      const tier = tierFromIndex(n);      // 1..4
      const tIdx = tier - 1;              // 0..3 (index into PRICES/SCORES/DESCRIPTORS)

      return {
        id: `${section}_${resolvedGender}_${n}`,
        img: `${import.meta.env.BASE_URL}images/interview/${base}${n}.png`,

        price: PRICES?.[section]?.[tIdx] ?? 0,
        score: SCORES?.[section]?.[tIdx] ?? 0,
        desc: DESCRIPTORS?.[section]?.[tIdx] ?? "Selected item",
      };
    });
  };

  const currentItems = useMemo(() => {
    if (!SECTIONS.includes(stage)) return [];
    return itemsFor(stage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, resolvedGender]);

  const currentIndex = SECTIONS.includes(stage) ? (indexBySection[stage] ?? 0) : 0;
  const currentPreview = currentItems.length ? currentItems[currentIndex] : null;

  const totalCost = useMemo(
    () => SECTIONS.reduce((sum, k) => sum + (chosen[k]?.price || 0), 0),
    [chosen]
  );

  const totalScore = useMemo(() => {
    const raw = SECTIONS.reduce((sum, k) => sum + (chosen[k]?.score || 0), 0);
    return clamp(raw, 0, 100);
  }, [chosen]);

  const allPicked = SECTIONS.every((k) => !!chosen[k]);

const advice = useMemo(() => {
  // If they’ve chosen everything, ALWAYS show overall outfit advice (prevents weird feedback at 100/100)
  if (allPicked) {
    const s = totalScore;

    if (s >= 90) return "Excellent — you look very professional. This outfit gives a strong first impression.";
    if (s >= 80) return "Really good — smart and tidy. You’d look confident walking into an interview like this.";
    if (s >= 70) return "Decent — mostly suitable. A couple of slightly smarter choices would boost your score.";
    if (s >= 60) return "Borderline — parts look interview-ready, but it’s a bit mixed. Try upgrading one or two items.";
    if (s >= 50) return "Not great — too casual overall. Aim for smarter shoes and a more formal top.";
    return "Poor choice for an interview — this looks too casual. Try a smart top, smart bottoms and smart shoes.";
  }

  // First screen
  if (stage === "pick") {
    return "Pick a section to browse. Use the arrows, then click an item to choose it.";
  }

  // Browsing screen
  const picked = chosen[stage];
  if (!picked) return `Browse ${LABELS[stage]}. Click an item to choose it.`;

  // If they’re browsing but have picked this section, give a small “section” nudge only
  // (without contradicting their overall score)
  const ps = picked.score || 0;
  if (ps >= 20) return "Nice pick for this section — interview-ready.";
  if (ps >= 10) return "This works, but you could pick something smarter for a higher score.";
  return "This is quite casual — a smarter choice here will improve your overall score.";
}, [stage, chosen, allPicked, totalScore]);

  const goPrev = () => {
    if (!SECTIONS.includes(stage)) return;
    setIndexBySection((prev) => {
      const len = itemsFor(stage).length || 1;
      const cur = prev[stage] ?? 0;
      return { ...prev, [stage]: (cur - 1 + len) % len };
    });
  };

  const goNext = () => {
    if (!SECTIONS.includes(stage)) return;
    setIndexBySection((prev) => {
      const len = itemsFor(stage).length || 1;
      const cur = prev[stage] ?? 0;
      return { ...prev, [stage]: (cur + 1) % len };
    });
  };

  const chooseCurrent = () => {
    if (!SECTIONS.includes(stage)) return;
    const items = itemsFor(stage);
    const it = items[indexBySection[stage] ?? 0];
    if (!it) return;
    setChosen((prev) => ({ ...prev, [stage]: it }));
  };

  const closeNow = () => {
    if (typeof onClose === "function") onClose();
  };

  const confirmNow = () => {
    const outfit = { ...chosen };
    const payload = { outfit, totalCost, score: totalScore };
    if (typeof onConfirm === "function") onConfirm(payload);
    closeNow();
  };

  if (!open) return null;

  return (
    <div className="iom-overlay" role="dialog" aria-modal="true">
      <div className="iom-shell">
        {/* LEFT: scene popup */}
        <div
          className="iom-scene"
          style={{ backgroundImage: `url(${import.meta.env.BASE_URL}images/interview/background.png)` }}

        >
          {/* First screen: buttons directly on background */}
          {stage === "pick" ? (
            <div className="iom-pickFloating">
              <div className="iom-pickTitle">Pick a section</div>

              <div className="iom-pickStack">
                {SECTIONS.map((s) => (
                  <button
                    key={s}
                    className="iom-pickBtn"
                    type="button"
                    onClick={() => setStage(s)}
                  >
                    {LABELS[s]}
                    {chosen[s] ? <span className="iom-tick">✓</span> : null}
                  </button>
                ))}
              </div>

              <div className="iom-tip">
                Use the buttons to browse. Click an item to choose it. Then confirm when ready.
              </div>
            </div>
          ) : (
            <div className="iom-browserFloating">
              <button className="iom-arrow" type="button" onClick={goPrev}>
                ‹
              </button>

              <div className="iom-previewWrap">
                {currentPreview ? (
                  // IMPORTANT: this uses the new card frame (same for ALL sections)
                  <button
                    type="button"
                    className="iom-cardBtn"
                    onClick={chooseCurrent}
                    aria-label="Select this item"
                  >
                    <div className="iom-cardFrame">
                      <img
                        className="iom-cardImg"
                        src={currentPreview.img}
                        alt=""
                        draggable={false}
                      />
                    </div>

                    <div className="iom-cardPrice">£{currentPreview.price}</div>
                    <div className="iom-cardHint">CLICK TO SELECT</div>
                  </button>
                ) : (
                  <div className="iom-previewEmpty">No items</div>
                )}
              </div>

              <button className="iom-arrow" type="button" onClick={goNext}>
                ›
              </button>

              {/* Bottom nav must ALWAYS be visible while browsing */}
              <div className="iom-bottomNav">
                {SECTIONS.map((s) => {
                  const active = s === stage;
                  const picked = !!chosen[s];
                  return (
                    <button
                      key={s}
                      type="button"
                      className={
                        "iom-navBtn" +
                        (active ? " is-active" : "") +
                        (picked ? " is-picked" : "")
                      }
                      onClick={() => setStage(s)}
                    >
                      {LABELS[s]} {picked ? "✓" : ""}
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="iom-navBtn iom-backBtn"
                  onClick={() => setStage("pick")}
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: HUD (outside scene) */}
        <div className="iom-hud">
          <div className="iom-hudTop">
            <div className="iom-cost">
              Total: <span>£{totalCost}</span>
            </div>

            <div className="iom-scoreWrap">
              <div className="iom-scoreText">{totalScore}/100</div>
              <div className="iom-scoreBar">
                <div
                  className="iom-scoreFill"
                  style={{ width: `${clamp(totalScore, 0, 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="iom-hudRows">
            {SECTIONS.map((s) => {
              const it = chosen[s];
              return (
                <div className="iom-row" key={s}>
                  <div className="iom-rowLabel">{LABELS[s]}</div>
                  <div className="iom-rowBox">
                    <div className="iom-thumb">
                      {it ? (
                        <img src={it.img} alt="" draggable={false} />
                      ) : (
                        <div className="iom-thumbEmpty" />
                      )}
                    </div>

                    <div className="iom-rowMeta">
                      <div className="iom-rowDesc">{it ? it.desc : "Not chosen yet"}</div>
                      <div className="iom-rowPrice">{it ? `£${it.price}` : ""}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="iom-advice">
            <div className="iom-assistant">
              <img
                src={import.meta.env.BASE_URL + "images/interview/shop_assistant.png"}

                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              <div className="iom-assistantFallback" aria-hidden>
                🙂
              </div>
            </div>
            <div className="iom-bubble">{advice}</div>
          </div>

          <div className="iom-actions">
            <button className="iom-btn iom-btnClose" type="button" onClick={closeNow}>
              Close
            </button>
            <button
              className="iom-btn iom-btnConfirm"
              type="button"
              onClick={confirmNow}
              disabled={!allPicked}
              title={!allPicked ? "Pick all items first" : "Confirm outfit"}
            >
              Confirm outfit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
