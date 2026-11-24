# EJNHS CCS CRM

A plain HTML, CSS, and JavaScript call-center practice site for CCS students. There is no framework, npm install, build command, app server, account system, or database to set up.

## Put it on GitHub Pages

1. Extract the ZIP. Upload **its contents**, preserving the folders, to the root of a public GitHub repository. `index.html` must be at the top level, not inside another folder. Do not upload the ZIP itself as the website.
2. In **Settings → Pages**, select **Deploy from a branch**, then **main** and **/ (root)**. Save.
3. After deployment finishes, open **Visit site**. Send that HTTPS link to your classmates.

If you prefer keeping your existing `/docs` Pages setting, place the **same extracted contents inside `docs/`** instead. No paths need editing.

## Files you can edit

| File | Purpose |
| --- | --- |
| `index.html` | Entry page, stylesheet, and script loading order |
| `css/main.css` | The responsive interface, fonts, navigation, forms and call controls |
| `js/app.js` | Scenario data, screens, case notes and solo practice |
| `js/p2p.js` | PeerJS room discovery, room codes, WebRTC voice, chat, microphone controls and hang-up |
| `js/ringer.js` | Local double-ring sound on incoming calls, with a silence control |
| `js/storage.js` | Browser-local history reads and writes |
| `js/reset.js` | Confirmed deletion of EJNHS CCS CRM history only |
| `service-worker.js` | Caches the app shell for offline solo practice after a successful first visit |
| `manifest.json`, `icons/` | Home-screen name, colors and app icons |
| `assets/`, `vendor/`, `licenses/` | Local fonts, illustrations, headset photo, icons and the bundled PeerJS client |

The CSS and JavaScript are readable source files, not build artifacts. After editing JS or CSS, increment the matching `?v=` references in `index.html` and `service-worker.js` and the cache version in `service-worker.js`. This keeps offline copies consistent.

## Practice

Choose **Create room**, pick Agent or Customer, and enter a practice name. Share the invitation or code. Your partner chooses the other role and enters their practice name. The customer may supply fictional contact details and a reason for calling. The agent answers the incoming call even when they joined rather than created the room. Both devices allow microphone access. Either participant can end the call. The agent can save the outcome and notes afterward.

On small screens, switch among **Call**, **Record**, and **Wrap-up**. Students without a partner can choose **Practice solo**. No sign-in is required. Use fictional information for training profiles. Accounts shown inside CRM cases are fictional customer records.

## Local testing

Use your editor's static **Live Server** feature, or any ordinary local HTTP server. Open its `localhost` URL in a browser. Do not double-click `index.html` to test microphones or offline installation: these need HTTPS or localhost. For two different devices, use the published HTTPS site.

## Internet and privacy

The app runs entirely in the browser. Live rooms still need an internet connection to the external **PeerJS Cloud** signaling service so devices can find each other. Audio and messages travel over WebRTC and are not recorded by EJNHS CCS CRM. The broker sees connection metadata. A restrictive network can block signaling or require a TURN relay. If you run your own PeerServer, set `window.RELAY_PEER_OPTIONS` before `js/p2p.js` loads. Do not embed private, permanent TURN credentials in a public repository.

Offline practice requires the app to have finished caching during an earlier online visit. A service worker does not enable offline calls. Completed case notes remain in localStorage on this browser. **History → Clear saved history** removes those notes, without touching another site's data. Active rooms and unsaved cases end when the tab closes.

## Different Wi-Fi or mobile data

Click **Test network** in room setup to check TURN reachability. See [NETWORK-SETUP.md](NETWORK-SETUP.md) for the instructor relay setup, troubleshooting, and a two-device acceptance test.
