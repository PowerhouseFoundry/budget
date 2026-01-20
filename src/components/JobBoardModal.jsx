// src/components/JobBoardModal.jsx
import { useMemo, useState } from "react";
import "../styles/jobBoardModal.css";

function pounds(n) {
  const x = Number(n || 0);
  return `£${x.toFixed(2)}`;
}

function monthlyPay(payPerHour, hoursPerWeek) {
  // game logic: hourly * hours/week * 4.5 weeks/month
  return Number(payPerHour) * Number(hoursPerWeek) * 4.5;
}

const PART_TIME_JOBS = [
  {
    id: "pt-barista",
    title: "Cafe Barista",
    company: "Loft Coffee",
    location: "Local area",
    payPerHour: 10.5,
    hoursPerWeek: 18,
    responsibilities: [
      "Make hot and cold drinks",
      "Serve customers politely",
      "Keep the counter clean and tidy",
      "Restock cups, milk and supplies",
      "Use the till and take payments",
    ],
    tags: ["Immediate start", "Training provided"],
  },
  {
    id: "pt-waiter",
    title: "Waiter / Waitress",
    company: "City Grill",
    location: "Local area",
    payPerHour: 11.0,
    hoursPerWeek: 20,
    responsibilities: [
      "Welcome customers and take orders",
      "Carry food and drinks safely",
      "Clear tables and reset for new guests",
      "Use a tablet/till for orders",
      "Work as part of a team",
    ],
    tags: ["Evenings", "Busy shifts"],
  },
  {
    id: "pt-kitchen",
    title: "Kitchen Assistant",
    company: "Grumpies",
    location: "Local area",
    payPerHour: 10.25,
    hoursPerWeek: 17,
    responsibilities: [
      "Wash up and keep the kitchen clean",
      "Help prep simple food",
      "Put deliveries away correctly",
      "Take rubbish out safely",
      "Follow food hygiene rules",
    ],
    tags: ["Back of house", "Team role"],
  },
  {
    id: "pt-warehouse",
    title: "Warehouse Operative",
    company: "Amazon",
    location: "Local area",
    payPerHour: 12.0,
    hoursPerWeek: 19,
    responsibilities: [
      "Pick items using a list/scanner",
      "Pack orders neatly and label parcels",
      "Move stock safely (trolleys/cages)",
      "Keep aisles clear and tidy",
      "Follow safe lifting rules",
    ],
    tags: ["Day shifts", "On your feet"],
  },
  {
    id: "pt-bartender",
    title: "Bar Team Member",
    company: "Springfield Bar & Lounge",
    location: "Local area",
    payPerHour: 11.5,
    hoursPerWeek: 18,
    responsibilities: [
      "Serve drinks and take payments",
      "Wash glasses and keep bar clean",
      "Restock fridges and shelves",
      "Speak politely to customers",
      "Follow age-check rules with a supervisor",
    ],
    tags: ["Weekends", "Customer service"],
  },
  {
    id: "pt-cleaner",
    title: "Cleaner",
    company: "CleanRight Services",
    location: "Local area",
    payPerHour: 10.75,
    hoursPerWeek: 16,
    responsibilities: [
      "Vacuum, mop and wipe surfaces",
      "Clean toilets and washrooms",
      "Empty bins and replace liners",
      "Use cleaning products safely",
      "Follow a checklist to finish tasks",
    ],
    tags: ["Early starts", "Checklist"],
  },
];

const FULL_TIME_JOBS = [
  {
    id: "ft-warehouse",
    title: "Warehouse Operative",
    company: "Amazon",
    location: "Local area",
    payPerHour: 12.0,
    hoursPerWeek: 28,
    responsibilities: [
      "Pick items using a scanner",
      "Pack orders and print labels",
      "Move stock safely",
      "Keep work area organised",
      "Follow safe lifting rules",
    ],
    tags: ["Full-time hours", "Fast-paced"],
  },
  {
    id: "ft-kitchen",
    title: "Kitchen Assistant",
    company: "Wagamama",
    location: "Local area",
    payPerHour: 10.5,
    hoursPerWeek: 30,
    responsibilities: [
      "Keep kitchen stations clean",
      "Support food prep tasks",
      "Wash up and tidy equipment",
      "Put deliveries away correctly",
      "Follow food hygiene rules",
    ],
    tags: ["Full-time hours", "Busy kitchen"],
  },
  {
    id: "ft-waiter",
    title: "Waiter / Waitress",
    company: "City Grill",
    location: "Local area",
    payPerHour: 11.0,
    hoursPerWeek: 29,
    responsibilities: [
      "Welcome customers and take orders",
      "Carry food and drinks safely",
      "Clear tables and reset",
      "Use a tablet/till for orders",
      "Work as part of a team",
    ],
    tags: ["Full-time hours", "Customer-facing"],
  },
  {
    id: "ft-bartender",
    title: "Bar Team Member",
    company: "Springfield Bar & Lounge",
    location: "Local area",
    payPerHour: 11.75,
    hoursPerWeek: 27,
    responsibilities: [
      "Serve drinks and take payments",
      "Keep bar area clean and stocked",
      "Wash glasses and tidy",
      "Customer service and teamwork",
      "Follow age-check rules with a supervisor",
    ],
    tags: ["Evenings", "Weekends"],
  },
  {
    id: "ft-cleaner",
    title: "Cleaner",
    company: "CleanRight Services",
    location: "Local area",
    payPerHour: 10.25,
    hoursPerWeek: 28,
    responsibilities: [
      "Clean rooms and shared areas",
      "Vacuum, mop and wipe surfaces",
      "Empty bins and refill supplies",
      "Use cleaning products safely",
      "Follow a checklist to finish tasks",
    ],
    tags: ["Reliable hours", "Checklist"],
  },
  {
    id: "ft-barista",
    title: "Cafe Barista",
    company: "Loft Coffee",
    location: "Local area",
    payPerHour: 10.75,
    hoursPerWeek: 27,
    responsibilities: [
      "Make hot and cold drinks",
      "Serve customers and take payments",
      "Keep the counter clean",
      "Restock supplies",
      "Work calmly during busy times",
    ],
    tags: ["Full-time hours", "Training provided"],
  },
];

export default function JobBoardModal({ open, lifestyle, onClose, onApply }) {
  const [selectedId, setSelectedId] = useState(null);

  const jobs = useMemo(() => {
    const life = String(lifestyle || "").toLowerCase();
    if (life.includes("part")) return PART_TIME_JOBS;
    if (life.includes("full")) return FULL_TIME_JOBS;
    return [];
  }, [lifestyle]);

  const selected = useMemo(
    () => jobs.find((j) => j.id === selectedId) || null,
    [jobs, selectedId]
  );

  if (!open) return null;

  return (
    <div className="jb-backdrop" role="dialog" aria-modal="true" aria-label="Job Board">
      <div className="jb-modal">
<div className="jb-head">
  <div className="jb-head-left">
    <img
      src="/images/indeed-logo.jpg"
      alt="Indeed"
      className="jb-indeed-logo"
    />
    <div>
      <h2 className="jb-title">Job Board</h2>
      <div className="jb-sub">Choose one job to apply for.</div>
    </div>
  </div>

          <button className="jb-close" type="button" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="jb-body">
          {/* Left: job list (Indeed-style) */}
          <div className="jb-list">
            {jobs.map((j) => (
              <button
                key={j.id}
                type="button"
                className={"jb-card" + (j.id === selectedId ? " is-active" : "")}
                onClick={() => setSelectedId(j.id)}
              >
                <div className="jb-row">
                  <div className="jb-jobtitle">{j.title}</div>
                  <div className="jb-pay">
                    {pounds(j.payPerHour)}/hr • {j.hoursPerWeek} hrs/wk
                  </div>
                </div>
                <div className="jb-company">{j.company} • {j.location}</div>
                <ul className="jb-snippet">
                  {j.responsibilities.slice(0, 3).map((t, idx) => (
                    <li key={idx}>{t}</li>
                  ))}
                </ul>
                <div className="jb-tags">
                  {j.tags?.slice(0, 2).map((t) => (
                    <span key={t} className="jb-tag">{t}</span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          {/* Right: details */}
          <div className="jb-detail">
            {!selected ? (
              <div className="jb-empty">Select a job to view details.</div>
            ) : (
              <>
                <div className="jb-detail-top">
                  <div className="jb-detail-title">{selected.title}</div>
                  <div className="jb-detail-company">{selected.company} • {selected.location}</div>
                  <div className="jb-detail-pay">
                    {pounds(selected.payPerHour)}/hour • {selected.hoursPerWeek} hours per week
                  </div>
                </div>

                <div className="jb-section">
                  <div className="jb-section-h">Responsibilities</div>
                  <ul className="jb-bullets">
                    {selected.responsibilities.map((t, idx) => (
                      <li key={idx}>{t}</li>
                    ))}
                  </ul>
                </div>

            

                <div className="jb-actions">
                  <button
                    type="button"
                    className="jb-apply"
                    onClick={() => {
                      const monthly = monthlyPay(selected.payPerHour, selected.hoursPerWeek);
                      onApply?.({
                        jobId: selected.id,
                        title: selected.title,
                        company: selected.company,
                        payPerHour: selected.payPerHour,
                        hoursPerWeek: selected.hoursPerWeek,
                        monthlyPay: monthly,
                      });
                    }}
                  >
                    ▶ Apply for this job
                  </button>
                  <button type="button" className="jb-cancel" onClick={onClose}>
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
