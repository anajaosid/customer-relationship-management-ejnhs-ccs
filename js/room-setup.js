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
// The first character identifies the case, so a pasted code selects the correct desk and seat.
const casePrefixes="123456ABCDEFGHJKLM";
const codeAlphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function makeRoomCode(id) {
  return (
    casePrefixes[id] +
    Array.from(
      crypto.getRandomValues(new Uint8Array(5)),
      (b) => codeAlphabet[b % 32],
    ).join("")
  );
}
function normalizeCode(value) {
  let v = String(value ?? "").trim();
  if (v.includes("#"))
    v = new URLSearchParams(v.split("#")[1]).get("room") || "";
  return v.replace(/[\s-]/g, "").toUpperCase();
}
function codeDesk(code) {
  const c = normalizeCode(code);
  const id=casePrefixes.indexOf(c[0]);return c.length===6 && id>=0 && /^[A-HJ-NP-Z2-9]{5}$/.test(c.slice(1)) && D[id] ? id : null;
}
function assignedSeat(mode, id) {
  const caller = D[id]?.direction === "Outbound" ? "Agent" : "Customer";
  return mode === "create" ? caller : otherSeat(caller);
}
function roomSetup(mode, id, code = "", error = "", draft = null) {
  if (active) return resumePrompt();
  if (connecting) return toast("Room setup is already in progress.");
  const host = mode === "create";
  code = normalizeCode(code);
  if (!host && codeDesk(code) !== null) id = codeDesk(code);
  const d = D[id],
    role = d ? assignedSeat(mode, id) : null;
  show(`${d ? tile(d) : I("phone-call")}<div class="eyebrow gray" style="margin-top:12px">Room setup</div><h2>${host ? "Create a practice room" : "Join a practice room"}</h2><p>${host ? "You place the call. Share the code with the person who will answer." : "Enter the creator’s code or paste their invitation. Your seat is assigned by the scenario."}</p><form onsubmit="event.preventDefault();submitRoomSetup(this,'${mode}',${id})">
 ${host ? "" : `<label class="field">Room code or invitation<input name="code" class="codeinput" required value="${esc(code)}" autocapitalize="characters" autocomplete="off" spellcheck="false" placeholder="e.g. 2K7BRM" oninput="updateSeat(this.form,${id})"></label>`}
 <div id="seat-summary" class="brief">${seatSummary(mode, id)}</div>
 <label class="field"><span id="profile-name-label">${role || "Your"} practice name</span><input name="practiceName" required maxlength="48" autocomplete="off" value="${esc(draft?.name || "")}" placeholder="e.g. Alex Reyes"></label>
 <div id="customer-fields" ${role === "Customer" ? "" : "hidden"}><label class="field">City or branch <small>(optional)</small><input name="city" maxlength="70" value="${esc(draft?.city || "")}" autocomplete="off"></label><label class="field">Fictional callback number <small>(optional)</small><input name="callback" maxlength="32" value="${esc(draft?.callback || "")}" autocomplete="off"></label><label class="field">Reason for calling <small>(optional)</small><textarea name="concern" rows="2" maxlength="350" placeholder="Leave blank to use the scenario brief.">${esc(draft?.concern || "")}</textarea></label></div>
 <label class="mic-prep"><input type="checkbox" name="prepareMic" checked><span>Prepare microphone before connecting<small>Recommended for phone hotspots. Allow the microphone and local network if your browser asks. No voice is sent before the call is answered.</small></span></label>
 <p class="sub">Use made-up details only. Your partner sees your practice profile.</p><p class="error" role="alert">${esc(error)}</p><div class="actions setup-actions"><button class="btn orange">${I(host ? "plus" : "phone-call")}${host ? "Create room" : "Join room"}</button>${button("Test network", "testRelay(this)", "", "wifi")}</div><p class="relay-result" role="status"></p></form></div>`);
}
function seatSummary(mode, id) {
  const d = D[id];
  return d
    ? `<b>${esc(d.issue)} · ${d.direction} call</b><p>Your seat: <strong>${assignedSeat(mode, id)}</strong> · ${mode === "create" ? "You call your partner." : "You answer the call."}</p>`
    : "<p>The room code will identify your scenario and role.</p>";
}
function updateSeat(f, fallback) {
  const id = codeDesk(f.elements.code.value) ?? fallback,
    d = D[id],
    role = d ? assignedSeat("join", id) : null;
  f.querySelector("#seat-summary").innerHTML = seatSummary("join", id);
  f.querySelector("#customer-fields").hidden = role !== "Customer";
  f.querySelector("#profile-name-label").textContent =
    (role || "Your") + " practice name";
  f.querySelector(".error").textContent = "";
}
function submitRoomSetup(f, mode, id) {
  const el = f.elements,
    code = normalizeCode(el.code?.value);
  if (mode === "join") {
    id = codeDesk(code);
    if (id === null) {
      f.querySelector(".error").textContent =
        "Use a current six-character room code or invite link. Older rooms must be recreated after updating both browsers.";
      return;
    }
  }
  const profile = cleanProfile({
    role: assignedSeat(mode, id),
    name: el.practiceName.value,
    city: el.city.value,
    callback: el.callback.value,
    concern: el.concern.value,
  });
  if (!profile) {
    el.practiceName.focus();
    return toast("Enter a practice name.");
  }
  connectRoom(mode, id, code, profile, el.prepareMic.checked);
}
