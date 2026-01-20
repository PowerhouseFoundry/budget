import { useMemo, useState } from "react";

/**
 * JSAForm
 * - Blocks submission if required fields missing
 * - Shows red asterisks/borders after first submit attempt
 * - Previous job/course section is optional (lastActivity + lastActivityWhen)
 *
 * Props:
 *   onSubmit({ values, quality })  // called only when valid
 */
export default function JSAForm({ onSubmit }) {
  const [values, setValues] = useState({
    name: "",
    address1: "",
    address2: "",
    town: "",
    postcode: "",
    dob: "",
    phone: "",
    email: "",
    contactPreference: "",
    workingNow: "no",
    currentJobTitle: "",
    currentJobHours: "",
    currentJobPay: "",
    lastActivity: "",
    lastActivityWhen: "",
    hoursType: "",
    days: [],
    times: [],
    travelModes: [],
    travelTime: "",
    areas: "",
    jobTypes: "",
    jobSearchMethods: [],
    jobsPerWeek: "",
    supportNeeds: "",
    supportHelps: [],
    declarationTicked: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [attempted, setAttempted] = useState(false);

  const updateField = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const toggleInArray = (field, value) => {
    setValues((prev) => {
      const set = new Set(prev[field] || []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      return { ...prev, [field]: Array.from(set) };
    });
  };

  // ✅ REQUIRED: everything EXCEPT previous job/course fields + optional contact details
  function findMissingFields(v) {
    const missing = [];

    // About you (address2 / phone / email optional)
    if (!String(v.name || "").trim()) missing.push("name");
    if (!String(v.address1 || "").trim()) missing.push("address1");
    if (!String(v.town || "").trim()) missing.push("town");
    if (!String(v.postcode || "").trim()) missing.push("postcode");
    if (!String(v.dob || "").trim()) missing.push("dob");
    if (!String(v.contactPreference || "").trim())
      missing.push("contactPreference");

    // Current situation
    if (!String(v.workingNow || "").trim()) missing.push("workingNow");
    if (v.workingNow === "yes") {
      if (!String(v.currentJobTitle || "").trim()) missing.push("currentJobTitle");
      if (!String(v.currentJobHours || "").trim()) missing.push("currentJobHours");
      if (!String(v.currentJobPay || "").trim()) missing.push("currentJobPay");
    }
    // Previous job/course is OPTIONAL:
    // lastActivity + lastActivityWhen are NOT required

    // When you can work
    if (!String(v.hoursType || "").trim()) missing.push("hoursType");
    if (!Array.isArray(v.days) || v.days.length === 0) missing.push("days");
    if (!Array.isArray(v.times) || v.times.length === 0) missing.push("times");

    // Travel and where
    if (!Array.isArray(v.travelModes) || v.travelModes.length === 0)
      missing.push("travelModes");
    if (!String(v.travelTime || "").trim()) missing.push("travelTime");
    if (!String(v.areas || "").trim()) missing.push("areas");

    // Jobs you’re looking for
    if (!String(v.jobTypes || "").trim()) missing.push("jobTypes");
    if (!Array.isArray(v.jobSearchMethods) || v.jobSearchMethods.length === 0)
      missing.push("jobSearchMethods");
    if (!String(v.jobsPerWeek || "").trim()) missing.push("jobsPerWeek");

    // Support
    if (!String(v.supportNeeds || "").trim()) missing.push("supportNeeds");
    if (!Array.isArray(v.supportHelps) || v.supportHelps.length === 0)
      missing.push("supportHelps");

    // Declaration
    if (!v.declarationTicked) missing.push("declaration");

    return missing;
  }

  const missingNow = useMemo(() => findMissingFields(values), [values]);
  const isMissing = (field) => attempted && missingNow.includes(field);
  const canSubmit = missingNow.length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    setAttempted(true);

    // ✅ BLOCK submission until valid
    if (!canSubmit) return;

    setSubmitted(true);

    // keep simple: valid form = "good"
    const quality = "good";

    if (typeof onSubmit === "function") {
      onSubmit({ values, quality });
    }
  };

  // --- Styles (unchanged look) ---
  const govWrapperStyle = {
    border: "1px solid #b1b4b6",
    borderRadius: 6,
    background: "#ffffff",
    marginTop: 16,
    overflow: "hidden",
    maxWidth: 720,
  };

  const govHeaderStyle = {
    background: "#1d70b8",
    color: "#ffffff",
    padding: "12px 18px",
    display: "flex",
    alignItems: "center",
    gap: 12,
  };

  const govLogoBox = {
    width: 32,
    height: 32,
    borderRadius: 4,
    border: "2px solid #ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 14,
  };

  const govBodyStyle = {
    padding: "16px 18px 18px",
    fontSize: "0.95rem",
    lineHeight: 1.5,
  };

  const sectionStyle = {
    borderTop: "1px solid #e5e7eb",
    paddingTop: 12,
    marginTop: 12,
  };

  const labelStyle = {
    display: "block",
    fontWeight: 600,
    marginBottom: 4,
  };

  const hintStyle = {
    fontSize: "0.85rem",
    color: "#6b7280",
    marginBottom: 6,
  };

  const inputStyle = {
    width: "100%",
    padding: "6px 8px",
    borderRadius: 4,
    border: "1px solid #d0d4da",
    fontSize: "0.95rem",
  };

  const checkboxRowStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  };

  const smallCheckboxLabel = {
    display: "inline-flex",
    alignItems: "center",
    gap: 4,
    fontSize: "0.9rem",
  };

  const submitBarStyle = {
    marginTop: 16,
    paddingTop: 12,
    borderTop: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    gap: 6,
  };

  const buttonStyle = {
    alignSelf: "flex-start",
    background: "#1d70b8",
    color: "#000000",
    border: "2px solid #1d70b8",
    borderRadius: 4,
    padding: "8px 16px",
    fontSize: "1rem",
    fontWeight: 600,
    cursor: "pointer",
  };

  const infoTextStyle = {
    fontSize: "0.85rem",
    color: "#4b5563",
  };

  return (
    <div style={govWrapperStyle} aria-label="Jobseeker’s Allowance application form">
      <div style={govHeaderStyle}>
        <div style={govLogoBox} aria-hidden>JSA</div>
        <div>
          <div style={{ fontSize: "0.78rem", letterSpacing: 0.5 }}>JOBSEEKER’S ALLOWANCE</div>
          <div style={{ fontSize: "1.1rem", fontWeight: 700 }}>Apply for Jobseeker’s Allowance</div>
        </div>
      </div>

      <form style={govBodyStyle} onSubmit={handleSubmit}>
        <p style={hintStyle}>
          Fill in this form as if you were really applying. Missing answers will stop you sending the form.
        </p>

        {/* Section A – About you */}
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 6px", fontSize: "1rem" }}>About you</h3>

          <label style={labelStyle}>
            Full name{" "}
            {isMissing("name") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            <input
              type="text"
              style={{ ...inputStyle, border: isMissing("name") ? "2px solid #c0392b" : inputStyle.border }}
              value={values.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
          </label>

          <label style={labelStyle}>
            Address line 1{" "}
            {isMissing("address1") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            <input
              type="text"
              style={{ ...inputStyle, border: isMissing("address1") ? "2px solid #c0392b" : inputStyle.border }}
              value={values.address1}
              onChange={(e) => updateField("address1", e.target.value)}
            />
          </label>

          <label style={labelStyle}>
            Address line 2 (optional)
            <input
              type="text"
              style={inputStyle}
              value={values.address2}
              onChange={(e) => updateField("address2", e.target.value)}
            />
          </label>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <label style={{ ...labelStyle, flex: 2 }}>
              Town / City{" "}
              {isMissing("town") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
              <input
                type="text"
                style={{ ...inputStyle, border: isMissing("town") ? "2px solid #c0392b" : inputStyle.border }}
                value={values.town}
                onChange={(e) => updateField("town", e.target.value)}
              />
            </label>

            <label style={{ ...labelStyle, flex: 1 }}>
              Postcode{" "}
              {isMissing("postcode") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
              <input
                type="text"
                style={{ ...inputStyle, border: isMissing("postcode") ? "2px solid #c0392b" : inputStyle.border }}
                value={values.postcode}
                onChange={(e) => updateField("postcode", e.target.value)}
              />
            </label>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
            <label style={{ ...labelStyle, flex: 1 }}>
              Date of birth (DD/MM/YYYY){" "}
              {isMissing("dob") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
              <input
                type="text"
                style={{ ...inputStyle, border: isMissing("dob") ? "2px solid #c0392b" : inputStyle.border }}
                placeholder="e.g. 14/09/2007"
                value={values.dob}
                onChange={(e) => updateField("dob", e.target.value)}
              />
            </label>

            <label style={{ ...labelStyle, flex: 1 }}>
              Phone number (optional)
              <input
                type="text"
                style={inputStyle}
                value={values.phone}
                onChange={(e) => updateField("phone", e.target.value)}
              />
            </label>
          </div>

          <label style={{ ...labelStyle, marginTop: 6 }}>
            Email address (optional)
            <input
              type="email"
              style={inputStyle}
              value={values.email}
              onChange={(e) => updateField("email", e.target.value)}
            />
          </label>

          <div style={{ marginTop: 8 }}>
            <span style={labelStyle}>
              How do you prefer to be contacted?{" "}
              {isMissing("contactPreference") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            </span>

            <div
              style={{
                ...checkboxRowStyle,
                padding: 6,
                borderRadius: 10,
                border: isMissing("contactPreference") ? "2px solid #c0392b" : "1px solid transparent",
              }}
            >
              {["Phone", "Text message", "Email", "Letter"].map((label) => (
                <label key={label} style={smallCheckboxLabel}>
                  <input
                    type="radio"
                    name="contactPreference"
                    value={label}
                    checked={values.contactPreference === label}
                    onChange={(e) => updateField("contactPreference", e.target.value)}
                  />
                  {label}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section B – Current situation */}
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 6px", fontSize: "1rem" }}>Your current situation</h3>

          <div
            style={{
              ...checkboxRowStyle,
              padding: 6,
              borderRadius: 10,
              border: isMissing("workingNow") ? "2px solid #c0392b" : "1px solid transparent",
            }}
          >
            <span style={{ ...labelStyle, display: "block", marginBottom: 4 }}>
              Are you working now?{" "}
              {isMissing("workingNow") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            </span>

            <label style={smallCheckboxLabel}>
              <input
                type="radio"
                name="workingNow"
                value="no"
                checked={values.workingNow === "no"}
                onChange={(e) => updateField("workingNow", e.target.value)}
              />
              I am not working at the moment
            </label>

            <label style={smallCheckboxLabel}>
              <input
                type="radio"
                name="workingNow"
                value="yes"
                checked={values.workingNow === "yes"}
                onChange={(e) => updateField("workingNow", e.target.value)}
              />
              I have a job
            </label>
          </div>

          {values.workingNow === "yes" ? (
            <div style={{ marginTop: 8 }}>
              <label style={labelStyle}>
                Job title{" "}
                {isMissing("currentJobTitle") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
                <input
                  type="text"
                  style={{ ...inputStyle, border: isMissing("currentJobTitle") ? "2px solid #c0392b" : inputStyle.border }}
                  value={values.currentJobTitle}
                  onChange={(e) => updateField("currentJobTitle", e.target.value)}
                />
              </label>

              <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
                <label style={{ ...labelStyle, flex: 1 }}>
                  Hours per week{" "}
                  {isMissing("currentJobHours") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
                  <input
                    type="text"
                    style={{ ...inputStyle, border: isMissing("currentJobHours") ? "2px solid #c0392b" : inputStyle.border }}
                    value={values.currentJobHours}
                    onChange={(e) => updateField("currentJobHours", e.target.value)}
                  />
                </label>

                <label style={{ ...labelStyle, flex: 1 }}>
                  Pay (per week or month){" "}
                  {isMissing("currentJobPay") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
                  <input
                    type="text"
                    style={{ ...inputStyle, border: isMissing("currentJobPay") ? "2px solid #c0392b" : inputStyle.border }}
                    value={values.currentJobPay}
                    onChange={(e) => updateField("currentJobPay", e.target.value)}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: 8 }}>
              <label style={labelStyle}>
                Last job or course (name) (optional)
                <input
                  type="text"
                  style={inputStyle}
                  value={values.lastActivity}
                  onChange={(e) => updateField("lastActivity", e.target.value)}
                />
              </label>

              <label style={labelStyle}>
                When did it end? (month/year) (optional)
                <input
                  type="text"
                  style={inputStyle}
                  placeholder="e.g. 06/2024"
                  value={values.lastActivityWhen}
                  onChange={(e) => updateField("lastActivityWhen", e.target.value)}
                />
              </label>
            </div>
          )}
        </div>

        {/* Section C – When you can work */}
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 6px", fontSize: "1rem" }}>When you can work</h3>

          <div>
            <span style={labelStyle}>
              What kind of hours can you work?{" "}
              {isMissing("hoursType") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            </span>

            <div
              style={{
                ...checkboxRowStyle,
                padding: 6,
                borderRadius: 10,
                border: isMissing("hoursType") ? "2px solid #c0392b" : "1px solid transparent",
              }}
            >
              <label style={smallCheckboxLabel}>
                <input
                  type="radio"
                  name="hoursType"
                  value="full-time"
                  checked={values.hoursType === "full-time"}
                  onChange={(e) => updateField("hoursType", e.target.value)}
                />
                Full-time (around 35+ hours a week)
              </label>

              <label style={smallCheckboxLabel}>
                <input
                  type="radio"
                  name="hoursType"
                  value="part-time"
                  checked={values.hoursType === "part-time"}
                  onChange={(e) => updateField("hoursType", e.target.value)}
                />
                Part-time (up to 16–20 hours a week)
              </label>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <span style={labelStyle}>
              Which days can you work?{" "}
              {isMissing("days") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            </span>

            <div
              style={{
                ...checkboxRowStyle,
                padding: 6,
                borderRadius: 10,
                border: isMissing("days") ? "2px solid #c0392b" : "1px solid transparent",
              }}
            >
              {["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"].map((d) => (
                <label key={d} style={smallCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={values.days.includes(d)}
                    onChange={() => toggleInArray("days", d)}
                  />
                  {d}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <span style={labelStyle}>
              When can you work?{" "}
              {isMissing("times") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            </span>

            <div
              style={{
                ...checkboxRowStyle,
                padding: 6,
                borderRadius: 10,
                border: isMissing("times") ? "2px solid #c0392b" : "1px solid transparent",
              }}
            >
              {["Mornings", "Afternoons", "Evenings"].map((t) => (
                <label key={t} style={smallCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={values.times.includes(t)}
                    onChange={() => toggleInArray("times", t)}
                  />
                  {t}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section D – Travel and where you can work */}
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 6px", fontSize: "1rem" }}>Travel and where you can work</h3>

          <div>
            <span style={labelStyle}>
              How can you travel to work?{" "}
              {isMissing("travelModes") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            </span>

            <div
              style={{
                ...checkboxRowStyle,
                padding: 6,
                borderRadius: 10,
                border: isMissing("travelModes") ? "2px solid #c0392b" : "1px solid transparent",
              }}
            >
              {["Walk", "Bus", "Train", "Car (lift)", "Bike"].map((mode) => (
                <label key={mode} style={smallCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={values.travelModes.includes(mode)}
                    onChange={() => toggleInArray("travelModes", mode)}
                  />
                  {mode}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <span style={labelStyle}>
              How long are you happy to travel each way?{" "}
              {isMissing("travelTime") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            </span>

            <div
              style={{
                ...checkboxRowStyle,
                padding: 6,
                borderRadius: 10,
                border: isMissing("travelTime") ? "2px solid #c0392b" : "1px solid transparent",
              }}
            >
              {["Up to 30 minutes", "Up to 1 hour", "More than 1 hour"].map((opt) => (
                <label key={opt} style={smallCheckboxLabel}>
                  <input
                    type="radio"
                    name="travelTime"
                    value={opt}
                    checked={values.travelTime === opt}
                    onChange={(e) => updateField("travelTime", e.target.value)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <label style={{ ...labelStyle, marginTop: 8 }}>
            Which areas can you travel to for work?{" "}
            {isMissing("areas") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            <textarea
              rows={2}
              style={{
                ...inputStyle,
                resize: "vertical",
                border: isMissing("areas") ? "2px solid #c0392b" : inputStyle.border,
              }}
              value={values.areas}
              onChange={(e) => updateField("areas", e.target.value)}
            />
          </label>
        </div>

        {/* Section E – Job goals and job search */}
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 6px", fontSize: "1rem" }}>Jobs you are looking for</h3>

          <label style={labelStyle}>
            What kind of jobs are you looking for?{" "}
            {isMissing("jobTypes") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            <textarea
              rows={2}
              style={{
                ...inputStyle,
                resize: "vertical",
                border: isMissing("jobTypes") ? "2px solid #c0392b" : inputStyle.border,
              }}
              placeholder="e.g. shop work, warehouse, café, kitchen, office, cleaning"
              value={values.jobTypes}
              onChange={(e) => updateField("jobTypes", e.target.value)}
            />
          </label>

          <div style={{ marginTop: 8 }}>
            <span style={labelStyle}>
              Where will you look for jobs?{" "}
              {isMissing("jobSearchMethods") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            </span>

            <div
              style={{
                ...checkboxRowStyle,
                padding: 6,
                borderRadius: 10,
                border: isMissing("jobSearchMethods") ? "2px solid #c0392b" : "1px solid transparent",
              }}
            >
              {[
                "Job websites (e.g. Indeed)",
                "Going into shops/cafés and asking",
                "Jobcentre",
                "Asking friends or family",
                "Social media / online groups",
              ].map((m) => (
                <label key={m} style={smallCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={values.jobSearchMethods.includes(m)}
                    onChange={() => toggleInArray("jobSearchMethods", m)}
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <span style={labelStyle}>
              How many jobs can you apply for each week?{" "}
              {isMissing("jobsPerWeek") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            </span>

            <div
              style={{
                ...checkboxRowStyle,
                padding: 6,
                borderRadius: 10,
                border: isMissing("jobsPerWeek") ? "2px solid #c0392b" : "1px solid transparent",
              }}
            >
              {["1–2 jobs", "3–5 jobs", "More than 5 jobs"].map((opt) => (
                <label key={opt} style={smallCheckboxLabel}>
                  <input
                    type="radio"
                    name="jobsPerWeek"
                    value={opt}
                    checked={values.jobsPerWeek === opt}
                    onChange={(e) => updateField("jobsPerWeek", e.target.value)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section F – Support needs */}
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 6px", fontSize: "1rem" }}>Support you might need</h3>

          <label style={labelStyle}>
            Is there anything that makes working harder for you?{" "}
            {isMissing("supportNeeds") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            <textarea
              rows={2}
              style={{
                ...inputStyle,
                resize: "vertical",
                border: isMissing("supportNeeds") ? "2px solid #c0392b" : inputStyle.border,
              }}
              value={values.supportNeeds}
              onChange={(e) => updateField("supportNeeds", e.target.value)}
            />
          </label>

          <div style={{ marginTop: 8 }}>
            <span style={labelStyle}>
              What support might help you get and keep a job?{" "}
              {isMissing("supportHelps") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
            </span>

            <div
              style={{
                ...checkboxRowStyle,
                padding: 6,
                borderRadius: 10,
                border: isMissing("supportHelps") ? "2px solid #c0392b" : "1px solid transparent",
              }}
            >
              {[
                "Extra time to learn tasks",
                "Clear written instructions",
                "Help to travel to work",
                "Support worker / job coach",
                "Flexible hours",
              ].map((opt) => (
                <label key={opt} style={smallCheckboxLabel}>
                  <input
                    type="checkbox"
                    checked={values.supportHelps.includes(opt)}
                    onChange={() => toggleInArray("supportHelps", opt)}
                  />
                  {opt}
                </label>
              ))}
              <label style={smallCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={values.supportHelps.includes("Other")}
                  onChange={() => toggleInArray("supportHelps", "Other")}
                />
                Other / something else
              </label>
            </div>
          </div>
        </div>

        {/* Section G – Declaration */}
        <div style={sectionStyle}>
          <h3 style={{ margin: "0 0 6px", fontSize: "1rem" }}>Agreement</h3>

          <p style={hintStyle}>Please read this carefully and tick the box if you agree.</p>

          <label style={smallCheckboxLabel}>
            <input
              type="checkbox"
              checked={values.declarationTicked}
              onChange={(e) => updateField("declarationTicked", e.target.checked)}
            />
            I agree that the information I have given is true, and I will look for work.{" "}
            {isMissing("declaration") && <span style={{ color: "#c0392b", fontWeight: 800 }}>*</span>}
          </label>
        </div>

        {/* Submit bar */}
        <div style={submitBarStyle}>
          <button type="submit" style={buttonStyle} disabled={submitted}>
            {submitted ? "Form sent" : "Send form to Jobcentre"}
          </button>

          <p style={infoTextStyle}>
            In the game, you must fill in all required fields before sending.
          </p>

          {submitted && (
            <p style={{ ...infoTextStyle, color: "#166534" }}>
              Your form has been sent. You will get a decision in a future month.
            </p>
          )}
        </div>
      </form>
    </div>
  );
}
