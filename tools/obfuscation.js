function tryBase64(str) {
  try {
    const cleaned = str.replace(/\s+/g, "");
    if (!/^[A-Za-z0-9+/=]+$/.test(cleaned)) return null;
    const decoded = atob(cleaned);
    return decoded.length ? decoded : null;
  } catch (e) {
    return null;
  }
}

function tryHex(str) {
  try {
    const cleaned = str.replace(/\\x/g, "").replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]+$/.test(cleaned) || cleaned.length % 2 !== 0) return null;
    let out = "";
    for (let i = 0; i < cleaned.length; i += 2) {
      out += String.fromCharCode(parseInt(cleaned.substr(i, 2), 16));
    }
    return out.length ? out : null;
  } catch (e) {
    return null;
  }
}

function tryUrlDecode(str) {
  try {
    const dec = decodeURIComponent(str);
    return dec && dec !== str ? dec : null;
  } catch (e) {
    return null;
  }
}

function runObfuscationHunter() {
  const raw = document.getElementById("obf-input").value.trim();
  const layersEl = document.getElementById("obf-layers");
  const outEl = document.getElementById("obf-output");
  const warnEl = document.getElementById("obf-warnings");

  if (!raw) {
    alert("Paste something to analyze.");
    return;
  }

  let output = raw;
  const layers = [];
  const warnings = [];

  // patterns
  if (/eval\(/i.test(raw)) warnings.push("⚠ eval() detected (frequently used in obfuscated scripts).");
  if (/Function\(/i.test(raw)) warnings.push("⚠ Function() constructor detected.");
  if (/atob\(/i.test(raw)) warnings.push("⚠ atob() usage — may be decoding hidden payloads.");
  if (/unescape\(/i.test(raw)) warnings.push("⚠ unescape() usage — suspicious legacy API.");
  if (/\\x[0-9A-Fa-f]{2}/.test(raw)) warnings.push("⚠ hex escape sequences (\\xNN) present.");
  if (/\\u[0-9A-Fa-f]{4}/.test(raw)) warnings.push("⚠ unicode escape sequences (\\uNNNN) present.");
  if (/while\s*\(\s*true\s*\)/i.test(raw)) warnings.push("⚠ infinite loop pattern detected.");
  if (/document\.write/i.test(raw)) warnings.push("⚠ document.write() usage can be abused in injected scripts.");

  // attempt decodings (single layer best-effort)
  const b64 = tryBase64(raw);
  if (b64 && b64.length > 4) {
    layers.push("Base64 decoded");
    output = b64;
  }

  const hex = tryHex(raw);
  if (hex && hex.length > 4) {
    layers.push("Hex decoded");
    output = hex;
  }

  const urlDec = tryUrlDecode(raw);
  if (urlDec && urlDec.length > 4) {
    layers.push("URL decoded");
    output = urlDec;
  }

  layersEl.textContent = layers.length
    ? "Detected layers:\n- " + layers.join("\n- ")
    : "No obvious encoding layers detected.";

  outEl.textContent = "Deobfuscated output (best effort):\n\n" + output;

  warnEl.textContent = warnings.length
    ? "Warnings:\n\n" + warnings.join("\n")
    : "No specific obfuscation primitives detected.";
}

function clearObfuscation() {
  document.getElementById("obf-input").value = "";
  document.getElementById("obf-layers").textContent = "";
  document.getElementById("obf-output").textContent = "";
  document.getElementById("obf-warnings").textContent = "";
}
