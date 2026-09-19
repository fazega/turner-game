# The Golden Harbour — The Last Light

A small exploration game inside the harbor painting. All models, materials and runtime code are bundled locally.

## Deploy to Cloudflare Workers

Connect this GitHub repository with worker name `turner-game`, production branch `main`, root directory `/`, build command `npm run build`, and deploy command `npx wrangler deploy`. The included `wrangler.jsonc` serves `dist` as static assets; no Worker JavaScript entry point, bindings, or environment variables are needed.

After deployment, open the Worker's Settings → Domains & Routes → Add → Custom Domain and enter `turner.game.gdelt.me`. The `gdelt.me` zone must be active in the same Cloudflare account. Cloudflare provisions DNS and the certificate through this custom-domain flow.

The same static build can also be deployed with Cloudflare Pages: build command `npm run build`, output directory `dist`.

Open http://127.0.0.1:8765. To restart the server, run `node server.cjs` from this folder.

## Play

Walk toward **Mira**, the harbor warden beside the lantern. Click a nearby named character or press **E** to talk. Follow the conversations with **Tomas** and **Inez**, then return to Mira to restore the beacon. The always-visible quest tracker shows the current step and immediate objective; progress saves in this browser. Unfinished adventures resume on reload; completed adventures restart with an unlit beacon. Completing the quest lights the actual lantern and awards the Keeper of the Evening Light token.

## Controls

- **W A S D / Z Q S D**: move. The Commands panel automatically detects QWERTY or AZERTY using the browser keyboard map, with actual key presses as a fallback. Arrow keys also work. **Shift**: move at 7 m/s (normal walking: 4.6 m/s).
- **Drag the mouse**: look around. The fantasy cursor stays visible; the game does not capture or hide it.
- **Click a person / E**: interact within reach.
- **Esc**: close dialogue. **Tab / Enter** or **1 / 2** also operate dialogue choices.
- **Space**: jump while walking; holding it does not repeatedly jump.
- **F**: switch walking and flight. **Space / C**: rise and descend while flying.
- **R**: return to the starting viewpoint; quest progress is preserved.
- Hover **Commands** in the bottom-left to open the small controls panel, or press **H**.
- The left quest tracker stays visible: yellow **Ongoing**, green **Completed**.

Sound, entry buttons, top controls, and viewpoint buttons have been removed. Rendering quality adjusts automatically.

## Scene and testing

Ships have detailed hulls, rigging, decking and weathered sails. Scanned cargo, sculpture and surfaces accompany custom architecture, rowboats and foliage. Fourteen articulated 3D gulls have curved wings, layered feathers, fanned tails, beaks and alternating flapping/gliding flight. People use Quaternius’s rigged character models with textured clothing, hair and faces. Hidden body geometry is removed to prevent it clipping through outfits. The horizon has seven coastal mountain ranges, including hills behind the starting viewpoint; the old city contains 250 houses plus a domed church and bell towers.

The renderer shares geometry, uses distance-based detail and spatial batching, caches static shadows, and schedules water reflections. Water combines displaced waves, scrolling normals, Fresnel reflection and shoreline foam.

`verification.json` records gameplay and browser checks, including the complete quest, progress persistence, input, cursor, UI and error checks. `performance.json` records frame timings across five views in headless Edge at 1440 x 960; results vary by hardware and browser.

See `CREDITS.md` for asset sources and licenses. The quest, dialogue, cursor and gull geometry are custom additions. Character source links and CC0 licenses are included in assets/characters and assets/sources.json.

## Loading

The local server serves precompressed Brotli assets with ETag cache validation. Images are resized to appropriate resolutions; character textures, rigs and clothing geometry are shared. The loading screen shows progress through loading, construction and shader preparation. `loading-performance.json` records observed startup timing and transfer sizes; hardware and browser caches affect the result.

The rear garden has geometric grass, edged gravel paths, timber benches and a black steel fence aligned with the walking boundary. Characters gesture during dialogue and gulls travel at 8.5–12.7 m/s.

Walking, idle and conversation gestures use retargeted Quaternius CC0 animation clips. Four townspeople follow the promenade; Tomas waits at the western cargo quay and Inez along the eastern arcade. The produce stand, fishing nets, workbench, planted rear garden and wind-blown grass tufts add close-range detail.

Harbour activity includes two fish stalls with silent market-call captions, three children playing chase, two carpenters, two anglers with moving lines, and six garden pedestrians following the sloped paths behind the fence. Arcade characters and collision boundaries clear the columns. `activity-verification.json` and `quest-tracker-verification.json` record the activity and tracker checks.

The southwest garden edge transitions to a sloped sandy beach with a wet-sand band, calmer shallows and shoreline foam. The rear town has detailed window frames, shutters, roof courses, chimney pots, doors, flower boxes, balconies and lamps. Stationary characters use four relaxed stance variants instead of the shared wide-legged idle pose.
