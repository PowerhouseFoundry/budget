// src/shell/App.jsx — crash-proof; Finish Month works via global event; KPI header intact
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useReducer, useMemo, useEffect } from "react";
import { reducer, initialState } from "../state/store";
import ProgressBar from "../components/ProgressBar";
import { Icon } from "../components/Icon";
import Toast from "../components/Toast";
import "../styles/font-override.css";
import "../styles/header-fullwidth.css";



function monthName(idx) {
  const names = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return names[Math.max(0, Math.min(11, idx | 0))];
}

const fmtGBP = (n) => "£" + Math.round(Number(n || 0)).toLocaleString("en-GB");

// Consider a tab "done" if ANY common selection shape is present.
function tabDone(state, key) {
  if (state?.pendingChoices && state.pendingChoices[key]) return true;
  if (state?.choices && state.choices[key]) return true;
  if (state?.selected && state.selected[key]) return true;

  const guess = {
    housing: state?.housingSelection ?? state?.housingChoiceId,
    food: state?.foodSelection ?? state?.foodChoiceId,
    transport: state?.transportSelection ?? state?.transportChoiceId,
    leisure: state?.leisureSelection ?? state?.leisureChoiceId,
    phone: state?.phonePlan ?? state?.phoneChoiceId,
    broadband: state?.broadbandPlan ?? state?.broadbandChoiceId,
  };
  return Boolean(guess[key]);
}

// Inbox complete check (matches your “read + chosen if needed” rule)
function inboxAllReadForMonth(inbox, month) {
  const all = Array.isArray(inbox) ? inbox : [];
  const msgs = all.filter((m) => typeof m?.month === "number" && m.month === month);

  // If none for this month, treat as complete
  if (msgs.length === 0) return true;

  return msgs.every((m) => {
    const hasChoices = Array.isArray(m?.choices) && m.choices.length > 0;
    const hasOptions = Array.isArray(m?.options) && m.options.length > 0;
    const needsChoice = hasChoices || hasOptions;
    const hasChosen = !needsChoice || !!m.chosenOptionId;
    return !!m.read && hasChosen;
  });
}

// Chat complete check (read + chosen if needed)
function chatAllReadForMonth(chat, month) {
  const all = Array.isArray(chat) ? chat : [];
  const msgs = all.filter((m) =>
    typeof m?.month === "number" ? m.month === month : true
  );

  if (msgs.length === 0) return true;

  return msgs.every((m) => {
    const needsChoice = Array.isArray(m?.options) && m.options.length > 0;
    const hasChoice = !needsChoice || !!m.chosenOptionId;
    return !!m.read && hasChoice;
  });
}

export default function App() {
  const [rawState, dispatch] = useReducer(reducer, initialState);
  const loc = useLocation();
  const navigate = useNavigate();
    const hasLifestyle = !!rawState?.lifestyle;
  const isIntroRoute =
    loc.pathname === "/" ||
    loc.pathname === "/character" ||
    loc.pathname === "/lifestyle";



  const state = useMemo(
    () => ({
      month: Number(rawState?.month ?? 0),
      income: Number(rawState?.income ?? 0),
      money: Number(rawState?.money ?? 0),
      health: Number(rawState?.health ?? 70),
      wellbeing: Number(rawState?.wellbeing ?? 70),
      setupComplete: Boolean(rawState?.setupComplete ?? false),
      pendingChoices: rawState?.pendingChoices ?? {},
      toasts: Array.isArray(rawState?.toasts) ? rawState.toasts : [],
      choices: rawState?.choices ?? {},
      selected: rawState?.selected ?? {},
      inbox: Array.isArray(rawState?.inbox) ? rawState.inbox : [],
      chat: Array.isArray(rawState?.chat) ? rawState.chat : [],
      contracts: rawState?.contracts ?? {},
      flags: rawState?.flags ?? {},
      ...rawState,
    }),
    [rawState]
  );

  // Seed inbox when on /inbox
useEffect(() => {
  const onInbox = loc.pathname.startsWith("/inbox");
  const onPhoneTab =
    loc.pathname.startsWith("/month") && (loc.search || "").includes("tab=chat");

  if (onInbox || onPhoneTab) {
    dispatch({ type: "INBOX_SEED_IF_EMPTY" });
  }
}, [loc.pathname, loc.search]);

  const nav = [
    { to: "/month?tab=summary", icon: "chart", label: "Summary" },
    { to: "/month", icon: "home", label: "Housing & Bills", key: "housing" },
    { to: "/month?tab=food", icon: "food", label: "Food & Shopping", key: "food" },
    { to: "/month?tab=leisure", icon: "leisure", label: "Leisure & Subs", key: "leisure" },
    { to: "/month?tab=transport", icon: "bus", label: "Transport", key: "transport" },
    ...(state.month === 0
      ? [
          { to: "/month?tab=phone", icon: "credit", label: "Phone Plan", key: "phone" },
          { to: "/month?tab=broadband", icon: "credit", label: "Broadband", key: "broadband" },
        ]
      : []),
    { to: "/inbox", icon: "mail", label: "Inbox", key: "inbox" },
    { to: "/month?tab=chat", icon: "mail", label: "Phone", key: "chat" },
  ];

  const isActive = (path) => loc.pathname + (loc.search || "") === path;

  const moneyPct = useMemo(() => {
    if (!state.income) return 0;
    const pct = (state.money / state.income) * 100;
    return Math.max(0, Math.min(100, Math.round(pct)));
  }, [state.money, state.income]);

  const healthVal = Math.round(state.health);
  const wellbeingVal = Math.round(state.wellbeing);
  const moneyDanger = state.money <= 100;
  const healthDanger = healthVal <= 10;
  const wellbeingDanger = wellbeingVal <= 10;

  // ---- Finish Month readiness (ONLY used for styling/disable/flash) ----
  // Month.jsx still enforces the real rules + toasts.
  const finishReady = useMemo(() => {
    const m = state.month;

    // Required tabs for “choices”
    const requiredKeys =
      m === 0
        ? ["housing", "food", "transport", "leisure", "phone", "broadband"]
        : ["food", "transport", "leisure"];

    const choicesOk = requiredKeys.every((k) => {
      if (k === "housing") {
        // housing may be locked into contracts
        return tabDone(state, "housing") || !!state.contracts?.housing;
      }
      if (k === "phone") return tabDone(state, "phone") || !!state.contracts?.phone;
      if (k === "broadband") return tabDone(state, "broadband") || !!state.contracts?.broadband;
      return tabDone(state, k);
    });

    const inboxOk = inboxAllReadForMonth(state.inbox, m);
    const chatOk = chatAllReadForMonth(state.chat, m);

    return !!choicesOk && !!inboxOk && !!chatOk;
  }, [state]);

  // Click handler: fire an event Month.jsx can respond to
const handleFinishClick = (e) => {
  if (e?.preventDefault) e.preventDefault();
  if (e?.stopPropagation) e.stopPropagation();

  // Always route through Month.jsx using finish=1 (reliable)
  navigate("/month?finish=1");

  // Optional: keep event for backward compatibility (safe)
  window.dispatchEvent(new Event("PH_FINISH_MONTH"));
};

  // ✅ Fullscreen intro flow: Start -> Character -> Lifestyle
  if (isIntroRoute) {
    return (
      <main className="content" style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Outlet context={{ state, dispatch }} />
        {(state.toasts ?? []).map((t, i) => (
          <Toast key={i} text={t} onDone={() => {}} />
        ))}
      </main>
    );
  }



  return (
    <div className="app-root">
      <header className="topbar topbar--full">
        <div className="topbar-row">
          {/* LEFT: Month + Finish */}
          <div className="month-left" style={{ flexDirection: "column", alignItems: "flex-start", gap: 10 }}>
            <h1 className="month-title">{monthName(state.month)}</h1>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                className={
                  "topbar-finish-btn" +
                  (finishReady ? " is-ready" : " is-disabled")
                }
                onClick={handleFinishClick}
                disabled={!finishReady}
                aria-disabled={!finishReady}
                title={
                  finishReady
                    ? "Finish the month"
                    : "Complete all tabs, Inbox and Phone first"
                }
              >
                Finish month
              </button>

              <div
                style={{
                  fontSize: 12,
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.88)",
                  letterSpacing: 0.2,
                  whiteSpace: "nowrap",
                }}
              >
                Complete all tabs, then finish
              </div>
            </div>
          </div>

          {/* RIGHT: KPI cluster */}
          <div className="kpi-wrap kpi-wrap--right">
            <div className="kpi">
              <div className="kpi-label white">
                <span className="kpi-icon kpi-icon--money">£</span>
                <span>Money</span>
                {moneyDanger && <span className="kpi-alert" title="Low funds">!</span>}
              </div>
              <ProgressBar value={moneyPct} color={moneyDanger ? "var(--red, #dc2626)" : "var(--green)"} />
              <div className="kpi-value kpi-value--big white" aria-live="polite">
                {fmtGBP(state.money)}
              </div>
            </div>

            <div className="kpi">
              <div className="kpi-label white">
                <span className="kpi-icon kpi-icon--health">❤️</span>
                <span>Health</span>
                {healthDanger && <span className="kpi-alert" title="Very low health">!</span>}
              </div>
              <ProgressBar value={healthVal} color={healthDanger ? "var(--red, #dc2626)" : "var(--blue)"} />
              <div className="kpi-value kpi-value--big white" aria-live="polite">
                {healthVal}%
              </div>
            </div>

            <div className="kpi">
              <div className="kpi-label white">
                <span className="kpi-icon kpi-icon--wellbeing">😊</span>
                <span>Well-being</span>
                {wellbeingDanger && <span className="kpi-alert" title="Very low well-being">!</span>}
              </div>
              <ProgressBar value={wellbeingVal} color={wellbeingDanger ? "var(--red, #dc2626)" : "var(--amber)"} />
              <div className="kpi-value kpi-value--big white" aria-live="polite">
                {wellbeingVal}%
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="app-shell">
        <aside className="sidebar">
          {(nav ?? []).map((n) => {
            const active = isActive(n.to);
            const requiredKeys =
              state.month === 0
                ? ["housing", "food", "transport", "leisure", "phone", "broadband"]
                : ["food", "transport", "leisure"];

            const needs = n.key ? requiredKeys.includes(n.key) && !tabDone(state, n.key) : false;

            return (
              <Link key={n.to} to={n.to} className={"item" + (active ? " active" : "")}>
                <Icon name={n.icon} />
                <span>{n.label}</span>
                {n.key && needs && (
                  <span
                    title="Not completed"
                    style={{
                      marginLeft: "auto",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 18,
                      height: 18,
                      borderRadius: "50%",
                      background: "#fef3c7",
                      color: "#b45309",
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    !
                  </span>
                )}
              </Link>
            );
          })}
        </aside>

        <main className="content">
          <Outlet context={{ state, dispatch }} />
        </main>
      </div>

      {(state.toasts ?? []).map((t, i) => (
        <Toast key={i} text={t} onDone={() => {}} />
      ))}
    </div>
  );
}
