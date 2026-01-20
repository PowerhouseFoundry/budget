import React, { useEffect, useMemo, useRef, useState } from "react";

export default function WhatsAppPhone({
  messages = [],
  onDraft, // (messageId, optionObj) => dispatch CHAT_DRAFT_OPTION
  onSend, // (messageId, optionId) => dispatch CHAT_SEND_OPTION
  onMarkRead, // (messageId) => dispatch CHAT_MARK_READ
}) {
  const safeMessages = Array.isArray(messages) ? messages : [];

  // Helper: get "natural sentence" reply text (supports replyText OR reply)
  const getReplyText = (opt) => {
    if (!opt) return "";
return opt?.replyText || opt?.reply || opt?.text || opt?.message || opt?.label || "";


  };

  // ---------- NORMALISE INCOMING MESSAGE SHAPE ----------
  // Your scenarios use: from, subject, preview, body:[...], choices:[...]
  // This component expects: contactName, bodyText, options
  const normalized = useMemo(() => {
    return safeMessages.map((m) => {
      const bodyText = Array.isArray(m?.body)
        ? m.body.filter(Boolean).join("\n\n")
        : m?.bodyText || m?.text || "";

      const contactName = m?.contactName || m?.from || m?.sender || m?.name || "Message";

      // ensure options list is always present as `options` for this UI
      const rawOptions = Array.isArray(m?.options)
        ? m.options
        : Array.isArray(m?.choices)
        ? m.choices
        : [];

      // ✅ normalize each option so reply is always available as replyText too
      const options = rawOptions.map((o) => ({
        ...o,
        replyText: o?.replyText || o?.reply || o?.label || o?.text || "",
      }));

      return {
        ...m,
        contactName,
        bodyText,
        options,
      };
    });
  }, [safeMessages]);

  // newest first
  const list = useMemo(() => {
    return [...normalized].sort((a, b) => {
      const ad = Number(a?.dateIndex ?? a?.time ?? 0);
      const bd = Number(b?.dateIndex ?? b?.time ?? 0);
      return bd - ad;
    });
  }, [normalized]);

  const [activeId, setActiveId] = useState(list?.[0]?.id || null);

  // single-phone navigation (list -> chat)
  const [view, setView] = useState("list"); // "list" | "chat"

  // Keep activeId valid if list changes
  useEffect(() => {
    if (!activeId && list.length) setActiveId(list[0].id);
    if (activeId && list.length && !list.some((m) => m.id === activeId)) {
      setActiveId(list[0].id);
    }
  }, [activeId, list]);

  const active = useMemo(() => {
    return list.find((m) => m.id === activeId) || null;
  }, [list, activeId]);

  // mark read when opening a thread
  useEffect(() => {
    if (active?.id && typeof onMarkRead === "function" && view === "chat") {
      onMarkRead(active.id);
    }
  }, [active?.id, onMarkRead, view]);

  const scrollRef = useRef(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.id, active?.draftOptionId, active?.chosenOptionId, active?.sentReply, view]);

  // Identify scam threads (so we can hide wellbeing effects on choices)
  const isScamThread = useMemo(() => {
    const id = String(active?.id || "");
    const cat = String(active?.category || "");
    return /scam/i.test(id) || /scam/i.test(cat);
  }, [active?.id, active?.category]);

  // Helpers (effects)
  const fmtEffFromEffects = (effects) => {
    const eff = effects || {};
    const h = Number(eff.health || 0);
    const w = Number(eff.wellbeing || 0);

    const parts = [];

    // Keep health effects visible
    if (h) parts.push(`Health ${h > 0 ? "+" : ""}${h}`);

    // Hide WELL-BEING effects on scam message options/sent line
    if (!isScamThread && w) parts.push(`Well-being ${w > 0 ? "+" : ""}${w}`);

    return parts.join(" • ");
  };

  const fmtEffFromOpt = (opt) => fmtEffFromEffects(opt?.effects || {});

  // Resolve what to show as the "sent" message bubble
  const resolvedSent = useMemo(() => {
    if (!active) return null;

    // reducer stores committed choice here
    if (active.sentOption) {
      const txt = getReplyText(active.sentOption);
      if (txt) {
        return {
          text: txt,
          effects: active.sentOption.effects || {},
        };
      }
    }

    // backward compat
    if (active.sentReply?.text) return active.sentReply;

    // Fallback: derive from chosenOptionId
    if (active.chosenOptionId) {
      const opts = Array.isArray(active.options) ? active.options : [];
      const c = opts.find((o) => o.id === active.chosenOptionId);
      if (c) {
        return {
          text: getReplyText(c),
          effects: c.effects || {},
        };
      }
    }

    return null;
  }, [active]);

  // Styles (WhatsApp-ish)
  const COLORS = {
    bg: "#0b141a",
    panel: "#111b21",
    header: "#075E54", // WhatsApp green
    border: "rgba(255,255,255,0.08)",
    text: "#e9edef",
    muted: "rgba(233,237,239,0.65)",
    bubbleIn: "#202c33",
    bubbleOut: "#005c4b",
    accent2: "#25D366",
  };

const phoneShell = {
  width: "100%",
  maxWidth: 420,
  margin: "0 auto",
  padding: 14,                 // space for the bezel
  borderRadius: 34,
  background: "linear-gradient(180deg, #0f0f0f, #000)",
  boxShadow: `
    0 30px 60px rgba(0,0,0,0.6),
    inset 0 2px 2px rgba(255,255,255,0.08),
    inset 0 -2px 2px rgba(0,0,0,0.6)
  `,
  position: "relative",
};


  const phone = {
    background: COLORS.panel,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 24,
    overflow: "hidden",
    minHeight: 560,
    display: "flex",
    flexDirection: "column",
    position: "relative",
  };

  const header = {
    background: COLORS.header,
    padding: "10px 14px",
    borderBottom: `1px solid ${COLORS.border}`,
    display: "flex",
    alignItems: "center",
    gap: 10,
    color: COLORS.text,
  };

  const avatar = {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.14)",
    display: "grid",
    placeItems: "center",
    fontSize: 16,
    flex: "0 0 auto",
  };

  const backBtn = {
    border: "none",
    background: "transparent",
    color: COLORS.text,
    cursor: "pointer",
    fontSize: 18,
    lineHeight: 1,
    padding: "6px 8px",
    borderRadius: 10,
  };

  const listArea = {
    flex: 1,
    overflowY: "auto",
  };

  const chatArea = {
    flex: 1,
    padding: "14px 14px 10px",
    overflowY: "auto",
    background: "linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.05))",
  };

  const bubbleBase = {
    maxWidth: "78%",
    padding: "10px 12px",
    borderRadius: 14,
    lineHeight: 1.35,
    fontSize: 15,
    color: COLORS.text,
    boxShadow: "0 2px 10px rgba(0,0,0,0.20)",
    whiteSpace: "pre-wrap",
  };

  const bubbleIn = {
    ...bubbleBase,
    background: COLORS.bubbleIn,
    borderTopLeftRadius: 6,
  };

  const bubbleOut = {
    ...bubbleBase,
    background: COLORS.bubbleOut,
    borderTopRightRadius: 6,
  };

  const optionsWrap = {
    padding: "10px 12px 12px",
    borderTop: `1px solid ${COLORS.border}`,
    background: "#0f1a20",
  };

  const optionBtn = (selected) => ({
    width: "100%",
    textAlign: "left",
    padding: "10px 12px",
    borderRadius: 12,
    border: `1px solid ${selected ? COLORS.accent2 : COLORS.border}`,
    background: selected ? "rgba(37,211,102,0.14)" : "rgba(255,255,255,0.03)",
    color: COLORS.text,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: selected ? 800 : 650,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  });

  const sendRow = {
    marginTop: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
  };

  const sendBtn = (enabled) => ({
    width: 44,
    height: 44,
    borderRadius: "999px",
    border: "none",
    background: enabled ? COLORS.accent2 : "rgba(255,255,255,0.12)",
    cursor: enabled ? "pointer" : "not-allowed",
    display: "grid",
    placeItems: "center",
    boxShadow: enabled ? "0 6px 16px rgba(0,0,0,0.35)" : "none",
  });

  const triangle = {
    width: 0,
    height: 0,
    borderTop: "8px solid transparent",
    borderBottom: "8px solid transparent",
    borderLeft: "14px solid #0b141a",
    marginLeft: 3,
  };

  const activeOpts = Array.isArray(active?.options) ? active.options : [];
  const canSend = !!active?.draftOptionId;

  const openChat = (id) => {
    setActiveId(id);
    setView("chat");
  };

  const goBack = () => setView("list");

  return (
    <div style={phoneShell}>
      <div style={phone}>
        {/* Header */}
        <div style={header}>
          {view === "chat" ? (
            <button type="button" style={backBtn} onClick={goBack} aria-label="Back">
              ←
            </button>
          ) : null}

          <div style={avatar} aria-hidden>
            {view === "chat" ? "👤" : "💬"}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 900, fontSize: 14 }}>
              {view === "chat" ? (active?.contactName || "Chat") : "WhatsApp"}
            </div>
            <div style={{ color: COLORS.muted, fontSize: 12 }}>
              {view === "chat" ? "WhatsApp message" : "Phone"}
            </div>
          </div>
        </div>

        {/* LIST VIEW */}
        {view === "list" ? (
          <div style={listArea}>
            {list.length === 0 ? (
              <div style={{ padding: 14, color: COLORS.muted }}>No messages this month.</div>
            ) : (
              list.map((m) => {
                const preview =
                  m.sentReply?.text ||
                  (m.sentOption ? getReplyText(m.sentOption) : "") ||
                  (m.draftOptionId ? getReplyText(m.draftOption) : "") ||
                  m.preview ||
                  m.subject ||
                  m.bodyText ||
                  "New message";

                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => openChat(m.id)}
                    style={{
                      width: "100%",
                      border: "none",
                      background: "transparent",
                      padding: "12px 12px",
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      cursor: "pointer",
                      borderBottom: `1px solid ${COLORS.border}`,
                      color: COLORS.text,
                      textAlign: "left",
                    }}
                  >
                    <div style={avatar} aria-hidden>💬</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 850, fontSize: 14 }}>{m.contactName || "Message"}</div>
                      <div
                        style={{
                          fontSize: 12.5,
                          color: COLORS.muted,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {String(preview)}
                      </div>
                    </div>
                    {!m.read ? (
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: COLORS.accent2,
                        }}
                        aria-label="Unread"
                      />
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        ) : null}

        {/* CHAT VIEW */}
        {view === "chat" ? (
          <>
            <div ref={scrollRef} style={chatArea}>
              {!active ? (
                <div style={{ color: COLORS.muted }}>Select a message.</div>
              ) : (
                <>
                  {/* Incoming prompt bubble */}
                  <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: 10 }}>
                    <div style={bubbleIn}>{active.bodyText || active.text || "You have a new message."}</div>
                  </div>

                  {/* Outgoing sent bubble (after send) */}
                  {resolvedSent ? (
                    <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 6 }}>
                      <div style={bubbleOut}>
                        <div style={{ fontWeight: 850 }}>{resolvedSent.text}</div>

                        {/* Effects line (wellbeing hidden on scam threads) */}
                        {fmtEffFromEffects(resolvedSent.effects) ? (
                          <div style={{ marginTop: 6, fontSize: 12.5, color: "rgba(233,237,239,0.72)" }}>
                            {fmtEffFromEffects(resolvedSent.effects)}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </>
              )}
            </div>

            {/* Options + Send (only if not sent yet) */}
            {active && !active.chosenOptionId ? (
              <div style={optionsWrap}>
                <div style={{ color: COLORS.muted, fontSize: 12, marginBottom: 8 }}>
                  Tap an option (you can change your mind), then press send.
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {activeOpts.map((opt) => {
                    const selected = active.draftOptionId === opt.id;
                    const effLine = fmtEffFromOpt(opt); // hides wellbeing for scam threads

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        style={optionBtn(selected)}
                        onClick={() => {
                          if (typeof onDraft === "function") onDraft(active.id, opt);
                          if (typeof onMarkRead === "function") onMarkRead(active.id);
                        }}
                      >
                        <span style={{ flex: 1 }}>
                          {/* ✅ keep buttons showing the label (choice text) */}
                          {opt.label || opt.text || "Option"}
                          {effLine ? (
                            <span style={{ display: "block", marginTop: 4, fontSize: 12, color: COLORS.muted }}>
                              {effLine}
                            </span>
                          ) : null}
                        </span>
                        {selected ? (
                          <span style={{ color: COLORS.accent2, fontWeight: 900 }}>✓</span>
                        ) : (
                          <span style={{ color: COLORS.muted, fontWeight: 900 }}> </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div style={sendRow}>
                  <button
                    type="button"
                    aria-label="Send"
                    style={sendBtn(canSend)}
                    onClick={() => {
                      if (!active?.draftOptionId) return;
                      if (typeof onSend === "function") onSend(active.id, active.draftOptionId);
                      if (typeof onMarkRead === "function") onMarkRead(active.id);
                    }}
                  >
                    <div style={triangle} />
                  </button>
                </div>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}
