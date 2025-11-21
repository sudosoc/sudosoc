function analyzeRedirect() {
  const url = document.getElementById("rc-url").value.trim();
  const chainEl = document.getElementById("rc-chain");
  const warnEl = document.getElementById("rc-warnings");

  if (!url) {
    alert("Enter a URL first.");
    return;
  }

  const patterns = [
    "redirect=",
    "redir=",
    "next=",
    "forward=",
    "url=",
    "target=",
    "dest=",
    "u=",
    "link=",
    "goto=",
    "out=",
    "r=",
    "to=",
    "callback="
  ];

  const found = [];
  patterns.forEach((p) => {
    if (new RegExp(p, "i").test(url)) found.push(p);
  });

  let chainText = "";
  if (found.length) {
    chainText += "Potential redirect-style parameters detected:\n\n";
    chainText += found.map((p) => "- " + p).join("\n");
  } else {
    chainText = "No obvious redirect parameters detected by static patterns.";
  }

  chainEl.textContent = chainText;

  const warnings = [];

  if (/%2f/i.test(url) || /%5c/i.test(url)) {
    warnings.push("Encoded slashes (%2F / %5C) present — may hide true path.");
  }
  if (/@/.test(url)) {
    warnings.push("The '@' symbol appears in the URL — classic trick to hide the real destination.");
  }
  if (url.length > 150) {
    warnings.push("URL is quite long — can be a sign of tracking or obfuscation.");
  }
  if (/\b\d{1,3}(\.\d{1,3}){3}\b/.test(url)) {
    warnings.push("URL uses a raw IP instead of a domain — higher risk for phishing.");
  }
  if (/\/\/[a-z0-9-]+\.[a-z]{2,}.*@/i.test(url)) {
    warnings.push("Possible visually deceptive URL structure before '@'.");
  }

  warnEl.textContent =
    warnings.length
      ? "Warnings:\n\n" + warnings.join("\n")
      : "No specific static warning patterns triggered. Always verify manually.";
}

function clearRedirect() {
  document.getElementById("rc-url").value = "";
  document.getElementById("rc-chain").textContent = "";
  document.getElementById("rc-warnings").textContent = "";
}
