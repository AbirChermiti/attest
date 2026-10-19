/* Attest browser store — used by the app and the verify page until the backend launches.
   Everything lives in this browser's localStorage under one key. */
(function () {
  var KEY = "attest.store.v1";
  function demo() {
    return {
      org: { name: "Example Institute", signerName: "Dr. Sample Signer", signerTitle: "Program Director", prefix: "CRT", website: "", verifyUrl: "" },
      programs: [
        { id: "p-example-aml", name: "Applied Machine Learning", title: "Professional Certificate", description: "has successfully completed all coursework and the capstone project of", skills: ["Python", "Model evaluation", "MLOps"], activity: "course", topicHours: { technical: 10, leadership: 0, business: 1, ethics: 1 }, hours: 12, offers: { pdh: true, ceu: true, pdu: false, sch: false }, approvals: "", validityMonths: 36, signerName: "", signerTitle: "Program Director", style: "classic", color: "#22306B", createdAt: 1, sample: true, badge: { shape: "hex", icon: "chip", accent: "#B08A3E", label: "ML PRACTITIONER", level: "Professional", showCredit: true } },
        { id: "p-example-lead", name: "Engineering Leadership Cohort", title: "Certificate of Completion", description: "has completed the cohort program and leadership practicum of", skills: ["Negotiation", "Team leadership", "Public speaking"], activity: "course", topicHours: { technical: 0, leadership: 14, business: 4, ethics: 2 }, hours: 20, offers: { pdh: true, pdu: true, ceu: true, sch: false }, approvals: "", validityMonths: 0, signerName: "", signerTitle: "Cohort Lead", style: "modern", color: "#1F5C4A", createdAt: 2, sample: true, badge: { shape: "shield", icon: "people", accent: "#C9CED8", label: "ENGINEERING LEADER", level: "Cohort 2026", showCredit: true } },
        { id: "p-example-agile", name: "Agile Delivery for Technical Teams", title: "Certificate of Completion", description: "has completed the hands-on workshop", skills: ["Scrum", "Kanban", "Estimation"], activity: "course", topicHours: { technical: 8, leadership: 3, business: 3, ethics: 0 }, hours: 14, offers: { pdh: true, pdu: true, ceu: false, sch: false }, approvals: "", validityMonths: 0, signerName: "", signerTitle: "Lead Instructor", style: "minimal", color: "#2E4152", createdAt: 3, sample: true, badge: { shape: "ribbon", icon: "gear", accent: "#C27A4A", label: "AGILE DELIVERY", level: "", showCredit: true } }
      ],
      creds: [
        { id: "CRT-7KQ3-9XPM", recipientName: "Amina Diallo", recipientEmail: "amina@example.org", grade: "With Honors", programId: "p-example-aml", programName: "Applied Machine Learning", title: "Professional Certificate", statement: "has successfully completed all coursework and the capstone project of", skills: ["Python", "Model evaluation", "MLOps"], hours: 12, credits: { contactHours: 12, pdh: 12, ethics: 1, ceu: 1.2 }, attendance: 1, issuedOn: "2026-09-30", expiresOn: "2029-09-30", signerName: "Dr. Sample Signer", signerTitle: "Program Director", status: "active", issuedAt: 1791500000000, sample: true },
        { id: "CRT-M4RD-2HTW", recipientName: "Lucas Ferreira", recipientEmail: "lucas@example.org", grade: "", programId: "p-example-lead", programName: "Engineering Leadership Cohort", title: "Certificate of Completion", statement: "has completed the cohort program and leadership practicum of", skills: ["Negotiation", "Team leadership", "Public speaking"], hours: 20, credits: { contactHours: 20, pdh: 20, ethics: 2, ceu: 2, pduWW: 0, pduPS: 16, pduBA: 4, pduEd: 20, pdu: 20 }, attendance: 1, issuedOn: "2026-09-12", expiresOn: null, signerName: "Dr. Sample Signer", signerTitle: "Cohort Lead", status: "active", issuedAt: 1790000000000, sample: true },
        { id: "CRT-PX8N-4CEB", recipientName: "Priya Raman", recipientEmail: "priya@example.org", grade: "", programId: "p-example-aml", programName: "Applied Machine Learning", title: "Professional Certificate", statement: "has successfully completed all coursework and the capstone project of", skills: ["Python", "Model evaluation", "MLOps"], hours: 12, credits: { contactHours: 12, pdh: 12, ethics: 1, ceu: 1.2 }, attendance: 1, issuedOn: "2023-10-02", expiresOn: "2026-10-02", signerName: "Dr. Sample Signer", signerTitle: "Program Director", status: "active", issuedAt: 1696200000000, sample: true },
        { id: "CRT-J9VA-6QLS", recipientName: "Jonas Weber", recipientEmail: "jonas@example.org", grade: "", programId: "p-example-lead", programName: "Engineering Leadership Cohort", title: "Certificate of Completion", statement: "has completed the cohort program and leadership practicum of", skills: ["Negotiation", "Team leadership"], hours: 20, credits: { contactHours: 20, pdh: 20, ethics: 2, ceu: 2, pduWW: 0, pduPS: 16, pduBA: 4, pduEd: 20, pdu: 20 }, attendance: 1, issuedOn: "2026-08-20", expiresOn: null, signerName: "Dr. Sample Signer", signerTitle: "Cohort Lead", status: "revoked", revokedReason: "Issued in error", issuedAt: 1789000000000, sample: true }
      ],
      learnersArr: [
        { id: "amina@example.org", name: "Amina Diallo", email: "amina@example.org", sample: true,
          licenses: [
            { id: "l-ex-1", template: "ncees", name: "PE license · NCEES CPC standard", months: 12, pdh: 15, ethics: 1, cycleStart: "2026-01-01", cycleEnd: "2026-12-31" },
            { id: "l-ex-2", template: "pmp", name: "PMP · PMI", months: 36, pdu: 60, edMin: 35, areaMin: 8, gbMax: 25, practMax: 8, cycleStart: "2024-03-01", cycleEnd: "2027-02-28" } ],
          activities: [ { id: "a-ex-1", activity: "society", title: "IEEE PES chapter committee member", date: "2026-05-10", hours: 0, area: "technical", count: 1, units: 0, unitType: "semester", firstTime: false, gbHours: 6, evidence: "Chapter officer roster 2026", credits: { activity: "society", contactHours: 0, pdh: 2, pduGB: 6, pdu: 6 }, selfReported: true, loggedAt: 1792434000000 } ] },
        { id: "lucas@example.org", name: "Lucas Ferreira", email: "lucas@example.org", sample: true,
          licenses: [ { id: "l-ex-3", template: "ceu2", name: "Continuing education · 2.0 CEU every 2 years", months: 24, ceu: 2, cycleStart: "2025-06-01", cycleEnd: "2027-05-31" } ],
          activities: [] }
      ]
    };
  }
  function load() {
    try { var raw = localStorage.getItem(KEY); if (raw) { var s = JSON.parse(raw); if (s && s.org && s.programs && s.creds) return s; } } catch (e) {}
    return null;
  }
  function save(state) {
    try { localStorage.setItem(KEY, JSON.stringify({ org: state.org, programs: state.programs, creds: state.creds, learnersArr: state.learnersArr || [] })); return true; }
    catch (e) { return false; }
  }
  function reset() { try { localStorage.removeItem(KEY); } catch (e) {} }
  function account() { try { return JSON.parse(localStorage.getItem("attest.account") || "null"); } catch (e) { return null; } }
  window.AttestStore = { KEY: KEY, demo: demo, load: load, save: save, reset: reset, account: account };
})();
