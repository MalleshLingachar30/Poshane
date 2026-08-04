/* ============================================================
   KSLSA SILVI ZONE SPECIES PLAN — SOURCE DATA
   ------------------------------------------------------------
   Source: "Statement showing the list of Forest Species suitable
   for different Silvi Zones (Model wise) in Karnataka —
   Regrouped 10 Agroclimatic zones in to 4 silvi zones (covering
   all districts & Taluks) for the purpose of Afforestation
   Under KSLSA Project".

   Transcribed verbatim from the 4-sheet scanned statement
   (Adobe Scan, 4 Aug 2026). Botanical names are reproduced
   exactly as printed in the source, including spellings that
   differ from currently accepted taxonomy (e.g. "Emblica
   officinalis", "Swietenia mahogany", "Feronia elephantum").
   See DATA_NOTES at the bottom for known source defects.
   ============================================================ */

export type ModelKey = "bund" | "block" | "linear" | "gua" | "institutional";

export interface AgroforestryModel {
  key: ModelKey;
  name: string;
  short: string;
  seedling: string;
  spacing: string;
  speciesType: string;
  commonLand: boolean;
}

/* Planting models are identical across all four silvi zones;
   only the species lists change. */
export const MODELS: AgroforestryModel[] = [
  {
    key: "bund",
    name: "Bund / Strip / Shelter belt / Hedge / Alley Planting",
    short: "Bund / Strip / Alley",
    seedling: '14"x20" size PB seedlings',
    spacing: "10m x 10m = 100 plants/ha",
    speciesType: "NTFP Species",
    commonLand: false,
  },
  {
    key: "block",
    name: "Block / Cluster Plantation",
    short: "Block / Cluster",
    seedling: '8"x12" size PB seedlings',
    spacing:
      "10m x 5m = 200 plants/ha OR 5m x 5m = 400 plants/ha; Teak 3m x 3m or 2m x 2m",
    speciesType: "Timber Species",
    commonLand: false,
  },
  {
    key: "linear",
    name: "Linear / Roadside / Canal Bank Plantation",
    short: "Linear / Roadside",
    seedling: '14"x20" size PB seedlings',
    spacing: "7m x 7m = 300 plants/km",
    speciesType: "NTFP / Timber Species",
    commonLand: true,
  },
  {
    key: "gua",
    name: "Greening of Urban Area (GUA)",
    short: "Urban Greening",
    seedling: '14"x20" size PB seedlings',
    spacing: "7m x 7m = 300 plants/km",
    speciesType: "Flowering Species",
    commonLand: true,
  },
  {
    key: "institutional",
    name: "School / Institute / Temple Premises / Grave yard Planting",
    short: "Institutional / Temple",
    seedling: '14"x20" size PB seedlings',
    spacing: "10m x 10m = 100 plants/km",
    speciesType: "Flowering / Shade / Fruit Species",
    commonLand: true,
  },
];

/** [botanical name, local (Kannada) name] exactly as printed. */
export type SpeciesRow = [string, string];

export interface SilviDistrict {
  /** District name as printed in the source statement. */
  source: string;
  /** Canonical district name matching DISTRICTS in data.ts, or null if unmapped. */
  district: string | null;
  /** Taluks listed in the source. Empty array = whole district. */
  taluks: string[];
}

export interface AgroClimaticZone {
  name: string;
  districts: SilviDistrict[];
}

export interface SilviZone {
  key: string;
  /** Sheet number in the source statement (1-4). */
  sheet: number;
  name: string;
  agroZones: AgroClimaticZone[];
  species: Record<ModelKey, SpeciesRow[]>;
}

const D = (
  source: string,
  district: string | null,
  taluks: string[] = []
): SilviDistrict => ({ source, district, taluks });

export const SILVI_ZONES: SilviZone[] = [
  /* ---------------- SHEET 1 — DRY SILVI ZONE ---------------- */
  {
    key: "dry",
    sheet: 1,
    name: "Dry Zone",
    agroZones: [
      {
        name: "North Eastern Transition Zone",
        districts: [
          D("Bidar", "Bidar"),
          D("Kalaburgi", "Kalaburagi", ["Chincholi", "Aaland"]),
        ],
      },
      {
        name: "North Eastern Dry Zone",
        districts: [
          D("Kalaburgi", "Kalaburagi"),
          D("Raichur", "Raichur", ["Devadurga", "Manvi", "Raichur"]),
        ],
      },
      {
        name: "North Dry Zone",
        districts: [
          D("Vijapur", "Vijayapura"),
          D("Bagalkot", "Bagalkote"),
          D("Koppal", "Koppal"),
          D("Raichur", "Raichur", ["Lingsugur", "Sindhanur"]),
          D("Bellary", "Ballari"),
          D("Davangere", "Davanagere", ["Harapanahalli"]),
          D("Gadag", "Gadag"),
          D("Dharwad", "Dharwad", ["Navalgund"]),
          D("Belgaum", "Belagavi", ["Gokak Forest Division"]),
        ],
      },
      {
        name: "Central Dry Zone",
        districts: [
          D("Chitradurga", "Chitradurga"),
          D("Davangere", "Davanagere"),
          D("Tumkur", "Tumakuru"),
          D("Hasan", "Hassan", ["Arasikere"]),
          D("Chikkamagalur", "Chikkamagaluru", ["Kadur"]),
        ],
      },
      {
        name: "Eastern Dry Zone",
        districts: [
          D("Tumkur", "Tumakuru", ["Gubbi", "Tumkur"]),
          D("Bangalore (Rural)", "Bengaluru Rural"),
          D("Bangalore (U)", "Bengaluru Urban", [
            "Bangalore North",
            "Bangalore South",
            "Anekal",
          ]),
          D("Kolar", "Kolar"),
          D("Chikkaballapur", "Chikkaballapura"),
        ],
      },
      {
        name: "Southern Dry Zone",
        districts: [
          D("Mysore", "Mysuru"),
          D("Chamarajnagar", "Chamarajanagara"),
          D("Tumkur", "Tumakuru", ["Turuvekere", "Kunigal"]),
          D("Mandya", "Mandya"),
          D("Hasan", "Hassan", ["Channarayapattan"]),
        ],
      },
    ],
    species: {
      bund: [
        ["Aegle marmelos", "Bilva"],
        ["Albizia lebbeck", "Baage"],
        ["Anacardium occidentale", "Cashew"],
        ["Artocarpus hirsutus", "Halasu"],
        ["Azadirachta indica", "Bevu"],
        ["Cordia dicotoma", "Challe"],
        ["Emblica officinalis", "Nelli"],
        ["Feronia elephantum", "Bela"],
        ["Ficus benghalensis", "Aale"],
        ["Maduca indica", "Hippe"],
        ["Mangifera indica", "Maavu"],
        ["Mimusops elengi", "Ranjal"],
        ["Moringa oleifera", "Murki"],
        ["Pongamia pinnata", "Honge"],
        ["Sapindus trifoliatus", "Antuwaal"],
        ["Syzygium cumini", "Nerale"],
        ["Tamarindus indica", "Hunse"],
      ],
      block: [
        ["Anacardium occidentale", "Cashew"],
        ["Annona squamosa", "Seetaphal"],
        ["Dendrocalamus stocksii", "Maarihal Bamboo"],
        ["Emblica officinalis", "Nelli"],
        ["Melia dubia", "Hebbevu"],
        ["Moringa oleifera", "Nugge"],
        ["Murraya koenigii", "Karibevu"],
        ["Pongamia pinnata", "Honge"],
        ["Santalum album", "Sandal"],
        ["Swietenia mahogany", "Mahagani"],
        ["Tectona grandis", "Teak"],
        ["Wrightia tinctoria", "Haale"],
      ],
      linear: [
        ["Albizia lebbeck", "Baage"],
        ["Artocarpus hirsutus", "Halasu"],
        ["Azadirachta indica", "Bevu"],
        ["Bombax ceiba", "Buraga"],
        ["Cassia fistula", "Kakke"],
        ["Dalbergia latifolia", "Beete"],
        ["Ficus benghalensis", "Aale"],
        ["Holoptelea integrifolia", "Tapasi"],
        ["Maduca indica", "Hippe"],
        ["Mangifera indica", "Maavu"],
        ["Mimusops elengi", "Ranjal"],
        ["Pithecellobium dulce", "Sihihunshe"],
        ["Pongamia pinnata", "Honge"],
        ["Ptecarpus marsupium", "Honne"],
        ["Syzygium cumini", "Nerale"],
        ["Tamarindus indica", "Hunse"],
        ["Terminalia arjuna", "Hole matti"],
        ["Terminalia bellirica", "Taare"],
      ],
      gua: [
        ["Azadirachta indica", "Bevu"],
        ["Cassia fistula", "Kakke"],
        ["Jacaranda mimosifolia", "Jakaranda"],
        ["Maduca indica", "Hippe"],
        ["Magnolia champaca", "Sampige"],
        ["Millingtonia hortensis", "Aakash Mallige"],
        ["Mimusops elengi", "Ranjal"],
        ["Peltophorum pterocarpum", "Peltoforum"],
        ["Pongamia pinnata", "Honge"],
        ["Spathodea campanulata", "Spethodia"],
        ["Tecoma argentea", "Techoma"],
        ["Terminalia catappa", "Kaadu badami"],
        ["Thespesia populnea", "Hoovarasi"],
      ],
      institutional: [
        ["Artocarpus hirsutus", "Halasu"],
        ["Azadirachta indica", "Bevu"],
        ["Cassia fistula", "Kakke"],
        ["Emblica officinalis", "Nelli"],
        ["Mangifera indica", "Maavu"],
        ["Millingtonia hortensis", "Aakash Mallige"],
        ["Mimusops elengi", "Ranjal"],
        ["Phyllanthus acidus", "Kadagol Nelli"],
        ["Pongamia pinnata", "Honge"],
        ["Syzygium cumini", "Nerale"],
        ["Thespesia populnea", "Hoovarsi"],
      ],
    },
  },

  /* ------------- SHEET 2 — TRANSITIONAL SILVI ZONE ------------- */
  {
    key: "transitional",
    sheet: 2,
    name: "Transitional Zone",
    agroZones: [
      {
        name: "Southern Transition Zone",
        districts: [
          D("Hasan", "Hassan"),
          D("Chikkamaglur", "Chikkamagaluru", ["Tarikere"]),
          D("Shimoga", "Shivamogga", ["Bhadravati", "Shimoga", "Shikaripur"]),
          D("Davangere", "Davanagere", ["Honnali", "Channagiri"]),
          D("Mysore", "Mysuru", ["H.D. Kote", "Hunsur", "Periyapattan"]),
        ],
      },
      {
        name: "Northern Transition Zone & North Eastern",
        districts: [
          D("Belgaum", "Belagavi", [
            "Hukkeri",
            "Chikkodi",
            "Bailhongal",
            "Belgaum",
          ]),
          D("Dharwad", "Dharwad", ["Dharwad", "Hubli", "Kundgol"]),
        ],
      },
      {
        name: "Northen Eastern Transition Zone",
        districts: [
          D("Haveri", "Haveri"),
          D("Gadag", "Gadag", ["Shirahatti"]),
        ],
      },
    ],
    species: {
      bund: [
        ["Aegle marmelos", "Bilva"],
        ["Albizia lebbeck", "Baage"],
        ["Anacardium occidentale", "Cashew"],
        ["Artocarpus hirsutus", "Halasu"],
        ["Azadirachta indica", "Bevu"],
        ["Buchanania langan", "Murki"],
        ["Cordia dicotoma", "Challe"],
        ["Emblica officinalis", "Nelli"],
        ["Feronia elephantum", "Bela"],
        ["Gmelina arborea", "Shivani"],
        ["Maduca indica", "Hippe"],
        ["Mangifera indica", "Maavu"],
        ["Mimusops elengi", "Ranjal"],
        ["Pongamia pinnata", "Honge"],
        ["Sapindus trifoliatus", "Antuwaal"],
        ["Syzygium cumini", "Nerale"],
        ["Tamarindus indica", "Hunse"],
      ],
      block: [
        ["Anacordium occidentale", "Cashew"],
        ["Annona squamosa", "Seetaphal"],
        ["Dendrocalamus stocksii", "Maarihal Bamboo"],
        ["Emblica officinalis", "Nelli"],
        ["Melia dubia", "Hebbevu"],
        ["Moringa oleifera", "Nugge"],
        ["Pongamia pinnata", "Honge"],
        ["Ptecarpus marsupium", "Honne"],
        ["Pterocarpus santalinus", "Red Sander"],
        ["Santalum album", "Sandal"],
        ["Swietenia mahogany", "Mahagani"],
        ["Tectona grandis", "Teak"],
        ["Wrightia tinctoria", "Haale"],
      ],
      linear: [
        ["Albizia lebbeck", "Baage"],
        ["Artocarpus hirsutus", "Halasu"],
        ["Azadirachta indica", "Bevu"],
        ["Bombax ceiba", "Buraga"],
        ["Cassia fistula", "Kakke"],
        ["Dalbergia latifolia", "Beete"],
        ["Ficus benghalensis", "Aale"],
        ["Holoptelea integrifolia", "Tapasi"],
        ["Maduca indica", "Hippe"],
        ["Mangifera indica", "Maavu"],
        ["Mimusops elengi", "Ranjal"],
        ["Pithecellobium dulce", "Sihihunshe"],
        ["Pongamia pinnata", "Honge"],
        ["Ptecarpus marsupium", "Honne"],
        ["Syzygium cumini", "Nerale"],
        ["Tamarindus indica", "Hunse"],
        ["Terminalia arjuna", "Hole matti"],
        ["Terminalia bellirica", "Taare"],
      ],
      gua: [
        ["Azadirachta indica", "Bevu"],
        ["Cassia fistula", "Kakke"],
        ["Jacaranda mimosifolia", "Jakaranda"],
        ["Maduca indica", "Hippe"],
        ["Magnolia champaca", "Sampige"],
        ["Mangifera indica", "Maavu"],
        ["Millingtonia hortensis", "Aakash Mallige"],
        ["Mimusops elengi", "Ranjal"],
        ["Peltophorum pterocarpum", "Peltophorum"],
        ["Spathodea campanulata", "Spethodia"],
        ["Tecoma argentea", "Techoma"],
        ["Terminalia catappa", "Kaadu badami"],
        ["Thespesia populnea", "Hoovarasi"],
      ],
      institutional: [
        ["Artocarpus hirsutus", "Halasu"],
        ["Azadirachta indica", "Bevu"],
        ["Cassia fistula", "Kakke"],
        ["Emblica officinalis", "Nelli"],
        ["Mangifera indica", "Maavu"],
        ["Millingtonia hortensis", "Aakash Mallige"],
        ["Mimusops elengi", "Ranjal"],
        ["Phyllanthus acidus", "Kadagol Nelli"],
        ["Pongamia pinnata", "Honge"],
        ["Syzygium cumini", "Nerale"],
        ["Thespesia populnea", "Hoovarsi"],
      ],
    },
  },

  /* ---------------- SHEET 3 — HILLY SILVI ZONE ---------------- */
  {
    key: "hilly",
    sheet: 3,
    name: "Hilly Zone",
    agroZones: [
      {
        name: "Hilly Zone",
        districts: [
          D("Uttar Kannada", "Uttara Kannada", [
            "Sirsi",
            "Siddapur",
            "Yellapur",
            "Supa",
            "Haliyal",
            "Mundagod",
          ]),
          D("Belgaum", "Belagavi", ["Khanapur"]),
          D("Shivamoga", "Shivamogga", [
            "Sorab",
            "Hosanagar",
            "Sagar",
            "Tirthahalli",
          ]),
          D("Chikkamagalur", "Chikkamagaluru"),
          D("Dharwad", "Dharwad", ["Kalaghatagi"]),
          D("Haveri", "Haveri", ["Hanagal"]),
          D("Kodagu", "Kodagu"),
          D("(Sakaleshapur)", "Hassan", ["Sakaleshapur"]),
        ],
      },
    ],
    species: {
      bund: [
        ["Anacordium occidentale", "Cashew"],
        ["Artocarpus hirsutus", "Halasu"],
        ["Emblica officinalis", "Nelli"],
        ["Gmelina arborea", "Shivani"],
        ["Maduca indica", "Hippe"],
        ["Mangifera indica", "Maavu"],
        ["Mimusops elengi", "Ranjal"],
        ["Sapindus trifoliatus", "Antuwaal"],
        ["Syzygium cumini", "Nerale"],
      ],
      block: [
        ["Anacordium occidentale", "Cashew"],
        ["Casuarina equisetifolia", "Casurina"],
        ["Cinnamomum verum", "Dalchini"],
        ["Dalbergia latifolia", "Beete"],
        ["Dendrocalamus stocksii", "Maarihal Bamboo"],
        ["Emblica officinalis", "Nelli"],
        ["Garcinia cambogia", "Uppage"],
        ["Garcinia indica", "Murugal"],
        ["Melia dubia", "Hebbevu"],
        ["Pterocarpus santalinus", "Red Sandal"],
        ["Santalum album", "Sandal"],
        ["Swietenia mahogany", "Mahagani"],
        ["Tectona grandis", "Teak"],
      ],
      linear: [
        ["Albizia lebbeck", "Baage"],
        ["Artocarpus hirsutus", "Halasu"],
        ["Bombax ceiba", "Buraga"],
        ["Cassia fistula", "Kakke"],
        ["Dalbergia latifolia", "Beete"],
        ["Ficus benghalensis", "Aale"],
        ["Holoptelea integrifolia", "Tapasi"],
        ["Maduca indica", "Hippe"],
        ["Mangifera indica", "Maavu"],
        ["Mimusops elengi", "Ranjal"],
        ["Pithecellobium dulce", "Sihihunshe"],
        ["Pongamia pinnata", "Honge"],
        ["Ptecarpus marsupium", "Honne"],
        ["Syzygium cumini", "Nerale"],
        ["Tamarindus indica", "Hunse"],
        ["Terminalia arjuna", "Hole matti"],
        ["Terminalia bellirica", "Taare"],
      ],
      gua: [
        ["Cassia fistula", "Kakke"],
        ["Jacaranda mimosifolia", "Jakaranda"],
        ["Maduca indica", "Hippe"],
        ["Magnolia champaca", "Sampige"],
        ["Millingtonia hortensis", "Aakash Mallige"],
        ["Mimusops elengi", "Ranjal"],
        ["Peltophorum pterocarpum", "Peltoforum"],
        ["Pongamia pinnata", "Honge"],
        ["Spathodea campanulata", "Spethodia"],
        ["Tecoma argentea", "Techoma"],
        ["Terminalia catappa", "Kaadu badami"],
        ["Thespesia populnea", "Hoovarasi"],
      ],
      institutional: [
        ["Artocarpus hirsutus", "Halasu"],
        ["Azadirachta indica", "Bevu"],
        ["Cassia fistula", "Kakke"],
        ["Emblica officinalis", "Nelli"],
        ["Mangifera indica", "Maavu"],
        ["Millingtonia hortensis", "Aakash Mallige"],
        ["Mimusops elengi", "Ranjal"],
        ["Phyllanthus acidus", "Kadagol Nelli"],
        ["Pongamia pinnata", "Honge"],
        ["Syzygium cumini", "Nerale"],
        ["Thespesia populnea", "Hoovarsi"],
      ],
    },
  },

  /* ---------------- SHEET 4 — COSTAL SILVI ZONE ---------------- */
  {
    key: "costal",
    sheet: 4,
    name: "Costal Zone",
    agroZones: [
      {
        name: "Costal Zone",
        districts: [
          D("Uttar Kannada", "Uttara Kannada", [
            "Karwar",
            "Kumta",
            "Honnavar",
            "Bhatakal",
            "Ankola",
          ]),
          D("Udapi", "Udupi", ["Coondapur", "Karkal", "Udupi"]),
          D("Dakshina Kannada", "Dakshina Kannada", [
            "Mangalore",
            "Bantwala",
            "Belthangadi",
            "Puttur",
            "Sulya",
          ]),
        ],
      },
    ],
    species: {
      bund: [
        ["Anacordium occidentale", "Cashew"],
        ["Artocarpus hirsutus", "Halasu"],
        ["Emblica officinalis", "Nelli"],
        ["Gmelina arborea", "Shivani"],
        ["Maduca indica", "Hippe"],
        ["Mangifera indica", "Maavu"],
        ["Mimusops elengi", "Ranjal"],
        ["Sapindus trifoliatus", "Antuwaal"],
        ["Syzygium cumini", "Nerale"],
      ],
      block: [
        ["Anacordium occidentale", "Cashew"],
        ["Casuarina equisetifolia", "Casurina"],
        ["Cinnamomum verum", "Dalchinni"],
        ["Dalbergia latifolia", "Beete"],
        ["Dendrocalamus stocksii", "Maarihal Bamboo"],
        ["Emblica officinalis", "Nelli"],
        ["Garcinia cambogia", "Uppage"],
        ["Garcinia indica", "Murugal"],
        ["Melia dubia", "Hebbevu"],
        ["Pterocarpus santalinus", "Red Sander"],
        ["Santalum album", "Sandal"],
        ["Swietenia mahogany", "Mahagani"],
        ["Tectona grandis", "Teak"],
      ],
      linear: [
        ["Albizia lebbeck", "Baage"],
        ["Artocarpus hirsutus", "Halasu"],
        ["Bombax ceiba", "Buraga"],
        ["Cassia fistula", "Kakke"],
        ["Dalbergia latifolia", "Beete"],
        ["Ficus benghalensis", "Aale"],
        ["Holoptelea integrifolia", "Tapasi"],
        ["Maduca indica", "Hippe"],
        ["Mangifera indica", "Maavu"],
        ["Mimusops elengi", "Ranjal"],
        ["Pithecellobium dulce", "Sihihunshe"],
        ["Pongamia pinnata", "Honge"],
        ["Ptecarpus marsupium", "Honne"],
        ["Syzygium cumini", "Nerale"],
        ["Tamarindus indica", "Hunse"],
        ["Terminalia arjuna", "Hole matti"],
        ["Terminalia bellirica", "Taare"],
      ],
      gua: [
        ["Cassia fistula", "Kakke"],
        ["Jacaranda mimosifolia", "Jakaranda"],
        ["Maduca indica", "Hippe"],
        ["Magnolia champaca", "Sampige"],
        ["Millingtonia hortensis", "Aakash Mallige"],
        ["Mimusops elengi", "Ranjal"],
        ["Peltophorum pterocarpum", "Peltoforum"],
        ["Pongamia pinnata", "Honge"],
        ["Spathodea campanulata", "Spethodia"],
        ["Tecoma argentea", "Techoma"],
        ["Terminalia catappa", "Kaadu badami"],
        ["Thespesia populnea", "Hoovarasi"],
      ],
      institutional: [
        ["Artocarpus hirsutus", "Halasu"],
        ["Azadirachta indica", "Bevu"],
        ["Cassia fistula", "Kakke"],
        ["Emblica officinalis", "Nelli"],
        ["Mangifera indica", "Maavu"],
        ["Millingtonia hortensis", "Aakash Mallige"],
        ["Mimusops elengi", "Ranjal"],
        ["Phyllanthus acidus", "Kadagol Nelli"],
        ["Pongamia pinnata", "Honge"],
        ["Syzygium cumini", "Nerale"],
        ["Thespesia populnea", "Hoovarsi"],
      ],
    },
  },
];

/* ============================================================
   DERIVED INDICES
   ============================================================ */

export interface Recommendation {
  zoneKey: string;
  zoneName: string;
  agroZone: string;
  sourceDistrict: string;
  district: string | null;
  taluks: string[];
  model: AgroforestryModel;
  botanical: string;
  local: string;
}

/** Fully denormalised district x model x species rows. */
export const RECOMMENDATIONS: Recommendation[] = SILVI_ZONES.flatMap((z) =>
  z.agroZones.flatMap((az) =>
    az.districts.flatMap((d) =>
      MODELS.flatMap((m) =>
        z.species[m.key].map(([botanical, local]) => ({
          zoneKey: z.key,
          zoneName: z.name,
          agroZone: az.name,
          sourceDistrict: d.source,
          district: d.district,
          taluks: d.taluks,
          model: m,
          botanical,
          local,
        }))
      )
    )
  )
);

export const MODEL_BY_KEY: Record<ModelKey, AgroforestryModel> = MODELS.reduce(
  (acc, m) => ({ ...acc, [m.key]: m }),
  {} as Record<ModelKey, AgroforestryModel>
);

/** Canonical district name -> silvi zone keys covering it. */
export const DISTRICT_TO_ZONES: Record<string, string[]> = (() => {
  const out: Record<string, Set<string>> = {};
  for (const z of SILVI_ZONES)
    for (const az of z.agroZones)
      for (const d of az.districts) {
        if (!d.district) continue;
        (out[d.district] ??= new Set()).add(z.key);
      }
  return Object.fromEntries(
    Object.entries(out).map(([k, v]) => [k, [...v]])
  );
})();

/** Every district named anywhere in the statement (canonical names). */
export const SILVI_DISTRICTS: string[] = [
  ...new Set(
    SILVI_ZONES.flatMap((z) =>
      z.agroZones.flatMap((az) =>
        az.districts.map((d) => d.district).filter((x): x is string => !!x)
      )
    )
  ),
].sort();

/** Every taluk named anywhere in the statement. */
export const SILVI_TALUKS: string[] = [
  ...new Set(
    SILVI_ZONES.flatMap((z) =>
      z.agroZones.flatMap((az) => az.districts.flatMap((d) => d.taluks))
    )
  ),
].sort();

export interface SpeciesSummary {
  botanical: string;
  /** All local-name spellings used for this botanical name. */
  locals: string[];
  zones: string[];
  models: ModelKey[];
  districts: string[];
}

/** Reverse index: species -> where it is recommended. */
export const SPECIES_INDEX: SpeciesSummary[] = (() => {
  const map = new Map<
    string,
    {
      locals: Set<string>;
      zones: Set<string>;
      models: Set<ModelKey>;
      districts: Set<string>;
    }
  >();
  for (const z of SILVI_ZONES) {
    const districts = z.agroZones.flatMap((az) =>
      az.districts.map((d) => d.district).filter((x): x is string => !!x)
    );
    for (const m of MODELS)
      for (const [botanical, local] of z.species[m.key]) {
        const e =
          map.get(botanical) ??
          {
            locals: new Set<string>(),
            zones: new Set<string>(),
            models: new Set<ModelKey>(),
            districts: new Set<string>(),
          };
        e.locals.add(local);
        e.zones.add(z.name);
        e.models.add(m.key);
        districts.forEach((d) => e.districts.add(d));
        map.set(botanical, e);
      }
  }
  return [...map.entries()]
    .map(([botanical, e]) => ({
      botanical,
      locals: [...e.locals],
      zones: [...e.zones],
      models: [...e.models],
      districts: [...e.districts].sort(),
    }))
    .sort((a, b) => a.botanical.localeCompare(b.botanical));
})();

/* ============================================================
   DATA NOTES — defects found in the source statement.
   Surfaced in the UI so field teams can see provenance.
   ============================================================ */
export const DATA_NOTES: string[] = [
  'Dry Zone / Bund model lists "Moringa oleifera" with local name "Murki". "Murki" is the local name for Buchanania langan (see Transitional Zone). The Block model on the same sheet gives Moringa oleifera as "Nugge". Transcribed as printed.',
  'Hilly Zone / Block model repeats "Casuarina equisetifolia" at both row 2 and row 14. The duplicate row is omitted here; the Costal Zone equivalent leaves row 14 blank.',
  'Hilly Zone district list item 8 reads only "(Sakaleshapur)" with no district name. Sakaleshapur is a taluk of Hassan and has been mapped accordingly.',
  'Botanical spellings are reproduced verbatim, including "Anacordium"/"Anacardium", "Ptecarpus marsupium", "Maduca indica", "Swietenia mahogany", "Emblica officinalis" and "Feronia elephantum".',
  "Yadgir, Vijayanagara and Ramanagara do not appear anywhere in the statement. All three were carved out of parent districts after the source was drafted.",
  "10 of the 28 districts fall in more than one silvi zone (Dharwad, Belagavi, Hassan and Chikkamagaluru span three). For these, the taluk determines which species list applies — filter by taluk, not district alone.",
  "Five species carry two local-name spellings across sheets: Cinnamomum verum (Dalchini/Dalchinni), Peltophorum pterocarpum (Peltoforum/Peltophorum), Pterocarpus santalinus (Red Sander/Red Sandal), Thespesia populnea (Hoovarasi/Hoovarsi) and Moringa oleifera (Murki/Nugge). All spellings are preserved.",
];
