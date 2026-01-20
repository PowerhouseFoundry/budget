// src/components/MonthEndSummary.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import ScoreAvatar from "./ScoreAvatar";
import "./MonthEndSummary.css";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function MonthEndSummary({
  items = [],
  startAmount = 0,
  currentMonthIndex = 0,
  onDone,
}) {
  const [step, setStep] = useState(0); // 0=intro, 1..len=item, >len=summary
  const [running, setRunning] = useState(startAmount);

  const nextMonthName = MONTHS[(currentMonthIndex + 1) % 12];

  // Precompute totals
  const totals = useMemo(() => {
    let m = 0, h = 0, w = 0;
    items.forEach((x) => {
      m += (x.amount || 0);
      h += (x.h || 0);
      w += (x.w || 0);
    });
    return { m, h, w };
  }, [items]);

  // Get overall state so we can show avatar with end-of-month scores
  const { state } = useOutletContext();

  const endScores = useMemo(() => {
    const baseMoney = state?.money ?? 0;
    const baseHealth = state?.health ?? 70;
    const baseWellbeing = state?.wellbeing ?? 70;
    return {
      money: baseMoney + totals.m,
      health: baseHealth + totals.h,
      wellbeing: baseWellbeing + totals.w,
    };
  }, [state?.money, state?.health, state?.wellbeing, totals.m, totals.h, totals.w]);

  // When step advances, apply that item to running total
  const appliedRef = useRef(0);
  useEffect(() => {
    if (step === 0 || step > items.length) return;

    // prevent double-apply if rerender happens
    if (appliedRef.current === step) return;
    appliedRef.current = step;

    const i = step - 1;
    const it = items[i];
    setRunning((prev) => prev + (it.amount || 0));
  }, [step, items]);

  // Auto-advance every 1s through items, stop on summary
  useEffect(() => {
    if (items.length === 0) return;
    if (step > items.length) return;
    const id = setTimeout(() => setStep((s) => s + 1), 1000);
    return () => clearTimeout(id);
  }, [step, items.length]);

  const showingIndex = Math.min(Math.max(step - 1, -1), items.length - 1);
  const showing = items[showingIndex] || null;

  // Lock background scroll while modal is open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="mes-overlay" role="dialog" aria-modal="true">
      <div className="mes-card wide">
        <div className="mes-title">Month Summary</div>

        {/* Item stage */}
        {step >= 1 && step <= items.length && showing && (
          <div className="mes-stage">
            <div className="mes-art">
              {showing.img ? (
                <img alt="" src={showing.img} />
              ) : (
                <div className="ph">Image</div>
              )}
            </div>

            <div className="mes-info">
              <div className="line main">{showing.label}</div>
              <div className="line">
                Money:{" "}
                <b className={showing.amount < 0 ? "neg" : "pos"}>
                  {showing.amount < 0 ? "-" : "+"}£{Math.abs(showing.amount)}
                </b>
              </div>
              <div className="line">
                Health:{" "}
                <b className={(showing.h || 0) < 0 ? "neg" : "pos"}>
                  {(showing.h || 0) === 0
                    ? "0"
                    : (showing.h || 0) > 0
                    ? "+" + (showing.h || 0)
                    : String(showing.h || 0)}
                </b>
              </div>
              <div className="line">
                Well-being:{" "}
                <b className={(showing.w || 0) < 0 ? "neg" : "pos"}>
                  {(showing.w || 0) === 0
                    ? "0"
                    : (showing.w || 0) > 0
                    ? "+" + (showing.w || 0)
                    : String(showing.w || 0)}
                </b>
              </div>
            </div>
          </div>
        )}

        {/* Summary stage */}
        {step > items.length && (
          <div className="mes-summary-panel">
            <div className="mes-avatarWrap">
              <div className="mes-avatarInner">
                <ScoreAvatar
                  gender={localStorage.getItem("avatar_gender") || "male"}
                  money={endScores.money}
                  health={endScores.health}
                  wellbeing={endScores.wellbeing}
                  size={260} // you can change this now
                />
              </div>
            </div>

            <div className="sum-grid">
              <div className="k">Total money</div>
              <div className={"v " + (totals.m < 0 ? "neg" : "pos")}>
                {totals.m < 0 ? "-" : "+"}£{Math.abs(totals.m)}
              </div>

              <div className="k">Total health</div>
              <div className={"v " + (totals.h < 0 ? "neg" : "pos")}>
                {totals.h === 0 ? "0" : totals.h > 0 ? "+" + totals.h : totals.h}
              </div>

              <div className="k">Total well-being</div>
              <div className={"v " + (totals.w < 0 ? "neg" : "pos")}>
                {totals.w === 0 ? "0" : totals.w > 0 ? "+" + totals.w : totals.w}
              </div>
            </div>

            <div className="mes-total">
              Balance after changes: <b>£{Math.round(running)}</b>
            </div>

            <div className="mes-actions">
              <button className="btn primary" onClick={onDone} type="button">
                Move to {nextMonthName}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
