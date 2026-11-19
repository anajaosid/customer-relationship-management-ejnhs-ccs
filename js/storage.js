// Browser-local session history. No account or backend.
function load(k, def) {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? def;
  } catch {
    return def;
  }
}
function save(k, v) {
  try {
    localStorage.setItem(k, JSON.stringify(v));
    return true;
  } catch {
    toast(
      "Browser storage unavailable. Changes will last for this visit only.",
    );
    return false;
  }
}
