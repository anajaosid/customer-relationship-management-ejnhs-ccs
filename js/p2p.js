"use strict";
// PeerJS is bundled in vendor/. Assign RELAY_PEER_OPTIONS before app startup
// only if your classroom uses a custom signaling or TURN service.
/* WebSocket-like signaling adapter for a static Pages site. A PeerJS data connection
   carries only room setup and SDP/ICE; the voice call starts when the agent answers. */
class P2PRoom {
  constructor() {
    this.readyState = 0;
    this.closed = false;
    this.retries = 0;
    queueMicrotask(() => {
      if (!this.closed) {
        this.readyState = 1;
        this.onopen?.();
      }
    });
  }
  emit(message) {
    if (!this.closed) this.onmessage?.({ data: JSON.stringify(message) });
  }
  send(raw) {
    const m = JSON.parse(raw);
    if (m.t === "create" || m.t === "join") this.register(m);
    else if (this.link?.open) this.link.send(m);
  }
  register(m) {
    const host = m.t === "create",
      token = crypto.getRandomValues(new Uint8Array(3));
    const code = host
      ? Array.from(token, (x) => x.toString(16).padStart(2, "0"))
          .join("")
          .toUpperCase()
      : m.code;
    const home = new URL("./", document.baseURI).href;
    let namespace = 2166136261;
    for (const c of home)
      namespace = Math.imul(namespace ^ c.charCodeAt(0), 16777619);
    const prefix = `relaydesk-${(namespace >>> 0).toString(36)}-`;
    this.ishost = host;
    const peer = new Peer(prefix + (host ? code : crypto.randomUUID()), {
      debug: 0,
      ...(window.RELAY_PEER_OPTIONS || {}),
    });
    this.broker = peer;
    this.iceServers = peer.options.config?.iceServers;
    peer.on("open", () => {
      if (this.closed) return;
      if (host) this.emit({ t: "created", code });
      else {
        const call = peer.connect(prefix + code, {
          reliable: true,
          serialization: "json",
          metadata: { version: 1, scenario: m.scenario },
        });
        this.listen(call, false);
        this.link = call;
      }
    });
    peer.on("connection", (call) => {
      if (!host || this.closed) {
        call.close();
        return;
      }
      const meta = call.metadata || {};
      const reason = this.link
        ? "This room already has two participants."
        : meta.version !== 1
          ? "Unsupported practice client."
          : meta.scenario != null && meta.scenario !== m.scenario
            ? "This code belongs to a different scenario. Check the industry with your agent."
            : "";
      if (reason) {
        call.on("open", () => {
          call.send({ t: "error", message: reason });
          setTimeout(() => call.close(), 700);
        });
        return;
      }
      this.link = call;
      this.listen(call, true);
      call.on("open", () => {
        call.send({ t: "joined", code, scenario: m.scenario });
        this.emit({ t: "peer" });
      });
    });
    peer.on("error", (err) => {
      if (this.closed || this.broker !== peer) return;
      if (err.type === "unavailable-id" && host && this.retries++ < 3) {
        peer.destroy();
        this.register(m);
        return;
      }
      if (this.link?.open) return;
      this.emit({
        t: "error",
        message:
          err.type === "peer-unavailable"
            ? "Room not found. Ask your partner to keep the room open and check the code."
            : "Could not reach the live room service. Check your network, then try again. Solo practice is still available.",
      });
    });
  }
  listen(link, host) {
    link.on("data", (m) => {
      if (this.closed || this.link !== link || !m || typeof m !== "object")
        return;
      const allowed = host
        ? ["answer", "ice", "left"]
        : ["joined", "error", "offer", "ice", "left"];
      if (!allowed.includes(m.t)) return;
      if (
        m.t === "joined" &&
        (!Number.isInteger(m.scenario) ||
          m.scenario < 0 ||
          m.scenario > 5 ||
          !/^[A-F0-9]{6}$/.test(m.code))
      )
        return;
      if (m.t === "left") this.depart();
      else this.emit(m);
    });
    link.on("close", () => {
      if (this.link === link) this.depart();
    });
    link.on("error", () => {
      if (this.link === link) this.depart();
    });
  }
  depart() {
    if (this.closed) return;
    this.emit({ t: "left" });
    this.close();
  }
  close() {
    if (this.closed) return;
    this.closed = true;
    this.readyState = 3;
    if (this.link?.open) {
      try {
        this.link.send({ t: "left" });
      } catch {}
    }
    this.broker?.destroy();
  }
}

let connecting = false;
function startLive(id) {
  if (active) return resumePrompt();
  connectRoom("create", id, "");
}
function joinLive(code, id = null) {
  if (active) return resumePrompt();
  connectRoom("join", id, code);
}
function connectRoom(t, id, code) {
  if (connecting) return;
  closeModal();
  if (!navigator.onLine)
    return toast("Live calls need internet. You can still practice solo.");
  if (!window.RTCPeerConnection)
    return toast(
      "This browser does not support WebRTC. Try a current browser.",
    );
  connecting = true;
  toast(
    t === "create" ? "Opening your practice room…" : "Finding your partner…",
  );
  let ws;
  try {
    ws = new P2PRoom();
  } catch {
    connecting = false;
    return toast("Could not reach the room service.");
  }
  let l = {
    ws,
    code: "",
    status: "Connecting",
    pc: null,
    ch: null,
    stream: null,
    micOn: false,
    candidates: [],
    iceServers: null,
    micBusy: false,
  };
  live = l;
  const timeout = setTimeout(() => {
    if (connecting && live === l) {
      disconnect();
      toast("Room service timed out. Please try again.");
    }
  }, 30000);
  ws.onopen = () => ws.send(JSON.stringify({ t, scenario: id, code }));
  let chain = Promise.resolve();
  ws.onmessage = (e) => {
    chain = chain
      .then(async () => {
        if (live !== l) return;
        let m = JSON.parse(e.data);
        if (m.t === "error") {
          if (active) {
            setLiveStatus(m.message);
            return;
          }
          disconnect();
          if (t === "join") joinForm(id, code, m.message);
          else toast(m.message);
          return;
        }
        if (m.t === "created" || m.t === "joined") {
          clearTimeout(timeout);
          connecting = false;
          l.code = m.code;
          active = makeSession(
            m.scenario ?? id,
            "live",
            m.t === "created" ? "Agent" : "Customer",
          );
          l.phase = m.t === "created" ? "waiting" : "ringing";
          l.status =
            m.t === "created" ? "Waiting for customer" : "Calling the agent";
          go("Active session");
          if (m.t === "joined") toggleMic();
          return;
        }
        if (m.t === "left") {
          if (active?.role === "Agent") active.pane = "wrap";
          if (!active) {
            disconnect();
            toast("The room closed before the call started.");
            return;
          }
          l.endedAt = Date.now();
          l.phase = "ended";
          l.status = "Call ended · partner left";
          l.code = "";
          l.pc?.close();
          l.stream?.getTracks().forEach((x) => x.stop());
          l.stream = null;
          l.micOn = false;
          render();
          return;
        }
        if (m.t === "peer") {
          closeModal();
          l.phase = "incoming";
          l.status = "Incoming customer call";
          go("Active session");
        } else if (m.t === "offer") {
          l.phase = "connecting";
          setLiveStatus("Connecting voice call");
          let pc = await peer(l);
          await pc.setRemoteDescription(m.sdp);
          await flushIce(l);
          await pc.setLocalDescription(await pc.createAnswer());
          signal(l, { t: "answer", sdp: pc.localDescription });
        } else if (m.t === "answer") {
          await l.pc.setRemoteDescription(m.sdp);
          await flushIce(l);
        } else if (m.t === "ice") {
          if (l.pc?.remoteDescription) await l.pc.addIceCandidate(m.candidate);
          else l.candidates.push(m.candidate);
        }
      })
      .catch(() => {
        if (live === l) setLiveStatus("Connection failed — check network");
      });
  };
  ws.onerror = () => {
    if (live === l)
      toast("Room service unavailable. Check your connection and try again.");
  };
  ws.onclose = () => {
    clearTimeout(timeout);
    if (live !== l) return;
    connecting = false;
    if (active) {
      l.code = "";
      if (l.ch?.readyState !== "open") l.phase = "ended";
      setLiveStatus(
        l.ch?.readyState === "open"
          ? "Peer connected · room service offline"
          : "Room service disconnected",
      );
    } else {
      live = null;
      toast("Could not connect to the room service.");
    }
  };
}
function reportMic(l) {
  if (l.ch?.readyState === "open")
    l.ch.send(JSON.stringify({ t: "mic", on: !!l.micOn }));
}
async function answerIncoming() {
  let l = live;
  if (!l || l.phase !== "incoming") return;
  l.phase = "connecting";
  setLiveStatus("Connecting voice call");
  if (!l.stream) toggleMic();
  try {
    let pc = await peer(l);
    if (live !== l || !l.code) return;
    attachChannel(l, pc.createDataChannel("case-room"));
    await pc.setLocalDescription(await pc.createOffer());
    signal(l, { t: "offer", sdp: pc.localDescription });
  } catch {
    if (live === l)
      setLiveStatus("Audio connection failed — end call and retry");
  }
}
function cancelRoom() {
  disconnect();
  active = null;
  go("Overview");
  toast("Practice line closed.");
}
function endCall() {
  if (active?.role === "Agent") active.pane = "wrap";
  let l = live;
  if (!l) return;
  l.ws.close();
  l.code = "";
  l.endedAt = Date.now();
  l.phase = "ended";
  l.ch?.close();
  l.pc?.close();
  l.stream?.getTracks().forEach((t) => t.stop());
  l.stream = null;
  l.micOn = false;
  l.ws.onclose = null;
  $("#remote").srcObject = null;
  setLiveStatus(
    active.role === "Agent" ? "Call ended · after-call work" : "Call ended",
  );
  toast(
    active.role === "Agent"
      ? "Voice disconnected. Your case notes are ready for wrap-up."
      : "Voice call ended.",
  );
}
function signal(l, m) {
  if (l.ws.readyState === WebSocket.OPEN) l.ws.send(JSON.stringify(m));
}
function setLiveStatus(s) {
  if (!live) return;
  live.status = s;
  if (view === "Active session") render();
}
async function peer(l) {
  if (l.pc) return l.pc;
  let iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
  iceServers = l.ws.iceServers || iceServers;
  if (live !== l) throw Error("Room closed");
  let pc = new RTCPeerConnection({ iceServers });
  l.pc = pc;
  l.trans = pc.addTransceiver("audio", { direction: "sendrecv" });
  if (l.stream) await l.trans.sender.replaceTrack(l.stream.getAudioTracks()[0]);
  pc.onicecandidate = (e) => {
    if (e.candidate) signal(l, { t: "ice", candidate: e.candidate });
  };
  pc.ontrack = (e) => {
    if (live !== l) return;
    $("#remote").srcObject = e.streams[0] || new MediaStream([e.track]);
    $("#remote")
      .play()
      .catch(() => toast("Select Play partner audio to hear the call."));
  };
  pc.ondatachannel = (e) => attachChannel(l, e.channel);
  pc.onconnectionstatechange = () => {
    if (live !== l || !l.code) return;
    if (pc.connectionState === "connected")
      setLiveStatus("Voice connection ready");
    else if (pc.connectionState === "failed")
      setLiveStatus("Connection blocked — see handbook");
    else if (pc.connectionState === "disconnected")
      setLiveStatus("Partner connection interrupted");
  };
  return pc;
}
async function flushIce(l) {
  for (const c of l.candidates) await l.pc.addIceCandidate(c);
  l.candidates = [];
}
function attachChannel(l, ch) {
  l.ch = ch;
  ch.onopen = () => {
    if (live === l) {
      l.phase = "connected";
      l.callStart = Date.now();
      reportMic(l);
      setLiveStatus("Live call connected");
    }
  };
  ch.onmessage = (e) => {
    if (live !== l || !active) return;
    try {
      let m = JSON.parse(e.data);
      if (m.t === "mic") {
        l.peerMic = m.on === true;
        if (view === "Active session") {
          let state = $(".line-state");
          if (state)
            state.innerHTML =
              I(l.peerMic ? "mic" : "mic-off") +
              (l.peerMic ? "Partner mic on" : "Partner mic off");
        }
      }
      if (m.t === "message" && typeof m.text === "string") {
        active.logs.push({
          from: active.role === "Agent" ? "Customer" : "Agent",
          text: m.text.slice(0, 1000),
        });
        refreshChat();
      }
      if (m.t === "case" && active.role === "Customer") {
        active.verified = !!m.verified;
        active.done = !!m.done;
        active.logs.push({
          from: "Case update",
          text: active.done ? D[active.id].result : "Account verified.",
        });
        if (view === "Active session") render();
      }
    } catch {}
  };
}
async function toggleMic() {
  let l = live;
  if (!l || l.micBusy) return;
  if (!l.code && l.ch?.readyState !== "open")
    return toast("This room has ended. Start a new room for another call.");
  if (l.stream) {
    l.micOn = !l.micOn;
    l.stream.getTracks().forEach((t) => (t.enabled = l.micOn));
    reportMic(l);
    render();
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia)
    return toast("Microphone access requires HTTPS or localhost.");
  l.micBusy = true;
  try {
    let stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true },
      video: false,
    });
    if (l !== live || !l.code) {
      stream.getTracks().forEach((t) => t.stop());
      return;
    }
    l.stream = stream;
    l.micOn = true;
    if (l.trans) await l.trans.sender.replaceTrack(stream.getAudioTracks()[0]);
    reportMic(l);
    render();
    toast("Microphone enabled. Use headphones for the clearest call.");
  } catch (e) {
    toast(
      e.name === "NotAllowedError"
        ? "Microphone blocked. Allow access in browser settings or open the preview in a new tab."
        : "No microphone available. You can still use room messages.",
    );
  } finally {
    l.micBusy = false;
  }
}
function playAudio() {
  if (!$("#remote").srcObject)
    return toast(
      "No partner audio yet. Ask your partner to enable their microphone.",
    );
  $("#remote")
    .play()
    .then(() => toast("Partner audio playback enabled."))
    .catch(() => toast("Playback blocked. Open this workspace in a new tab."));
}
async function copyCode() {
  try {
    await navigator.clipboard.writeText(live.code);
    toast("Room code copied. Share it with your partner.");
  } catch {
    toast("Share this room code: " + live.code);
  }
}
function notifyPeer() {
  if (live?.ch?.readyState === "open")
    live.ch.send(
      JSON.stringify({
        t: "case",
        verified: active.verified,
        done: active.done,
      }),
    );
}
function sendChat(el) {
  let msg = el.value.trim();
  if (!msg) return;
  if (live?.ch?.readyState !== "open")
    return toast("Wait for your partner to connect first.");
  live.ch.send(JSON.stringify({ t: "message", text: msg }));
  active.logs.push({ from: active.role, text: msg });
  el.value = "";
  refreshChat();
}
function disconnect() {
  let l = live;
  live = null;
  connecting = false;
  if (!l) return;
  l.stream?.getTracks().forEach((t) => t.stop());
  l.ch?.close();
  l.pc?.close();
  l.ws?.close();
  $("#remote").srcObject = null;
}
