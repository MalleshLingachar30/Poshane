import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const talukSource = readFileSync(
  new URL("../app/command-center/taluks.ts", import.meta.url),
  "utf8"
);
const frameSource = readFileSync(
  new URL("../app/command-center/components/taluk-frame.tsx", import.meta.url),
  "utf8"
);
const shellSource = readFileSync(
  new URL("../app/command-center/CommandCenterApp.tsx", import.meta.url),
  "utf8"
);

function configuredTalukRoster() {
  const match = talukSource.match(
    /TALUK_NAMES_BY_DISTRICT[^=]*=\s*(\{[\s\S]*?\n\});/
  );
  assert.ok(match, "taluk roster object is present");
  return Function(`"use strict"; return (${match[1]});`)();
}

const officialDistrictCounts = {
  BDR: 8, KLB: 11, YDG: 6, VJP: 13, RCH: 8, BLG: 15, BGK: 10, KPL: 7,
  BLY: 5, DWD: 8, GDG: 7, VJN: 6, UK: 12, HVR: 8, DVG: 6, CTD: 6,
  UDP: 7, SMG: 7, CKM: 9, TMK: 10, CBP: 8, DK: 9, HSN: 8, MDY: 7,
  BNR: 4, KLR: 6, KDG: 5, MYS: 9, RMN: 5, BNU: 5, CHN: 5,
};

test("all 31 command-center districts have a non-empty taluk roster", () => {
  const roster = configuredTalukRoster();
  assert.equal(Object.keys(roster).length, 31);
  for (const [districtCode, taluks] of Object.entries(roster)) {
    assert.match(districtCode, /^[A-Z]{2,3}$/);
    assert.ok(Array.isArray(taluks) && taluks.length > 0, districtCode);
    assert.equal(new Set(taluks).size, taluks.length, `${districtCode} has duplicate taluks`);
  }
});

test("the statewide taluk roster contains 240 uniquely district-linked rows", () => {
  const roster = configuredTalukRoster();
  const rows = Object.entries(roster).flatMap(([district, taluks]) =>
    taluks.map((taluk) => `${district}:${taluk}`)
  );
  assert.equal(rows.length, 240);
  assert.equal(new Set(rows).size, 240);
  assert.deepEqual(
    Object.fromEntries(Object.entries(roster).map(([district, taluks]) => [district, taluks.length])),
    officialDistrictCounts
  );
  assert.ok(roster.BGK.includes("Terdal"));
  assert.ok(roster.RCH.includes("Arakera"));
  assert.ok(!roster.RCH.includes("Mudgal"));
  assert.deepEqual(roster.BNU, [
    "Anekal",
    "Bengaluru East",
    "Bengaluru North",
    "Bengaluru South",
    "Yelahanka",
  ]);
  assert.match(talukSource, /validateTalukDistribution\(\);/);
  assert.match(talukSource, /taluk allocation does not reconcile/);
  assert.match(talukSource, /taluk Year-1 target does not reconcile/);
  assert.match(talukSource, /taluk planting does not reconcile/);
  assert.match(talukSource, /taluk volunteer allocation does not reconcile/);
});

test("taluk view is a third scope with full parameter search and district drill-through", () => {
  assert.match(shellSource, />Taluk View</);
  assert.match(shellSource, /frame === "f9"/);
  assert.match(shellSource, /onSelectTaluk=\{goTaluk\}/);
  assert.match(frameSource, /Search and sort every operational parameter/);
  assert.match(frameSource, /aria-label="Search all taluk parameters"/);
  for (const parameter of [
    "programmeShare",
    "yearOneTarget",
    "planted",
    "progress",
    "survival",
    "ngos",
    "volunteers",
    "nurseries",
  ]) {
    assert.match(frameSource, new RegExp(`value="${parameter}"`));
  }
});
