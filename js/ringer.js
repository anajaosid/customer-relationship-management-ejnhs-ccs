// Local speaker only: never add the ringtone to a WebRTC microphone stream.
const callRinger = {
  context: null,
  source: null,
  arm() {
    try {
      const Audio = window.AudioContext || window.webkitAudioContext;
      if (!Audio) return;
      this.context ||= new Audio();
      // Called by the agent's Create room click, before asynchronous room setup.
      if (this.context.state !== 'running') this.context.resume().catch(() => {});
    } catch { /* The visual incoming-call controls remain available. */ }
  },
  start() {
    const ctx = this.context;
    if (!ctx || this.source) return;
    const rate = ctx.sampleRate;
    const tone = ctx.createBuffer(1, Math.round(rate * 3.1), rate);
    const samples = tone.getChannelData(0);
    // A short double ring, then a pause. Fades avoid clicks on the pulse edges.
    for (const offset of [0, 0.54]) {
      for (let i = 0; i < rate * 0.36; i++) {
        const t = i / rate;
        const fade = Math.min(1, t / 0.018, (0.36 - t) / 0.035);
        samples[Math.floor(offset * rate) + i] = 0.10 * fade *
          (Math.sin(2 * Math.PI * 440 * t) + Math.sin(2 * Math.PI * 480 * t));
      }
    }
    const node = ctx.createBufferSource();
    node.buffer = tone; node.loop = true; node.connect(ctx.destination);
    this.source = node; node.start();
  },
  stop() {
    if (!this.source) return;
    this.source.stop(); this.source.disconnect(); this.source = null;
  },
  release() {
    this.stop();
    if (this.context && this.context.state !== 'closed') this.context.close().catch(() => {});
    this.context = null;
  }
};
function toggleCallRinger() {
  if (live?.phase !== 'incoming') return;
  if (callRinger.source && callRinger.context?.state === 'running') callRinger.stop();
  else { callRinger.arm(); callRinger.start(); }
  render();
  const ctx = callRinger.context;
  if(ctx && ctx.state !== 'running') ctx.resume().then(()=>{if(live?.phase==='incoming')render()}).catch(()=>{});
}
