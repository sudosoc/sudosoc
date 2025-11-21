function generatePassword() {
  let length = parseInt(document.getElementById("pg-length").value, 10);
  if (isNaN(length) || length < 8) length = 8;
  if (length > 64) length = 64;
  document.getElementById("pg-length").value = length;

  const useLower = document.getElementById("pg-lower").checked;
  const useUpper = document.getElementById("pg-upper").checked;
  const useDigits = document.getElementById("pg-digits").checked;
  const useSymbols = document.getElementById("pg-symbols").checked;

  let chars = "";
  if (useLower) chars += "abcdefghijklmnopqrstuvwxyz";
  if (useUpper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (useDigits) chars += "0123456789";
  if (useSymbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";

  if (!chars) {
    alert("Select at least one character set.");
    return;
  }

  let result = "";
  if (window.crypto && window.crypto.getRandomValues) {
    const buf = new Uint32Array(length);
    window.crypto.getRandomValues(buf);
    for (let i = 0; i < length; i++) {
      result += chars[buf[i] % chars.length];
    }
  } else {
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
  }

  document.getElementById("pg-output").value = result;
}

function copyPassword() {
  const value = document.getElementById("pg-output").value;
  if (!value) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(value).then(() => {
      alert("Password copied.");
    });
  } else {
    const input = document.getElementById("pg-output");
    input.select();
    document.execCommand("copy");
    alert("Password copied.");
  }
}
