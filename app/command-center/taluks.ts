/* ============================================================
   KARNATAKA TALUK OPERATIONAL GEOGRAPHY
   ------------------------------------------------------------
   The taluk roster is kept separate from the older silviculture
   statement in silvi.ts. That statement predates three districts
   and only names taluks needed to distinguish agro-climatic zones.

   Administrative roster cross-checked against Karnataka district
   portals and the national land-records directory (240 taluks, 2026).
   Programme figures remain illustrative mock data. Every generated
   taluk split conserves its parent district totals exactly.
   ============================================================ */
import { DISTRICTS, plantedOf, y1Of, type District } from "./data";

export const TALUK_NAMES_BY_DISTRICT: Readonly<Record<string, readonly string[]>> = {
  BDR: ["Aurad", "Basavakalyan", "Bhalki", "Bidar", "Chitgoppa", "Hulsur", "Humnabad", "Kamalanagar"],
  KLB: ["Afzalpur", "Aland", "Chincholi", "Chittapur", "Jevargi", "Kalaburagi", "Kalgi", "Kamalapur", "Sedam", "Shahabad", "Yedrami"],
  YDG: ["Gurmitkal", "Hunsagi", "Shahapur", "Shorapur", "Wadagera", "Yadgir"],
  VJP: ["Almel", "Babaleshwar", "Basavana Bagewadi", "Chadchan", "Devara Hipparagi", "Indi", "Kolhar", "Muddebihal", "Nidagundi", "Sindagi", "Talikoti", "Tikota", "Vijayapura"],
  RCH: ["Arakera", "Devadurga", "Lingasugur", "Manvi", "Maski", "Raichur", "Sindhanur", "Sirwar"],
  BLG: ["Athani", "Bailhongal", "Belagavi", "Chikkodi", "Gokak", "Hukkeri", "Kagwad", "Khanapur", "Kittur", "Mudalagi", "Nippani", "Raibag", "Ramdurg", "Saundatti", "Yaragatti"],
  BGK: ["Badami", "Bagalkote", "Bilagi", "Guledagudda", "Hunagunda", "Ilkal", "Jamakhandi", "Mudhol", "Rabakavi Banahatti", "Terdal"],
  KPL: ["Gangavathi", "Kanakagiri", "Karatagi", "Koppal", "Kukanur", "Kushtagi", "Yelburga"],
  BLY: ["Ballari", "Kampli", "Kurugodu", "Sandur", "Siruguppa"],
  DWD: ["Alnavar", "Annigeri", "Dharwad", "Hubballi Rural", "Hubballi Urban", "Kalghatgi", "Kundgol", "Navalgund"],
  GDG: ["Gadag", "Gajendragad", "Lakshmeshwar", "Mundargi", "Nargund", "Ron", "Shirahatti"],
  VJN: ["Hagaribommanahalli", "Harapanahalli", "Hosapete", "Hoovina Hadagali", "Kottur", "Kudligi"],
  UK: ["Ankola", "Bhatkal", "Dandeli", "Haliyal", "Honnavar", "Joida", "Karwar", "Kumta", "Mundgod", "Siddapur", "Sirsi", "Yellapur"],
  HVR: ["Byadgi", "Hangal", "Haveri", "Hirekerur", "Ranebennur", "Rattihalli", "Savanur", "Shiggaon"],
  DVG: ["Channagiri", "Davanagere", "Harihar", "Honnali", "Jagalur", "Nyamathi"],
  CTD: ["Challakere", "Chitradurga", "Hiriyur", "Holalkere", "Hosadurga", "Molakalmuru"],
  UDP: ["Brahmavar", "Byndoor", "Hebri", "Kapu", "Karkala", "Kundapura", "Udupi"],
  SMG: ["Bhadravathi", "Hosanagara", "Sagar", "Shikaripura", "Shivamogga", "Soraba", "Tirthahalli"],
  CKM: ["Ajjampura", "Chikkamagaluru", "Kaduru", "Kalasa", "Koppa", "Mudigere", "Narasimharajapura", "Sringeri", "Tarikere"],
  TMK: ["Chikkanayakanahalli", "Gubbi", "Koratagere", "Kunigal", "Madhugiri", "Pavagada", "Sira", "Tiptur", "Tumakuru", "Turuvekere"],
  CBP: ["Bagepalli", "Chelur", "Chikkaballapura", "Chintamani", "Gauribidanur", "Gudibanda", "Manchenahalli", "Sidlaghatta"],
  DK: ["Bantwal", "Belthangady", "Kadaba", "Mangaluru", "Moodbidri", "Mulki", "Puttur", "Sullia", "Ullal"],
  HSN: ["Alur", "Arkalgud", "Arsikere", "Belur", "Channarayapatna", "Hassan", "Holenarasipura", "Sakleshpur"],
  MDY: ["Krishnarajapete", "Maddur", "Malavalli", "Mandya", "Nagamangala", "Pandavapura", "Srirangapatna"],
  BNR: ["Devanahalli", "Doddaballapura", "Hoskote", "Nelamangala"],
  KLR: ["Bangarapet", "Kolar", "Kolar Gold Fields", "Malur", "Mulbagal", "Srinivaspur"],
  KDG: ["Kushalnagar", "Madikeri", "Ponnampet", "Somwarpet", "Virajpet"],
  MYS: ["Heggadadevanakote", "Hunsur", "Krishnarajanagara", "Mysuru", "Nanjangud", "Piriyapatna", "Saligrama", "Saragur", "T. Narasipura"],
  RMN: ["Channapatna", "Harohalli", "Kanakapura", "Magadi", "Ramanagara"],
  BNU: ["Anekal", "Bengaluru East", "Bengaluru North", "Bengaluru South", "Yelahanka"],
  CHN: ["Chamarajanagara", "Gundlupet", "Hanur", "Kollegal", "Yelandur"],
};

export interface TalukIdentity {
  name: string;
  code: string;
  districtCode: string;
  districtName: string;
  ordinal: number;
}

export interface TalukMetrics extends TalukIdentity {
  programmeShare: number;
  yearOneTarget: number;
  planted: number;
  progress: number;
  survival: number;
  ngos: number;
  volunteers: number;
  nurseries: number;
  governmentLandPct: number;
}

function stableUnit(value: string) {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  hash ^= hash >>> 16;
  hash = Math.imul(hash, 0x85ebca6b);
  hash ^= hash >>> 13;
  hash = Math.imul(hash, 0xc2b2ae35);
  hash ^= hash >>> 16;
  return (hash >>> 0) / 0xffffffff;
}

function weightsFor(items: readonly TalukIdentity[], salt: string) {
  return items.map((item) => 0.84 + stableUnit(`${salt}:${item.code}:${item.name}`) * 0.32);
}

/** Largest-remainder distribution: result is integer and sums to total exactly. */
function distributeUnits(total: number, weights: readonly number[]) {
  if (!weights.length) return [];
  const safeTotal = Math.max(0, Math.round(total));
  const weightTotal = weights.reduce((sum, value) => sum + Math.max(0, value), 0) || weights.length;
  const exact = weights.map((value) => safeTotal * Math.max(0, value) / weightTotal);
  const units = exact.map(Math.floor);
  const remaining = safeTotal - units.reduce((sum, value) => sum + value, 0);
  const order = exact
    .map((value, index) => ({ index, fraction: value - units[index] }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index);
  for (let i = 0; i < remaining; i++) units[order[i % order.length].index]++;
  return units;
}

export const TALUKS: readonly TalukIdentity[] = DISTRICTS.flatMap((district) => {
  const names = TALUK_NAMES_BY_DISTRICT[district.code];
  if (!names?.length) throw new Error(`No taluks configured for ${district.name} (${district.code})`);
  return names.map((name, index) => ({
    name,
    code: `${district.code}-${String(index + 1).padStart(2, "0")}`,
    districtCode: district.code,
    districtName: district.name,
    ordinal: index + 1,
  }));
});

export const TALUKS_BY_DISTRICT: Readonly<Record<string, readonly TalukIdentity[]>> = Object.fromEntries(
  DISTRICTS.map((district) => [district.code, TALUKS.filter((taluk) => taluk.districtCode === district.code)])
);

export const TALUK_COUNT = TALUKS.length;

export function findTaluk(value: string | undefined, districtCode?: string) {
  const query = value?.trim().toLowerCase();
  if (!query) return undefined;
  return TALUKS.find((taluk) =>
    (!districtCode || taluk.districtCode === districtCode) &&
    (taluk.code.toLowerCase() === query || taluk.name.toLowerCase() === query)
  );
}

export function firstTalukCode(districtCode: string) {
  return TALUKS_BY_DISTRICT[districtCode]?.[0]?.code ?? "";
}

/**
 * Builds the complete split for one district. Allocation is distributed in
 * tenths of a lakh and planting in individual saplings, so both reconcile to
 * the district total rather than merely looking close after rounding.
 */
export function buildTalukMetrics(district: District, districtPlanted = plantedOf(district)): TalukMetrics[] {
  const identities = TALUKS_BY_DISTRICT[district.code] ?? [];
  if (!identities.length) return [];

  const baseWeights = weightsFor(identities, "allocation");
  const allocationTenths = distributeUnits(Math.round(district.alloc * 10), baseWeights);
  const plantedWeights = allocationTenths.map((allocation, index) =>
    Math.max(1, allocation) * (0.96 + stableUnit(`progress:${identities[index].code}`) * 0.08)
  );
  const plantedSaplings = distributeUnits(Math.round(districtPlanted * 100_000), plantedWeights);
  const ngos = distributeUnits(district.ngos, weightsFor(identities, "ngos"));
  const volunteers = distributeUnits(district.volunteers, weightsFor(identities, "volunteers"));
  const nurseries = distributeUnits(district.nurseries, weightsFor(identities, "nurseries"));

  const survivalRaw = identities.map((identity) => stableUnit(`survival:${identity.code}`) - 0.5);
  const plantedTotal = plantedSaplings.reduce((sum, value) => sum + value, 0) || 1;
  const survivalMean = survivalRaw.reduce(
    (sum, value, index) => sum + value * plantedSaplings[index],
    0
  ) / plantedTotal;
  const survivalSpan = Math.min(3.2, district.survival - 86, 99.4 - district.survival);

  const landRaw = identities.map((identity) => stableUnit(`land:${identity.code}`) - 0.5);
  const allocationTotal = allocationTenths.reduce((sum, value) => sum + value, 0) || 1;
  const landMean = landRaw.reduce(
    (sum, value, index) => sum + value * allocationTenths[index],
    0
  ) / allocationTotal;
  const districtGovernmentLandPct = 52 + ((district.name.length * 7) % 31);

  return identities.map((identity, index) => {
    const programmeShare = allocationTenths[index] / 10;
    const yearOneTarget = programmeShare * 0.12;
    const planted = plantedSaplings[index] / 100_000;
    return {
      ...identity,
      programmeShare,
      yearOneTarget,
      planted,
      progress: yearOneTarget ? planted / yearOneTarget * 100 : 0,
      survival: district.survival + (survivalRaw[index] - survivalMean) * survivalSpan,
      ngos: ngos[index],
      volunteers: volunteers[index],
      nurseries: nurseries[index],
      governmentLandPct: districtGovernmentLandPct + (landRaw[index] - landMean) * 12,
    };
  });
}

export const TALUK_METRICS: readonly TalukMetrics[] = DISTRICTS.flatMap((district) =>
  buildTalukMetrics(district)
);

/** Throws during development if a roster or split ever drifts from district data. */
export function validateTalukDistribution() {
  const expectedCodes = new Set(DISTRICTS.map((district) => district.code));
  const configuredCodes = Object.keys(TALUK_NAMES_BY_DISTRICT);
  if (configuredCodes.length !== DISTRICTS.length || configuredCodes.some((code) => !expectedCodes.has(code))) {
    throw new Error("Taluk roster must cover each configured district exactly once.");
  }
  if (TALUK_COUNT !== 240) throw new Error(`Expected 240 Karnataka taluks; received ${TALUK_COUNT}.`);

  for (const district of DISTRICTS) {
    const rows = buildTalukMetrics(district);
    const close = (left: number, right: number) => Math.abs(left - right) < 1e-9;
    if (!close(rows.reduce((sum, row) => sum + row.programmeShare, 0), district.alloc)) {
      throw new Error(`${district.name} taluk allocation does not reconcile.`);
    }
    if (!close(rows.reduce((sum, row) => sum + row.yearOneTarget, 0), y1Of(district))) {
      throw new Error(`${district.name} taluk Year-1 target does not reconcile.`);
    }
    if (!close(rows.reduce((sum, row) => sum + row.planted, 0), plantedOf(district))) {
      throw new Error(`${district.name} taluk planting does not reconcile.`);
    }
    if (rows.reduce((sum, row) => sum + row.ngos, 0) !== district.ngos) {
      throw new Error(`${district.name} taluk NGO allocation does not reconcile.`);
    }
    if (rows.reduce((sum, row) => sum + row.volunteers, 0) !== district.volunteers) {
      throw new Error(`${district.name} taluk volunteer allocation does not reconcile.`);
    }
    if (rows.reduce((sum, row) => sum + row.nurseries, 0) !== district.nurseries) {
      throw new Error(`${district.name} taluk nursery allocation does not reconcile.`);
    }
  }
  return true;
}

validateTalukDistribution();
