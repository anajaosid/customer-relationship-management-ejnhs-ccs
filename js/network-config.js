// Instructor setup: leave blank to use PeerJS's bundled STUN/TURN configuration.
// For reliable classroom service, use a managed TURN service with TCP/TLS on 443.
// This URL returns SHORT-LIVED credentials as {iceServers:[...]}; never put a provider secret here.
window.CCS_NETWORK = { credentialEndpoint: "", relayOnly: false };
