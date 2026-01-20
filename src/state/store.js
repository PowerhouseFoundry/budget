// src/state/store.js — global game state
import { SCENARIOS } from "../data/scenarios";

// ---------- helpers for inbox / scenarios ----------

function appliesLifestyle(appliesTo, lifestyleRaw) {
  const lifestyle = (lifestyleRaw || "").toLowerCase();
  if (!appliesTo || appliesTo === "all") return true;
  const want = String(appliesTo).toLowerCase();

  if (want.includes("|")) {
    return want.split("|").some((part) => lifestyle.includes(part.trim()));
  }
  return lifestyle.includes(want);
}

// clamp helper for bars
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function buildCoachMessage(state) {
  const month = state.month ?? 0;
  const money = state.money ?? 0;
  const health = state.health ?? 0;
  const wellbeing = state.wellbeing ?? 0;

  const id = `coach_m${month}`;
  const base = {
    id,
    category: "general",
    appliesTo: "all",
    from: "Powerhouse Coach",
    read: false,
  };

  if (money < 0) {
    return {
      ...base,
      subject: "Money is in the red",
      preview: "Try to reduce spending or increase income this month.",
      body: [
        "Hi,",
        "Your money bar has dropped below zero. This means you are spending more than you have.",
        "Next month, look for ways to cut back on non-essential spending or increase your income.",
        "Check your subscriptions, leisure choices and upgrades. Small changes can help get you back in the green.",
        "Try to avoid staying in the overdraft for too long.",
        "Thanks,",
        "Powerhouse Coach",
      ],
    };
  }

  if (health < 40) {
    return {
      ...base,
      subject: "Watch your health score",
      preview: "Some choices are pulling your health down.",
      body: [
        "Hi,",
        "Your health bar is getting low.",
        "Think about your food, transport and leisure choices. Walking more, cooking simple meals and choosing active hobbies can help.",
        "Spending a little money to protect your health can be a good long-term decision.",
        "Try to make at least one positive health choice next month.",
        "Thanks,",
        "Powerhouse Coach",
      ],
    };
  }

  if (wellbeing < 40) {
    return {
      ...base,
      subject: "Look after your well-being",
      preview: "Low well-being can make everything feel harder.",
      body: [
        "Hi,",
        "Your well-being bar is quite low.",
        "It can help to plan small, low-cost treats like meeting a friend, going for a walk or choosing a relaxing hobby.",
        "Try to balance saving money with doing things that make you feel good.",
        "Even one or two positive well-being choices can make a difference.",
        "Thanks,",
        "Powerhouse Coach",
      ],
    };
  }

  return {
    ...base,
    subject: "You’re keeping things balanced",
    preview: "Keep an eye on all three bars and stay in control.",
    body: [
      "Hi,",
      "You are doing a good job of keeping your money, health and well-being in balance.",
      "Each month, keep checking your bars at the top and think about how each choice might change them.",
      "It’s okay if one bar dips sometimes, but try not to let any of them stay too low for too long.",
      "Keep it up and see how many months you can stay in control.",
      "Thanks,",
      "Powerhouse Coach",
    ],
  };
}

/**
 * Build inbox messages for a month from scenarios + coach email.
 * - Always returns at least coach message.
 * - Month 0 also includes a welcome message.
 */
function seedChat(state) {
  const messages = [];
  const maxScenarioCount = 4;

  // Core phone/chat scenarios that must always appear
  const CHAT_CORE_IDS = new Set([
    "start-gift-family-jan",
  ]);


  for (let month = 0; month < 12; month++) {
    const lifestyle = state.lifestyle;
    const flags = state.flags || {};
    const balanceNow = state.money;

    const ctx = {
      month,
      lifestyle,
      flags,
      balanceNow,
      balanceAfterBills: balanceNow,
    };


    // Only scenarios marked channel:"chat"
     // Scenarios for the WhatsApp-style phone can be channel:"chat" or channel:"phone"
    const eligible = SCENARIOS.filter(
      (s) =>
        (s.channel === "chat" || s.channel === "phone") &&
        appliesLifestyle(s.appliesTo, lifestyle) &&
        s.trigger(ctx)
    );


    if (eligible.length === 0) continue;

// Core first, then shuffle remaining
const core = [];
const others = [];

for (const s of eligible) {
  if (CHAT_CORE_IDS.has(s.id)) core.push(s);
  else others.push(s);
}

const shuffledOthers = others
  .map((item) => [Math.random(), item])
  .sort((a, b) => a[0] - b[0])
  .map(([, item]) => item);

const remainingSlots = Math.max(0, maxScenarioCount - core.length);
const picked = [...core, ...shuffledOthers.slice(0, remainingSlots)];


    for (const scenario of picked) {
      messages.push({ ...scenario, month });
    }
  }

  return messages;
}

function seedInbox(state) {
  const messages = [];
  const maxScenarioCount = 4;

  // Core benefit scenarios we never want to drop when they trigger
  const CORE_IDS = new Set([
    "benefits-jsa-application",
    "benefits_jsa_application",
    "benefits-uc-housing-invite",
    "benefits_uc_housing_support",
    "benefits-uc-housing-support",
    "benefits_uc_housing_support",
    "benefits_uc_housing_invite",
    "benefits-uc-housing-invite",
    "work-interview-feedback-attire",
      "bank-warning-scam-activity",
  "bank-warning-scam-activity-stage-2",
  "bank-warning-scam-activity-stage-3",
  "bank-warning-how-to-spot-smishing",
  "jobs-agency-new-listings-m4",
"jobs-agency-new-listings-m9",
"work-interview-invite-job",
"work-job-offer",


  ]);

  // Welcome email (Month 0 only)
  const welcomeMsg = {
    id: "seed-welcome-m1",
    month: 0,
    category: "general",
    appliesTo: "all",
    from: "Powerhouse Coach",
    read: false,
    subject: "Welcome to your budget challenge",
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
  };

  for (let month = 0; month < 12; month++) {
    const lifestyle = state.lifestyle;
    const flags = state.flags || {};
    const balanceNow = state.money;

    const ctx = {
      month,
      lifestyle,
      flags,
      balanceNow,
      balanceAfterBills: balanceNow,
    };


    // Always include coach message every month
    const coach = { ...buildCoachMessage({ ...state, month }), month };

    if (month === 0) messages.push(welcomeMsg);
    messages.push(coach);


const scheduled = SCENARIOS.filter(
  (s) =>
    (s.channel == null || s.channel === "inbox") &&
    s.scheduledOnly &&
    appliesLifestyle(s.appliesTo, lifestyle) &&
    s.trigger(ctx)
);

const eligible = SCENARIOS.filter(
  (s) =>
    (s.channel == null || s.channel === "inbox") &&
    !s.scheduledOnly &&
    appliesLifestyle(s.appliesTo, lifestyle) &&
    s.trigger(ctx)
);


    const pool = [...scheduled, ...eligible];
    if (pool.length === 0) continue;

    // Split into core and others
    const core = [];
    const others = [];

    for (const s of pool) {
      if (CORE_IDS.has(s.id)) {
        if (!core.find((c) => c.id === s.id)) core.push(s);
      } else {
        others.push(s);
      }
    }

    // Shuffle others only
    const shuffledOthers = others
      .map((item) => [Math.random(), item])
      .sort((a, b) => a[0] - b[0])
      .map(([, item]) => item);

    const remainingSlots = Math.max(0, maxScenarioCount - core.length);
    const pickedOthers =
      remainingSlots > 0 ? shuffledOthers.slice(0, remainingSlots) : [];

    const pickedForMonth = [...core, ...pickedOthers];

    for (const scenario of pickedForMonth) {
      messages.push({ ...scenario, month });
    }
  }


  return messages;
}
/**
 * Build phone/chat messages for a month from scenarios tagged channel: "chat".
 * These are shown in the Phone modal instead of the Inbox.
 */

// ---------- initial state ----------
export const initialState = {
  setupComplete: true,
  month: 0, // 0=Jan
  income: 1200,
  money: 0,
  health: 70,
  wellbeing: 70,
  toasts: [],
  inbox: [],
  chat: [],
  chatDrafts: {},
  choices: {},
  selected: {},
  pendingChoices: {},
  contracts: null,
  lifestyle: localStorage.getItem("lifestyle") || null,
  flags: (() => {
    try { return JSON.parse(localStorage.getItem("ph_flags") || "{}"); }
    catch { return {}; }
  })(),
  history: (() => {
    const h = loadHistory();
    if (h && Array.isArray(h.money) && Array.isArray(h.health) && Array.isArray(h.wellbeing)) return h;
    return null;
  })(),
  chosenEffects: {}, // lets user change inbox choices without stacking effects
};

function loadHistory(){
  try {
    const raw = localStorage.getItem("ph_history");
    const parsed = raw ? JSON.parse(raw) : null;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function persistHistory(hist){
  try { localStorage.setItem("ph_history", JSON.stringify(hist || {})); } catch {}
}


function persistFlags(flags){
  try { localStorage.setItem('ph_flags', JSON.stringify(flags||{})) } catch {}
}
// ===== Fraud helpers (scam repercussions) =====
function fraudStageToTxn(stage){
  // amounts are NEGATIVE because they are withdrawals
  if (stage === 1) return { merchant: "Apple Pay", amount: -0.45 };
  if (stage === 2) return { merchant: "Sports Direct", amount: -59.99 };
  if (stage === 3) return { merchant: "International Transfer 034500001", amount: -2500 };
  return null;
}

// Trigger fraud chain when learner falls for a "details" scam
function applyScamFraudTrigger(prevFlags, scamFlags, currentMonth){
  const flags = { ...(prevFlags || {}) };
  if (!scamFlags?.phone_scam_fell_for_it) return flags;

  // Only start the chain for scams where details are entered (bank/HMRC/WhatsApp etc.)
  const type = String(scamFlags?.phone_scam_type || "");
const enteredDetails =
  type === "bank" ||
  type === "hmrc" ||
  type === "whatsapp" ||
  type === "parcel" ||
  type === "prize" ||
  scamFlags?.phone_scam_entered_details;


  if (!enteredDetails) return flags;

  // If already active or resolved, don't restart
// ✅ Always restart the chain if learner falls for another scam
// (fresh run begins next month)
delete flags.fraud_active;
delete flags.fraud_stage;
delete flags.fraud_start_month;
delete flags.fraud_reported;
delete flags.fraud_resolved;
delete flags.fraud_refund_due_month;
delete flags.fraud_game_over_next;

// Reset warning/tips so the emails can show again
delete flags.bank_warning_sent;
delete flags.bank_smishing_tips_sent;

// Next month: suspicious activity email + Stage 1 txn appears
flags.fraud_active = true;
flags.fraud_stage = 1;
flags.fraud_start_month = Number.isFinite(currentMonth) ? (currentMonth + 1) : 1;
flags.fraud_reported = false;
flags.fraud_resolved = false;

return flags;
} // ✅ CLOSE applyScamFraudTrigger here


// Escalate once per month if not reported
function advanceFraudIfNeeded(prevFlags, finishingMonth){

  const flags = { ...(prevFlags || {}) };

  if (!flags.fraud_active) return flags;
  if (flags.fraud_resolved) return flags;

  const start = Number(flags.fraud_start_month || 0);
  const stage = Number(flags.fraud_stage || 1);

  // Only start escalation after the first fraud month has actually happened
  if (finishingMonth < start) return flags;

  // If user did NOT report by end of this month, increase stage for next month
if (!flags.fraud_reported && flags.bank_warning_sent !== false) {

    if (stage < 3) {
      flags.fraud_stage = stage + 1;
    } else {
      // Stage 3 was ignored -> next month lose the game
      flags.fraud_game_over_next = true;
    }
  }

  return flags;
}


// ---------- reducer ----------
export function reducer(state, action) {
  switch (action.type) {
    case "PATCH_STATE": {
      return { ...state, ...(action.payload || {}) };
    }
case "REPORT_FRAUD": {
  const payload = action.payload || {};
  const month = state.month ?? 0;

  const flags0 = state.flags || {};
  const stage = Number(flags0.fraud_stage || 0);
  const start = Number(flags0.fraud_start_month || 0);

  // Only allow reporting once fraud is active and has begun
  if (!flags0.fraud_active || flags0.fraud_resolved || month < start || stage < 1) return state;

  const txn = fraudStageToTxn(stage);
  if (!txn) return state;

  const inDesc = String(payload.merchant || "").trim().toLowerCase();
  const inAmt = Number(payload.amount);

  const wantDesc = String(txn.merchant).trim().toLowerCase();
  const wantAmt = Number(Math.abs(txn.amount)); // compare positive user entry

const descOk = inDesc === wantDesc;
const amtOk = Number.isFinite(inAmt) && Math.abs(inAmt - wantAmt) < 0.001;

if (!descOk || !amtOk) {

    return {
      ...state,
      toasts: [...(state.toasts || []), "That doesn’t match the suspicious transaction. Check the amount and merchant name."],
    };
  }

// ✅ No immediate refund (prevents "making money")
const newMoney = Number(state.money || 0);

const flags = {
  ...(flags0 || {}),
  fraud_reported: true,
  fraud_resolved: true,
  fraud_active: false,
  fraud_game_over_next: false,
  // Optional: keep a record for email/feedback
  fraud_refund_due_month: month + 1,
};

persistFlags(flags);

return {
  ...state,
  money: newMoney,
  flags,
  toasts: [...(state.toasts || []), "Fraud reported. Your bank has stopped the payment."],
};

}

    case "ADD_TOAST": {
      const text = action.text || "Notice";
      return { ...state, toasts: [...(state.toasts || []), text] };
    }

    case "SET_PENDING_CHOICE": {
      const key = action.key;
      const value = action.value;
      if (!key) return state;

      return {
        ...state,
        pendingChoices: { ...(state.pendingChoices || {}), [key]: value },
      };
    }
case "INTERVIEW_OUTFIT_CLOSED": {
  return {
    ...state,
    flags: {
      ...(state.flags || {}),
      interview_outfit_open: false,
    },
  };
}
case "INTERVIEW_OUTFIT_CONFIRMED": {
  const payload = action.payload || {};
  const outfit = payload.outfit || {};
  const totalCost = Number(payload.totalCost || 0);
  const score = Number(payload.score || 0);

  // ✅ Set your pass mark here
  const PASS_SCORE = 70;
  const failed = score < PASS_SCORE;

  const currentMonth = state.month ?? 0;

  const flags = {
    ...(state.flags || {}),
    interview_outfit_open: false,
    interview_outfit_done: true,
    interview_outfit_score: score,
    interview_outfit_cost: totalCost,

    // ✅ schedule feedback email for next month if failed
    interview_feedback_due_month: failed ? currentMonth + 1 : (state.flags?.interview_feedback_due_month ?? undefined),
    interview_outfit_failed: failed,
  };

  // Deduct money immediately
  const newMoney = Number(state.money || 0) - totalCost;

  // Mark the interview message as completed so you can finish the month
  const inbox = Array.isArray(state.inbox) ? state.inbox : [];
  const newInbox = inbox.map((m) => {
    if (m.id !== "work-interview-invite") return m;
    return {
      ...m,
      read: true,
      chosenOptionId: m.chosenOptionId || "interview_outfit_confirmed",
    };
  });

  return {
    ...state,
    money: newMoney,
    flags,
    inbox: newInbox,
  };
}

    case "LOCK_CONTRACTS": {
      try {
        const saved = JSON.parse(localStorage.getItem("contracts") || "{}");
        return { ...state, contracts: saved };
      } catch {
        return state;
      }
    }

case "INBOX_SEED_IF_EMPTY": {
  const inboxAlready = Array.isArray(state.inbox) && state.inbox.length > 0;
  const chatAlready = Array.isArray(state.chat) && state.chat.length > 0;

  if (inboxAlready && chatAlready) return state;
// Ensure history exists (Month 0/Jan starting point)
let history = state.history;
if (!history) {
  history = {
    money: [Number(state.money || 0)],
    health: [Number(state.health || 0)],
    wellbeing: [Number(state.wellbeing || 0)],
  };
  persistHistory(history);
}

return {
  ...state,
  history,
  inbox: inboxAlready ? state.inbox : seedInbox(state),
  chat: chatAlready ? state.chat : seedChat(state),
};

}

    case "INBOX_MARK_READ": {
      const id = action.id;
      if (!id) return state;
      return {
        ...state,
        inbox: (state.inbox || []).map((m) =>
          m.id === id ? { ...m, read: true } : m
        ),
      };
    }
case "CHAT_MARK_READ": {
  const id = action.id;
  if (!id) return state;

  const chat = Array.isArray(state.chat) ? state.chat : [];
  return {
    ...state,
    chat: chat.map((m) => (m.id === id ? { ...m, read: true } : m)),
  };
}
// -------------------------
// Phone/Chat choices (draft -> send)
// -------------------------
case "CHAT_DRAFT_OPTION": {
  const messageId = action.id;
  const opt = action.option || {};
  if (!messageId || !opt?.id) return state;

  const chat = Array.isArray(state.chat) ? state.chat : [];

  const newChat = chat.map((m) => {
    if (m.id !== messageId) return m;
    return {
      ...m,
      read: true,
      draftOptionId: opt.id,
      draftOption: opt,
    };
  });

  return {
    ...state,
    chat: newChat,
  };
}


case "CHAT_SEND_OPTION": {
  const messageId = action.id;
  if (!messageId) return state;

  const chat = Array.isArray(state.chat) ? state.chat : [];
  const msg = chat.find((m) => m.id === messageId);
  if (!msg) return state;

  // Must have a draft to send
  const draft = msg.draftOption || null;
  if (!draft || !draft.id) return state;

  // Prevent re-sending
  if (msg.chosenOptionId) return state;

  // Apply effects ONCE at send-time
  const eff = draft.effects || {};
  const moneyDelta = Number(eff.money || 0);
  const healthDelta = Number(eff.health || 0);
  const wellbeingDelta = Number(eff.wellbeing || 0);

  const newMoney = Number(state.money || 0) + moneyDelta;
  const newHealth = clamp(Number(state.health || 0) + healthDelta, 0, 100);
  const newWellbeing = clamp(Number(state.wellbeing || 0) + wellbeingDelta, 0, 100);

  // ✅ Merge flags from the chosen chat option
  let newFlags = {
    ...(state.flags || {}),
    ...(draft.flags || {}),
  };


// ✅ Trigger fraud chain ONLY if this option is the “fell for it” scam
if (draft?.flags?.phone_scam_fell_for_it === true) {
  newFlags = applyScamFraudTrigger(newFlags, draft.flags, state.month ?? 0);

  // One-shot: do not leave the trigger flag set
  newFlags.phone_scam_fell_for_it = false;
  newFlags.phone_scam_fell_month = Number(state.month ?? 0);
}


persistFlags(newFlags);


  // ✅ Commit the sent message so WhatsAppPhone can show the REPLY text
  const newChat = chat.map((m) => {
    if (m.id !== messageId) return m;
    return {
      ...m,
      read: true,
      chosenOptionId: draft.id,
      sentOption: draft,      // IMPORTANT: keeps draft.reply available
      draftOptionId: null,
      draftOption: null,
    };
  });

  return {
    ...state,
    money: newMoney,
    health: newHealth,
    wellbeing: newWellbeing,
    flags: newFlags,
    chat: newChat,
  };
}





    // -------------------------
    // JSA form submitted
    // -------------------------
    case "JSA_FORM_SUBMITTED": {
      const payload = action.payload || {};
      const allowed = new Set(["good", "ok", "bad", "none"]);
      const quality = allowed.has(payload.quality) ? payload.quality : "none";

      const currentMonth = state.month ?? 0;

      const newFlags = {
        ...(state.flags || {}),
        jsa_form_open: false,
        jsa_form_submitted: true,
        jsa_form_quality: quality,
      };

      // Mark JSA invite message as “completed” so Finish Month doesn’t bounce them back
      const newInbox = (state.inbox || []).map((m) => {
        if (
          m.id !== "benefits-jsa-application" &&
          m.id !== "benefits_jsa_application"
        )
          return m;
        return {
          ...m,
          read: true,
          chosenOptionId: m.chosenOptionId || "jsa_form_submitted",
        };
      });

      // Receipt email (same month)
      const receiptId = `jsa_receipt_m${currentMonth}`;
      const alreadyHasReceipt = (state.inbox || []).some(
        (m) => m.id === receiptId
      );

      const receiptMessage = {
        id: receiptId,
        month: currentMonth,
        category: "work",
        from: "DWP – Jobseeker’s Allowance",
        read: false,
        subject: "We received your JSA application",
        preview: "Thanks — we’ve received your form. We will review it soon.",
        body: [
          "Hi,",
          "Thanks for submitting your Jobseeker’s Allowance (JSA) application.",
          "We have received your form and will review it.",
          "You may get a decision message soon.",
          "Thanks,",
          "DWP Team",
        ],
        choices: [{ id: "jsa_receipt_ok", label: "OK", effects: {} }],
      };

      return {
        ...state,
        flags: newFlags,
        inbox: alreadyHasReceipt ? newInbox : [...newInbox, receiptMessage],
      };
    }

    // -------------------------
    // UC form submitted
    // -------------------------
    case "UC_FORM_SUBMITTED": {
      const flags = { ...(state.flags || {}) };
      const currentMonth = state.month ?? 0;

      const values = action?.payload?.values || {};
      const award = action?.payload?.award || action?.payload?.breakdown || {};

      const num = (x) => {
        const s = String(x ?? "").replace(/[^\d.]/g, "");
        const n = parseFloat(s);
        return Number.isFinite(n) ? n : 0;
      };

      const submitted = {
        rent: num(values.rentMonthly),
        councilTax: num(values.councilTaxMonthly),
        utilities: num(values.utilitiesMonthly || values.utilityBillMonthly),
      };

      // ✅ Expected values:
      // - Council Tax fixed at £100
      // - Utilities fixed at £181 (gas+electric+water combined)
      // - Rent should match the rent selected in-game (if available in flags)
      const expectedRent =
        Number(flags.rent_monthly || flags.rentMonthly || flags.housing_rent || 0);

      const expected = {
        rent: expectedRent,
        councilTax: 100,
        utilities: 181,
      };

      const diff = {
        rent: expected.rent > 0 ? submitted.rent - expected.rent : 0,
        councilTax: submitted.councilTax - expected.councilTax,
        utilities: submitted.utilities - expected.utilities,
      };

      // validate CT + utilities always; rent only if we actually have expected rent from game
      const rentOk = expected.rent > 0 ? diff.rent === 0 : true;
      const isCorrect = rentOk && diff.councilTax === 0 && diff.utilities === 0;

      flags.uc_form_submitted = true;
      flags.uc_form_open = false;

      // decision message appears next month
      flags.uc_decision_due_month = currentMonth + 1;
      flags.uc_application_correct = !!isCorrect;

      // store for email text
      flags.uc_submitted_amounts = submitted;
      flags.uc_expected_amounts = expected;
      flags.uc_amount_diffs = diff;

      // store pending award (activated after approval message is acknowledged)
      flags.uc_pending_amount = Number(award.monthlyTotal || 0);

      // Mark UC invite as completed so Finish Month does not bounce them back to it
      const newInbox = (state.inbox || []).map((m) => {
        if (
          m.id !== "benefits-uc-housing-invite" &&
          m.id !== "benefits_uc_housing_support" &&
          m.id !== "benefits-uc-housing-support"
        )
          return m;
        return {
          ...m,
          read: true,
          chosenOptionId: m.chosenOptionId || "uc_form_submitted",
        };
      });

      // receipt message (same month)
      const receiptId = `uc_receipt_m${currentMonth}`;
      const alreadyHasReceipt = (state.inbox || []).some(
        (m) => m.id === receiptId
      );

      const receiptMessage = {
        id: receiptId,
        month: currentMonth,
        category: "housing",
        from: "DWP – Universal Credit",
        read: false,
        subject: "We received your Universal Credit form",
        preview: "Thanks — we’ve received your housing support details.",
        body: [
          "Hi,",
          "Thanks for submitting your Universal Credit housing support form.",
          "We will check the amounts you entered against your bills.",
          "You will receive a decision message next month.",
          "Thanks,",
          "Universal Credit Team",
        ],
        choices: [{ id: "uc_receipt_ok", label: "OK", effects: {} }],
      };

      return {
        ...state,
        flags,
        inbox: alreadyHasReceipt ? newInbox : [...newInbox, receiptMessage],
      };
    }

    // -------------------------
    // Inbox choices (allow change mind without stacking)
    // -------------------------
    // -------------------------
// Phone/Chat choices (same logic as inbox, but operates on state.chat)
// -------------------------

    case "INBOX_OPTION_SELECTED": {
      const messageId = action.id;
      const opt = action.option || {};
      if (!messageId) return state;

      const inbox = Array.isArray(state.inbox) ? state.inbox : [];
      const currentMsg = inbox.find((m) => m.id === messageId);
      if (!currentMsg) return state;


      // Merge option flags
let newFlags = {
  ...(state.flags || {}),
  ...(opt.flags || {}),
};
// ----------------------------------------
// GP CHECK-UP CONDITIONAL SUPPORT OFFERS
// ----------------------------------------
if (
  (messageId === "gp-checkup-m5" || messageId === "gp-checkup-m8") &&
  opt?.id === "gp-go"
) {
  const m = Number(state.month ?? 0);

  // If money is low at the time of check-up, activate food bank voucher for next 3 months
  if (Number(state.money ?? 0) < 100) {
    newFlags.foodbank_voucher_start_month = m + 1;     // starts next month
    newFlags.foodbank_voucher_end_month = m + 3;       // lasts 3 months
  }

  // If wellbeing is very low, activate monthly counselling from next month
  if (Number(state.wellbeing ?? 0) < 20) {
    newFlags.counselling_active = true;
    newFlags.counselling_start_month = m + 1;
  }
}

// ✅ Job offer accepted -> set new monthly income starting NEXT month
if (messageId === "work-job-offer" && opt?.id === "accept-job") {
  const payPerHour = Number(newFlags.job_applied_pay_per_hour || 0);
  const hoursPerWeek = Number(newFlags.job_applied_hours_per_week || 0);
  const monthly = payPerHour * hoursPerWeek * 4.5;

  const currentMonth = Number(state.month ?? 0);

  newFlags.job_monthly_income = monthly;
  newFlags.job_income_start_month = currentMonth + 1;

  // close flow
  newFlags.job_application_active = false;
}



      // ✅ UC re-apply from unsuccessful decision email
      if (messageId === "uc-decision-unsuccessful" && opt.id === "uc_reapply") {
        newFlags.uc_form_open = true;
        newFlags.uc_form_submitted = false;
        newFlags.uc_decision_done = false;

        if ("uc_decision_due_month" in newFlags) delete newFlags.uc_decision_due_month;
        if ("uc_application_correct" in newFlags) delete newFlags.uc_application_correct;
      }

      // Track effects per message so user can change their mind safely
      const chosenEffects = { ...(state.chosenEffects || {}) };
      const prev = chosenEffects[messageId] || { money: 0, health: 0, wellbeing: 0 };

      const eff = opt.effects || {};
      const nextEff = {
        money: Number(eff.money || 0),
        health: Number(eff.health || 0),
        wellbeing: Number(eff.wellbeing || 0),
      };

      // Undo previous, apply new
      const baseMoney = Number(state.money || 0) - Number(prev.money || 0);
      const baseHealth = clamp(
        Number(state.health || 0) - Number(prev.health || 0),
        0,
        100
      );
      const baseWell = clamp(
        Number(state.wellbeing || 0) - Number(prev.wellbeing || 0),
        0,
        100
      );

      const newMoney = baseMoney + nextEff.money;
      const newHealth = clamp(baseHealth + nextEff.health, 0, 100);
      const newWellbeing = clamp(baseWell + nextEff.wellbeing, 0, 100);

      // ✅ UC: when success decision is acknowledged, start monthly UC from next month
      if (messageId === "uc-decision-success" && opt.id === "uc-decision-success-ok") {
        newFlags.uc_monthly_amount = Number(newFlags.uc_pending_amount || 0);
        newFlags.uc_start_month = (state.month ?? 0) + 1;
      }

      // ✅ JSA: when decision is acknowledged, start monthly JSA from next month
      if (
        (messageId === "benefits-jsa-decision-good" && opt.id === "benefits-jsa-decision-good-ok") ||
        (messageId === "benefits-jsa-decision-ok" && opt.id === "benefits-jsa-decision-ok-ok")
      ) {
        newFlags.jsa_monthly_amount = 320;
        newFlags.jsa_start_month = (state.month ?? 0) + 1;
      }
      // -------------------------
      // Store card scheduling logic
      // -------------------------
      if (messageId === "store-card-offer") {
        const m = Number(state.month ?? 0);

        if (opt.id === "store-card-offer-decline") {
          // Re-offer in 6 months (or the last month if near the end)
          newFlags.storeCardNextOfferMonth = Math.min(11, m + 6);
        }

        if (opt.id === "store-card-offer-accept") {
          // Start payments next month (not immediately)
          newFlags.storeCardStartMonth = m + 1;

          // Prevent re-offer once accepted
          newFlags.storeCardNextOfferMonth = 99;
        }
      }

      chosenEffects[messageId] = nextEff;

const newInbox = inbox.map((m) => {
  if (m.id !== messageId) return m;
  return { ...m, read: true, chosenOptionId: opt.id || null };
});

persistFlags(newFlags);

return {
  ...state,
  money: newMoney,
  health: newHealth,
  wellbeing: newWellbeing,
  flags: newFlags,
  inbox: newInbox,
  chosenEffects,
};

    }

    // -------------------------
    // Month commit (adds next month’s benefit income ONCE)
    // -------------------------
    case "COMMIT_MONTH": {
      const totals = (action && action.payload && action.payload.totals) || {};
      const deltaMoney = Number(totals.money || 0);
      const deltaHealth = Number(totals.health || 0);
      const deltaWellbeing = Number(totals.wellbeing || 0);

      const currentMonth = state.month ?? 0;

      const fromMonth =
        action &&
        action.payload &&
        typeof action.payload.fromMonth === "number"
          ? action.payload.fromMonth
          : null;

      if (fromMonth !== null && fromMonth !== currentMonth) {
        return state;
      }

      const nextMonth = Math.min(11, currentMonth + 1);

      // ✅ Monthly benefit payments paid INTO the next month
let flags = state.flags || {};
flags = advanceFraudIfNeeded(flags, currentMonth);
persistFlags(flags);



      const ucAmt = Number(flags.uc_monthly_amount || 0);
      const ucStart = Number.isFinite(flags.uc_start_month)
        ? Number(flags.uc_start_month)
        : 0;

      const jsaAmt = Number(flags.jsa_monthly_amount || 0);
      const jsaStart = Number.isFinite(flags.jsa_start_month)
        ? Number(flags.jsa_start_month)
        : 0;

      let monthlyBenefitIncome = 0;
      if (ucAmt > 0 && nextMonth >= ucStart) monthlyBenefitIncome += ucAmt;
      if (jsaAmt > 0 && nextMonth >= jsaStart) monthlyBenefitIncome += jsaAmt;

      // IMPORTANT:
      // We add benefits here so they are not double-counted in Month.jsx totals.
const newMoney = (state.money || 0) + deltaMoney + monthlyBenefitIncome;
const newHealth = clamp((state.health || 0) + deltaHealth, 0, 100);
const newWellbeing = clamp((state.wellbeing || 0) + deltaWellbeing, 0, 100);

// ✅ Counselling: +5 wellbeing every month once active (from counselling_start_month)
const counsellingOn = flags.counselling_active === true;
const counsellingStart = Number.isFinite(flags.counselling_start_month)
  ? Number(flags.counselling_start_month)
  : 999;

let finalWellbeing = newWellbeing;
if (counsellingOn && nextMonth >= counsellingStart) {
  finalWellbeing = clamp(finalWellbeing + 5, 0, 100);
}

const baseNext = {
  ...state,
  month: nextMonth,
  money: newMoney,
  health: newHealth,
  wellbeing: finalWellbeing, // ✅ use the declared variable
  flags, // ✅ important
};


const nextInbox = seedInbox(baseNext);
const nextChat = seedChat(baseNext);
// --- Append score history for the NEXT month state (so it grows to 12 points) ---
let history = state.history || loadHistory();

if (!history || !Array.isArray(history.money)) {
  history = {
    money: [],
    health: [],
    wellbeing: [],
  };
}

// We want history index = month number (0..11)
const idx = nextMonth;

// Ensure arrays are long enough
while (history.money.length < idx) history.money.push(history.money[history.money.length - 1] ?? Number(state.money || 0));
while (history.health.length < idx) history.health.push(history.health[history.health.length - 1] ?? Number(state.health || 0));
while (history.wellbeing.length < idx) history.wellbeing.push(history.wellbeing[history.wellbeing.length - 1] ?? Number(state.wellbeing || 0));

// Add/replace the value for this month index
history.money[idx] = Number(baseNext.money || 0);
history.health[idx] = Number(baseNext.health || 0);
history.wellbeing[idx] = Number(baseNext.wellbeing || 0);

persistHistory(history);


      // clear pending/choices that should reset monthly
      const oldPending = state.pendingChoices || {};
      const newPending = { ...oldPending };
      ["food", "transport", "leisure"].forEach((k) => {
        if (k in newPending) delete newPending[k];
      });

      const oldChoices = state.choices || {};
      const newChoices = { ...oldChoices };
      ["food", "transport", "leisure"].forEach((k) => {
        if (k in newChoices) delete newChoices[k];
      });

return {
  ...baseNext,
  history,
  inbox: nextInbox,
  chat: nextChat,
  pendingChoices: newPending,
  choices: newChoices,
};

    }

    case "NEXT_MONTH": {
      const nextMonth = Math.min(11, (state.month || 0) + 1);
      const baseNext = { ...state, month: nextMonth };
      return { ...baseNext, inbox: seedInbox(baseNext), chat: seedChat(baseNext) };


    }
case "MERGE_FLAGS": {
  const nextFlags = { ...(state.flags || {}), ...(action.flags || {}) };
  persistFlags(nextFlags);
  return { ...state, flags: nextFlags };
}




    default:
      return state;
  }
}
