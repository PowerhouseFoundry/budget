// src/routes/Inbox.jsx
import { useMemo, useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import "../styles/inbox.css";
import JSAForm from "../components/JSAForm";
import UCForm from "../components/UCForm";
 import InterviewOutfitModal from "../components/InterviewOutfitModal";
import JobBoardModal from "../components/JobBoardModal";



// Stop parent clicks / navigation swallowing button clicks
const safeClick = (fn) => (e) => {
  if (e && typeof e.preventDefault === "function") e.preventDefault();
  if (e && typeof e.stopPropagation === "function") e.stopPropagation();
  if (typeof fn === "function") fn(e);
};

// Safely read messages from state
function readMessages(state) {
  if (!state) return [];
  if (Array.isArray(state.inbox)) return state.inbox;
  if (state.messages && Array.isArray(state.messages.inbox)) {
    return state.messages.inbox;
  }
  if (state.messages && Array.isArray(state.messages)) {
    return state.messages;
  }
  return [];
}

// Seed a welcome email in Month 1 if nothing else exists
function seeded(list, month) {
  if (list.length > 0) return list;
  const m = month ?? 0;

  if (m === 0) {
    return [
      {
        id: "seed-welcome-m1",
        subject: "Welcome to your budget challenge",
        from: "Powerhouse Coach",
        category: "general",
        preview:
          "Keep your money, health and well-being in balance by making good choices each month.",
        body: [
          "Hi,",
          "Welcome to Month 1 of your budget challenge.",
          "Your goal is to keep three things in balance: money, health and well-being.",
          "Each month you will choose things like where you live, how you travel, what you eat and how you relax.",
          "Watch the bars at the top of the screen. Try not to let any of them drop too low for too long.",
          "Start by reading all of your messages here, then work through each section on the left: bills, food, transport and leisure.",
          "There is not always a perfect choice. Some options save money but might affect your health or well-being. Think about what matters most to you.",
          "Good luck,",
          "Powerhouse Coach",
        ],
      },
    ];
  }

  return [];
}

// Build impact text (stacked lines) from an option
function buildImpactText(opt) {
  if (!opt) return "";
  if (opt.impact) return opt.impact;

  const eff = opt.effects || {};
  const bits = [];

  if (typeof eff.money === "number" && eff.money !== 0) {
    const sign = eff.money > 0 ? "+" : "-";
    const symbol = eff.money > 0 ? "💰" : "🔻";
    bits.push(`${symbol} Money <b>${sign}£${Math.abs(eff.money)}</b>`);
  }
  if (typeof eff.health === "number" && eff.health !== 0) {
    const sign = eff.health > 0 ? "+" : "";
    const symbol = eff.health > 0 ? "💚" : "💔";
    bits.push(`${symbol} Health <b>${sign}${eff.health}</b>`);
  }
  if (typeof eff.wellbeing === "number" && eff.wellbeing !== 0) {
    const sign = eff.wellbeing > 0 ? "+" : "";
    const symbol = eff.wellbeing > 0 ? "😊" : "😥";
    bits.push(`${symbol} Well-being <b>${sign}${eff.wellbeing}</b>`);
  }

  if (!bits.length) return "";
  return bits.join("<br/>");
}

// Basic button style – colour / highlight handled by CSS + chosen state
function getChoiceButtonStyle() {
  return {
    borderRadius: "10px",
    padding: "10px 12px",
    marginBottom: "8px",
    border: "2px solid #d0d7de",
    backgroundColor: "#ffffff",
    cursor: "pointer",
    textAlign: "left",
    width: "100%",
    fontSize: "0.95rem",
    display: "block",
  };
}

export default function Inbox() {
  const ctx = useOutletContext() || {};
  const state = ctx.state || {};
  const dispatch = ctx.dispatch || (() => {});
  const flags = state.flags || {};

  const listRaw = readMessages(state);
  const currentMonth = state.month ?? 0;

  // Only show messages for the current month
  const messagesThisMonth = useMemo(
    () =>
      (listRaw || []).filter((m) =>
        typeof m.month === "number" ? m.month === currentMonth : true
      ),
    [listRaw, currentMonth]
  );

  const list = useMemo(
    () => seeded(messagesThisMonth, currentMonth),
    [messagesThisMonth, currentMonth]
  );

  const [selectedId, setSelectedId] = useState(list[0]?.id ?? null);
  const selected = useMemo(
    () => list.find((m) => m.id === selectedId) || null,
    [list, selectedId]
  );

  useEffect(() => {
    if (list.length > 0 && (!selected || list.every((m) => m.id !== selectedId))) {
      setSelectedId(list[0].id);
    }
  }, [list, selected, selectedId]);

  // ✅ NEW: local override to force-open forms when the learner clicks the "Open form" option
  const [forcedForm, setForcedForm] = useState(null); // "jsa" | "uc" | null

  // ✅ NEW: test button to open outfit builder without playing through
  const [testOutfitOpen, setTestOutfitOpen] = useState(false);
  const [testJobBoardOpen, setTestJobBoardOpen] = useState(false);
    // ✅ NEW: show "FORM SENT" screen inside the popup after submission
  const [jsaSent, setJsaSent] = useState(false);
  const [ucSent, setUcSent] = useState(false);



  // When you change email, stop forcing a form open
  useEffect(() => {
    setForcedForm(null);
    setJsaSent(false);
    setUcSent(false);
  }, [selectedId]);



// ✅ Keep the modal open even after submission so we can show the confirmation page
const showJsaForm = forcedForm === "jsa";



  const handleJsaSubmit = (result) => {
    try {
      dispatch({
        type: "JSA_FORM_SUBMITTED",
        payload: {
          quality: result?.quality,
        },
      });

      // Mark THIS message as "completed" (so Finish Month can work)
      if (selected?.id) {
        dispatch({
          type: "INBOX_OPTION_SELECTED",
          id: selected.id,
          option: { id: "form-completed", effects: {} },
        });
      }

      // ✅ After submit, show "FORM SENT" screen (do not auto-close)
      setJsaSent(true);

    } catch (e) {
      console.error("JSA_FORM_SUBMITTED failed", e);
    }
  };

// ✅ Only open the UC popup when the learner clicks the "Open form" option
const showUcForm = forcedForm === "uc";



  const handleUcSubmit = (result) => {
    try {
      // 1) Save UC submission data in your store (whatever your reducer already expects)
      dispatch({
        type: "UC_FORM_SUBMITTED",
        payload: {
          values: result?.values,
          award: result?.award,
        },
      });

      // 2) Mark the CURRENT message as complete + close the UC form flag
      //    This is the bit that stops Finish Month bouncing you back.
      if (selected?.id) {
        dispatch({
          type: "INBOX_OPTION_SELECTED",
          id: selected.id,
          option: {
            id: "uc-form-sent",
            effects: {},
            flags: {
              uc_form_open: false,       // ✅ closes the form
              uc_form_submitted: true,   // ✅ prevents re-opening
            },
          },
        });

        // Also make sure it is definitely marked read
        dispatch({ type: "INBOX_MARK_READ", id: selected.id });
      }

      // ✅ After submit, show "FORM SENT" screen (do not auto-close)
      setUcSent(true);

    } catch (e) {
      console.error("UC_FORM_SUBMITTED failed", e);
    }
  };

  const showInterviewOutfit =
    !!state?.flags?.interview_outfit_open; // scenario flag check

  const handleInterviewOutfitConfirm = ({ outfit, totalCost, score }) => {
    try {
      dispatch({
        type: "INTERVIEW_OUTFIT_CONFIRMED",
        payload: { outfit, totalCost, score },
      });
    } catch {}
  };

  const toggleReadStatus = () => {
    if (!selected || !dispatch) return;
    if (!selected.read) {
      dispatch({ type: "INBOX_MARK_READ", id: selected.id });
    }
  };

  const onSelect = (id) => {
    setSelectedId(id);
    const msg = list.find((m) => m.id === id);
    if (msg && !msg.read) {
      dispatch({ type: "INBOX_MARK_READ", id });
    }
  };

  const buttonStyle = getChoiceButtonStyle();

  const modalOpen = !!testOutfitOpen || !!showInterviewOutfit;
  const modalGender = localStorage.getItem("avatar_gender") || "male";
  // ✅ GOV.UK-style confirmation screen shown after form submit
  const GovUkConfirmation = ({ title, reference, lines, onClose }) => (
    <div style={{ maxWidth: 760, margin: "0 auto" }}>
      {/* Green confirmation panel */}
      <div
        style={{
          background: "#00703c",
          color: "#fff",
          padding: "22px 18px",
          borderRadius: 12,
        }}
      >
        <div style={{ fontSize: "1.9rem", fontWeight: 950, lineHeight: 1.15 }}>
          {title}
        </div>
        <div style={{ marginTop: 10, fontSize: "1.1rem" }}>
          Your reference number
        </div>
        <div style={{ fontSize: "1.6rem", fontWeight: 950, letterSpacing: 1 }}>
          {reference}
        </div>
      </div>

      {/* White body */}
      <div style={{ padding: "18px 4px" }}>
        <h3 style={{ fontSize: "1.25rem", fontWeight: 900, marginTop: 10 }}>
          What happens next
        </h3>

        <ul style={{ marginTop: 10, fontSize: "1.05rem", lineHeight: 1.6 }}>
          {(lines || []).map((t, idx) => (
            <li key={idx}>{t}</li>
          ))}
        </ul>

        <div style={{ marginTop: 18 }}>
          <button
            type="button"
            className="btn primary"
            onClick={onClose}
            style={{
              width: "100%",
              maxWidth: 340,
              fontSize: "1.05rem",
              padding: "12px 14px",
            }}
          >
            Close this window
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="inbox-root">
      <section
        className="inbox-layout"
        aria-label="Inbox"
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          gap: "1.5rem",
          width: "100%",
        }}
      >
        {/* LEFT: message list */}
        <aside
          className="inbox-list"
          style={{
            flex: "0 0 22%",
            minWidth: 0,
          }}
        >
          <div className="inbox-list-hd">Inbox</div>

          {list.length === 0 ? (
            <div className="inbox-empty">
              No messages yet. Check back next month.
            </div>
          ) : (
            <ul className="inbox-ul" role="list">
              {list.map((m) => (
                <li
                  key={m.id}
                  className={
                    "inbox-item" +
                    (m.id === selectedId ? " is-active" : "") +
                    (m.read ? " is-read" : " is-unread")
                  }
                  onClick={() => onSelect(m.id)}
                >
                  <div
                    className={"pill " + (m.category || "general")}
                    aria-hidden
                  />
                  <div className="item-main">
                    <div className="item-row">
                      <div
                        className="item-subject"
                        style={{ fontWeight: m.read ? 500 : 700 }}
                      >
                        {!m.read && (
                          <span className="unread-dot" aria-hidden>
                            •
                          </span>
                        )}
                        {m.subject || "(no subject)"}
                      </div>
                      {m.date && <div className="item-date">{m.date}</div>}
                    </div>
                    <div className="item-row meta">
                      <div className="item-from">{m.from || "System"}</div>
                    </div>
                    {m.preview && (
                      <div className="item-preview">{m.preview}</div>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </aside>

        {/* RIGHT: reading pane */}
        <section
          className="inbox-read"
          style={{
            flex: "1 1 0",
            minWidth: 0,
          }}
        >
 


          {!selected ? (
            <div className="read-empty">Select a message on the left.</div>
          ) : (
            <article className="mail">
              <header className="mail-hd">
                <h2 className="mail-subject">
                  {selected.subject || "(no subject)"}
                </h2>

                <div className="mail-meta">
                  <span className="from">{selected.from || "System"}</span>
                  {selected.date && <span className="date">{selected.date}</span>}

                  <button
                    className={
                      "mark-as-read-toggle " +
                      (selected.read ? "is-read" : "is-unread")
                    }
                    aria-label={
                      selected.read ? "Mark as unread" : "Mark as read"
                    }
                    onClick={toggleReadStatus}
                    key={selected.id + (selected.read ? "r" : "u")}
                    type="button"
                  >
                    {selected.read ? "✅ Read" : "Mark as Read"}
                  </button>
                </div>
              </header>

              <div className="mail-body">
                {/* Body text */}
                {Array.isArray(selected.body) && selected.body.length > 0 ? (
                  selected.body.map((p, i) => (
                    <p
                      key={i}
                      className="mail-paragraph"
                      dangerouslySetInnerHTML={{ __html: p }}
                    />
                  ))
                ) : (
                  <>
                    <p className="mail-paragraph">Hi,</p>
                    <p className="mail-paragraph">
                      {selected.preview || "Here is an update for this month."}
                    </p>
                    <p className="mail-paragraph">Thanks,</p>
                    <p className="mail-paragraph">Powerhouse Team</p>
                  </>
                )}

                {/* Options / choices */}
                {(() => {
                  const rawOptions =
                    Array.isArray(selected?.options) && selected.options.length > 0
                      ? selected.options
                      : Array.isArray(selected?.choices) &&
                        selected.choices.length > 0
                      ? selected.choices
                      : null;

                  if (!rawOptions) return null;

                  return (
                    <div className="mail-options">
                      {rawOptions.map((opt, i) => {
                        // ✅ Normalise option so it always has an id
                        const norm =
                          typeof opt === "string"
                            ? { id: `choice-${i + 1}`, label: opt, effects: {} }
                            : { ...opt, id: opt?.id || `choice-${i + 1}` };

                        const mainLabel = norm.label || norm.title || "Choose";
                        const impactText = buildImpactText(norm);

                        const isChosen =
                          String(selected?.chosenOptionId || "") ===
                          String(norm.id);

                        // ✅ BLUE highlight (matches other choice boxes)
                        const chosenStyle = isChosen
                          ? {
                              border: "3px solid #1d70b8",
                              background: "#e8f1fb",
                              boxShadow:
                                "0 0 0 4px rgba(29,112,184,0.18)",
                            }
                          : {
                              border: "2px solid #d0d7de",
                              background: "#ffffff",
                            };

                        const handleOptionClick = safeClick(() => {
                          // ✅ Force open forms immediately when the learner clicks the correct option
                 const nextType = norm?.next?.type;

// ✅ Normal triggers (preferred)
if (nextType === "jsa_form") setForcedForm("jsa");
if (nextType === "uc_form") setForcedForm("uc");
if (norm?.flags?.jsa_form_open) setForcedForm("jsa");
if (norm?.flags?.uc_form_open) setForcedForm("uc");

// ✅ Fallback: "try again" buttons on decision emails (if scenario option has no next/flags)
const msgId = String(selected?.id || "");
const optId = String(norm?.id || "").toLowerCase();
const optLabel = String(norm?.label || norm?.title || "").toLowerCase();

const looksLikeRetry =
  optId.includes("reapply") ||
  optId.includes("retry") ||
  optId.includes("again") ||
  optLabel.includes("again") ||
  optLabel.includes("re-apply") ||
  optLabel.includes("reapply") ||
  optLabel.includes("try again") ||
  optLabel.includes("fill") && optLabel.includes("again");

if (looksLikeRetry) {
  // If it's a JSA-related message, open JSA form
  if (msgId.includes("jsa")) setForcedForm("jsa");

  // If it's a UC-related message, open UC form
  if (msgId.includes("uc")) setForcedForm("uc");

  // Also support your known UC invite id
  if (msgId === "benefits-uc-housing-invite") setForcedForm("uc");
  if (msgId === "benefits-jsa-application" || msgId === "benefits_jsa_application") setForcedForm("jsa");
}

                          try {
                            dispatch({
                              type: "INBOX_OPTION_SELECTED",
                              id: selected.id,
                              option: norm,
                            });
                          } catch {
                            // ignore if reducer not wired yet
                          }
                        });

                        return (
                          <button
                            key={norm.id}
                            className={
                              "option-btn" + (isChosen ? " is-chosen" : "")
                            }
                            style={{ ...buttonStyle, ...chosenStyle }}
                            aria-pressed={isChosen}
                            onClick={handleOptionClick}
                            type="button"
                          >
                            <span
                              style={{
                                display: "block",
                                fontWeight: 800,
                                marginBottom: impactText ? 4 : 0,
                                color: "#111111",
                              }}
                            >
                              {mainLabel}
                            </span>

                            {impactText && (
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "1.05rem",
                                  opacity: 0.95,
                                  marginTop: "6px",
                                  lineHeight: 1.25,
                                  color: "#333333",
                                }}
                                dangerouslySetInnerHTML={{ __html: impactText }}
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}

                           {/* Forms are now shown in a POPUP (modal) instead of inside the email */}
                {(() => {
                  const active = showJsaForm ? "jsa" : showUcForm ? "uc" : null;
                  if (!active) return null;

                  const onClose = () => {
                    setForcedForm(null);
                    setJsaSent(false);
                    setUcSent(false);
                  };

                  return (
                    <div
                      role="dialog"
                      aria-modal="true"
                      style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.55)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 3000,
                        padding: 16,
                      }}
                    >
                      <div
                        style={{
                          width: "min(900px, 96vw)",
                          maxHeight: "88vh",
                          background: "#ffffff",
                          borderRadius: 18,
                          overflow: "hidden",
                          boxShadow: "0 24px 80px rgba(0,0,0,0.35)",
                          border: "1px solid rgba(15,23,42,0.12)",
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        {/* Header */}
                        <div
                          style={{
                            position: "relative",
                            padding: "14px 16px",
                            borderBottom: "1px solid rgba(15,23,42,0.10)",
                            background: "rgba(248,250,252,0.95)",
                          }}
                        >
                          <div style={{ fontWeight: 950, fontSize: "1.25rem" }}>
                            {active === "jsa"
                              ? "Jobseeker’s Allowance (JSA) form"
                              : "Universal Credit (UC) form"}
                          </div>

                          {/* BIG red close X */}
                          <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            style={{
                              position: "absolute",
                              top: 10,
                              right: 12,
                              width: 48,
                              height: 48,
                              borderRadius: 14,
                              border: "2px solid rgba(220,38,38,0.35)",
                              background: "rgba(220,38,38,0.10)",
                              color: "#dc2626",
                              fontSize: 30,
                              fontWeight: 900,
                              cursor: "pointer",
                              display: "grid",
                              placeItems: "center",
                            }}
                          >
                            ×
                          </button>
                        </div>

                        {/* Scrollable body */}
                        <div
                          style={{
                            padding: 16,
                            overflow: "auto",
                            WebkitOverflowScrolling: "touch",
                          }}
                        >
                          {active === "jsa" ? (
                  jsaSent ? (
  <GovUkConfirmation
    title="Application sent"
    reference={`JSA-${String(state.month ?? 0).padStart(2, "0")}-${(selected?.id || "OK").slice(0, 4).toUpperCase()}`}
    lines={[
      "We’ve received your Jobseeker’s Allowance (JSA) application.",
      "You may be contacted if more information is needed.",
      "You’ll get a decision message in your inbox soon.",
    ]}
    onClose={onClose}
  />
) : (
  <JSAForm onSubmit={handleJsaSubmit} />
)

) : ucSent ? (
  <GovUkConfirmation
    title="Form sent"
    reference={`UC-${String(state.month ?? 0).padStart(2, "0")}-${(selected?.id || "OK").slice(0, 4).toUpperCase()}`}
    lines={[
      "We’ve received your Universal Credit housing support form.",
      "We’ll check the amounts against your bills.",
      "You’ll get a decision message in your inbox next month.",
    ]}
    onClose={onClose}
  />
) : (
  <UCForm onSubmit={handleUcSubmit} />
)}


                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            </article>
          )}
<JobBoardModal
  open={!!testJobBoardOpen || !!flags?.job_board_open}
  lifestyle={state.lifestyle || localStorage.getItem("lifestyle")}
  onClose={() => {
    setTestJobBoardOpen(false);
    try {
      // close persisted flag too
      dispatch({ type: "MERGE_FLAGS", flags: { job_board_open: false } });
    } catch {}
  }}
  onApply={(job) => {
    try {
      dispatch({
        type: "MERGE_FLAGS",
        flags: {
          job_board_open: false,
          job_application_active: true,
          job_applied_month: Number(state.month ?? 0),
          job_applied_id: job.jobId,
          job_applied_title: job.title,
          job_applied_company: job.company,
          job_applied_pay_per_hour: job.payPerHour,
          job_applied_hours_per_week: job.hoursPerWeek,
          job_applied_monthly_pay: job.monthlyPay,
        },
      });
      setTestJobBoardOpen(false);
    } catch {}
  }}
/>

          {/* ✅ Interview outfit modal (works from scenario flag OR test button) */}
          <InterviewOutfitModal
            open={modalOpen}
            gender={modalGender}
            onClose={() => {
              setTestOutfitOpen(false);
              // If it was opened by a scenario flag, close it too (without needing another reducer case)
              try {
                dispatch({
                  type: "PATCH_STATE",
                  payload: {
                    flags: { ...(state.flags || {}), interview_outfit_open: false },
                  },
                });
              } catch {}
            }}
            onConfirm={({ outfit, totalCost, score }) => {
              handleInterviewOutfitConfirm({ outfit, totalCost, score });
              setTestOutfitOpen(false);
            }}
          />
        </section>
      </section>
    </div>
  );
}
