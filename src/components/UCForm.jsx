import { useMemo, useState } from "react";

function num(x) {
  const s = String(x ?? "").replace(/[^\d.]/g, "");
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export default function UCForm({ onSubmit }) {
  const [attempted, setAttempted] = useState(false);

  const [v, setV] = useState({
    fullName: "",
    dob: "",
    address: "",
    postcode: "",
    rentMonthly: "",
    councilTaxMonthly: "",
    utilitiesMonthly: "", // ✅ gas+electric+water combined (ONE field)
    confirmTruth: false,
    ageBand: "25plus",
  });

  const required = [
    "fullName",
    "dob",
    "address",
    "postcode",
    "rentMonthly",
    "councilTaxMonthly",
    "utilitiesMonthly",
    "confirmTruth",
  ];

  const missing = useMemo(() => {
    const m = [];
    for (const k of required) {
      const val = v[k];
      if (k === "confirmTruth") {
        if (!val) m.push(k);
      } else if (!String(val ?? "").trim()) {
        m.push(k);
      }
    }
    return m;
  }, [v]);

  const isMissing = (key) => attempted && missing.includes(key);
  const canSubmit = missing.length === 0;

  // UC standard allowance (monthly baseline) – simplified for the game
  const STANDARD_UNDER_25 = 316.98;
  const STANDARD_25_PLUS = 400.14;

  const award = useMemo(() => {
    const rent = num(v.rentMonthly);
    const ctax = num(v.councilTaxMonthly);
    const util = num(v.utilitiesMonthly);

    const standard = v.ageBand === "under25" ? STANDARD_UNDER_25 : STANDARD_25_PLUS;

    const rentCap = 600;
    const eligibleRent = Math.min(rent, rentCap);
    const housing = Math.round(eligibleRent * 0.8);

    const ctr = Math.min(Math.round(ctax * 0.75), 140);
    const billsHelp = Math.min(Math.round(util * 0.25), 60);

    const monthlyTotal = Math.round(standard + housing + ctr + billsHelp);

    return {
      standard: Math.round(standard),
      housing,
      councilTaxReduction: ctr,
      billsHelp,
      monthlyTotal,
    };
  }, [v]);

  const setField = (k, val) => setV((p) => ({ ...p, [k]: val }));

  const submit = (e) => {
    e.preventDefault();
    setAttempted(true);
    if (!canSubmit) return;
    onSubmit?.({ values: v, award });
  };

  const inputStyle = (key) => ({
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: isMissing(key) ? "2px solid #c0392b" : "1px solid #cfd7df",
  });

  const labelTitle = (label, key) => (
    <div style={{ fontWeight: 700 }}>
      {label}{" "}
      {isMissing(key) && <span style={{ color: "#c0392b", fontWeight: 900 }}>*</span>}
    </div>
  );

  return (
    <div style={{ marginTop: 16 }}>
      <div style={{ border: "1px solid #cfd7df", borderRadius: 12, overflow: "hidden", background: "#fff" }}>
        <div style={{ background: "#1d70b8", color: "#fff", padding: "12px 14px" }}>
          <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>
            Universal Credit – Housing Support (Simplified)
          </div>
          <div style={{ opacity: 0.95, fontSize: "0.95rem" }}>
            Fill in the key details to unlock housing help.
          </div>
        </div>

        <form onSubmit={submit} style={{ padding: 14 }}>
          {!canSubmit && attempted && (
            <div style={{ background: "#fff4f4", border: "1px solid #f1b0b7", borderRadius: 10, padding: 10, marginBottom: 12 }}>
              <div style={{ fontWeight: 800 }}>Missing required fields:</div>
              <div style={{ fontSize: "0.95rem" }}>{missing.join(", ")}</div>
            </div>
          )}

          <div style={{ display: "grid", gap: 10 }}>
            <label>
              {labelTitle("Full name", "fullName")}
              <input value={v.fullName} onChange={(e) => setField("fullName", e.target.value)} style={inputStyle("fullName")} />
            </label>

            <label>
              {labelTitle("Date of birth", "dob")}
              <input type="date" value={v.dob} onChange={(e) => setField("dob", e.target.value)} style={inputStyle("dob")} />
            </label>

            <label>
              {labelTitle("Address", "address")}
              <input value={v.address} onChange={(e) => setField("address", e.target.value)} style={inputStyle("address")} />
            </label>

            <label>
              {labelTitle("Postcode", "postcode")}
              <input value={v.postcode} onChange={(e) => setField("postcode", e.target.value)} style={inputStyle("postcode")} />
            </label>

            <label>
              <div style={{ fontWeight: 700 }}>Age band</div>
              <select
                value={v.ageBand}
                onChange={(e) => setField("ageBand", e.target.value)}
                style={{ width: "100%", padding: 10, borderRadius: 10, border: "1px solid #cfd7df" }}
              >
                <option value="under25">Single – under 25</option>
                <option value="25plus">Single – 25 or over</option>
              </select>
            </label>

            <label>
              {labelTitle("Rent per month (£)", "rentMonthly")}
              <input inputMode="decimal" value={v.rentMonthly} onChange={(e) => setField("rentMonthly", e.target.value)} style={inputStyle("rentMonthly")} />
            </label>

            <label>
              {labelTitle("Council Tax per month (£)", "councilTaxMonthly")}
              <input inputMode="decimal" value={v.councilTaxMonthly} onChange={(e) => setField("councilTaxMonthly", e.target.value)} style={inputStyle("councilTaxMonthly")} />
            </label>

            <label>
              {labelTitle("Total bills per month (£) (gas + electric + water combined)", "utilitiesMonthly")}
              <input inputMode="decimal" value={v.utilitiesMonthly} onChange={(e) => setField("utilitiesMonthly", e.target.value)} style={inputStyle("utilitiesMonthly")} />
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input type="checkbox" checked={v.confirmTruth} onChange={(e) => setField("confirmTruth", e.target.checked)} />
              <span style={{ fontWeight: 700 }}>
                I confirm this information is true{" "}
                {isMissing("confirmTruth") && <span style={{ color: "#c0392b", fontWeight: 900 }}>*</span>}
              </span>
            </label>
          </div>

          <div style={{ marginTop: 14, padding: 12, borderRadius: 12, background: "#f6f8fa", border: "1px solid #e6edf3" }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Estimated monthly support (game)</div>
            <div>Standard allowance: <b>£{award.standard}</b></div>
            <div>Housing help: <b>£{award.housing}</b></div>
            <div>Council Tax reduction: <b>£{award.councilTaxReduction}</b></div>
            <div>Bills help: <b>£{award.billsHelp}</b></div>
            <div style={{ marginTop: 8, fontSize: "1.05rem" }}>
              Total boost each month: <b>£{award.monthlyTotal}</b>
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            style={{
              marginTop: 12,
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "none",
              fontWeight: 800,
              cursor: canSubmit ? "pointer" : "not-allowed",
              background: canSubmit ? "#1d70b8" : "#9bbad7",
              color: "#fff",
              fontSize: "1rem",
            }}
          >
            Send Universal Credit form
          </button>
        </form>
      </div>
    </div>
  );
}
