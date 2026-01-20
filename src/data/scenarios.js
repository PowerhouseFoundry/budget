// src/data/scenarios.js
// Categories for coloured accents: 'housing','bills','food','transport','work','health','social','general'

export const TRIG = {
  monthAtLeast: (n) => ({ month }) => (month ?? 0) >= n,

  // After fixed bills have been taken, balance is below £0
  overdraftAfterBills: ({ balanceAfterBills }) => (balanceAfterBills ?? 0) < 0,

  // Only show missed-rent letter if rent failed AND the *current* balance is overdrawn
  missedRentOnlyIfOverdraft: ({ flags, balanceNow }) =>
    flags?.couldNotPayRent === true && (balanceNow ?? 0) < 0,

  // Only show council tax help / issues if CT couldn’t be paid AND current balance is overdrawn
  councilTaxOnlyIfOverdraft: ({ flags, balanceNow }) =>
    flags?.couldNotPayCouncilTax === true && (balanceNow ?? 0) < 0,

  lifestyleIncludes: (want) => ({ lifestyle }) =>
    (lifestyle || "").toLowerCase().includes(want),

  monthIsOneOf: (list) => ({ month }) => list.includes(month),

  never: () => false,
};

const ALL = "all";

export const SCENARIOS = [
  // ---------------------------------------------------------
  // PHONE SCENARIOS (WhatsApp-style) — Friends/Family + Scams
  // channel: "chat"
  // ---------------------------------------------------------

  {
    id: "phone-birthday-night-out",
    channel: "chat",
    category: "social",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 1 && [1, 2, 5, 9].includes(month),
    from: "Mia",
    subject: "Birthday plans 🎉",
    preview: "You coming out tonight?",
    body: [
      "It’s Sam’s birthday tonight 🎉",
      "We’re going into town for food + a few drinks.",
      "Are you coming?"
    ],
    choices: [
      { id: "phone-birthday-go", label: "Yeah I’m in (£30)", reply: "Yes sounds good — I’ll be there!", effects: { money: -30, wellbeing: +5 } },
      { id: "phone-birthday-skip", label: "Can’t this time (save money)", reply: "Sorry, I can’t make it this time — hope you have a great night!", effects: { wellbeing: -3 } },
    ],
  },

  {
    id: "phone-cinema-invite",
    channel: "chat",
    category: "social",
    appliesTo: ALL,
      trigger: ({ month }) => (month ?? 0) >= 1 && [3, 6, 10].includes(month),

    from: "Jay",
    subject: "Cinema?",
    preview: "New film looks good.",
    body: [
      "Fancy the cinema this week?",
      "We can get tickets + snacks after."
    ],
    choices: [
      { id: "phone-cinema-go", label: "Go to cinema (£18)", reply: "Yeah I’m up for it — what day are you thinking?", effects: { money: -18, wellbeing: +3 } },
      { id: "phone-cinema-decline", label: "Decline (save money)", reply: "I’ll have to pass this time — trying to save a bit.", effects: { wellbeing: -1 } },
    ],
  },

  {
    id: "phone-bowling-invite",
    channel: "chat",
    category: "social",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 1 && [2, 7, 11].includes(month),
    from: "Leah",
    subject: "Bowling 🎳",
    preview: "Couple of games after work?",
    body: [
      "Bowling tonight? 🎳",
      "Just a couple of games + a drink."
    ],
    choices: [
      { id: "phone-bowling-go", label: "Go bowling (£22)", reply: "Yes, bowling sounds fun — I’m in!", effects: { money: -22, wellbeing: +3 } },
      { id: "phone-bowling-skip", label: "Skip (save money)", reply: "Not tonight sorry — I’ll catch you another time.", effects: { wellbeing: -1 } },
    ],
  },

  {
    id: "phone-shopping-trip",
    channel: "chat",
    category: "social",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 1 && [1, 4, 8].includes(month),
    from: "Auntie Rose",
    subject: "Shopping day",
    preview: "Want to come with me?",
    body: [
      "I’m going shopping this weekend.",
      "Want to come with me? Could be a nice day out."
    ],
    choices: [
      { id: "phone-shopping-go", label: "Go shopping (£25)", reply: "Yes please — that sounds like a nice day out!", effects: { money: -25, wellbeing: +2 } },
      { id: "phone-shopping-no", label: "No thanks", reply: "Thanks for asking — I’ll give it a miss this weekend.", effects: { wellbeing: 0 } },
    ],
  },

  {
    id: "phone-coffee-catchup",
    channel: "chat",
    category: "social",
    appliesTo: ALL,
      trigger: ({ month }) => (month ?? 0) >= 1 && [2, 5, 7, 9, 11].includes(month),

    from: "Mum",
    subject: "Quick catch-up ☕",
    preview: "Coffee and a chat?",
    body: [
      "Are you free for a coffee and a chat this week?",
      "Just want to see how you’re doing."
    ],
    choices: [
      { id: "phone-coffee-yes", label: "Go for coffee (£6)", reply: "Yes please — I’d love a coffee and a chat.", effects: { money: -6, wellbeing: +2 } },
      { id: "phone-coffee-later", label: "Not this week", reply: "Not this week sorry — can we do it soon though?", effects: { wellbeing: -1 } },
    ],
  },

  {
    id: "phone-weekend-away",
    channel: "chat",
    category: "social",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 2 && [3, 6, 10].includes(month),
    from: "Dan",
    subject: "Weekend away?",
    preview: "Couple of nights somewhere cheap?",
    body: [
      "Me and a few mates are thinking a weekend away.",
      "Nothing fancy — just a cheap place for 2 nights.",
      "You in?"
    ],
    choices: [
      { id: "phone-weekend-away-yes", label: "Go (£85)", reply: "That sounds great — I’m in, let me know the plan!", effects: { money: -85, wellbeing: +6, health: -1 } },
      { id: "phone-weekend-away-no", label: "No (too expensive)", reply: "I can’t afford it right now — hope you all have a good time though!", effects: { wellbeing: -1 } },
    ],
  },

  {
    id: "phone-holiday-invite",
    channel: "chat",
    category: "social",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 3 && [4, 8].includes(month),
    from: "Chloe",
    subject: "Holiday idea ✈️",
    preview: "We found a deal…",
    body: [
      "We found a holiday deal for later this year ✈️",
      "Would be amazing but it’s not cheap.",
      "Do you want in?"
    ],
    choices: [
      { id: "phone-holiday-yes", label: "Pay deposit (£120)", reply: "Yes! I’m up for it — I’ll pay the deposit.", effects: { money: -120, wellbeing: +7 } },
      { id: "phone-holiday-no", label: "No (too much money)", reply: "It sounds amazing but I can’t do it money-wise — sorry!", effects: { wellbeing: -1 } },
    ],
  },

  {
    id: "phone-gym-buddy",
    channel: "chat",
    category: "health",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 1 && [2, 5, 9].includes(month),
    from: "Kai",
    subject: "Gym session?",
    preview: "Want to come with me?",
    body: [
      "Gym with me this week?",
      "Could do a quick session then head home."
    ],
    choices: [
      { id: "phone-gym-yes", label: "Go (£5)", reply: "Yeah let’s do it — what time are you going?", effects: { money: -5, health: +2, wellbeing: +1 } },
      { id: "phone-gym-no", label: "No thanks", reply: "Not this time — maybe another week!", effects: { wellbeing: 0 } },
    ],
  },
{
  id: "start-gift-family-jan",
  channel: "phone",
  category: "general",
  appliesTo: "all",
  scheduledOnly: true,
  trigger: ({ month, flags }) => month === 0 && !flags?.start_gift_done,
  from: "Family",
  preview: "Good luck with moving out…",
  body: [
    "Hi 😊",
    "",
    "Good luck with moving out.",
    "I’ve put £1000 in your bank account to give you a head start.",
    "",
    "Use it wisely.",
  ],
  choices: [
    {
      id: "start-gift-accept",
      label: "Accept politely",
      reply: "Thank you so much. I really appreciate it. I’ll use it carefully.",
      effects: { money: 1000 }, // ✅ credits immediately when sent
      flags: { start_gift_done: true, start_gift_accepted: true },
    },
    {
      id: "start-gift-refuse",
      label: "Refuse politely",
      reply: "Thank you, but I’d like to try and manage on my own.",
      effects: { money: 0 },
      flags: { start_gift_done: true, start_gift_accepted: false },
    },
  ],
},

  {
    id: "phone-takeaway-invite",
    channel: "chat",
    category: "food",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 1 && [1, 3, 6, 9].includes(month),
    from: "Josh",
    subject: "Takeaway?",
    preview: "Fancy ordering in?",
    body: [
      "Fancy ordering a takeaway tonight?",
      "We can chill and watch something."
    ],
    choices: [
      { id: "phone-takeaway-yes", label: "Order takeaway (£16)", reply: "Yes, let’s order in — what do you fancy?", effects: { money: -16, wellbeing: +2, health: -1 } },
      { id: "phone-takeaway-no", label: "No (cook instead)", reply: "I’m going to cook tonight to save money — maybe another time.", effects: { wellbeing: 0, health: +1 } },
    ],
  },

  // --------------------
  // SCAMS / SMISHING
  // IMPORTANT: store.js will auto-set "phone_scam_due_month" = currentMonth + 1
  // when phone_scam_fell_for_it is true, so triggers work reliably.
  // --------------------

  {
    id: "phone-scam-parcel-fee",
    channel: "chat",
    category: "general",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 1 && Math.random() < 0.22,
    from: "Delivery Update",
    subject: "Missed delivery",
    preview: "A small fee is needed to reschedule.",
    body: [
      "Your parcel could not be delivered.",
      "To rearrange delivery, a small fee is required.",
      "Tap the link to pay and choose a new time."
    ],
    choices: [
      {
        id: "phone-scam-parcel-pay",
        label: "Pay the fee (enter card details)",
        reply: "Okay, I’ll pay the fee now to rearrange it.",
        effects: { money: -45, wellbeing: -2 },
        flags: { phone_scam_fell_for_it: true, phone_scam_type: "parcel", phone_scam_loss: 45 },
      },
      { id: "phone-scam-parcel-ignore", label: "Ignore / delete", reply: "This looks suspicious — I’m deleting it.", effects: { wellbeing: +1 }, flags: { phone_scam_avoided: true } },
      { id: "phone-scam-parcel-report", label: "Report as scam", reply: "I’m reporting this as a scam and blocking it.", effects: { wellbeing: +2 }, flags: { phone_scam_reported: true } },
    ],
  },

  {
    id: "phone-scam-hmrc-refund",
    channel: "chat",
    category: "general",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 2 && Math.random() < 0.18,
    from: "HMRC",
    subject: "Tax refund",
    preview: "Refund available — confirm details.",
    body: [
      "HMRC: You are due a tax refund.",
      "Confirm your details to receive the payment."
    ],
    choices: [
      {
        id: "phone-scam-hmrc-click",
        label: "Click link and enter details",
        reply: "Great — I’ll confirm my details now.",
        effects: { money: -120, wellbeing: -3 },
        flags: { phone_scam_fell_for_it: true, phone_scam_type: "hmrc", phone_scam_loss: 120 },
      },
      { id: "phone-scam-hmrc-ignore", label: "Ignore / delete", reply: "I’m not clicking that — I’ll ignore it.", effects: { wellbeing: +1 } },
      { id: "phone-scam-hmrc-check", label: "Don’t click — check official website later", reply: "I won’t click links — I’ll check the official HMRC site later.", effects: { wellbeing: +2 }, flags: { phone_scam_smart_choice: true } },
    ],
  },

  {
    id: "phone-scam-bank-fraud-team",
    channel: "chat",
    category: "general",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 2 && Math.random() < 0.18,
    from: "Bank Security",
    subject: "Fraud alert",
    preview: "Unusual payment detected — act now.",
    body: [
      "We detected an unusual payment.",
      "If this was NOT you, reply YES and follow the steps to secure your account."
    ],
    choices: [
      {
        id: "phone-scam-bank-reply",
        label: "Reply YES and follow instructions",
        reply: "YES",
        effects: { money: -200, wellbeing: -4 },
        flags: { phone_scam_fell_for_it: true, phone_scam_type: "bank", phone_scam_loss: 200 },
      },
      { id: "phone-scam-bank-ignore", label: "Ignore / delete", reply: "I’m deleting this — it doesn’t feel legit.", effects: { wellbeing: +1 } },
      { id: "phone-scam-bank-call", label: "Call your bank using the number on your card", reply: "I’m not replying — I’ll call my bank using the number on my card.", effects: { wellbeing: +2 }, flags: { phone_scam_smart_choice: true } },
    ],
  },

  {
    id: "phone-scam-whatsapp-verify",
    channel: "chat",
    category: "general",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 1 && Math.random() < 0.20,
    from: "WhatsApp Support",
    subject: "Account check",
    preview: "Verify your account now.",
    body: [
      "Your WhatsApp account needs verifying.",
      "If you do not verify now, your account may be locked."
    ],
    choices: [
      {
        id: "phone-scam-whatsapp-details",
        label: "Enter code / details",
        reply: "Okay, I’ll verify my account now.",
        effects: { money: -60, wellbeing: -2 },
        flags: { phone_scam_fell_for_it: true, phone_scam_type: "whatsapp", phone_scam_loss: 60 },
      },
      { id: "phone-scam-whatsapp-ignore", label: "Ignore / delete", reply: "I’m ignoring this — WhatsApp wouldn’t message like that.", effects: { wellbeing: +1 } },
      { id: "phone-scam-whatsapp-block", label: "Block / report contact", reply: "Blocked and reported — definitely a scam.", effects: { wellbeing: +2 }, flags: { phone_scam_reported: true } },
    ],
  },

  {
    id: "phone-scam-prize-giftcard",
    channel: "chat",
    category: "general",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 1 && Math.random() < 0.16,
    from: "Promo Team",
    subject: "You’ve won!",
    preview: "Claim your gift card now.",
    body: [
      "Congratulations! You’ve been selected for a gift card.",
      "Claim now before it expires."
    ],
    choices: [
      {
        id: "phone-scam-prize-claim",
        label: "Claim prize (enter details)",
        reply: "No way — I’ll claim it now!",
        effects: { money: -35, wellbeing: -1 },
        flags: { phone_scam_fell_for_it: true, phone_scam_type: "prize", phone_scam_loss: 35 },
      },
      { id: "phone-scam-prize-ignore", label: "Ignore / delete", reply: "That’s obviously fake — deleting it.", effects: { wellbeing: +1 } },
    ],
  },

  // ---------------------------------------------------------
  // NEXT-MONTH BANK WARNING EMAIL (inbox)
  // Triggers exactly when month === flags.phone_scam_due_month
  // ---------------------------------------------------------

  {
    id: "bank-warning-scam-activity",
    category: "bills",
    appliesTo: ALL,
   trigger: ({ month, flags }) =>
  flags?.fraud_active === true &&
  !flags?.fraud_resolved &&
  flags?.fraud_stage === 1 &&
  (month ?? 0) === flags?.fraud_start_month,

    subject: "Bank warning: suspicious activity",
    from: "Your Bank",
    preview: "We noticed suspicious activity linked to a text message scam.",
    body: [
      "Hi,",
      "We noticed unusual activity after a text message asked you to click a link or enter details.",
      "Banks and services do not ask you to click links in unexpected texts.",
      "If you are unsure, stop and contact the company using a trusted number (e.g. on your bank card).",
      "Thanks,",
      "Fraud Prevention Team",
    ],
    choices: [
      {
        id: "bank-warning-scam-ack",
        label: "OK",
        effects: { wellbeing: +1 },
        flags: { bank_warning_sent: true },
      },
    ],
  },
{
  id: "bank-warning-scam-activity-stage-2",
  category: "bills",
  appliesTo: "all",
  trigger: ({ month, flags }) =>
    flags?.fraud_active === true &&
    flags?.fraud_stage === 2 &&
    (month ?? 0) >= flags?.fraud_start_month + 1,
  subject: "Further suspicious activity detected",
  from: "Your Bank",
  preview: "Another unusual payment has been detected.",
  body: [
    "We have detected another suspicious payment.",
    "If this was not you, please report it immediately via your bank statement.",
  ],
  choices: [{ id: "fraud_stage_2_ack", label: "OK", effects: {} }],
},

{
  id: "bank-warning-scam-activity-stage-3",
  category: "bills",
  appliesTo: "all",
  trigger: ({ month, flags }) =>
    flags?.fraud_active === true &&
    flags?.fraud_stage === 3 &&
    (month ?? 0) >= flags?.fraud_start_month + 2,
  subject: "Urgent: large international transfer",
  from: "Your Bank",
  preview: "A large payment has left your account.",
  body: [
    "A large international transfer has left your account.",
    "Please report this immediately if you do not recognise it.",
  ],
  choices: [{ id: "fraud_stage_3_ack", label: "OK", effects: {} }],
},

  {
    id: "bank-warning-how-to-spot-smishing",
    category: "bills",
    appliesTo: ALL,
    trigger: ({ month, flags }) =>
      (month ?? 0) >= 1 &&
      flags?.phone_scam_fell_for_it === true &&
      flags?.bank_warning_sent === true &&
      flags?.bank_smishing_tips_sent !== true,
    subject: "How to spot scam texts (smishing)",
    from: "Your Bank",
    preview: "Simple checks to keep you safe.",
    body: [
      "Hi,",
      "Quick checks for scam texts:",
      "• Be cautious with urgent messages pushing you to click a link.",
      "• Don’t share codes, PINs or passwords.",
      "• Contact companies using official numbers, not the one in the message.",
      "Thanks,",
      "Fraud Prevention Team",
    ],
    choices: [
      {
        id: "bank-smishing-tips-ok",
        label: "OK",
        effects: { wellbeing: +2 },
        flags: { bank_smishing_tips_sent: true },
      },
    ],
  },

  // ---------------------------------------------------------
  // Everything else (unchanged from your file after this point)
  // ---------------------------------------------------------

  {
    id: "rent-missed-notice",
    category: "housing",
    appliesTo: ALL,
    trigger: TRIG.missedRentOnlyIfOverdraft,
    subject: "Rent payment missed",
    preview: "Your landlord says last month’s rent was not received.",
    body: [
      "Our records show your rent was not received. Please resolve this to avoid further charges.",
    ],
    choices: [
      {
        id: "rent-missed-notice-pay-now",
        label: "Pay rent now (includes £50 late fee)",
        effects: { money: -50, wellbeing: -2 },
        flags: { resolvedRentArrears: true },
      },
      {
        id: "rent-missed-notice-plan",
        label: "Request a payment plan (rent split next month)",
        effects: { wellbeing: -1 },
        flags: { rentDoubleNextMonth: true },
      },
    ],
  },

  {
    id: "council-tax-support-offer",
    category: "bills",
    appliesTo: "benefit",
    trigger: TRIG.councilTaxOnlyIfOverdraft,
    subject: "Council Tax Support available",
    preview: "You may be eligible for help with Council Tax.",
    body: [
      "Based on your circumstances, you could apply for Council Tax Support to reduce monthly costs.",
    ],
    choices: [
      {
        id: "council-tax-support-offer-apply",
        label: "Apply for Council Tax Support",
        effects: { wellbeing: +2 },
        flags: { openCouncilTaxForm: true },
      },
      {
        id: "council-tax-support-offer-ignore",
        label: "Ignore for now",
        effects: { wellbeing: -1 },
        flags: { councilTaxFineNextMonth: true },
      },
    ],
  },

  {
    id: "boiler-service-due",
    category: "bills",
    appliesTo: ALL,
    trigger: ({ month, flags }) =>
      (month ?? 0) === 1 &&
      !flags?.boilerServiced &&
      !flags?.boilerReplaced &&
      !flags?.boilerBreakdownPlanned,
    subject: "Boiler service due",
    preview: "Servicing now could avoid a big bill later.",
    body: [
      "Your landlord reminds you the boiler is due a service. Paying now may prevent a future breakdown.",
    ],
    choices: [
      {
        id: "boiler-service-due-service",
        label: "Pay £80 for a boiler service",
        effects: { money: -80, wellbeing: +1 },
        flags: { boilerServiced: true },
      },
      {
        id: "boiler-service-due-skip",
        label: "Skip the service (risk future breakdown)",
        effects: { wellbeing: -1 },
        flags: { boilerBreakdownPlanned: true },
      },
    ],
  },

  {
    id: "boiler-breakdown",
    category: "bills",
    appliesTo: ALL,
 trigger: ({ month, flags }) =>
  (month ?? 0) >= 2 &&
  flags?.boilerBreakdownPlanned === true &&
  !flags?.boilerReplaced &&
  !flags?.boilerHeatersInstalled,

    subject: "Boiler has broken down",
    preview: "No hot water or heating.",
    body: ["Your boiler has broken down. You have no central heating or hot water."],
    choices: [
      {
        id: "boiler-breakdown-replace",
        label: "Pay £600 for a new boiler (safe, warm home)",
        effects: { money: -600, wellbeing: +2, health: +2 },
        flags: { boilerReplaced: true },
      },
      {
  id: "boiler-breakdown-heaters",
  label: "Buy electric heaters (£150) — heats rooms, but NO hot water",
  effects: { money: -150, wellbeing: -2 },
  flags: {
    boilerHeatersInstalled: true,        // ✅ prevents repeat breakdown email
    higherEnergyBillsNextMonth: true,    // ✅ keeps your later-bills mechanic
    boilerHotWaterStillBroken: true,     // ✅ optional: lets you reference this later if you want
  },
},

      {
        id: "boiler-breakdown-nothing",
        label: "Do nothing (very cold, risky)",
        effects: { wellbeing: -4, health: -6 },
        flags: { boilerBroken: true },
      },
    ],
  },

  {
    id: "overdraft-charges-explained",
    category: "bills",
    appliesTo: ALL,
    trigger: ({ balanceNow, flags }) =>
      (balanceNow ?? 0) < 0 && !flags?.overdraftExplained,
    subject: "Overdraft charges applied",
    preview: "Your account has gone below £0.",
    body: [
      "You’ve gone into your overdraft. Your bank charges £2 per day until your balance goes back above £0.",
    ],
    choices: [
      {
        id: "overdraft-charges-explained-clear",
        label: "Clear overdraft now (£14)",
        effects: { money: -14, wellbeing: +1 },
        flags: { overdraftExplained: true },
      },
      {
        id: "overdraft-charges-explained-wait",
        label: "Leave it and try to fix it next month",
        effects: { wellbeing: -3 },
        flags: { overdraftChargeNextMonth: true, overdraftExplained: true },
      },
    ],
  },

  {
    id: "overdraft-penalty-fee",
    category: "bills",
    appliesTo: ALL,
    trigger: ({ flags }) => flags?.overdraftChargeNextMonth === true,
    subject: "Overdraft penalty added (£25)",
    preview: "Last month’s overdraft was not cleared.",
    body: [
      "Your bank has applied a £25 penalty because your overdraft was not cleared last month.",
    ],
    choices: [
      {
        id: "overdraft-penalty-fee-ack",
        label: "Acknowledge the charge",
        effects: { money: -25 },
        flags: { overdraftChargeNextMonth: false },
      },
    ],
  },

  {
    id: "short-term-loan-offer",
    category: "bills",
    appliesTo: ALL,
    trigger: ({ balanceNow, month, flags }) =>
      (month ?? 0) >= 1 && (balanceNow ?? 0) < -50 && !flags?.loanPlanActive,
    subject: "Short-term loan offer (£200, repay £50 per month)",
    preview: "Need money urgently?",
    body: [
      "You are offered a loan of £200. You would repay £50 each month for 5 months.",
    ],
    choices: [
      {
        id: "short-term-loan-offer-accept",
        label: "Accept loan (£200 now, £50 per month)",
        effects: { money: +200, wellbeing: +1 },
        flags: { loanPlanActive: true, loanMonthsLeft: 5, loanMonthly: 50 },
      },
      { id: "short-term-loan-offer-decline", label: "Decline the loan", effects: { wellbeing: 0 } },
    ],
  },

  {
    id: "store-card-offer",
    category: "bills",
    appliesTo: ALL,
    trigger: ({ month, flags }) => {
  const m = Number(month ?? 0);

  // If they already have one, never offer again
  if (flags?.storeCardActive) return false;

  // First offer is month 2 unless we have scheduled a later re-offer
  const nextOffer = Number.isFinite(flags?.storeCardNextOfferMonth)
    ? Number(flags.storeCardNextOfferMonth)
    : 2;

  return m === nextOffer;
},

    subject: "Store card offer (limit £150)",
    preview: "Extra shopping budget – but at a cost.",
    body: [
      "A clothing store offers you a store card. You can spend up to £150. Minimum payment is £15 per month.",
    ],
    choices: [
      {
        id: "store-card-offer-accept",
        label: "Accept card (get £150 to spend)",
        effects: { money: +150 },
        flags: { storeCardActive: true, storeCardBalance: 150 },
      },
      {
        id: "store-card-offer-decline",
        label: "Decline – avoid extra debt",
        effects: { wellbeing: +1 },
      },
    ],
  },

  {
    id: "store-card-payment-due",
    category: "bills",
    appliesTo: ALL,
    trigger: ({ flags, month }) => {
  const m = Number(month ?? 0);
  const start = Number.isFinite(flags?.storeCardStartMonth)
    ? Number(flags.storeCardStartMonth)
    : 3; // fallback

  return flags?.storeCardActive === true && m >= start;
},

    subject: "Store card payment due (£15)",
    preview: "Your monthly store card bill has arrived.",
    body: ["Your store card minimum payment of £15 is due. Not paying will add a late fee."],
    choices: [
      { id: "store-card-payment-due-pay", label: "Pay minimum (£15)", effects: { money: -15, wellbeing: +1 } },
      { id: "store-card-payment-due-miss", label: "Miss payment (risk fees)", effects: { wellbeing: -3 }, flags: { storeCardLateFee: true } },
    ],
  },

  {
    id: "store-card-late-fee",
    category: "bills",
    appliesTo: ALL,
    trigger: ({ flags }) => flags?.storeCardLateFee === true,
    subject: "Store card late fee added (£25)",
    preview: "You missed last month’s minimum payment.",
    body: ["Because you missed last month’s store card payment, a £25 late fee has been added."],
    choices: [
      { id: "store-card-late-fee-ack", label: "Acknowledge the fee", effects: { money: -25 }, flags: { storeCardLateFee: false } },
    ],
  },

  // ---------------------------------------------------------
  // BENEFITS: JSA (Month 0 or 1 only)
  // ---------------------------------------------------------

  {
    id: "benefits-jsa-application",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ lifestyle, month, flags }) => {
      const life = (lifestyle || "").toLowerCase();
      if (!life.includes("benefit")) return false;

      const m = month ?? 0;
      if (m > 1) return false;

      if (flags?.jsa_form_submitted || flags?.jsa_decision_done) return false;
      return true;
    },
    subject: "Apply for Jobseeker’s Allowance",
    preview: "You may be able to get Jobseeker’s Allowance while looking for work.",
    body: [
      "You might be able to get Jobseeker’s Allowance (JSA).",
      "To apply, fill in the form and agree to look for jobs regularly.",
    ],
    choices: [
      {
        id: "benefits-jsa-application-open",
        label: "Open the Jobseeker’s Allowance form",
        effects: {},
        flags: { jsa_form_open: true },
        next: { type: "jsa-form" },
      },
      {
        id: "benefits-jsa-application-later",
        label: "Ignore for now",
        effects: { wellbeing: -1 },
      },
    ],
  },

  {
    id: "benefits-jsa-decision-good",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ lifestyle, flags }) => {
      const life = (lifestyle || "").toLowerCase();
      if (!life.includes("benefit")) return false;
      return (
        flags?.jsa_form_submitted === true &&
        flags?.jsa_form_quality === "good" &&
        !flags?.jsa_decision_done
      );
    },
    subject: "Jobseeker’s Allowance decision",
    preview: "Your Jobseeker’s Allowance has been awarded.",
    body: [
      "We received your Jobseeker’s Allowance form.",
      "Your claim has been awarded. Keep to your job search agreement to continue payments.",
    ],
    choices: [
      {
        id: "benefits-jsa-decision-good-ok",
        label: "OK",
        effects: { wellbeing: +3 },
        flags: { jsa_awarded: true, jsa_decision_done: true },
      },
    ],
  },

  {
    id: "benefits-jsa-decision-ok",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ lifestyle, flags }) => {
      const life = (lifestyle || "").toLowerCase();
      if (!life.includes("benefit")) return false;
      return (
        flags?.jsa_form_submitted === true &&
        flags?.jsa_form_quality === "ok" &&
        !flags?.jsa_decision_done
      );
    },
    subject: "Jobseeker’s Allowance decision",
    preview: "Your Jobseeker’s Allowance has been awarded with conditions.",
    body: [
      "We received your form.",
      "You must keep better records of job applications to avoid payments stopping.",
    ],
    choices: [
      {
        id: "benefits-jsa-decision-ok-ok",
        label: "OK",
        effects: { wellbeing: +1 },
        flags: { jsa_awarded: true, jsa_decision_done: true },
      },
    ],
  },

  {
    id: "benefits-jsa-decision-bad",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ lifestyle, flags }) => {
      const life = (lifestyle || "").toLowerCase();
      if (!life.includes("benefit")) return false;
      return (
        flags?.jsa_form_submitted === true &&
        flags?.jsa_form_quality === "bad" &&
        !flags?.jsa_decision_done
      );
    },
    subject: "Jobseeker’s Allowance decision – refused",
    preview: "Your claim has been refused.",
    body: [
      "Many key details were missing, so we cannot accept your claim right now.",
      "You can try again later with full information.",
    ],
    choices: [
      {
        id: "benefits-jsa-decision-bad-ok",
        label: "OK",
        effects: { wellbeing: -3 },
        flags: { jsa_awarded: false, jsa_decision_done: true },
      },
    ],
  },

  {
    id: "benefits-jsa-payment",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ lifestyle, flags }) =>
      (lifestyle || "").toLowerCase().includes("benefit") && flags?.jsa_awarded === true,
    subject: "Jobseeker’s Allowance payment received",
    preview: "Your Jobseeker’s Allowance has been paid into your bank.",
    body: [
      "Your regular JSA payment has been paid. Keep looking for work to continue receiving it.",
    ],
    choices: [{ id: "benefits-jsa-payment-ok", label: "OK", effects: { money: +320 } }],
  },

  // ---------------------------------------------------------
  // BENEFITS: UNIVERSAL CREDIT (Month 1 or 2 only)
  // ---------------------------------------------------------

  {
    id: "benefits-uc-housing-invite",
    category: "housing",
    appliesTo: "benefit",
    trigger: ({ lifestyle, month, flags }) => {
      const life = (lifestyle || "").toLowerCase();
      if (!life.includes("benefit")) return false;

      const m = month ?? 0;

      // ✅ Only Month 1 or 2 (Feb or Mar). Not Jan.
      if (m < 1 || m > 2) return false;

      // ❌ Don't show if already submitted or already decided
      if (flags?.uc_form_submitted || flags?.uc_decision_done) return false;

      return true;
    },
    subject: "Universal Credit: Housing Support",
    from: "DWP – Universal Credit",
    preview: "Apply now for rent help, council tax reduction and bills support.",
    body: [
      "Hi,",
      "You can apply for Universal Credit housing support.",
      "This can help with rent, council tax and some bills support.",
      "Open the form below and complete the key details.",
      "Thanks,",
      "Universal Credit Team",
    ],
    choices: [
      {
        id: "benefits-uc-housing-invite-open",
        label: "Open the Universal Credit housing form",
        effects: {},
        flags: { uc_form_open: true },
        next: { type: "uc_form" },
      },
      { id: "benefits-uc-housing-invite-later", label: "I will do this later", effects: {} },
    ],
  },

  {
    id: "uc-decision-success",
    category: "housing",
    appliesTo: "benefit",
    trigger: ({ lifestyle, month, flags }) => {
      const life = (lifestyle || "").toLowerCase();
      if (!life.includes("benefit")) return false;

      const due = Number(flags?.uc_decision_due_month ?? -1);
      if (due < 0) return false;

      return (
        (month ?? 0) === due &&
        flags?.uc_form_submitted === true &&
        flags?.uc_application_correct === true &&
        !flags?.uc_decision_done
      );
    },
    subject: "Universal Credit decision",
    from: "DWP – Universal Credit",
    preview: "Your Universal Credit housing support has been approved.",
    body: [
      "Good news — your Universal Credit housing support has been approved.",
      "Your payments will start from next month.",
    ],
    choices: [
      {
        id: "uc-decision-success-ok",
        label: "OK",
        effects: { wellbeing: +2 },
        flags: { uc_decision_done: true },
      },
    ],
  },

  {
    id: "uc-decision-unsuccessful",
    category: "housing",
    appliesTo: "benefit",
    trigger: ({ lifestyle, month, flags }) => {
      const life = (lifestyle || "").toLowerCase();
      if (!life.includes("benefit")) return false;

      const due = Number(flags?.uc_decision_due_month ?? -1);
      if (due < 0) return false;

      return (
        (month ?? 0) === due &&
        flags?.uc_form_submitted === true &&
        flags?.uc_application_correct === false &&
        !flags?.uc_decision_done
      );
    },
subject: "Universal Credit application unsuccessful",
from: "DWP – Universal Credit",
preview: "Errors were found in the amounts on your form.",
body: [
  "Hi,",
  "We checked your Universal Credit housing support form.",
  "Unfortunately, the amounts you entered did not match the bills we have on record.",
  "You can fill in the form again and resubmit.",
  "Thanks,",
  "Universal Credit Team",
],
choices: [
  {
    id: "uc_reapply",
    label: "Fill in the form again",
    effects: {},
    flags: {},
  },
  {
    id: "uc-decision-unsuccessful-ok",
    label: "OK",
    effects: { wellbeing: -1 },
    flags: { uc_decision_done: true },
  },
],
},   // ✅ THIS COMMA IS THE FIX

  {
    id: "uc-payment-received",
    category: "housing",
    appliesTo: "benefit",
    trigger: ({ lifestyle, flags }) => {
      const life = (lifestyle || "").toLowerCase();
      if (!life.includes("benefit")) return false;
      return Number(flags?.uc_monthly_amount || 0) > 0;
    },
    subject: "Universal Credit payment received",
    from: "DWP – Universal Credit",
    preview: "Your Universal Credit housing support has been paid.",
    body: [
      "Your Universal Credit payment has been paid into your bank.",
      "This will continue each month while you remain eligible.",
    ],
    choices: [{ id: "uc-payment-received-ok", label: "OK", effects: {} }],
  },

  // ---------------------------------------------------------
  // WORK SCENARIOS (PART TIME / FULL TIME)
  // ---------------------------------------------------------

  {
    id: "work-rotas-changed",
    category: "work",
    appliesTo: "full|part",
    trigger: ({ month, flags }) =>
      (month ?? 0) >= 1 && !flags?.rotasChangedShown && [2, 6, 9].includes(month),
    subject: "Your rota has changed",
    preview: "Your hours are different this month.",
    body: ["Your manager has changed the rota. Your hours might go up or down."],
    choices: [
      {
        id: "work-rotas-changed-ask-more",
        label: "Ask for more hours",
        effects: { wellbeing: -1 },
        flags: { rotasChangedShown: true, chanceExtraHours: true },
      },
      {
        id: "work-rotas-changed-accept",
        label: "Accept the changes",
        effects: { wellbeing: 0 },
        flags: { rotasChangedShown: true },
      },
    ],
  },

  {
    id: "work-payroll-mistake",
    category: "work",
    appliesTo: "full|part",
    trigger: ({ month, flags }) =>
      (month ?? 0) >= 2 && !flags?.payrollMistakeShown && Math.random() < 0.18,
    subject: "Payroll mistake: pay is late",
    preview: "Your pay will arrive next week instead.",
    body: ["Payroll says there has been an error and your pay will be delayed."],
    choices: [
      {
        id: "work-payroll-mistake-chase",
        label: "Chase payroll and manager",
        effects: { wellbeing: -1 },
        flags: { payrollMistakeShown: true },
      },
      {
        id: "work-payroll-mistake-wait",
        label: "Wait and manage carefully",
        effects: { wellbeing: -1 },
        flags: { payrollMistakeShown: true },
      },
    ],
  },

  {
    id: "work-training-offer",
    category: "work",
    appliesTo: "benefit|full|part",
    trigger: ({ month, flags }) =>
      (month ?? 0) >= 1 && !flags?.trainingOfferUsed && [1, 4, 7, 10].includes(month),
    subject: "Free training course offer",
    preview: "A short course could help you get better work.",
    body: ["A local provider offers a free short course (e.g. food safety, barista, warehouse)."],
    choices: [
      {
        id: "work-training-offer-join",
        label: "Join the course (takes time)",
        effects: { wellbeing: -1, health: +1 },
        flags: { trainingOfferUsed: true, trainingCompleted: true },
      },
      {
        id: "work-training-offer-decline",
        label: "Decline (too busy)",
        effects: { wellbeing: 0 },
        flags: { trainingOfferUsed: true },
      },
    ],
  },

  {
    id: "work-interview-invite",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ month, flags }) =>
      (month ?? 0) >= 2 &&
      [2, 5, 8, 11].includes(month) &&
      !flags?.interviewInviteUsed,
    subject: "Interview invitation",
    preview: "Chance to increase income.",
    body: ["A local employer has invited you for an interview."],
    choices: [
      {
        id: "work-interview-invite-attend",
        label: "Attend (costs £10 travel)",
        effects: { money: -10, wellbeing: +1 },
        flags: { interviewInviteUsed: true, chanceOfJobOffer: true },
      },
   {
  id: "work-interview-invite-clothes",
  label: "Buy interview clothes (open outfit builder)",
  effects: {},
  flags: {
    interviewInviteUsed: true,
    chanceOfJobOffer: true,      // ✅ important: this is “I’m going to the interview”
    interview_outfit_open: true, // ✅ opens the modal in Inbox
  },
},
      {
        id: "work-interview-invite-skip",
        label: "Skip the interview",
        effects: { wellbeing: -2 },
        flags: { interviewInviteUsed: true, missedInterview: true },
      },
    ],
  },
{
  id: "work-interview-feedback-attire",
  category: "work",
  appliesTo: "benefit",
  trigger: ({ month, flags }) => {
    const due = Number(flags?.interview_feedback_due_month ?? -1);
    if (due < 0) return false;

    return (
      (month ?? 0) === due &&
      flags?.interview_outfit_done === true &&
      flags?.interview_outfit_failed === true &&
      !flags?.interview_feedback_sent
    );
  },
  subject: "Interview feedback",
  from: "Recruitment Team",
  preview: "Thanks for attending — here is feedback from your interview.",
  body: [
    "Hi,",
    "Thanks for coming to interview with us.",
    "One key area to improve is dressing appropriately for an interview (smart, neat, and professional).",
    "We won’t be taking your application forward this time.",
    "You can try again next time — preparation really helps.",
    "Thanks,",
    "Recruitment Team",
  ],
  choices: [
    {
      id: "work-interview-feedback-attire-ok",
      label: "OK",
      effects: { wellbeing: -1 },
      flags: { interview_feedback_sent: true },
    },
  ],
},
  // ---------------------------------------------------------
  // INTERVIEW OUTFIT FEEDBACK (NEXT MONTH) — FAIL IF SCORE < 85
  // ---------------------------------------------------------

  {
    id: "interview-outfit-feedback-90",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ month, flags }) =>
      (month ?? 0) === Number(flags?.interview_outfit_feedback_due_month ?? -999) &&
      flags?.interview_outfit_failed === true &&
      !flags?.interview_outfit_feedback_sent &&
      Number(flags?.interview_outfit_score ?? 0) >= 90,
    subject: "Interview feedback",
    preview: "Feedback from the employer about your interview appearance.",
    body: [
      "Thanks for attending your interview.",
      "Your outfit looked very professional and made a great first impression.",
      "However, on this occasion you were not selected for the role for other reasons.",
      "Keep going — you’re close and you’re presenting yourself really well.",
    ],
    choices: [
      {
        id: "interview-outfit-feedback-90-ok",
        label: "OK",
        effects: {},
        flags: { interview_outfit_feedback_sent: true },
      },
    ],
  },

  {
    id: "interview-outfit-feedback-80",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ month, flags }) =>
      (month ?? 0) === Number(flags?.interview_outfit_feedback_due_month ?? -999) &&
      flags?.interview_outfit_failed === true &&
      !flags?.interview_outfit_feedback_sent &&
      Number(flags?.interview_outfit_score ?? 0) >= 80 &&
      Number(flags?.interview_outfit_score ?? 0) < 90,
    subject: "Interview feedback",
    preview: "Feedback from the employer about your interview appearance.",
    body: [
      "Thanks for attending your interview.",
      "Your outfit was mostly smart and tidy, which helped you look prepared.",
      "For future interviews, aim for a slightly more formal look to boost your impression.",
      "On this occasion you were not selected for the role.",
    ],
    choices: [
      {
        id: "interview-outfit-feedback-80-ok",
        label: "OK",
        effects: {},
        flags: { interview_outfit_feedback_sent: true },
      },
    ],
  },

  {
    id: "interview-outfit-feedback-70",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ month, flags }) =>
      (month ?? 0) === Number(flags?.interview_outfit_feedback_due_month ?? -999) &&
      flags?.interview_outfit_failed === true &&
      !flags?.interview_outfit_feedback_sent &&
      Number(flags?.interview_outfit_score ?? 0) >= 70 &&
      Number(flags?.interview_outfit_score ?? 0) < 80,
    subject: "Interview feedback",
    preview: "Feedback from the employer about your interview appearance.",
    body: [
      "Thanks for attending your interview.",
      "Your outfit was a bit mixed — some items were suitable, but some looked too casual.",
      "Next time, try a smarter top and shoes to look more interview-ready.",
      "On this occasion you were not selected for the role.",
    ],
    choices: [
      {
        id: "interview-outfit-feedback-70-ok",
        label: "OK",
        effects: {},
        flags: { interview_outfit_feedback_sent: true },
      },
    ],
  },

  {
    id: "interview-outfit-feedback-60",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ month, flags }) =>
      (month ?? 0) === Number(flags?.interview_outfit_feedback_due_month ?? -999) &&
      flags?.interview_outfit_failed === true &&
      !flags?.interview_outfit_feedback_sent &&
      Number(flags?.interview_outfit_score ?? 0) >= 60 &&
      Number(flags?.interview_outfit_score ?? 0) < 70,
    subject: "Interview feedback",
    preview: "Feedback from the employer about your interview appearance.",
    body: [
      "Thanks for attending your interview.",
      "Your outfit looked quite casual for an interview setting.",
      "Try to aim for smart trousers or a smart skirt, and smart shoes next time.",
      "On this occasion you were not selected for the role.",
    ],
    choices: [
      {
        id: "interview-outfit-feedback-60-ok",
        label: "OK",
        effects: {},
        flags: { interview_outfit_feedback_sent: true },
      },
    ],
  },

  {
    id: "interview-outfit-feedback-50",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ month, flags }) =>
      (month ?? 0) === Number(flags?.interview_outfit_feedback_due_month ?? -999) &&
      flags?.interview_outfit_failed === true &&
      !flags?.interview_outfit_feedback_sent &&
      Number(flags?.interview_outfit_score ?? 0) >= 50 &&
      Number(flags?.interview_outfit_score ?? 0) < 60,
    subject: "Interview feedback",
    preview: "Feedback from the employer about your interview appearance.",
    body: [
      "Thanks for attending your interview.",
      "Your outfit was not suitable for an interview — it looked too casual.",
      "For next time, choose a smart top, smart bottoms and smart shoes.",
      "On this occasion you were not selected for the role.",
    ],
    choices: [
      {
        id: "interview-outfit-feedback-50-ok",
        label: "OK",
        effects: {},
        flags: { interview_outfit_feedback_sent: true },
      },
    ],
  },

  {
    id: "interview-outfit-feedback-low",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ month, flags }) =>
      (month ?? 0) === Number(flags?.interview_outfit_feedback_due_month ?? -999) &&
      flags?.interview_outfit_failed === true &&
      !flags?.interview_outfit_feedback_sent &&
      Number(flags?.interview_outfit_score ?? 0) < 50,
    subject: "Interview feedback",
    preview: "Feedback from the employer about your interview appearance.",
    body: [
      "Thanks for attending your interview.",
      "Your outfit was far too casual for an interview and gave a poor first impression.",
      "For next time, aim for a formal top, formal bottoms, and smart shoes.",
      "On this occasion you were not selected for the role.",
    ],
    choices: [
      {
        id: "interview-outfit-feedback-low-ok",
        label: "OK",
        effects: {},
        flags: { interview_outfit_feedback_sent: true },
      },
    ],
  },




  // ---------------------------------------------------------
  // BENEFITS COMPLIANCE (SANCTION RISK)
  // ---------------------------------------------------------

  {
    id: "benefits-jobcentre-appointment",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ month, flags }) =>
      (month ?? 0) >= 2 && !flags?.jobcentreAppointmentDone && Math.random() < 0.22,
    subject: "Jobcentre appointment",
    preview: "You must attend to keep your benefit agreement.",
    body: ["You have an appointment with your work coach."],
    choices: [
      {
        id: "benefits-jobcentre-appointment-attend",
        label: "Attend on time",
        effects: { wellbeing: -1 },
        flags: { jobcentreAppointmentDone: true },
      },
      {
        id: "benefits-jobcentre-appointment-miss",
        label: "Miss the appointment",
        effects: { wellbeing: -3 },
        flags: { jobcentreAppointmentDone: true, sanctionRisk: true },
      },
    ],
  },

  {
    id: "benefits-sanction-warning",
    category: "work",
    appliesTo: "benefit",
    trigger: ({ flags }) => flags?.sanctionRisk === true && !flags?.sanctionWarningShown,
    subject: "Warning: your payments could be stopped",
    preview: "You missed required job search activities.",
    body: [
      "You missed an activity in your claimant agreement. If this happens again, your payment may be reduced or stopped.",
    ],
    choices: [
      {
        id: "benefits-sanction-warning-ack",
        label: "OK, I will improve",
        effects: { wellbeing: -1 },
        flags: { sanctionWarningShown: true },
      },
    ],
  },

  // ---------------------------------------------------------
  // TRANSPORT
  // ---------------------------------------------------------

  {
    id: "transport-strike",
    category: "transport",
    appliesTo: ALL,
    trigger: ({ month, flags }) =>
      (month ?? 0) >= 1 && !flags?.strikeThisMonth && [1, 4, 8].includes(month),
    subject: "Bus strike announced",
    preview: "Travel disruption for a week.",
    body: ["Buses will be off this week. How do you travel instead?"],
    choices: [
      {
        id: "transport-strike-walk",
        label: "Walk more where possible",
        effects: { health: +1, wellbeing: -1 },
        flags: { strikeThisMonth: true },
      },
      {
        id: "transport-strike-taxi",
        label: "Use taxis more",
        effects: { money: -30 },
        flags: { strikeThisMonth: true },
      },
    ],
  },

  // ---------------------------------------------------------
  // SOCIAL / HEALTH
  // ---------------------------------------------------------


  {
    id: "social-birthday-night",
    channel: "phone",
    category: "social",
    appliesTo: ALL,
    trigger: ({ month }) => (month ?? 0) >= 1 && [1, 2, 5, 9].includes(month),
    subject: "Friend’s birthday night out",
    preview: "Celebrate or save?",
    body: ["Your friends invited you out to celebrate."],
    choices: [
      { id: "social-birthday-night-go", label: "Go out (£30)", effects: { money: -30, wellbeing: +5 } },
      { id: "social-birthday-night-skip", label: "Skip the night out", effects: { wellbeing: -3 } },
    ],
  },

  {
    id: "health-cheap-gym-offer",
    category: "health",
    appliesTo: ALL,
    trigger: ({ month, flags }) => [2, 5, 9].includes(month ?? -1) && !flags?.gymMembership,
    subject: "Low-cost gym membership offer (£20 per month)",
    preview: "Could this help your health?",
    body: ["A local gym offers you a £20 per month deal."],
    choices: [
      {
        id: "health-cheap-gym-offer-join",
        label: "Join the gym",
        effects: { money: -20, health: +3, wellbeing: +2 },
        flags: { gymMembership: true },
      },
      { id: "health-cheap-gym-offer-decline", label: "Decline", effects: { wellbeing: 0 } },
    ],
  },

  // ---------------------------------------------------------
  // FOOD / LOW BUDGET
  // ---------------------------------------------------------

  {
    id: "food-budget-squeeze",
    category: "food",
    appliesTo: ALL,
    trigger: ({ month, balanceAfterBills }) =>
      (month ?? 0) >= 1 && (balanceAfterBills ?? 9999) < 100,
    subject: "Food budget is tight",
    preview: "You may need to adjust your food spending this month.",
    body: ["After bills, there isn’t much money left for food and extras."],
    choices: [
      {
        id: "food-budget-squeeze-cheaper",
        label: "Switch to cheaper meals",
        effects: { money: +40, health: -1, wellbeing: -1 },
      },
      {
        id: "food-budget-squeeze-overdraft",
        label: "Dip into overdraft",
        effects: { money: +40, wellbeing: -2 },
      },
    ],

    
  },
  // -------------------------
// LATE-YEAR INBOX PACK (Aug–Dec feel)
// Month index: 0 = Month 1 (Jan), so:
// 6 ~ July, 7 ~ Aug, 8 ~ Sep, 9 ~ Oct, 10 ~ Nov, 11 ~ Dec
// -------------------------

{
  id: "life-energy-price-update-m7",
  channel: "inbox",
  category: "bills",
  appliesTo: "all",
  scheduledOnly: true,
  trigger: ({ month }) => month === 7,
  from: "Yorkshire Gas",
  subject: "Energy price update",
  preview: "Your unit rate is changing next month. Check your usage.",
  body: [
    "Hi,",
    "We’re writing to let you know your energy unit rate will change next month.",
    "Small changes can help: turn lights off, shorter showers, and use appliances efficiently.",
    "You can also check if you are on the best tariff.",
    "",
    "Thanks,",
    "Yorkshire Gas Team",
  ],
  choices: [
    { id: "energy-ok", label: "OK", effects: {} },
  ],
},

{
  id: "life-mobile-contract-renewal-m8",
  channel: "inbox",
  category: "bills",
  appliesTo: "all",
  scheduledOnly: true,
  trigger: ({ month }) => month === 8,
  from: "Mobile Network",
  subject: "Your phone contract is ending soon",
  preview: "Choose a plan: cheaper data or keep the same.",
  body: [
    "Hi,",
    "Your phone contract is ending soon.",
    "You can choose a cheaper plan with less data, or keep a bigger plan for the same features.",
    "Think about how much you actually use your phone each month.",
    "",
    "Thanks,",
    "Customer Team",
  ],
  choices: [
    {
      id: "phone-plan-cheaper",
      label: "Switch to cheaper plan",
      effects: { money: +25, wellbeing: -2 }, // saves money, minor inconvenience
    },
    {
      id: "phone-plan-keep",
      label: "Keep the same plan",
      effects: { money: 0, wellbeing: 0 },
    },
  ],
},

{
  id: "life-unexpected-dentist-m9",
  channel: "inbox",
  category: "health",
  appliesTo: "all",
  scheduledOnly: true,
  trigger: ({ month }) => month === 9,
  from: "Springfield Dental",
  subject: "Appointment available: urgent check-up",
  preview: "You reported tooth pain. Do you book an appointment?",
  body: [
    "Hi,",
    "An urgent check-up appointment is available this week.",
    "Booking helps prevent bigger problems later, but it can cost money.",
    "",
    "Thanks,",
    "Springfield Dental",
  ],
  choices: [
    {
      id: "dentist-book",
      label: "Book appointment",
      effects: { money: -45, health: +10, wellbeing: +4 },
    },
    {
      id: "dentist-ignore",
      label: "Ignore it for now",
      effects: { money: 0, health: -8, wellbeing: -4 },
    },
  ],
},

{
  id: "life-bank-balance-check-m9",
  channel: "inbox",
  category: "banking",
  appliesTo: "all",
  scheduledOnly: true,
  trigger: ({ month }) => month === 9,
  from: "Powerhouse Banking",
  subject: "Quick reminder: check your transactions",
  preview: "Spotting problems early helps you stay in control.",
  body: [
    "Hi,",
    "Quick reminder: checking your transactions each month helps you spot problems early.",
    "Look for payments you don’t recognise, and report them straight away.",
    "",
    "Thanks,",
    "Powerhouse Banking Team",
  ],
  choices: [{ id: "bank-check-ok", label: "OK", effects: {} }],
},

{
  id: "life-streaming-price-rise-m10",
  channel: "inbox",
  category: "bills",
  appliesTo: "all",
  scheduledOnly: true,
  trigger: ({ month }) => month === 10,
  from: "StreamFlix",
  subject: "Subscription price change",
  preview: "Your subscription is increasing next month.",
  body: [
    "Hi,",
    "Your subscription price is increasing next month.",
    "You can keep your plan, switch to a cheaper plan, or cancel.",
    "",
    "Thanks,",
    "StreamFlix Team",
  ],
  choices: [
    { id: "stream-switch", label: "Switch to cheaper plan", effects: { money: +15, wellbeing: -1 } },
    { id: "stream-keep", label: "Keep subscription", effects: { money: 0, wellbeing: 0 } },
    { id: "stream-cancel", label: "Cancel subscription", effects: { money: +25, wellbeing: -3 } },
  ],
},

{
  id: "life-winter-heating-tips-m10",
  channel: "inbox",
  category: "bills",
  appliesTo: "all",
  scheduledOnly: true,
  trigger: ({ month }) => month === 10,
  from: "Yorkshire Gas",
  subject: "Winter heating tips",
  preview: "Small changes can reduce your bill in colder months.",
  body: [
    "Hi,",
    "As the weather gets colder, heating costs can rise.",
    "Tips: close curtains at night, wear a warm layer, and use heating for shorter bursts.",
    "If you are struggling, speak to your provider early.",
    "",
    "Thanks,",
    "Yorkshire Gas Team",
  ],
  choices: [{ id: "heating-ok", label: "OK", effects: { wellbeing: +1 } }],
},

{
  id: "work-seasonal-overtime-offer-m10",
  channel: "inbox",
  category: "work",
  appliesTo: "part|full", // not for benefits lifestyle
  scheduledOnly: true,
  trigger: ({ month }) => month === 10,
  from: "Shift Planner",
  subject: "Seasonal overtime available",
  preview: "Extra shifts are available this month. Do you take them?",
  body: [
    "Hi,",
    "Extra shifts are available this month due to seasonal demand.",
    "Taking overtime increases your pay, but it can reduce free time.",
    "",
    "Thanks,",
    "Shift Planner",
  ],
  choices: [
    { id: "overtime-yes", label: "Take overtime shifts", effects: { money: +80, wellbeing: -4, health: -2 } },
    { id: "overtime-no", label: "No overtime this month", effects: { money: 0, wellbeing: 0 } },
  ],
},

{
  id: "work-performance-checkin-m11",
  channel: "inbox",
  category: "work",
  appliesTo: "part|full", // not for benefits lifestyle
  scheduledOnly: true,
  trigger: ({ month }) => month === 11,
  from: "Line Manager",
  subject: "Quick work check-in",
  preview: "How are you finding your shift routine?",
  body: [
    "Hi,",
    "Quick check-in: how are you finding your shift routine?",
    "If anything is difficult (travel, timing, workload), it’s okay to ask for support.",
    "",
    "Thanks,",
    "Line Manager",
  ],
  choices: [
    { id: "work-ask-support", label: "Ask for support", effects: { wellbeing: +4 } },
    { id: "work-all-good", label: "All good", effects: { wellbeing: +1 } },
  ],
},

{
  id: "life-community-discount-m11",
  channel: "inbox",
  category: "general",
  appliesTo: "all",
  scheduledOnly: true,
  trigger: ({ month }) => month === 11,
  from: "Local Leisure Centre",
  subject: "Winter activities offer",
  preview: "A cheaper activity pass is available this month.",
  body: [
    "Hi,",
    "A discounted activity pass is available this month.",
    "Regular activity can help health and well-being, but it costs money.",
    "",
    "Thanks,",
    "Local Leisure Centre",
  ],
  choices: [
    { id: "leisure-pass-buy", label: "Buy the pass", effects: { money: -20, health: +6, wellbeing: +6 } },
    { id: "leisure-pass-skip", label: "Skip for now", effects: { money: 0, wellbeing: -1 } },
  ],
},

{
  id: "life-end-of-year-review-m11",
  channel: "inbox",
  category: "general",
  appliesTo: "all",
  scheduledOnly: true,
  trigger: ({ month }) => month === 11,
  from: "Powerhouse Coach",
  subject: "End of year check-in",
  preview: "A quick review of how you managed money, health and well-being.",
  body: [
    "Hi,",
    "You’ve reached the end of the year.",
    "Take a moment to check your money, health and well-being bars.",
    "Think about one thing you did well, and one thing you would change next time.",
    "",
    "Thanks,",
    "Powerhouse Coach",
  ],
  choices: [{ id: "year-review-ok", label: "OK", effects: { wellbeing: +2 } }],
},
{
  id: "gp-checkup-m5",
  channel: "inbox",
  category: "health",
  appliesTo: "all",
  scheduledOnly: true,
  trigger: ({ month }) => month === 5,
  from: "Springfield GP Surgery",
  subject: "Check-up appointment reminder",
  preview: "A simple check-up is available this month.",
  body: [
    "Hi,",
    "A simple check-up appointment is available this month.",
    "If you attend, it can help you stay on track.",
    "",
    "Thanks,",
    "Springfield GP Surgery",
  ],
  choices: [
    { id: "gp-go", label: "Go to the check-up", effects: { health: +1, wellbeing: +1 }, flags: {} },
    { id: "gp-skip", label: "Don’t go", effects: { health: -1, wellbeing: -1 }, flags: {} },
  ],
},

{
  id: "gp-checkup-m8",
  channel: "inbox",
  category: "health",
  appliesTo: "all",
  scheduledOnly: true,
  trigger: ({ month }) => month === 8,
  from: "Springfield GP Surgery",
  subject: "Check-up appointment reminder",
  preview: "A simple check-up is available this month.",
  body: [
    "Hi,",
    "A simple check-up appointment is available this month.",
    "If you attend, it can help you stay on track.",
    "",
    "Thanks,",
    "Springfield GP Surgery",
  ],
  choices: [
    { id: "gp-go", label: "Go to the check-up", effects: { health: +1, wellbeing: +1 }, flags: {} },
    { id: "gp-skip", label: "Don’t go", effects: { health: -1, wellbeing: -1 }, flags: {} },
  ],
},

  // ---------------------------------------------------------
// JOB AGENCY + JOB CHANGE FLOW (Inbox)
// appliesTo: parttime|fulltime
// Job board email at months 4 and 9
// ---------------------------------------------------------

{
  id: "jobs-agency-new-listings-m4",
  channel: "inbox",
  category: "work",
  appliesTo: "part|full",
  scheduledOnly: true,
  trigger: ({ month, flags }) =>
    month === 4 &&
    !flags?.job_application_active &&
    !flags?.job_offer_pending,
  from: "Springfield Job Agency",
  subject: "New jobs added to our platform",
  preview: "We’ve added new vacancies. View jobs and apply online.",
  body: [
    "Hi,",
    "We’ve added new vacancies you may be interested in.",
    "Pay is shown per hour and hours per week.",
    "Click below to view jobs on our Job Board.",
  ],
  choices: [
    {
      id: "open-job-board",
      label: "View jobs on Job Board",
      flags: { job_board_open: true },
      effects: {},
    },
  ],
},

{
  id: "jobs-agency-new-listings-m9",
  channel: "inbox",
  category: "work",
  appliesTo: "part|full",
  scheduledOnly: true,
  trigger: ({ month, flags }) =>
    month === 9 &&
    !flags?.job_application_active &&
    !flags?.job_offer_pending,
  from: "Springfield Job Agency",
  subject: "More jobs available this month",
  preview: "New roles just added. View jobs and apply online.",
  body: [
    "Hi,",
    "More roles have been added this month.",
    "Pay is shown per hour and hours per week.",
    "Click below to view jobs on our Job Board.",
  ],
  choices: [
    {
      id: "open-job-board-2",
      label: "View jobs on Job Board",
      flags: { job_board_open: true },
      effects: {},
    },
  ],
},

{
  id: "work-interview-invite-job",
  channel: "inbox",
  category: "work",
  appliesTo: "part|full",
  scheduledOnly: true,
  trigger: ({ month, flags }) => {
    const appliedMonth = Number(flags?.job_applied_month);
    return (
      flags?.job_application_active &&
      Number.isFinite(appliedMonth) &&
      month === appliedMonth + 1
    );
  },
  from: "Springfield Job Agency",
  subject: "Interview invitation",
  preview: "Good news — the employer would like to meet you.",
  body: [
    "Hi,",
    "Good news — the employer would like to invite you to an interview.",
    "Make sure you have appropriate interview clothes ready.",
  ],
  choices: [
    {
      id: "buy-interview-clothes",
      label: "Get interview clothes",
      flags: { interview_outfit_open: true },
      effects: {},
    },
    {
      id: "skip-interview",
      label: "Skip the interview",
      flags: { job_application_active: false, job_applied_month: null },
      effects: {},
    },
  ],
},

{
  id: "work-job-offer",
  channel: "inbox",
  category: "work",
  appliesTo: "part|full",
  scheduledOnly: true,
  trigger: ({ month, flags }) => {
    const appliedMonth = Number(flags?.job_applied_month);
    return (
      flags?.job_application_active &&
      !flags?.interview_outfit_failed &&
      flags?.interview_outfit_done === true &&
      Number.isFinite(appliedMonth) &&
      month === appliedMonth + 2
    );
  },
  from: "Springfield Job Agency",
  subject: "Job offer",
  preview: "Congratulations — you’ve been offered the role.",
  body: [
    "Hi,",
    "Congratulations — you’ve been offered the role.",
    "If you accept, your monthly pay will change from next month.",
  ],
  choices: [
    {
      id: "accept-job",
      label: "Accept the job",
      flags: (/* populated in reducer */) => ({}),
      effects: {},
    },
    {
      id: "decline-job",
      label: "Decline the job",
      flags: { job_application_active: false },
      effects: {},
    },
  ],
},

];
