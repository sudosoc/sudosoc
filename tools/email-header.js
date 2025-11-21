function parseHeaders(raw) {
  const lines = raw.split(/\r?\n/);
  const headers = {};
  let current = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    if (/^\s/.test(line) && current) {
      if (Array.isArray(headers[current])) {
        headers[current][headers[current].length - 1] += " " + line.trim();
      } else {
        headers[current] += " " + line.trim();
      }
      continue;
    }

    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const name = line.slice(0, idx).trim().toLowerCase();
    const value = line.slice(idx + 1).trim();

    if (headers[name]) {
      if (Array.isArray(headers[name])) headers[name].push(value);
      else headers[name] = [headers[name], value];
    } else {
      headers[name] = value;
    }
    current = name;
  }
  return headers;
}

function joinHeader(value) {
  return Array.isArray(value) ? value.join("\n") : (value || "");
}

function extractEmail(str) {
  if (!str) return "";
  const m = str.match(/<([^>]+)>/);
  return (m ? m[1] : str).trim().replace(/["']/g, "");
}

function getDomain(email) {
  if (!email) return "";
  const parts = email.split("@");
  return parts[1] ? parts[1].toLowerCase() : "";
}

function parseAuth(authRaw) {
  const result = { spf: null, dkim: null, dmarc: null, raw: authRaw || "" };
  if (!authRaw) return result;

  ["spf", "dkim", "dmarc"].forEach((key) => {
    const rex = new RegExp(key + "=([a-zA-Z0-9_-]+)");
    const m = authRaw.match(rex);
    if (m) result[key] = m[1].toLowerCase();
  });

  return result;
}

function parseSpam(spamScoreRaw, spamStatusRaw) {
  let score = null;
  if (spamScoreRaw) {
    const m = String(spamScoreRaw).match(/-?\d+(\.\d+)?/);
    if (m) score = parseFloat(m[0]);
  }
  const info = [
    spamScoreRaw ? `X-Spam-Score: ${spamScoreRaw}` : "",
    spamStatusRaw ? `X-Spam-Status: ${spamStatusRaw}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return { score, info };
}

function parseReceived(headers) {
  const rec = headers["received"];
  if (!rec) return [];
  const arr = Array.isArray(rec) ? rec : [rec];
  return arr.map((line, i) => {
    const hop = { index: i + 1, from: null, by: null, ip: null, raw: line };
    const fromMatch = line.match(/from\s(.+?)\s(by|\(|;)/i);
    if (fromMatch) hop.from = fromMatch[1];
    const byMatch = line.match(/by\s(.+?)\s(\(|;)/i);
    if (byMatch) hop.by = byMatch[1];
    const ipMatch = line.match(/(\d{1,3}\.){3}\d{1,3}/);
    if (ipMatch) hop.ip = ipMatch[0];
    return hop;
  });
}

function scoreRisk(auth, fromDomain, returnDomain, spam, received) {
  let score = 0;
  const reasons = [];

  function add(points, msg) {
    score += points;
    reasons.push(msg);
  }

  ["spf", "dkim", "dmarc"].forEach((k) => {
    const v = auth[k];
    if (!v) return;
    if (["fail", "softfail", "none", "neutral", "permerror", "temperror", "quarantine", "reject"].includes(v)) {
      add(2, `${k.toUpperCase()} = ${v}`);
    } else if (v === "pass") {
      add(-0.5, `${k.toUpperCase()} passed`);
    }
  });

  if (fromDomain && returnDomain && fromDomain !== returnDomain) {
    add(2, `From domain (${fromDomain}) ≠ Return-Path domain (${returnDomain})`);
  }

  if (spam.score != null) {
    if (spam.score >= 10) add(3, `Spam score very high (${spam.score})`);
    else if (spam.score >= 5) add(2, `Spam score elevated (${spam.score})`);
    else if (spam.score < 0) add(-1, `Spam score very low (${spam.score})`);
  }

  if (!auth.spf && !auth.dkim && !auth.dmarc) {
    add(1.5, "No SPF/DKIM/DMARC visible in Authentication-Results.");
  }

  if (score < 0) score = 0;
  if (score > 10) score = 10;

  let level = "good";
  let label = "Low risk";
  let desc = "No strong red flags detected in header-level checks.";

  if (score >= 8) {
    level = "bad";
    label = "High risk";
    desc = "Multiple strong indicators of spoofing / phishing in the header.";
  } else if (score >= 4) {
    level = "medium";
    label = "Moderate risk";
    desc = "Some suspicious indicators present; manual review recommended.";
  }

  return { score, level, label, desc, reasons };
}

function analyzeEmailHeader() {
  const raw = document.getElementById("eh-input").value.trim();
  if (!raw) {
    alert("Paste a header first.");
    return;
  }

  const headers = parseHeaders(raw);

  const fromHeader = joinHeader(headers["from"]);
  const returnHeader = joinHeader(headers["return-path"]);
  const subjectHeader = joinHeader(headers["subject"]);
  const toHeader = joinHeader(headers["to"]);
  const dateHeader = joinHeader(headers["date"]);
  const authRaw = joinHeader(headers["authentication-results"]);
  const spamScoreRaw = joinHeader(headers["x-spam-score"]);
  const spamStatusRaw = joinHeader(headers["x-spam-status"]);

  const fromEmail = extractEmail(fromHeader);
  const returnEmail = extractEmail(returnHeader);
  const fromDomain = getDomain(fromEmail);
  const returnDomain = getDomain(returnEmail);

  const auth = parseAuth(authRaw);
  const spam = parseSpam(spamScoreRaw, spamStatusRaw);
  const received = parseReceived(headers);
  const risk = scoreRisk(auth, fromDomain, returnDomain, spam, received);

  // Summary
  const summaryEl = document.getElementById("eh-summary");
  let riskClass = "status-good";
  if (risk.level === "bad") riskClass = "status-bad";
  else if (risk.level === "medium") riskClass = "status-medium";

  summaryEl.innerHTML =
    `<strong>Summary</strong>\n` +
    `<span class="status-pill ${riskClass}">${risk.label} — score ${risk.score}/10</span>\n\n` +
    (subjectHeader ? `Subject: ${subjectHeader}\n` : "") +
    (fromEmail ? `From: ${fromEmail}\n` : "") +
    (returnEmail ? `Return-Path: ${returnEmail}\n` : "") +
    (toHeader ? `To: ${toHeader}\n` : "") +
    (dateHeader ? `Date: ${dateHeader}\n` : "") +
    `\nNotes:\n` +
    (risk.reasons.length ? "- " + risk.reasons.join("\n- ") : "No strong warning reasons generated.");

  // Auth
  const authEl = document.getElementById("eh-auth");
  authEl.textContent =
    `AUTHENTICATION RESULTS\n` +
    `SPF:   ${auth.spf || "not visible"}\n` +
    `DKIM:  ${auth.dkim || "not visible"}\n` +
    `DMARC: ${auth.dmarc || "not visible"}\n\n` +
    (spam.info ? "Spam markers:\n" + spam.info : "No X-Spam headers found.") +
    (auth.raw ? `\n\nRaw Authentication-Results:\n${auth.raw}` : "");

  // Routing
  const routingEl = document.getElementById("eh-routing");
  if (!received.length) {
    routingEl.textContent = "No Received headers found.";
  } else {
    routingEl.textContent =
      "ROUTING (Received hops)\n\n" +
      received
        .map((hop) => {
          return (
            `Hop #${hop.index}\n` +
            `  FROM: ${hop.from || "(unknown)"}\n` +
            `  BY:   ${hop.by || "(unknown)"}\n` +
            `  IP:   ${hop.ip || "(none)"}\n`
          );
        })
        .join("\n");
  }

  // Raw
  const rawEl = document.getElementById("eh-raw");
  rawEl.textContent = "Raw header (as provided):\n\n" + raw;
}

function clearEmailHeader() {
  document.getElementById("eh-input").value = "";
  document.getElementById("eh-summary").textContent = "";
  document.getElementById("eh-auth").textContent = "";
  document.getElementById("eh-routing").textContent = "";
  document.getElementById("eh-raw").textContent = "";
}
