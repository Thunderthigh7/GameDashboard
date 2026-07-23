import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appSource = readFileSync(new URL("../public/app.js", import.meta.url), "utf8");
const helperStart = appSource.indexOf("function buildRoundedEventPropertyPath(");
const helperEnd = appSource.indexOf("\nfunction getEventPropertyPriority(", helperStart);
assert.ok(helperStart >= 0 && helperEnd > helperStart, "event property chart path helpers should remain available");

const helperSource = appSource.slice(helperStart, helperEnd);
const { buildRoundedEventPropertyPath } = Function(
  `"use strict";\n${helperSource}\nreturn { buildRoundedEventPropertyPath };`,
)();

const periodBucketCounts = new Map([
  ["1m", 240],
  ["5m", 180],
  ["15m", 120],
  ["1h", 72],
  ["6h", 40],
  ["12h", 30],
  ["1d", 30],
  ["7d", 12],
]);

for (const [period, bucketCount] of periodBucketCounts) {
  const points = Array.from({ length: bucketCount }, (_, index) => ({
    x: 54 + (index * 18),
    y: index > 0 && index % 29 === 0
      ? null
      : 18 + ((Math.sin(index / 4) + 1) * 111),
  }));
  const path = buildRoundedEventPropertyPath(points);
  assert.ok(path.startsWith("M"), `${period} should produce a visible path`);
  assert.ok(!/NaN|Infinity/.test(path), `${period} should not produce invalid coordinates`);
  assertPathCoordinatesStayBounded(path, 18, 240, period);
}

assert.equal(buildRoundedEventPropertyPath([]), "", "an empty range should produce no path");
assert.equal(
  buildRoundedEventPropertyPath([{ x: 54, y: 100 }]),
  "M54.00 100.00",
  "a one-bucket range should remain valid",
);
assert.match(
  buildRoundedEventPropertyPath([
    { x: 54, y: 100 },
    { x: 72, y: 80 },
    { x: 90, y: 120 },
  ]),
  /C/,
  "three or more buckets should use rounded cubic segments",
);
assert.equal(
  (buildRoundedEventPropertyPath([
    { x: 54, y: 100 },
    { x: 72, y: 80 },
    { x: 90, y: null },
    { x: 108, y: 120 },
  ]).match(/M/g) || []).length,
  2,
  "empty buckets should split the path instead of being bridged",
);

console.log("Event property chart period tests passed.", {
  periods: [...periodBucketCounts.keys()],
});

function assertPathCoordinatesStayBounded(path, minY, maxY, label) {
  const commands = path.match(/[MLC][^MLC]*/g) || [];
  for (const command of commands) {
    const values = command.slice(1).trim().split(/\s+/).map(Number);
    assert.ok(values.every(Number.isFinite), `${label} should only contain finite coordinates`);
    const yCoordinates = command[0] === "C"
      ? [values[1], values[3], values[5]]
      : [values[1]];
    for (const y of yCoordinates) {
      assert.ok(y >= minY && y <= maxY, `${label} should not curve outside the 0–100% plot`);
    }
  }
}
