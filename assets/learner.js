/* Attest learner engine — credit rules, verification checks, points and micro-credentials.
   Shared by learner/, review.html and verify.html. Data lives in this browser until the backend launches. */
(function () {
  var KEY = "attest.learner.v1";
  var today = function () { var d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  var q = function (x) { return Math.round(x * 4) / 4; };
  var r3 = function (x) { return Math.round(x * 3) / 3; };
  var rnd = function (n) { var A = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", a = new Uint32Array(n); crypto.getRandomValues(a); return Array.from(a, function (x) { return A[x % A.length]; }).join(""); };

  /* Activity types learners can add. Rules: common NCEES-style PDH model and PMI CCR categories. */
  var ACT = {
    course:       { label: "Course or certificate program", input: "hours", ed: true, ceu: true },
    conference:   { label: "Conference sessions attended", input: "hours", ed: true, ceu: true },
    selfstudy:    { label: "Online course or self-study", input: "hours", ed: true },
    college:      { label: "College course taken for credit", input: "units", ed: true },
    presentation: { label: "Presenting at a conference or meeting", input: "hours", first: true, gb: true },
    teaching:     { label: "Teaching a course or seminar", input: "hours", first: true, gb: true },
    publication:  { label: "Published paper, article or book", input: "count", unit: "publications", gb: true },
    patent:       { label: "Patent granted", input: "count", unit: "patents" },
    society:      { label: "Professional or technical society service", input: "count", unit: "organizations", gb: true },
    mentoring:    { label: "Mentoring or sharing knowledge", input: "hours", gb: true },
    practitioner: { label: "Working as a practitioner (PMI)", input: "none", gb: true }
  };
  function credits(x) {
    var a = ACT[x.activity] ? x.activity : "course", A = ACT[a], h = Math.max(0, +x.hours || 0), n = Math.max(0, +x.count || 0), gb = Math.max(0, +x.gbHours || 0);
    var area = x.area || "technical", c = { contactHours: A.input === "hours" ? q(h) : 0 };
    var edPdu = function (t) { if (!(t > 0)) return; c.pduWW = area === "technical" ? q(t) : 0; c.pduPS = area === "leadership" || area === "ethics" ? q(t) : 0; c.pduBA = area === "business" ? q(t) : 0; c.pduEd = q(t); c.pdu = c.pduEd; };
    var gbPdu = function (t) { if (!(t > 0)) return; c.pduGB = q(t); c.pdu = (c.pdu || 0) + c.pduGB; if (a === "practitioner") c.pduPract = c.pduGB; };
    if (A.input === "hours" && A.ed) { c.pdh = r3(h); if (area === "ethics") c.ethics = r3(h); edPdu(h); if (A.ceu && h) c.ceu = Math.round(h) / 10; }
    else if (a === "college") { var u = Math.max(0, +x.units || 0), sem = x.unitType !== "quarter"; c.pdh = u * (sem ? 45 : 30); edPdu(u * (sem ? 15 : 10)); if (u) c.sch = sem ? u : q(u * 2 / 3); }
    else if (a === "presentation" || a === "teaching") { if (x.firstTime) { c.pdh = r3(2 * h); if (area === "ethics") c.ethics = r3(2 * h); } gbPdu(h + gb); }
    else if (a === "publication") { c.pdh = 10 * n; gbPdu(gb); }
    else if (a === "patent") { c.pdh = 10 * n; }
    else if (a === "society") { c.pdh = 2 * n; gbPdu(gb); }
    else if (a === "mentoring") { gbPdu(h); }
    else if (a === "practitioner") { gbPdu(8); }
    Object.keys(c).forEach(function (k) { if (!c[k] && k !== "contactHours") delete c[k]; });
    return c;
  }
  function creditLine(c) { c = c || {}; var p = []; var n = function (v) { return String(Math.round(v * 100) / 100); };
    if (c.pdh) p.push(n(c.pdh) + " PDH"); if (c.pdu) p.push(n(c.pdu) + " PDU"); if (c.ceu) p.push(n(c.ceu) + " CEU"); if (c.sch) p.push(n(c.sch) + " semester hr"); return p.join(" · "); }

  /* Known issuers and the sites where their certificates can be checked. */
  var ISSUERS = [
    { name: "PMI", match: /\bpmi\b|project management institute/i, hosts: ["pmi.org"] },
    { name: "Coursera", match: /coursera/i, hosts: ["coursera.org"] },
    { name: "LinkedIn Learning", match: /linkedin/i, hosts: ["linkedin.com"] },
    { name: "IEEE", match: /\bieee\b/i, hosts: ["ieee.org", "ieeeusa.org"] },
    { name: "edX", match: /\bedx\b/i, hosts: ["edx.org"] },
    { name: "Credly", match: /credly/i, hosts: ["credly.com"] },
    { name: "Accredible", match: /accredible/i, hosts: ["accredible.com", "credential.net"] },
    { name: "ASCE", match: /\basce\b/i, hosts: ["asce.org"] },
    { name: "NSPE", match: /\bnspe\b/i, hosts: ["nspe.org"] }
  ];
  function hostOf(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } }
  function knownIssuer(name, registryOrgs) {
    var hit = ISSUERS.filter(function (i) { return i.match.test(name || ""); })[0];
    if (hit) return hit;
    if ((registryOrgs || []).some(function (o) { return o && name && o.toLowerCase() === name.trim().toLowerCase(); })) return { name: name, hosts: [], attest: true };
    return null;
  }

  /* Automatic verification. Returns checks, a score out of 100 and the resulting status.
     verified = credit counts now · review = Attest's team confirms · info = learner must add evidence. */
  function verify(item, ctx) {
    ctx = ctx || {};
    var checks = [], score = 0, add = function (label, ok, pts, note) { checks.push({ label: label, ok: ok, note: note || "" }); if (ok) score += pts; };
    var link = (item.evidence || "").trim(), host = hostOf(link), iss = knownIssuer(item.issuer, ctx.orgs);
    var regMatch = /\b[A-Z]{2,5}-[A-Z0-9]{4}-[A-Z0-9]{4}\b/.exec((link + " " + (item.credentialId || "")).toUpperCase());
    var reg = regMatch && (ctx.registry || []).filter(function (c) { return c.id === regMatch[0]; })[0];
    if (reg) {
      var mine = (reg.recipientEmail || "").toLowerCase() === (ctx.email || "").toLowerCase();
      add("Found in the Attest registry", true, 60, reg.id);
      add("Issued to this learner's email", mine, 40, mine ? "" : "The credential belongs to someone else");
      return { checks: checks, score: score, status: mine ? "verified" : "rejected", method: mine ? "Attest registry match" : "", reason: mine ? "" : "This credential was issued to a different email address." };
    }
    var hasEvidence = !!(link || item.fileName);
    add("Evidence attached", hasEvidence, 25, item.fileName ? "File: " + item.fileName : link ? "Link provided" : "Add a certificate file or verification link");
    var hostOk = !!(iss && host && iss.hosts.some(function (h) { return host === h || host.slice(-h.length - 1) === "." + h; }));
    add("Link is on the issuer's own site", hostOk, 25, host ? host : "No link");
    add("Issuer recognized by Attest", !!iss, 20, iss ? iss.name : "Unknown issuer: reviewed by hand");
    var d = item.date || "", dOk = /^\d{4}-\d{2}-\d{2}$/.test(d) && d <= today() && d >= "1990-01-01";
    add("Date is valid", dOk, 10, dOk ? "" : "Date is missing or in the future");
    var c = item.credits || {}, hOk = !(+item.hours > 300) && !(+item.count > 25) && !(+item.units > 30) && Object.keys(c).length > 1;
    add("Credit amount is plausible", hOk, 10, hOk ? creditLine(c) : "Check hours, count or units");
    var dup = (ctx.items || []).some(function (o) { return o.id !== item.id && o.status !== "rejected" && ((link && o.evidence === link) || (o.title || "").toLowerCase() === (item.title || "").toLowerCase() && o.date === item.date); });
    add("Not already on the record", !dup, 10, dup ? "Looks like a duplicate" : "");
    var status = dup ? "rejected" : score >= 90 ? "verified" : score >= 55 && hasEvidence ? "review" : "info";
    return { checks: checks, score: score, status: status, method: status === "verified" ? "Automatic checks" : "",
      reason: dup ? "Already on the record." : status === "info" ? "Add evidence (a certificate file or the issuer's verification link) so Attest can verify it." : "" };
  }

  /* Attest points: one point per verified contact-hour equivalent, counted once per item. */
  function points(c) { c = c || {}; return Math.round(Math.max(c.pdh || 0, c.pdu || 0, (c.ceu || 0) * 10, (c.sch || 0) * 15) * 10) / 10; }
  function stats(records) {
    var s = { points: 0, ethics: 0, power: 0, gb: 0, issuers: {}, pdh: 0, pdu: 0, ceu: 0, sch: 0 };
    records.forEach(function (r) { var c = r.credits || {}; s.points += points(c); s.ethics += c.ethics || 0; s.power += c.pduPS || 0; s.gb += c.pduGB || 0;
      s.pdh += c.pdh || 0; s.pdu += c.pdu || 0; s.ceu += c.ceu || 0; s.sch += c.sch || 0; if (r.issuer) s.issuers[r.issuer.toLowerCase()] = 1; });
    s.points = Math.round(s.points * 10) / 10; s.issuerCount = Object.keys(s.issuers).length; return s;
  }
  var MICRO = [
    { key: "bronze", tier: "Level", name: "Verified Learner · Bronze", criteria: "25 verified Attest points", val: function (s) { return s.points; }, need: 25, shape: "hex", color: "#7A4A26", icon: "star" },
    { key: "silver", tier: "Level", name: "Verified Learner · Silver", criteria: "75 verified Attest points", val: function (s) { return s.points; }, need: 75, shape: "hex", color: "#4D5770", icon: "star" },
    { key: "gold", tier: "Level", name: "Verified Learner · Gold", criteria: "150 verified Attest points", val: function (s) { return s.points; }, need: 150, shape: "hex", color: "#8A6A1E", icon: "star" },
    { key: "lead", tier: "Skill", name: "Leadership in Practice", criteria: "16 verified leadership hours (PMI Power Skills)", val: function (s) { return s.power; }, need: 16, shape: "shield", color: "#1F5C4A", icon: "people" },
    { key: "ethics", tier: "Skill", name: "Ethics and Professional Practice", criteria: "3 verified ethics PDH", val: function (s) { return s.ethics; }, need: 3, shape: "shield", color: "#22306B", icon: "shield" },
    { key: "community", tier: "Skill", name: "Community Contributor", criteria: "8 verified Giving Back PDUs from talks, papers or service", val: function (s) { return s.gb; }, need: 8, shape: "shield", color: "#7A2433", icon: "mic" },
    { key: "cross", tier: "Skill", name: "Cross-Credential Professional", criteria: "Verified credit from 3 different issuers", val: function (s) { return s.issuerCount; }, need: 3, shape: "circle", color: "#4B2D6B", icon: "link" }
  ];

  function blank(profile) { return { profile: profile || { name: "", email: "" }, claimed: [], items: [], licenses: [], micro: [], goals: [] }; }
  function demo() {
    var L = blank({ name: "Amina Diallo", email: "amina@example.org", demo: true });
    L.goals = ["pmp", "pe"];
    L.licenses = [
      { id: "l-ex-1", name: "PE license · NCEES CPC standard", pdh: 15, ethics: 1, cycleStart: "2026-01-01", cycleEnd: "2026-12-31" },
      { id: "l-ex-2", name: "PMP · PMI", pdu: 60, edMin: 35, areaMin: 8, gbMax: 25, cycleStart: "2024-03-01", cycleEnd: "2027-02-28" }];
    var mk = function (o) { o.id = "it-" + rnd(6).toLowerCase(); o.credits = credits(o); o.submittedAt = Date.now(); return o; };
    var a = mk({ kind: "activity", activity: "society", title: "IEEE PES chapter committee member", issuer: "IEEE", date: "2026-05-10", count: 1, gbHours: 6, evidence: "https://www.ieee.org/membership/example-roster", fileName: "" });
    var b = mk({ kind: "certificate", activity: "selfstudy", title: "Applied data science course certificate", issuer: "Coursera", date: "2026-08-14", hours: 8, area: "technical", evidence: "https://www.coursera.org/account/accomplishments/verify/EXAMPLE8KD2", fileName: "" });
    var c = mk({ kind: "certificate", activity: "selfstudy", title: "Project management foundations", issuer: "LinkedIn Learning", date: "2026-09-21", hours: 2, area: "leadership", evidence: "", fileName: "certificate-of-completion.pdf" });
    [a, b, c].forEach(function (it) { var v = verify(it, { items: [], email: L.profile.email }); it.checks = v.checks; it.score = v.score; it.status = v.status; it.method = v.method; it.reason = v.reason; L.items.push(it); });
    return L;
  }
  function load() { try { var s = JSON.parse(localStorage.getItem(KEY) || "null"); if (s && s.profile && Array.isArray(s.items)) return s; } catch (e) {} return null; }
  function save(L) { try { localStorage.setItem(KEY, JSON.stringify(L)); return true; } catch (e) { return false; } }
  function newMicroId() { return "ATT-" + rnd(4) + "-" + rnd(4); }

  window.AttestLearner = { KEY: KEY, ACT: ACT, ISSUERS: ISSUERS, MICRO: MICRO, credits: credits, creditLine: creditLine, verify: verify, points: points, stats: stats, demo: demo, blank: blank, load: load, save: save, newMicroId: newMicroId, today: today, hostOf: hostOf };
})();
