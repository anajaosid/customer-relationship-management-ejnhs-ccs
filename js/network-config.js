// GitHub Pages works without deploying an application server. Defaults use PeerJS Cloud.
// Optional for networks that block direct WebRTC: a managed TURN provider's HTTPS,
// browser-safe, read-only ICE-credentials URL (GET). Never use a master/admin secret.
// Expected JSON: an RTCIceServer array, or {iceServers:[...]}. See NETWORK-SETUP.md.
window.CCS_NETWORK = {
  browserIceServersUrl: "",
  credentialEndpoint: "",
  relayOnly: false,
};
