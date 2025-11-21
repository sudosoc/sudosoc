const COMMON_PASSWORDS = [
  "password", "123456", "123456789", "qwerty", "letmein", "admin",
  "welcome", "iloveyou", "monkey", "dragon", "111111", "123123",
  "abc123", "qwerty123", "password1"
];

function estimateEntropy(pw) {
  let pool = 0;
  if (/[a-z]/.test(pw)) pool += 26;
  if (/[A-Z]/.test(pw)) pool += 26;
  if (/[0-9]/.test(pw)) pool += 10;
  if (/[^A-Za-z0-9]/.test(pw)) pool += 32; // rough symbol set

  if (pool === 0) return 0;
  const entropy = Math.log2(pool) * pw.length;
  return Math.round(entropy * 10) / 10;
}

function crackTimeEstimate(entropy) {
  // assume 10^10 guesses/sec (very strong attacker)
  const guesses = Math.pow(2, entropy);
  const perSecond = 1e10;
  const seconds = guesses / perSecond;

  if (seconds < 1) return "< 1 second";
  const minute = 60, hour = 3600, day = 86400, year = 31557600;
  if (seconds < minute) return `${Math.round(seconds)} seconds`;
  if (seconds < hour) return `${Math.round(seconds / minute)} minutes`;
  if (seconds < day) return `${Math.round(seconds / hour)} hours`;
  if (seconds < year) return `${Math.round(seconds / day)} days`;
  if (seconds < year * 100) return `${Math.round(seconds / year)} years`;
  return `${Math.round(seconds / year)}+ years`;
}

function hasKeyboardPattern(pw) {
  const patterns = ["qwerty", "asdf", "zxcv", "1234", "12345", "qaz", "wsx"];
  const lower = pw.toLowerCase();
  return patterns.some((p) => lower.includes(p));
}

function analyzePassword() {
  const pw = document.getElementById("ps-input").value;
  const summaryEl = document.getElementById("ps-summary");
  const detailsEl = document.getElementById("ps-details");

  if (!pw) {
    alert("Enter a password to analyze.");
    return;
  }

  const issues = [];
  const lower = pw.toLowerCase();

  if (pw.length < 8) {
    issues.push("Very short: less than 8 characters.");
  } else if (pw.length < 12) {
    issues.push("Short: consider at least 12+ characters.");
  }

  const uniqueChars = new Set(pw.split(""));
  if (uniqueChars.size <= pw.length / 2) {
    issues.push("Repetitive characters: limited variety in the password.");
  }

  if (/^[0-9]+$/.test(pw)) {
    issues.push("Numeric-only password — very weak against brute force.");
  }
  if (/^[A-Za-z]+$/.test(pw)) {
    issues.push("Alphabet-only password — add digits and symbols.");
  }
  if (COMMON_PASSWORDS.includes(lower)) {
    issues.push("Matches a very common password — extremely weak.");
  }

  if (hasKeyboardPattern(pw)) {
    issues.push("Contains common keyboard patterns (e.g. qwerty, 1234).");
  }

  if (/\b(19|20)\d{2}\b/.test(pw)) {
    issues.push("Contains what looks like a year — often guessable.");
  }

  if (/([A-Za-z0-9])\1{2,}/.test(pw)) {
    issues.push("Contains repeated characters (aaa, 111) — reduces strength.");
  }

  const entropy = estimateEntropy(pw);
  const crackTime = crackTimeEstimate(entropy);

  let level = "status-good";
  let label = "Strong";
  if (entropy < 40) {
    level = "status-bad";
    label = "Very Weak";
  } else if (entropy < 60) {
    level = "status-medium";
    label = "Medium";
  }

  summaryEl.innerHTML =
    `<strong>Strength:</strong> <span class="status-pill ${level}">${label}</span>\n\n` +
    `Length: ${pw.length} characters\n` +
    `Estimated entropy: ${entropy} bits\n` +
    `Rough offline crack time (@10¹⁰ guesses/sec): ${crackTime}`;

  detailsEl.textContent =
    issues.length
      ? "Findings:\n\n- " + issues.join("\n- ")
      : "No obvious issues detected. This looks reasonably strong based on basic heuristics.\n\nRemember: never reuse passwords across critical accounts.";
}

function clearPassword() {
  document.getElementById("ps-input").value = "";
  document.getElementById("ps-summary").textContent = "";
  document.getElementById("ps-details").textContent = "";
}
