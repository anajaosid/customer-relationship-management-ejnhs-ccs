async function roomIceConfig() {
  const settings = window.CCS_NETWORK || {},
    custom = window.RELAY_PEER_OPTIONS?.config || {};
  let iceServers =
    custom.iceServers || window.peerjs?.util?.defaultConfig?.iceServers;
  if (!iceServers?.length)
    iceServers = [{ urls: "stun:stun.l.google.com:19302" }];
  // Keep both discovery services from the supplied p2p.js. Do not replace TURN
  // entries with a STUN-only list: carrier NAT and restrictive Wi-Fi may need a relay.
  if(!custom.iceServers){
    iceServers=[...iceServers];for(const url of ['stun:stun.l.google.com:19302','stun:stun.cloudflare.com:3478']){
      if(!iceServers.some(s=>[s.urls].flat().includes(url)))iceServers.push({urls:url});
    }
  }
  if (settings.browserIceServersUrl || settings.credentialEndpoint) {
    const u = new URL(
      settings.browserIceServersUrl || settings.credentialEndpoint,
    );
    if (u.protocol !== "https:")
      throw Error("The school TURN credential endpoint must use HTTPS.");
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 10000);
    try {
      const res = await fetch(u, {
        method: settings.browserIceServersUrl ? "GET" : "POST",
        cache: "no-store",
        credentials: "omit",
        signal: controller.signal,
      });
      if (!res.ok) throw Error();
      const raw = await res.json();
      const data = Array.isArray(raw) ? { iceServers: raw } : raw;
      if (
        !Array.isArray(data.iceServers) ||
        !data.iceServers.some(
          (s) =>
            [s.urls].flat().some((v) => /^turns?:/.test(v)) &&
            s.username &&
            s.credential,
        )
      )
        throw Error();
      iceServers = data.iceServers;
    } catch {
      throw Error(
        "School relay credentials are unavailable. Check the endpoint and allowed website origin.",
      );
    } finally {
      clearTimeout(timer);
    }
  }
  // Preserve the configured relay(s), and offer TCP as well as UDP for plain TURN URLs.
  iceServers = iceServers.map((s) => ({
    ...s,
    urls: [
      ...new Set(
        [s.urls]
          .flat()
          .flatMap((u) =>
            /^turn:/.test(u) && !u.includes("?")
              ? [u, u + "?transport=tcp"]
              : [u],
          ),
      ),
    ],
  }));
  return {
    ...custom,
    iceServers,
    iceTransportPolicy: settings.relayOnly
      ? "relay"
      : custom.iceTransportPolicy || "all",
  };
}
async function testRelay(btn) {
  const report = btn.closest("form,section")?.querySelector(".relay-result");
  if (!report) return;
  btn.disabled = true;
  report.textContent = "Checking whether this network can reach a TURN relay…";
  let pc, timer;
  try {
    pc = new RTCPeerConnection({
      ...(await roomIceConfig()),
      iceTransportPolicy: "relay",
    });
    pc.createDataChannel("probe");
    const result = new Promise((resolve) => {
      timer = setTimeout(() => resolve(false), 14000);
      pc.onicecandidate = (e) => {
        if (!e.candidate) resolve(false);
        else if (
          e.candidate.type === "relay" ||
          / typ relay /.test(e.candidate.candidate)
        )
          resolve(true);
      };
    });
    await pc.setLocalDescription(await pc.createOffer());
    report.textContent = (await result)
      ? "Relay reachable from this device. Test the other device too."
      : "No TURN relay was reachable from this network. Direct calls can still work. If joining times out, try another network or ask the site owner to configure a managed TURN URL in js/network-config.js.";
  } catch (e) {
    report.textContent = e.message || "Network test failed.";
  } finally {
    clearTimeout(timer);
    pc?.close();
    btn.disabled = false;
  }
}
