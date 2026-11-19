// Shared classroom computers: remove only RelayDesk history, not other apps' data.
function confirmHistoryReset() {
  show(
    `<h2>Clear practice history?</h2><p>This deletes completed sessions and case notes saved in this browser. It does not end an active call.</p></div><div class="dialog-footer">${button("Keep history", "closeModal()")}${button("Clear history", "clearSavedHistory()", "dark")}</div>`,
  );
}
function clearSavedHistory() {
  try {
    localStorage.removeItem("relay-history");
  } catch {
    return toast("Browser storage is unavailable. No history was deleted.");
  }
  historyList = [];
  closeModal();
  render();
  toast("Saved practice history cleared on this device.");
}
