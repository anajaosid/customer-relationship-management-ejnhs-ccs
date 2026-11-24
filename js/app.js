"use strict";
const $ = (q) => document.querySelector(q),
  I = (name) =>
    `<svg class="ic" aria-hidden="true"><use href="./assets/icons.svg#${name}"/></svg>`,
  esc = (x) =>
    String(x ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const D = [
  [
    "Healthcare",
    "Patient appointments, coverage inquiries, and care coordination.",
    "stethoscope",
    "#31836e",
    "#e6f3ed",
    "Beginner",
    "6–8",
    "HLC",
    "Mara Reyes",
    "Appointment scheduling",
    "I need to move my follow-up appointment. Is there a slot on Friday?",
    "Outpatient services",
    "Tuesday, 10:00 AM",
    "Friday, 2:30 PM is available.",
    "Reschedule the appointment",
    "Friday afternoon works for me. Please confirm the new time.",
    "Appointment rescheduled",
  ],
  [
    "Network support",
    "Troubleshoot connectivity, diagnose outages, and restore service.",
    "router",
    "#3b75b0",
    "#e9f1fb",
    "Intermediate",
    "8–12",
    "NET",
    "Paolo Cruz",
    "Intermittent connection",
    "My Wi-Fi keeps dropping during my online classes. Can you help?",
    "Home Fiber 200",
    "No area outage reported",
    "The wired connection is stable; the router is beside a microwave.",
    "Guide router relocation",
    "I moved the router away from the microwave. My connection is stable now.",
    "Connection restored",
  ],
  [
    "Retail & e-commerce",
    "Handle order tracking, product returns, and refund requests.",
    "shopping-bag",
    "#b57528",
    "#fff1d9",
    "Beginner",
    "5–8",
    "RTL",
    "Isabel Tan",
    "Order return request",
    "My order arrived in the wrong size. Can I send it back?",
    "Standard delivery",
    "Order RD-2048 · Delivered yesterday",
    "Unused items can be returned within 14 days.",
    "Issue a prepaid return label",
    "The item is unused. I received the label. When should I expect my refund?",
    "Return authorized",
  ],
  [
    "Banking & finance",
    "Navigate billing disputes, card concerns, and account servicing.",
    "landmark",
    "#8567ad",
    "#f2ecfa",
    "Advanced",
    "10–15",
    "BNK",
    "Luis Santos",
    "Duplicate card charge",
    "The same café payment appears twice on my statement.",
    "Everyday checking",
    "Two posted charges · ₱280 each",
    "A dispute review takes up to 10 business days; do not promise a refund.",
    "File a duplicate-charge dispute",
    "I only made one purchase. Thank you for opening the review.",
    "Dispute submitted",
  ],
  [
    "Travel & hospitality",
    "Manage reservations, itinerary changes, and guest requests.",
    "plane",
    "#b16e5c",
    "#fcf0e9",
    "Intermediate",
    "8–10",
    "TRV",
    "Nina Garcia",
    "Reservation change",
    "My flight was moved. Can I check in one day later?",
    "Flex stay booking",
    "Arrival: Thursday · 2 nights",
    "Friday arrival is available at the same nightly rate.",
    "Update the reservation",
    "Friday arrival for two nights is perfect. Will you confirm my dates?",
    "Reservation updated",
  ],
  [
    "Telecommunications",
    "Resolve mobile plan issues, billing questions, and service upgrades.",
    "radio-tower",
    "#348590",
    "#e6f3f4",
    "Intermediate",
    "7–10",
    "TEL",
    "Alex Lim",
    "Mobile data charge",
    "My bill is higher than usual. I thought my plan included data.",
    "Mobile Plus 20 GB",
    "₱150 charge · 3 GB extra usage",
    "The usage alert was disabled; the charge matches the plan terms.",
    "Enable usage alerts with consent",
    "That explains the extra charge. Yes, please turn on usage alerts.",
    "Usage alerts enabled",
  ],
].map(
  (
    [
      name,
      desc,
      icon,
      accent,
      tint,
      level,
      time,
      code,
      person,
      issue,
      opening,
      plan,
      record,
      policy,
      action,
      reply,
      result,
    ],
    id,
  ) => ({
    name,
    desc,
    icon,
    accent,
    tint,
    level,
    time,
    code,
    person,
    issue,
    opening,
    plan,
    record,
    policy,
    action,
    reply,
    result,
    id,
  }),
);
const coaching = [
  [
    ["Confirm the preferred day and time", "Promise the next available slot"],
    0,
    "Friday afternoon would be best. I can make 2:30 PM.",
    "Check availability before promising a new appointment.",
    "Appointment reminder delivered",
    "Follow-up visit booked",
    "Friday, 2:30 PM · Confirmed",
  ],
  [
    [
      "Replace the router immediately",
      "Compare wired and wireless connections",
    ],
    1,
    "My wired laptop works fine. Only Wi-Fi drops, especially when the microwave is on.",
    "Isolate the fault before recommending a replacement.",
    "Fiber line test passed",
    "Router installation completed",
    "Wireless stability confirmed by customer",
  ],
  [
    ["Check condition and delivery date", "Offer an immediate cash refund"],
    0,
    "It arrived yesterday and I haven’t used it. The original tags are still on.",
    "Establish return eligibility before offering a refund.",
    "Order delivered to customer",
    "Order RD-2048 dispatched",
    "Return label issued · Awaiting receipt",
  ],
  [
    ["Guarantee a same-day refund", "Check whether both charges are posted"],
    1,
    "Both charges have posted. They have the same merchant, date, and amount.",
    "A dispute requires review. Do not guarantee a refund.",
    "Monthly statement issued",
    "Transaction alerts activated",
    "Dispute open · Review in 10 business days",
  ],
  [
    ["Confirm the revised stay dates", "Cancel and rebook at a new rate"],
    0,
    "I would like to arrive on Friday and leave on Sunday. Can I keep my rate?",
    "Check the flexible booking terms before canceling a stay.",
    "Booking confirmation delivered",
    "Flex rate reservation created",
    "Friday arrival · 2 nights confirmed",
  ],
  [
    ["Upgrade the plan without approval", "Review the allowance and overage"],
    1,
    "I used 23 GB on my 20 GB plan. I didn’t get a usage notification.",
    "Review the bill first. Plan changes require explicit consent.",
    "Monthly invoice generated",
    "Mobile Plus plan activated",
    "Data alerts active · Existing plan retained",
  ],
];
let historyList = load("relay-history", []),
  view = "Overview",
  filter = "All levels",
  search = "",
  active = null,
  live = null,
  mobile = false,
  lastFocus = null;
const level = (d) =>
    `<span class="level ${d.level.toLowerCase()}"><span class="bars"><i></i><i></i><i></i></span>${d.level}</span>`,
  tile = (d) =>
    `<span class="tile" style="--accent:${d.accent};--tint:${d.tint}">${I(d.icon)}</span>`,
  button = (s, action, sty = "", icon = "") =>
    `<button type="button" class="btn ${sty}" onclick="${action}">${icon ? I(icon) : ""}${s}</button>`;
function go(v) {
  mobile = false;
  view = v;
  render();
  window.scrollTo(0, 0);
}
function drawer(v) {
  mobile = v;
  $(".mastnav").classList.toggle("open", v);
  $(".mobilemenu").setAttribute("aria-expanded", v);
}
const navLabels = {
  Overview: "Practice floor",
  "Scenario library": "Scenario library",
  "Live call room": "Live rooms",
  "Session history": "History",
  "Agent handbook": "Call guide",
  "Active session": "Current call",
};
function render() {
  let links = [
    "Overview",
    "Live call room",
    "Session history",
    "Agent handbook",
    ...(active ? ["Active session"] : []),
  ];
  $("#shell").innerHTML =
    `<header class="mast"><div class="mastinner"><button class="brand mastbrand" onclick="go('Overview')" aria-label="EJNHS CCS CRM home"><span class="logomark"><i></i><i></i><i></i></span><b><span class="school-name">EJNHS CCS</span> CRM</b></button><nav class="mastnav" aria-label="Main navigation" id="mainnav">${links.map((n) => `<button class="${view === n || (view === "Scenario library" && n === "Overview") ? "selected" : ""}" onclick="go('${n}')" ${view === n ? 'aria-current="page"' : ""}>${navLabels[n]}</button>`).join("")}</nav><div class="masttools">${button("Join with a code", "joinForm(null)", "dark", "radio")}<button class="mobilemenu iconbtn" aria-controls="mainnav" aria-expanded="false" aria-label="Toggle navigation" onclick="drawer(!mobile)">${I("menu")}</button></div></div></header><main class="main"><div class="content" id="content"></div></main>`;
  let body =
    view === "Overview"
      ? overview()
      : view === "Scenario library"
        ? library(true)
        : view === "Live call room"
          ? roomPage()
          : view === "Session history"
            ? historyPage()
            : view === "Agent handbook"
              ? guide()
              : consolePage();
  $("#content").innerHTML =
    body +
    `<footer class="page-foot"><span>${I("audio-lines")}EJNHS CCS CRM <i>/</i> Call lab</span><span>Fictional cases. No sign-in needed.</span></footer>`;
  tick();
}
function browse() {
  filter = "All levels";
  $(".filter select").value = filter;
  refreshCards();
  $("#scenario-shelf").scrollIntoView({
    behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
      ? "instant"
      : "smooth",
    block: "start",
  });
  $("#scenario-title").focus({ preventScroll: true });
}
function overview() {
  return `<section class="hero"><div class="labmark">CCS <span>/</span> Customer service lab</div><h1>The practice floor</h1><p>Take the agent seat or call in as a customer. Choose a case below to start—no sign-in needed.</p><div class="heroactions">${button("Choose a scenario " + I("arrow-right"), "browse()", "orange")}<button class="herohelp" onclick="go('Agent handbook')">Call guide ${I("arrow-up-right")}</button></div></section><ol class="howstrip" aria-label="How practice works"><li><i>1</i><span>Pick a scenario</span></li><li><i>2</i><span>Share the room code</span></li><li><i>3</i><span>Answer the call</span></li></ol>${library(false)}`;
}
function library(full) {
  return `<section id="scenario-shelf" aria-label="Scenario library"><div class="heading"><div><div class="row"><h2 id="scenario-title" tabindex="-1">Scenario library</h2></div><p>Create or join a room, then choose your role.</p></div><label class="filter">${I("list-filter")}<select aria-label="Filter scenarios by difficulty" onchange="filter=this.value;refreshCards()">${["All levels", "Beginner", "Intermediate", "Advanced"].map((l) => `<option ${filter === l ? "selected" : ""}>${l}</option>`).join("")}</select>${I("chevron-down")}</label></div>${full ? `<input class="search" aria-label="Search scenarios" placeholder="Search industry or topic…" value="${esc(search)}" oninput="search=this.value;refreshCards()">` : ""}<div class="grid" id="cards">${cards(full)}</div></section>`;
}
function refreshCards() {
  $("#cards").innerHTML = cards(view === "Scenario library");
}
function cards(full) {
  return (
    D.filter(
      (d) =>
        (filter === "All levels" || d.level === filter) &&
        (!full ||
          (d.name + " " + d.desc).toLowerCase().includes(search.toLowerCase())),
    )
      .map(
        (d) =>
          `<article class="card" style="--tint:${d.tint};--accent:${d.accent}"><div class="deskcover"><span class="desknumber">Desk <b>0${d.id + 1}</b></span><img src="./assets/desks/${d.code}.svg" alt=""></div><div class="cardbody"><div class="cardline"><span>${d.level}</span><i></i><span>${d.time} min</span><button class="practice-alone" onclick="beginSolo(${d.id})">Practice solo ${I("arrow-up-right")}</button></div><h3><button class="title-link" onclick="briefing(${d.id})" aria-label="Open ${d.name} scenario">${d.name}${I("arrow-up-right")}</button></h3><p>${["Help a patient move a follow-up appointment.", "Find out why a home Wi-Fi connection keeps dropping.", "Arrange a return for a customer sent the wrong size.", "Investigate a duplicate charge on a card statement.", "Change a hotel booking after a flight is moved.", "Explain an unexpected mobile data charge."][d.id]}</p></div><div class="room-actions"><button onclick="startLive(${d.id})">${I("plus")} Create room</button><button onclick="joinForm(${d.id})">Join room ${I("arrow-right")}</button></div></article>`,
      )
      .join("") ||
    '<p class="muted">No matching scenarios. Try a different level or search.</p>'
  );
}
function show(html) {
  if (!$("#modal").innerHTML) lastFocus = document.activeElement;
  $("#modal").innerHTML =
    `<div class="modal-back" onclick="if(event.target===this)closeModal()"><section class="dialog" role="dialog" aria-modal="true" aria-label="Training workspace dialog"><div class="dialog-main"><button class="close" aria-label="Close dialog" onclick="closeModal()">${I("x")}</button>${html}</section></div>`;
  document.body.style.overflow = "hidden";
  $(".close").focus();
}
function closeModal() {
  $("#modal").innerHTML = "";
  document.body.style.overflow = "";
  lastFocus?.focus?.();
}
function toast(s) {
  let e = $("#toast");
  e.textContent = s;
  e.className = "show";
  clearTimeout(toast.t);
  toast.t = setTimeout(() => (e.className = ""), 3600);
}
function briefing(id) {
  if (active) return resumePrompt();
  let d = D[id];
  show(
    `${tile(d)}<div class="case-id">SCENARIO BRIEF / ${d.code}-0${id + 1}</div><h2>${d.name}</h2>${level(d)}<div class="brief"><b>${d.issue}</b><p>“${d.opening}”</p></div><div class="eyebrow gray">TWO-PERSON VOICE PRACTICE</div><p>Create or join a room, choose a role, and enter a practice name.</p><div class="actions" style="margin-top:14px">${button("Create room", `startLive(${id})`, "orange", "plus")}${button("Join room", `joinForm(${id})`, "", "radio")}</div></div><div class="dialog-footer">${button("Start solo practice", `beginSolo(${id})`, "", "play")}</div>`,
  );
}
function joinForm(id, code = "", error = "", preferred = "Customer") {
  roomSetup("join", id, code, error, { role: preferred });
}
function resumePrompt() {
  show(
    `<div class="eyebrow gray">SESSION IN PROGRESS</div><h2>Return to your case</h2><p>Finish or leave your current session before starting another.</p></div><div class="dialog-footer">${button("Resume session", "closeModal();go('Active session')", "orange")}</div>`,
  );
}
function head(k, t, s) {
  return `<div class="page-head"><div class="eyebrow gray">${k}</div><h1 class="page-title">${t}</h1><p class="sub">${s}</p></div>`;
}
function roomPage() {
  if (active)
    return (
      head(
        "PEER-TO-PEER VOICE",
        "Live call room",
        "One active case at a time keeps your workspace focused.",
      ) +
      `<div class="panel"><h3>Session in progress</h3><p>Return to your ${active.mode === "solo" ? "solo practice" : "live role-play"} to continue.</p>${button("Resume session", "go('Active session')", "orange", "headset")}</div>`
    );
  return (
    head(
      "PEER-TO-PEER VOICE",
      "Live call room",
      "Practice together. One person takes the agent seat; the other plays the customer.",
    ) +
    `<div class="livegrid"><section class="panel"><span class="tile" style="--tint:#fff0e4;--accent:#ad653c">${I("headset")}</span><div class="case-id">01 / CREATE</div><h3>Host a practice call</h3><p>Choose an industry, create your room, and share its code with your partner.</p><label class="field">Practice scenario<select id="roomscenario">${D.map((d) => `<option value="${d.id}">${d.name}</option>`).join("")}</select></label>${button("Create live room", "startLive(+$('#roomscenario').value)", "orange", "plus")}</section><section class="panel"><span class="tile" style="--tint:#e9f1fa;--accent:#5483ae">${I("users")}</span><div class="case-id">02 / JOIN</div><h3>Join your partner</h3><p>Enter the creator’s six-character code, then choose the available role.</p><form onsubmit="event.preventDefault();joinLive(this.code.value.trim().toUpperCase())"><label class="field">Room code<input name="code" placeholder="e.g. A3F291" pattern="[A-Fa-f0-9]{6}" maxlength="6" required autocapitalize="characters" autocomplete="off"></label><button class="btn dark">${I("radio")}Join room</button></form></section></div><div class="privacy">${I("shield-check")}No account or database required. Audio is live and is never recorded by EJNHS CCS CRM.</div>`
  );
}
function historyPage() {
  return (
    head(
      "YOUR ACTIVITY",
      "Session history",
      "Completed practice sessions saved on this browser.",
    ) +
    (historyList.length
      ? `<div class="panel">${historyList.map((s, i) => `<div class="historyitem">${tile(D[s.id])}<div><b>${D[s.id].name}</b><small>${new Date(s.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })} · ${s.mode === "solo" ? "Solo practice" : "Live role-play"} · ${duration(s.seconds)}</small></div><span class="tag">${esc(s.outcome)}</span><button class="iconbtn" aria-label="View session details" onclick="review(${i})">${I("chevron-right")}</button></div>`).join("")}</div><div class="actions" style="margin-top:12px">${button("Clear saved history", "confirmHistoryReset()", "", "history")}</div>`
      : `<div class="panel empty">${I("history")}<h3>Your first session starts here</h3><p>Complete a scenario and its wrap-up to see your case notes and practice time here.</p>${button("Explore scenarios", "go('Scenario library')", "orange")}</div>`)
  );
}
function review(i) {
  let s = historyList[i];
  show(
    `<div class="eyebrow gray">COMPLETED CASE / ${D[s.id].code}</div><h2>${D[s.id].name}</h2><p>${esc(s.outcome)} · ${duration(s.seconds)} · ${new Date(s.at).toLocaleString()}</p><div class="brief"><b>After-call notes</b><p style="white-space:pre-wrap">${esc(s.notes)}</p></div><b>Case documentation</b><p>${s.verified ? "Account verified" : "Verification not completed"} · ${s.done ? D[s.id].result : "No account action recorded"}</p></div>`,
  );
}
function guide() {
  let items = [
    [
      "01",
      "Open the call",
      "Introduce yourself, confirm the reason for calling, and acknowledge the customer’s concern. Use the customer’s name naturally.",
    ],
    [
      "02",
      "Verify the training account",
      "Ask for the fictional account name and reference shown in the brief. Never enter real patient, payment, password, or identity information.",
    ],
    [
      "03",
      "Investigate and resolve",
      "Read the customer record and case policy. Explain an available action, ask for consent, then update the record. Escalate cases outside the scenario policy.",
    ],
    [
      "04",
      "Complete after-call work",
      "Summarize the action and the next step. Choose a disposition and write concise notes before closing the case.",
    ],
    [
      "05",
      "Set up live voice",
      "Both students must open the same deployed site. Choose the same industry. Either participant creates the room. Choose different roles and share the code or invitation. The agent answers the incoming call. Allow microphone access on both devices. Use headphones and allow microphone access over HTTPS. If a school network blocks peer-to-peer connections, try another network or ask your instructor to configure TURN.",
    ],
    [
      "06",
      "Understand your data",
      "Solo customers use scripted replies, not a real customer line. Rooms are temporary. On the static site, PeerJS Cloud helps devices find each other. EJNHS CCS CRM does not record messages or audio. Completed cases stay on this device. Practice names and fictional customer details are shared with the other participant for this session.",
    ],
  ];
  return (
    head(
      "DESK REFERENCE",
      "Agent handbook",
      "A quick reference for the call flow, customer care, and live practice.",
    ) +
    `<div class="panel guide">${items.map(([n, t, p], i) => `<details ${i === 0 ? "open" : ""}><summary><span class="tag">${n}</span> &nbsp;${t}</summary><p>${p}</p></details>`).join("")}</div>`
  );
}
function makeSession(id, mode, role = "Agent") {
  return {
    id,
    mode,
    role,
    start: Date.now(),
    notes: "",
    verified: false,
    done: false,
    stage: 0,
    logs: [],
    outcome: "Resolved",
  };
}
function beginSolo(id) {
  if (active) return resumePrompt();
  closeModal();
  active = makeSession(id, "solo");
  active.logs.push({ from: "Customer", text: D[id].opening });
  go("Active session");
}
function duration(s) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}
function tick() {
  let t = $("#elapsed");
  if (t && active)
    t.textContent = duration(
      Math.max(
        0,
        Math.floor(
          ((live?.endedAt || Date.now()) - (live?.callStart || active.start)) /
            1000,
        ),
      ),
    );
}
setInterval(tick, 1000);
function consolePage() {
  if (!active) return "";
  if (
    active.mode === "live" &&
    live &&
    ["waiting", "ringing", "incoming"].includes(live.phase)
  )
    return lobby();
  const a = active,
    d = D[a.id],
    guest = a.role === "Customer",
    isLive = a.mode === "live";
  return (
    head(
      "TRAINING CONSOLE / " + d.code + "-0" + (d.id + 1),
      d.name,
      `${a.role} seat · ${isLive ? "Live partner role-play" : "Solo practice with a scripted customer"}`,
    ) +
    `<div class="statusbar"><div class="row">${I("headset")}<b>${isLive ? esc(live?.status || "Connecting…") : "Practice in progress"}</b></div><div class="row">${isLive && live?.code ? button('<span class="roomcode">' + live.code + "</span>", "copyCode()", "", "copy") : ""}<span id="elapsed" class="mono">0:00</span></div></div>${isLive ? callControls() + `<div class="participant-strip">Agent: <b>${esc(participant("Agent")?.name)}</b> &nbsp;·&nbsp; Customer: <b>${esc(participant("Customer")?.name)}</b></div>` : ""}${mobilePanes(a)}<div class="consolegrid" data-pane="${a.pane || "call"}"><div class="record-column"><section class="panel"><div class="eyebrow gray">${guest ? "YOUR FICTIONAL IDENTITY" : "CUSTOMER RECORD"}</div><div class="row" style="gap:12px;margin:14px 0">${tile(d)}<div><h3>${esc(participant("Customer")?.name || d.person)}</h3><small class="muted">Training account</small></div></div><dl class="details"><dt>Reference</dt><dd>RD-40${a.id + 12}</dd>${participant("Customer")?.city ? `<dt>City / branch</dt><dd>${esc(participant("Customer").city)}</dd>` : ""}${participant("Customer")?.callback ? `<dt>Callback</dt><dd>${esc(participant("Customer").callback)}</dd>` : ""}<dt>Service</dt><dd>${d.plan}</dd><dt>Verification</dt><dd>${a.verified ? "Verified" : "Not verified"}</dd></dl>${!guest && !a.verified ? button("Verify account", "verifyForm()", "", "shield-check") : ""}</section><section class="panel"><div class="eyebrow gray">CASE CONTEXT</div><h3>${d.issue}</h3>${participant("Customer")?.concern ? `<p><b>Customer request:</b> ${esc(participant("Customer").concern)}</p>` : ""}<p>${a.done ? coaching[a.id][6] : d.record}</p><div class="guide-card"><b>${guest ? "Customer cue" : "Service policy"}</b><p>${guest ? d.reply : d.policy}</p></div>${!guest ? (a.done ? `<span class="tag">${I("check")} ${d.result}</span>` : button(d.action, "caseAction()", "", "clipboard-list")) : ""}</section><section class="panel"><div class="eyebrow gray">ACCOUNT TIMELINE</div><h3>Contact history</h3><div class="timeline"><div><small>CURRENT INTERACTION</small><p>${a.done ? d.result : d.issue}</p></div><div><small>PREVIOUS UPDATE</small><p>${coaching[a.id][4]}</p></div><div><small>ACCOUNT HISTORY</small><p>${coaching[a.id][5]}</p></div></div></section></div><div class="work-column"><section class="panel conversation-panel"><div class="eyebrow gray">${isLive ? "PEER-TO-PEER" : "GUIDED PRACTICE"}</div><h3>${isLive ? "Room conversation" : "Call conversation"}</h3>${guest ? `<div class="brief"><b>Start with this request</b><p>“${esc(participant("Customer")?.concern || d.opening)}”</p></div>` : ""}<div class="chatbox" id="chatbox">${chatMarkup()}</div>${isLive ? `<form class="chatinput" onsubmit="event.preventDefault();sendChat(this.msg)"><input class="search" style="max-width:none;margin:0" name="msg" value="${esc(a.chatDraft || "")}" oninput="active.chatDraft=this.value" aria-label="Message your partner" required maxlength="1000" placeholder="Message your partner…"><button class="btn" aria-label="Send message">${I("send")}</button></form>` : soloControls()}</section>${!guest ? `<section class="panel wrap-panel"><div class="eyebrow gray">AFTER-CALL WORK</div><h3>Case notes & wrap-up</h3><label class="field">Agent notes<textarea maxlength="3000" placeholder="Summarize the issue, action taken, and next steps…" oninput="active.notes=this.value">${esc(a.notes)}</textarea></label><div class="actions">${button("Wrap up session", "wrap()", "orange", "circle-check")}${!isLive ? button("Discard", "leavePrompt()") : ""}</div></section>` : ""}</div></div>`
  );
}
function chatMarkup() {
  return (
    active.logs
      .map(
        (m) =>
          `<div class="message ${m.from === active.role ? "mine" : ""}"><small>${esc(m.from)}${participant(m.from) ? " · " + esc(participant(m.from).name) : ""}</small>${esc(m.text)}</div>`,
      )
      .join("") ||
    "<p>Share the room code with your partner. Messages appear here once connected.</p>"
  );
}
function refreshChat() {
  if ($("#chatbox")) {
    $("#chatbox").innerHTML = chatMarkup();
    $("#chatbox").scrollTop = $("#chatbox").scrollHeight;
  }
}
function soloControls() {
  let a = active;
  return a.stage === 0
    ? `<div class="eyebrow gray" style="margin-top:12px">NEXT RESPONSE</div>${button("Greet & confirm the request", "greet()", "", "messages-square")}`
    : a.stage === 1
      ? "<p>Next: verify the account using the customer record.</p>"
      : !a.probed
        ? `<div class="eyebrow gray" style="margin-top:14px">CHOOSE YOUR APPROACH</div><div class="probes">${coaching[a.id][0].map((opt, i) => button(opt, `probe(${i})`, "", "messages-square")).join("")}</div>${a.feedback ? `<div class="actionfeedback">${esc(a.feedback)}</div>` : ""}`
        : !a.done
          ? "<p>Next: review the service policy and choose an account action.</p>"
          : "<p>Next: summarize the outcome in your notes and wrap up.</p>";
}
function greet() {
  active.stage = 1;
  active.logs.push(
    {
      from: "Agent",
      text: "Thank you for calling. I can help with that. May I confirm your account name and training reference?",
    },
    {
      from: "Customer",
      text: `Of course. It’s ${D[active.id].person}, reference RD-40${active.id + 12}.`,
    },
  );
  render();
}
function verifyForm() {
  if (active.mode === "solo" && active.stage === 0)
    return toast("Greet the customer first.");
  show(
    `<div class="eyebrow gray">IDENTITY CHECK</div><h2>Verify training account</h2><p>Confirm the fictional reference with the customer before changing their record.</p><form onsubmit="event.preventDefault();verify(this.ref.value)"><label class="field">Account reference<input required name="ref" placeholder="RD-0000" autocomplete="off"></label><p class="error" id="verifyerr"></p><button class="btn orange">Verify account</button></form></div>`,
  );
}
function verify(ref) {
  if (ref.trim().toUpperCase() !== "RD-40" + (active.id + 12))
    return ($("#verifyerr").textContent =
      "The reference does not match. Confirm it with the customer.");
  active.verified = true;
  active.stage = 2;
  active.logs.push({ from: "Case update", text: "Training account verified." });
  notifyPeer();
  closeModal();
  render();
}
function probe(i) {
  let a = active,
    c = coaching[a.id];
  if (i !== c[1]) {
    a.feedback = c[3];
    render();
    return;
  }
  a.probed = true;
  a.feedback = "";
  a.logs.push(
    { from: "Agent", text: c[0][i] + "." },
    { from: "Customer", text: c[2] },
  );
  render();
  refreshChat();
}
function caseAction() {
  if (!active.verified)
    return toast("Verify the training account before making changes.");
  if (active.mode === "solo" && !active.probed)
    return toast("Choose an approach in the call conversation first.");
  let d = D[active.id];
  show(
    `<div class="eyebrow gray">ACCOUNT ACTION</div><h2>${d.action}</h2><p>${d.policy}</p><div class="brief"><b>Customer consent</b><p>${active.mode === "solo" ? "“" + d.reply + "”" : "Confirm the proposed action with your partner before submitting."}</p></div></div><div class="dialog-footer">${button("Cancel", "closeModal()")}${button("Confirm action", "applyAction()", "orange")}</div>`,
  );
}
function applyAction() {
  active.done = true;
  let d = D[active.id];
  active.logs.push({ from: "Case update", text: d.result + ". " + d.policy });
  notifyPeer();
  closeModal();
  render();
}
function wrap() {
  if (!active.notes.trim()) {
    toast("Add case notes before wrapping up.");
    $("textarea")?.focus();
    return;
  }
  show(
    `<div class="eyebrow gray">AFTER-CALL WORK</div><h2>Complete this session</h2><p>Select the disposition that reflects your case work.</p><label class="field">Case disposition<select id="disposition">${(active.done ? ["Resolved", "Follow-up required", "Escalated"] : ["Follow-up required", "Escalated"]).map((x) => `<option>${x}</option>`).join("")}</select></label><div class="brief"><b>Agent notes</b><p>${esc(active.notes)}</p></div></div><div class="dialog-footer">${button("Back to case", "closeModal()")}${button("Save & finish", "finishSession()", "orange", "check")}</div>`,
  );
}
function finishSession() {
  let a = active;
  historyList.unshift({
    id: a.id,
    mode: a.mode,
    seconds: Math.floor((Date.now() - a.start) / 1000),
    at: Date.now(),
    outcome: $("#disposition").value,
    notes: a.notes,
    verified: a.verified,
    done: a.done,
  });
  save("relay-history", historyList);
  disconnect();
  active = null;
  closeModal();
  go("Session history");
  toast("Session completed. Wrap-up saved to your history.");
}
function leavePrompt() {
  show(
    `<div class="eyebrow gray">LEAVE SESSION</div><h2>Leave this practice case?</h2><p>Unfinished notes will not be saved.${active.mode === "live" ? " Your partner will be disconnected." : ""}</p></div><div class="dialog-footer">${button("Keep practicing", "closeModal()")}${button("Leave session", "disconnect();active=null;closeModal();go('Overview')", "dark")}</div>`,
  );
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if ($("#modal").innerHTML) closeModal();
    else if (mobile) drawer(false);
  }
  if (e.key === "Tab" && $("#modal").innerHTML) {
    let els = [
      ...$(".dialog").querySelectorAll(
        'button,input,textarea,select,[tabindex="0"]',
      ),
    ].filter((el) => !el.disabled);
    if (e.shiftKey && document.activeElement === els[0]) {
      e.preventDefault();
      els.at(-1).focus();
    } else if (!e.shiftKey && document.activeElement === els.at(-1)) {
      e.preventDefault();
      els[0].focus();
    }
  }
});
window.addEventListener("beforeunload", (e) => {
  if (active) {
    e.preventDefault();
    e.returnValue = "";
  }
});
window.addEventListener("pagehide", disconnect);
render();

function inviteURL() {
  const url = new URL("./", document.baseURI);
  url.hash = new URLSearchParams({
    room: live.code,
    desk: D[active.id].code,
    seat: otherSeat(active.role),
  });
  return url.href;
}
async function shareInvite() {
  if (!active || !live?.code) return;
  if (location.hostname.endsWith(".e2b.app")) {
    show(
      `<h2>Share from the public site</h2><p>This preview requires workspace access. Deploy EJNHS CCS CRM on a public host first, then create a room there to get a classmate invitation link.</p></div>`,
    );
    return;
  }
  const url = inviteURL();
  try {
    await navigator.clipboard.writeText(url);
    toast("Invite copied. Send it to your classmate.");
  } catch {
    show(
      `<h2>Room invitation</h2><p>Copy this link and send it to your partner. Keep your room open until they join.</p><label class="field">Invitation link<input id="shareurl" readonly value="${esc(url)}"></label></div>`,
    );
    $("#shareurl").select();
  }
}
function openInvite() {
  const args = new URLSearchParams(location.hash.slice(1)),
    code = (args.get("room") || "").toUpperCase(),
    desk = D.find((d) => d.code === args.get("desk"));
  if (!active && /^[A-F0-9]{6}$/.test(code)) {
    joinForm(
      desk?.id ?? null,
      code,
      "",
      args.get("seat") === "Agent" ? "Agent" : "Customer",
    );
  }
}
openInvite();
window.addEventListener("hashchange", openInvite);

function mobilePanes(a) {
  const panes = [
    ["call", "Call"],
    ["record", "Record"],
    ...(a.role === "Agent" ? [["wrap", "Wrap-up"]] : []),
  ];
  return `<nav class="pane-switch" aria-label="Case sections">${panes.map(([key, label]) => `<button aria-pressed="${(a.pane || "call") === key}" onclick="changePane('${key}')">${label}</button>`).join("")}</nav>`;
}
function changePane(key) {
  if (!active) return;
  active.pane = key;
  const grid = $(".consolegrid");
  if (grid) grid.dataset.pane = key;
  document
    .querySelectorAll(".pane-switch button")
    .forEach((b, i) =>
      b.setAttribute("aria-pressed", ["call", "record", "wrap"][i] === key),
    );
}

function callControls() {
  let l = live;
  if (!l) return "";
  if (l.phase === "ended")
    return `<div class="actions connection-note"><span class="line-state">${I("phone-off")} Audio disconnected</span>${button(active.role === "Agent" ? "Discard session" : "Return to scenarios", active.role === "Agent" ? "leavePrompt()" : "disconnect();active=null;go('Scenario library')", "", "log-out")}</div>`;
  return `<div class="actions connection-note">${button(l.micOn ? "Mute microphone" : l.stream ? "Unmute microphone" : "Enable microphone", "toggleMic()", "", l.micOn ? "mic" : "mic-off")}${button("Play partner audio", "playAudio()", "", "volume-2")}${button("End call", "endCall()", "end-call", "phone-off")}<span class="line-state">${I(l.peerMic ? "mic" : "mic-off")}${l.peerMic ? "Partner mic on" : "Partner mic off"}</span></div>`;
}

function lobby() {
  let l = live,
    a = active,
    d = D[a.id],
    host = l.phase === "waiting",
    incoming = l.phase === "incoming";
  return (
    head(
      "LIVE ROOM / " + d.code,
      d.name,
      `${esc(a.me.name)} · ${a.role} seat`,
    ) +
    `<section class="lobby"><div class="lobbyhead"><span>${I("radio")} PRACTICE LINE</span><span><i class="dot"></i> ${incoming ? "Inbound call" : host ? "Room open" : "Calling"}</span></div><div class="lobbybody"><span class="call-round ${incoming ? "ringing" : ""}">${I(incoming ? "phone-call" : host ? "headset" : "phone-call")}</span><div class="case-id">${a.role.toUpperCase()} STATION</div><h2>${incoming ? "Incoming customer call" : host ? "Your room is ready" : "Calling your agent…"}</h2><p>${incoming ? `${esc(participant("Customer")?.name || d.person)} is on the line. Answer to begin the ${d.name.toLowerCase()} case.` : host ? `Invite your partner to join as the ${otherSeat(a.role).toLowerCase()}. Keep this tab open.` : "Your agent has been notified. You’ll be connected when they answer."}</p>${host && !incoming ? `<div class="invitecode"><small>ROOM CODE</small><strong class="roomcode">${l.code}</strong><div class="actions callcenter">${button("Copy invite link", "shareInvite()", "dark", "arrow-up-right")}${button("Copy code", "copyCode()", "", "copy")}</div></div>` : ""}${incoming ? `<div class="actions callcenter">${button("Answer call", "answerIncoming()", "answer", "phone-call")}${button("Decline", "cancelRoom()", "end-call", "phone-off")}${button(callRinger.source && callRinger.context?.state === "running" ? "Silence ringer" : "Enable ringer", "toggleCallRinger()", "", "volume-2")}</div>` : `<div class="actions callcenter">${button(l.micOn ? "Mute microphone" : "Enable microphone", "toggleMic()", "", l.micOn ? "mic" : "mic-off")}${button(host ? "Close room" : "Cancel call", "cancelRoom()", "", "phone-off")}</div>`}<small class="callhint">${I("headphones")} ${incoming ? "Answering requests microphone access." : "Use headphones for clearer two-way audio."}</small></div></section>`
  );
}

// Install the offline shell only on HTTPS or localhost. Real calls always need internet.
if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () =>
    navigator.serviceWorker.register("./service-worker.js").catch(() => {}),
  );
}
