# v0.2.22 — Gold, uranium and underground cooling lake

Status: implementation specification, NOT yet a playable feature. Work in `feat/uranium-gold-cooling-lake`.

## Existing constraints
- The current `dist/engine.js` uses a 64×40 cell array, local bunker bounds of 30×20, `VERSION=14`; `dist/campaign.js` uses `campaignVersion=1`.
- Existing `lake` is a *water-bearing deposit*, consumed on digging into `resources.groundwater`. Do not repurpose it as a reactor lake; keep old campaigns unchanged.
- The active campaign can contain three bunkers and pending shipments. Do not change bunker IDs, positions, people, construction jobs, transport or existing geology during migration.

## Phase 1: mineral deposits
- New cell feature values `gold` and `uranium`, with finite `goldReserve` / `uraniumReserve` and explicit surveyed/seen flags. New deposits are generated deterministically from bunker seed and cell coordinates.
- Existing save migration: place new deposits only in eligible *unseen rock* cells inside bunker bounds, excluding deep unsurveyed cells if inaccessible, and never overwrite a feature, a building, a job target or a project site. Use a persisted `rareGeologyVersion` flag for idempotence. If no suitable cells exist, show a warning and do not force placement.
- Gold and uranium are extracted through new mining buildings, with worker/path/energy requirements. New resources start at 0 on old worlds; do not grant stock on import.
- Gold is a scarce trade/high-technology material; uranium ore is a fuel-cycle input. Add storage limits, room reports, resource UI, inter-bunker shipment rules and deterministic exhaustion.

## Phase 2: cooling lake
- Introduce a *distinct* `coolingLake` feature: underground open water, separate from drinking water and the legacy `lake` aquifer.
- A lake has `coolingWater`, `coolingWaterMax`, `rechargeRate`, `temperature` and `pollution` state. Preserve mass balance: pumping reduces the lake level; return flow replenishes it, minus modeled losses; natural recharge is bounded and rate-limited.
- The cooling station needs a connected intake, power, piping and a heat exchanger. Reactor primary coolant never mixes directly with lake water. A working lake cannot be assumed merely because a `lake` aquifer exists.
- Water supply must be explicitly connected to the reactor through accessible piping/rooms, including across floors. No free cooling across bunker boundaries.
- Display lake fill, intake rate, return flow, cooling capacity and reactor temperature. Provide a warning for insufficient water, broken pump, lost power or excessive lake temperature.

## Phase 3: nuclear power
- Technology chain: uranium mining → ore processing → fuel fabrication → reactor shielding → pumping/heat exchanger → commissioning.
- Multi-stage construction uses actual material, metal, gold and fuel costs, deducted once at job start. Numerical balance must be playtested before release.
- Reactor produces energy only while fuel, staffing/automation, shielding and cooling are available. Output is limited by demand, fuel throughput and cooling capacity.
- On inadequate cooling, automatically reduce reactor power, then SCRAM before an unsafe temperature. Do not simulate an explosion as the default consequence. Require inspection and cooldown before restart.
- Cross-bunker power transfers must respect links, capacity, transmission losses and priorities; no energy creation or double counting.

## Save-safe implementation order
1. Add pure deterministic geology helpers + migration tests.
2. Add gold and uranium mining and economy tests.
3. Add lake and cooling station simulation tests.
4. Add reactor/fuel cycle and energy transfer tests.
5. Add render/UI, touch interaction and tutorial.
6. Rebuild standalone HTML, run `npm test`, `npm run check`, `npm run build`, test import/export of a real three-bunker save and publish only after verification.

## Mandatory acceptance tests
- Import an existing three-bunker campaign; all residents, links, pending shipments, buildings, resources and current jobs remain intact.
- Import→export→import twice: new deposits do not duplicate or overwrite old content.
- No negative stocks, water, ore or fuel; no energy without fuel/cooling.
- Reactor cannot start without a cooling lake, powered pump, pipe connection and heat exchanger.
- Pump failure, dry lake and full energy store cause safe throttling/shutdown, never phantom production.
- Lake state and reactor temperature persist across save/load and simulation resumes deterministically.
- On Android with minimap hidden, mine/cooling building placement and inspect work as in v0.2.21.
- Existing `lake` geology and drinking water remain backward-compatible.

## Scope safety
Do not merge a design-only PR as if it implements gameplay. Do not deploy it until working code and automated tests are present.
