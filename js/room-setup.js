// Personalize the exercise, not an account. Profiles stay in the current room.
const otherSeat = (role) => (role === "Agent" ? "Customer" : "Agent");
function cleanProfile(p) {
  if (!p || !["Agent", "Customer"].includes(p.role)) return null;
  const text = (k, n) =>
    typeof p[k] === "string" ? p[k].trim().slice(0, n) : "";
  const name = text("name", 48);
  if (!name) return null;
  return {
    role: p.role,
    name,
    city: p.role === "Customer" ? text("city", 70) : "",
    callback: p.role === "Customer" ? text("callback", 32) : "",
    concern: p.role === "Customer" ? text("concern", 350) : "",
  };
}
function participant(role) {
  if (active?.mode !== "live") return null;
  return [active.me, active.partner].find((p) => p?.role === role) || null;
}
function roomSetup(mode, id, code = "", error = "", draft = null) {
  if (active) return resumePrompt();
  if (connecting) return toast("Room setup is already in progress.");
  const host = mode === "create",
    d = D[id],
    role = draft?.role || (host ? "Agent" : "Customer");
  show(`<div class="eyebrow gray">${d ? esc(d.name) : "Live practice"} / Room setup</div><h2>${host ? "Create a practice room" : "Join a practice room"}</h2><p>Choose your seat. Each room has one agent and one customer. Use made-up details for this exercise.</p><form onsubmit="event.preventDefault();submitRoomSetup(this,'${mode}',${id})">
 ${host ? "" : `<label class="field">Room code<input name="code" class="codeinput" required pattern="[a-fA-F0-9]{6}" maxlength="6" value="${esc(code)}" autocapitalize="characters" autocomplete="off" placeholder="A3F291"></label>`}
 <fieldset class="seat-choice"><legend>Your role</legend>${["Agent", "Customer"].map((r) => `<label><input type="radio" name="seat" value="${r}" ${r === role ? "checked" : ""} onchange="setSetupRole(this.form)"><span>${I(r === "Agent" ? "headset" : "user")}${r}</span></label>`).join("")}</fieldset>
 <label class="field"><span id="profile-name-label">${role} practice name</span><input name="practiceName" required maxlength="48" autocomplete="off" value="${esc(draft?.name || "")}" placeholder="e.g. Alex Reyes"></label>
 <div id="customer-fields" ${role === "Customer" ? "" : "hidden"}><label class="field">City or branch <small>(optional)</small><input name="city" maxlength="70" autocomplete="off" value="${esc(draft?.city || "")}" placeholder="e.g. Quezon City"></label><label class="field">Fictional callback number <small>(optional)</small><input name="callback" maxlength="32" autocomplete="off" value="${esc(draft?.callback || "")}" placeholder="Use a training number only"></label><label class="field">Reason for calling <small>(optional)</small><textarea name="concern" rows="2" maxlength="350" placeholder="Leave blank to use the scenario brief.">${esc(draft?.concern || "")}</textarea></label></div>
 <p class="sub">Your partner can see these details during the call. Do not enter private customer information.</p>${error ? `<p class="error" role="alert">${esc(error)}</p>` : ""}<div class="actions setup-actions"><button class="btn orange">${I(host ? "plus" : "phone-call")}${host ? "Create room" : "Join room"}</button>${button("Test network", "testRelay(this)", "", "wifi")}</div><p class="relay-result" role="status"></p></form></div>`);
}
function setSetupRole(f) {
  const role = f.elements.seat.value;
  f.querySelector("#customer-fields").hidden = role !== "Customer";
  f.querySelector("#profile-name-label").textContent = role + " practice name";
}
function submitRoomSetup(f, mode, id) {
  const el = f.elements;
  const profile = cleanProfile({
    role: el.seat.value,
    name: el.practiceName.value,
    city: el.city.value,
    callback: el.callback.value,
    concern: el.concern.value,
  });
  if (!profile) {
    el.practiceName.focus();
    return toast("Enter a practice name.");
  }
  connectRoom(mode, id, el.code?.value.trim().toUpperCase() || "", profile);
}
