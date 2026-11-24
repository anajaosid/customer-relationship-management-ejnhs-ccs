# Calls between different networks

**Students do not have to share Wi-Fi. Both devices must open the latest public HTTPS site.** Close older tabs on both devices and create a fresh room after updating. Live rooms from previous releases do not carry over. The Arena preview may restrict external visitors.

## Try a call

1. Create a room, choose Agent or Customer, and enter a practice name. Send the invitation or six-character code.
2. The partner chooses the other role and enters a practice name. The invitation preselects the available seat. Customers can optionally enter a fictional city/branch, callback number, and reason for calling. Use only made-up details. No account is created.
3. The **agent answers the ring**, regardless of who created the room. Both devices must allow the microphone. Profiles appear in the shared case workspace and remain in memory only.

## What to check if it fails

- **Room not found:** Check that both devices are on this release, the code is correct, the creator's tab remains open, and PeerJS Cloud is reachable. A TURN relay cannot fix a typo or a blocked signaling service.
- **Join times out on mobile data or school Wi-Fi:** On each device open Create room or Join room and click **Test network**. This checks whether the browser can allocate a relay candidate. It is not an end-to-end call test. Some networks allow direct calls even when this check fails.
- **No relay reachable:** Configure a working TURN service, ideally with UDP plus TCP/TLS on port 443. The bundled PeerJS service is best effort; it is not a guaranteed classroom relay. The same ICE configuration is used for the initial room channel and voice connection.
- **Connected but quiet:** Check microphone permissions, device volume, mute state and Play partner audio. Open the public site directly in the browser, not inside a restricted embed.

## Optional instructor setup: Cloudflare TURN with temporary credentials

The site remains plain HTML/CSS/JS on GitHub Pages. Only the short-lived credential issuer runs separately. No student accounts or database are required. **This package does not include a paid or provisioned relay.** Review provider pricing and establish spending limits before enabling a public service.

1. Create a TURN key in your Cloudflare Realtime account. Obtain the key ID and API token. See https://developers.cloudflare.com/realtime/turn/generate-credentials/ .
2. In `instructor-turn/wrangler.toml`, set `SITE_ORIGIN` to your actual site origin, for example `https://your-school.github.io` (no repository path). The provided Worker limits requests per IP. Origin checking is not authentication; set provider usage alerts/limits and consider additional access controls if exposing it beyond a class.
3. From the **instructor-turn** folder, run `npx wrangler login` and `npx wrangler deploy` after reviewing the config. Supply the key ID using `npx wrangler secret put TURN_KEY_ID` and the API token via `npx wrangler secret put TURN_TOKEN`. Enter secrets only at the prompts. Do not commit them or send them to students.
4. In `js/network-config.js`, set `credentialEndpoint` to the Worker's actual HTTPS URL plus `/turn`. Keep `relayOnly: false` for normal use. Publish the changed file. If a service worker has an older offline copy, reconnect and reload.
5. Run **Test network** on both devices. Then put one device on mobile data and the other on Wi-Fi, start a new room, and verify speech in both directions. Optionally set `relayOnly: true` temporarily for a relay-only acceptance test, then restore `false`.

## Existing TURN provider

Instead of the example Worker, configure an HTTPS endpoint accepting `POST` from your site's origin and returning `{ "iceServers": [...] }` with authorized, short-lived TURN credentials. Include valid TURN URLs supported by the provider, including TLS on port 443 if available. Responses must use `Cache-Control: no-store` and allow the Pages origin. The app never caches these responses. Never ship a master API token in a static website.
