# GitHub Pages only: joining a practice room

**Deploy the static files only. No Node service, Worker, database, build action or student login is required.** Upload this release to your Pages publishing folder; both devices must open the deployed HTTPS website, not a `github.com/.../blob/.../index.html` file. The public PeerJS service handles room discovery. GitHub Pages hosts files; it does not itself provide signaling or relay voice.

1. Close old tabs and reopen the published URL on both devices after deployment. Do not reuse an old code. Keep the creator's tab open, awake and in the foreground on mobile.
2. Create a room and enter a practice name. Send the code or the invitation link. The first character identifies the scenario. No manual seat selection is needed.
3. The partner uses **Join with a code**. Inbound = customer calls agent. Outbound = agent calls customer. The **joiner** answers the incoming ring. Both students allow microphone access.

## If joining fails

- **Room not found:** The public signaling service did not find an active creator at that code. Check the latest deployment, leave the host tab open and create a new code. The two browsers must use the same signaling service.
- **Timed out:** The signaling service or connection path may be blocked. Try **Test network** on both devices. This tests the ability to obtain a TURN relay candidate; it does not prove end-to-end audio. A failed initial join can be retried without intentionally closing the waiting host's room.
- **Connected but silent:** Check microphone permission, volume, mute, and Play partner audio. By default a PeerJS microphone call starts after the joiner answers. If that path fails, voice falls back to the room’s existing WebRTC connection. In Settings you can also choose that connection directly for the next room you create.
- **Still stuck:** Send the public Pages URL, the exact error from the joiner, browser/device names, and whether the creator saw a join attempt. Never send relay credentials.

## Restricted networks — still hosted only on GitHub Pages

The bundled PeerJS configuration provides best-effort NAT traversal. If a network blocks direct WebRTC and the default relay is unreachable, an actual reachable TURN provider is needed. No static JavaScript change can guarantee audio through every firewall.

Optional for the site owner: obtain a managed TURN provider’s **browser-safe, restricted, read-only ICE credentials URL** and set `browserIceServersUrl` in `js/network-config.js`. This is a GET endpoint that supports CORS from your site and returns an RTCIceServer array or `{iceServers:[...]}`. Include TURN/TLS on port 443 if supported. Example provider setup: https://www.metered.ca/tools/openrelay/ . This uses a managed networking service, not a second website deployment. Do not paste an admin token, private API key or permanent private TURN password into GitHub. Anyone can read the site files, so use provider restrictions, quotas and expiry.

Publish, reload, and run **Test network** on each device. To verify only the relayed route, set `relayOnly: true` temporarily, create a new room and check both directions. Restore `false` afterward. Leave all optional URLs empty for ordinary direct calls with the public defaults.

## Two-device check

Open the same deployed HTTPS address on two devices. Test once on shared Wi-Fi, then create a fresh room with one phone on mobile data (Wi-Fi off). Speak a different phrase on each end and have the other person repeat it. Test mute, chat and hang-up. Try an outbound and an inbound case to check who answers. A direct or relayed route label describes the active WebRTC path; it is not a guarantee for other networks.
