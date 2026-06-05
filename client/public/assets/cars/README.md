# Car sprite slots

Drop side-view PNG sprites here, named to match the `image` field in `data/cars.json`
(e.g. `vaz2106.png`, `civic_ek.png`, `silvia_s15.png`).

Until a real PNG is present, `CarSprite` automatically renders a procedural SVG
fallback (unique per car). No code change is needed to switch a car over to art —
just add the file at the path referenced by its `image` field.
