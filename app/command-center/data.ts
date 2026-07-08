/* ============================================================
   POSHANE COMMAND & CONTROL CENTER — MOCK DATA (illustrative)
   All figures are demonstration data. Not live operational data.
   ============================================================ */

export interface District {
  name: string; code: string; col: number; row: number; zone: number;
  alloc: number;      // 8-year programme share, lakh saplings
  prog: number;       // % of Year-1 target planted
  survival: number;   // %
  ngos: number; volunteers: number; nurseries: number;
}

type DRow = [string, string, number, number, number, number, number, number, number, number, number];
const DR: DRow[] = [
  ["Bidar","BDR",5,0,4,14,58,94.6,9,3150,6],
  ["Kalaburagi","KLB",4,1,5,28,52,93.6,14,4900,10],
  ["Yadgir","YDG",5,1,5,12,48,92.4,6,2050,5],
  ["Vijayapura","VJP",3,2,3,24,61,94.1,12,4200,9],
  ["Raichur","RCH",5,2,5,18,50,91.8,8,2800,7],
  ["Belagavi","BLG",2,3,2,36,74,96.2,21,7350,14],
  ["Bagalkote","BGK",3,3,3,16,63,94.8,9,3150,6],
  ["Koppal","KPL",4,3,3,14,55,94.3,7,2450,5],
  ["Ballari","BLY",5,3,3,16,60,94.5,9,3150,6],
  ["Dharwad","DWD",2,4,2,14,78,96.6,11,3850,6],
  ["Gadag","GDG",3,4,3,10,64,95.1,6,2100,4],
  ["Vijayanagara","VJN",4,4,3,12,57,94.4,7,2450,5],
  ["Uttara Kannada","UK",1,5,0,24,82,97.4,13,4550,10],
  ["Haveri","HVR",2,5,2,12,70,95.8,8,2800,5],
  ["Davanagere","DVG",3,5,6,14,68,95.6,9,3150,6],
  ["Chitradurga","CTD",4,5,6,18,62,94.9,10,3500,7],
  ["Udupi","UDP",1,6,0,10,84,97.6,8,2800,4],
  ["Shivamogga","SMG",2,6,1,22,80,97.2,14,4900,9],
  ["Chikkamagaluru","CKM",3,6,1,14,79,97.1,9,3150,6],
  ["Tumakuru","TMK",4,6,6,26,71,95.7,16,5600,11],
  ["Chikkaballapura","CBP",5,6,7,12,66,95.2,7,2450,5],
  ["Dakshina Kannada","DK",1,7,0,12,83,97.5,10,3500,5],
  ["Hassan","HSN",2,7,9,18,76,96.4,11,3850,8],
  ["Mandya","MDY",3,7,8,14,72,95.9,9,3150,6],
  ["Bengaluru Rural","BNR",4,7,7,10,69,95.5,8,2800,4],
  ["Kolar","KLR",5,7,7,12,65,95.0,7,2450,5],
  ["Kodagu","KDG",2,8,1,8,81,97.3,6,2100,4],
  ["Mysuru","MYS",3,8,8,22,75,96.3,15,5250,9],
  ["Ramanagara","RMN",4,8,7,10,73,96.0,7,2450,4],
  ["Bengaluru Urban","BNU",5,8,7,14,86,96.8,18,6300,6],
  ["Chamarajanagara","CHN",3,9,8,14,67,95.3,8,2800,6],
];
export const DISTRICTS: District[] = DR.map(r => ({
  name: r[0], code: r[1], col: r[2], row: r[3], zone: r[4],
  alloc: r[5], prog: r[6], survival: r[7], ngos: r[8], volunteers: r[9], nurseries: r[10],
}));

export interface Zone { name: string; species: [string, string][] }
export const ZONES: Zone[] = [
  {name:"Coastal Zone", species:[["Honne","Pterocarpus marsupium"],["Nerale (Jamun)","Syzygium cumini"],["Wild Jack (Hebbalasu)","Artocarpus hirsutus"],["Punnaga","Calophyllum inophyllum"],["Halasu (Jackfruit)","Artocarpus heterophyllus"]]},
  {name:"Hilly Zone (Malnad)", species:[["Mathi","Terminalia elliptica"],["Nandi","Lagerstroemia lanceolata"],["Beete (Rosewood)","Dalbergia latifolia"],["Honne","Pterocarpus marsupium"],["Halasu (Jackfruit)","Artocarpus heterophyllus"]]},
  {name:"Northern Transition Zone", species:[["Saguvani (Teak)","Tectona grandis"],["Hebbevu","Melia dubia"],["Nerale (Jamun)","Syzygium cumini"],["Mathi","Terminalia elliptica"],["Hunase (Tamarind)","Tamarindus indica"]]},
  {name:"Northern Dry Zone", species:[["Bevu (Neem)","Azadirachta indica"],["Honge","Pongamia pinnata"],["Hunase (Tamarind)","Tamarindus indica"],["Banni","Prosopis cineraria"],["Nellikai (Amla)","Phyllanthus emblica"]]},
  {name:"North Eastern Transition Zone", species:[["Bevu (Neem)","Azadirachta indica"],["Sissoo","Dalbergia sissoo"],["Hunase (Tamarind)","Tamarindus indica"],["Honge","Pongamia pinnata"],["Bael (Bilva)","Aegle marmelos"]]},
  {name:"North Eastern Dry Zone", species:[["Bevu (Neem)","Azadirachta indica"],["Honge","Pongamia pinnata"],["Ber (Elachi)","Ziziphus mauritiana"],["Sissoo","Dalbergia sissoo"],["Hunase (Tamarind)","Tamarindus indica"]]},
  {name:"Central Dry Zone", species:[["Honge","Pongamia pinnata"],["Nellikai (Amla)","Phyllanthus emblica"],["Hebbevu","Melia dubia"],["Hunase (Tamarind)","Tamarindus indica"],["Basavanapada","Bauhinia purpurea"]]},
  {name:"Eastern Dry Zone", species:[["Srigandha (Sandalwood)","Santalum album"],["Honge","Pongamia pinnata"],["Hebbevu","Melia dubia"],["Nerale (Jamun)","Syzygium cumini"],["Basavanapada","Bauhinia purpurea"]]},
  {name:"Southern Dry Zone", species:[["Srigandha (Sandalwood)","Santalum album"],["Hunase (Tamarind)","Tamarindus indica"],["Honge","Pongamia pinnata"],["Nellikai (Amla)","Phyllanthus emblica"],["Bidiru (Bamboo)","Bambusa bambos"]]},
  {name:"Southern Transition Zone", species:[["Saguvani (Teak)","Tectona grandis"],["Hebbevu","Melia dubia"],["Honne","Pterocarpus marsupium"],["Nerale (Jamun)","Syzygium cumini"],["Mathi","Terminalia elliptica"]]},
];

export const NGO_POOL = ["Hasiru Nele Foundation","Vana Mitra Trust","Green Deccan Collective","Sasya Seva Society","Malnad Eco Trust","Nisarga Balaga","Tunga Green Initiative","Kalyana Karnataka Hasiru Council","Cauvery Canopy Network","Bhoomi Tayi Trust","Aranya Snehi Sangha","Sahyadri Sapling Circle"];

/* [district, site, landType, areaAc, status, ownership] */
export type Site = [string, string, string, number, string, string];
export const SITES: Site[] = [
  ["Belagavi","Rakaskop Reservoir Belt","Government — Revenue",184,"Planted","Government body — Minor Irrigation Dept."],
  ["Belagavi","Udyambag Industrial Green Belt","Private industry",42,"Planted","Private industry — CSR custody (foundry cluster)"],
  ["Kalaburagi","Kusnoor Road Avenue Stretch","Roadside / Avenue",28,"Selected","Government body — PWD (avenue maintenance)"],
  ["Kalaburagi","Gulbarga University Campus","Institutional campus",66,"Planted","Institution — University estate office"],
  ["Mysuru","Lingambudhi Lake Foreshore","Lake foreshore",54,"Planted","Community — Lake conservation committee"],
  ["Mysuru","Varuna Hobli GP Commons","Community / Gram Panchayat",38,"Selected","Community — Gram Panchayat"],
  ["Tumakuru","Sira Taluk Revenue Block 12","Government — Revenue",210,"Planted","Government body — Revenue Dept. with NGO O&M"],
  ["Tumakuru","Vasanthanarasapura Industrial Node","Private industry",75,"Selected","Private industry — CSR custody (KIADB allottees)"],
  ["Bengaluru Urban","NICE Corridor Buffer — Ph II","Roadside / Avenue",64,"Planted","Government body — Corridor authority"],
  ["Bengaluru Rural","Doddaballapura Lake Series","Lake foreshore",47,"Available","Community — Tank users' association (proposed)"],
  ["Raichur","Krishna Left Bank Fringe","Government — Forest fringe",132,"Selected","Government body — Territorial forest division"],
  ["Uttara Kannada","Kirwatti Degraded Patch","Government — Forest fringe",158,"Planted","Government body — Territorial forest division"],
  ["Shivamogga","Bhadravathi Mill Lands","Private industry",58,"Available","Private industry — CSR custody (proposed)"],
  ["Hassan","Holenarasipura GP Cluster","Community / Gram Panchayat",44,"Planted","Community — Gram Panchayat federation"],
  ["Vijayapura","Almatti Backwater Belt","Government — Revenue",176,"Selected","Government body — Irrigation project authority"],
  ["Chamarajanagara","Kollegala School Network","Institutional campus",22,"Planted","Institution — Education Dept. school committees"],
  ["Kolar","KGF Reclaimed Grounds","Government — Revenue",96,"Available","Government body — Revenue Dept. (survey pending)"],
  ["Dakshina Kannada","Netravathi Bank Stretch","Lake foreshore",31,"Planted","Community — River bank samithi"],
];
export const LAND_TYPES = ["Government — Revenue","Government — Forest fringe","Institutional campus","Private industry","Community / Gram Panchayat","Roadside / Avenue","Lake foreshore"];

/* [name, type, district, onboarding, scope, contract, volunteers] */
export type Stakeholder = [string, string, string, string, string, string, number];
export const STK: Stakeholder[] = [
  ["Hasiru Nele Foundation","NGO","Bengaluru Urban","Onboarded","Avenue & lake-foreshore planting, 4 zones of BBMP limits","Active",1240],
  ["Vana Mitra Trust","NGO","Belagavi","Onboarded","Reservoir belt planting + 2-yr maintenance contract","Active",860],
  ["Green Deccan Collective","NGO","Kalaburagi","Onboarded","Dryland block planting, Kalyana Karnataka region","Signed",610],
  ["Sasya Seva Society","NGO","Mysuru","Onboarded","Lake foreshore + GP commons, survival assurance scope","Active",720],
  ["Malnad Eco Trust","NGO","Shivamogga","Onboarded","Native species blocks, Malnad belt","Active",540],
  ["Nisarga Balaga","NGO","Tumakuru","Verifying","Revenue block planting, Sira & Madhugiri taluks","Drafted",380],
  ["Tunga Green Initiative","NGO","Davanagere","Onboarded","Canal bund & tank bund planting","Signed",290],
  ["Kalyana Karnataka Hasiru Council","NGO","Raichur","Verifying","Forest-fringe restoration, Krishna belt","Drafted",240],
  ["Cauvery Canopy Network","NGO","Mandya","Onboarded","Canal network avenue planting","Active",460],
  ["Aranya Snehi Sangha","NGO","Uttara Kannada","Onboarded","Degraded patch restoration with KFD coordination","Active",350],
  ["District Forest Division","Government agency","All districts","Onboarded","Technical sanction, species verification, site handover","—",0],
  ["Dept. of Public Instruction","Government agency","All districts","Onboarded","School campus planting & Hasiru Shaale clubs","—",0],
  ["KIADB Estate Offices","Government agency","12 districts","Verifying","Industrial-node buffer planting coordination","—",0],
  ["NSS / NCC State Cells","Volunteer network","All districts","Onboarded","Planting-day mobilisation, monsoon window","—",18400],
  ["Yuva Hasiru Sene","Volunteer network","21 districts","Onboarded","Monthly monitoring walks & geo-photo entry","—",9600],
  ["Corporate Volunteer Pool","Volunteer network","Bengaluru Urban","Invited","Weekend planting drives, corridor buffers","—",3100],
];

export const NURSERIES: [string,string,string,string,string][] = [
  ["Hesaraghatta Central Nursery","Bengaluru Rural","12.0 L","Srigandha, Honge, Hebbevu, Nerale","Operational"],
  ["Rakaskop Nursery","Belagavi","9.5 L","Saguvani, Mathi, Hunase, Hebbevu","Operational"],
  ["Kalaburagi Zonal Nursery","Kalaburagi","8.0 L","Bevu, Honge, Ber, Sissoo","Operational"],
  ["Sirsi Malnad Nursery","Uttara Kannada","7.5 L","Mathi, Nandi, Beete, Halasu","Operational"],
  ["Sira Dryland Nursery","Tumakuru","7.0 L","Honge, Nellikai, Hunase, Basavanapada","Operational"],
  ["Mysuru South Nursery","Mysuru","6.5 L","Srigandha, Hunase, Bidiru, Nellikai","Operational"],
  ["Bhadravathi Nursery","Shivamogga","6.0 L","Nandi, Honne, Halasu, Mathi","Operational"],
  ["Raichur Krishna Nursery","Raichur","5.5 L","Bevu, Honge, Sissoo, Hunase","Stocking"],
  ["Mangaluru Coastal Nursery","Dakshina Kannada","4.5 L","Punnaga, Wild Jack, Nerale, Honne","Operational"],
  ["Hassan Transition Nursery","Hassan","5.0 L","Saguvani, Hebbevu, Nerale, Honne","Stocking"],
];

export const AUDITS: [string,string,string,string,string,string][] = [
  ["06 Jul 2026","Kirwatti Patch, Uttara Kannada","Plantation","Surprise","Pit spacing & mulching to standard; survival tally matches field register","Pass"],
  ["04 Jul 2026","Sira Block 12, Tumakuru","Plantation","Scheduled","Casualty replacement pending on 2.1% of pits — rectification in 15 days","Flag"],
  ["03 Jul 2026","Raichur Krishna Nursery","Nursery","Surprise","Shade-net gap on Bevu beds; seedling grading register incomplete","Flag"],
  ["01 Jul 2026","Lingambudhi Foreshore, Mysuru","Plantation","Scheduled","Watering roster verified; fencing intact","Pass"],
  ["29 Jun 2026","Kusnoor Avenue, Kalaburagi","Plantation","Surprise","Tree-guard theft at 14 pits reported to jurisdictional PS","Flag"],
  ["27 Jun 2026","Hesaraghatta Central Nursery","Nursery","Scheduled","Srigandha host-plant pairing verified; stock health good","Pass"],
  ["25 Jun 2026","Udyambag Belt, Belagavi","Plantation","Scheduled","CSR maintenance crew on site; drip lines functional","Pass"],
  ["22 Jun 2026","Almatti Belt, Vijayapura","Plantation","Surprise","Planting halted for waterlogging in low pockets — sites re-marked","Flag"],
  ["20 Jun 2026","Sirsi Malnad Nursery","Nursery","Scheduled","Beete stock below indent by 8% — supplementary sowing ordered","Flag"],
  ["18 Jun 2026","Kollegala Schools, Chamarajanagara","Plantation","Scheduled","Student green-club adoption registers complete","Pass"],
];

/* [time, who, actionHtml, sub] — actionHtml may contain <b> tags */
export const FEED: [string,string,string,string][] = [
  ["14:22","Field Officer · Tumakuru","logged <b>1,860 pits verified</b> at Sira Block 12","Geo-tagged photos: 46"],
  ["14:07","NGO Team · Mysuru","recorded <b>watering cycle complete</b> — Lingambudhi Foreshore","Roster W-27"],
  ["13:48","Nursery Keeper · Raichur","updated <b>Bevu bed count: 82,400</b> seedlings","Stocking entry"],
  ["13:31","Field Officer · Belagavi","logged <b>casualty replacement — 312 saplings</b>, Rakaskop Belt","Survival register"],
  ["13:05","Volunteer Lead · Bengaluru Urban","submitted <b>monitoring walk report</b> — NICE Corridor Ph II","Photos: 61"],
  ["12:44","Field Officer · Hassan","marked <b>site handover complete</b> — Holenarasipura GP cluster","Custody: GP federation"],
  ["12:19","NGO Team · Kalaburagi","flagged <b>tree-guard damage, 9 pits</b> — Kusnoor Avenue","Issue #KG-118 raised"],
  ["11:52","Field Officer · Udupi","logged <b>2,240 saplings planted</b> — coastal school network","Geo-tagged photos: 38"],
];

export const ISSUES: [string,string,string,string,string][] = [
  ["KG-118","Kalaburagi","Tree-guard damage / theft along Kusnoor Avenue","High","Open"],
  ["RC-091","Raichur","Water tanker frequency below roster in Block 4","High","Open"],
  ["TU-076","Tumakuru","Casualty replacement stock delay from zonal nursery","Medium","In progress"],
  ["BG-064","Belagavi","Encroachment marking dispute at reservoir belt edge","Medium","In progress"],
  ["MY-052","Mysuru","Volunteer roster clash on weekend watering","Low","Closed"],
  ["UK-047","Uttara Kannada","Fencing wire pilferage at Kirwatti patch","Medium","Closed"],
];

/* [agency, type, committedCr, receivedCr, utilisedCr] */
export const FUNDS: [string,string,number,number,number][] = [
  ["Government of Karnataka — Programme Grant","State budget line",120,60,41.2],
  ["CSR — Manufacturing & Infrastructure Consortium","CSR pooled",28,16,9.8],
  ["CSR — IT & Services Consortium","CSR pooled",18,10,6.1],
  ["Philanthropic Foundations Pool","Grant",12,5,2.9],
  ["District Mineral Foundation Allocations","DMF",8,3,1.4],
];

export const MONTH_ACTS = ["Site survey","Pit marking","Soil work & fencing","Nursery hardening","Handover & pre-monsoon","Planting wave 1","Planting wave 2 + casualty check","Watering & weeding","Watering & weeding","Growth measurement","Survival census (Y1)","Annual review & audit"];
export const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

/* ---------- helpers ---------- */
export const fmtIN = (n: number) => Math.round(n).toLocaleString("en-IN");
export const lakhToStr = (l: number) =>
  l >= 100 ? (l / 100).toFixed(2).replace(/\.00$/, "") + " Cr" : (Math.round(l * 10) / 10) + " L";
export const cr = (v: number) => "₹" + v.toLocaleString("en-IN", { maximumFractionDigits: 1 }) + " Cr";
export const y1Of = (d: District) => d.alloc * 0.12;
export const plantedOf = (d: District) => y1Of(d) * d.prog / 100;

export const TOT_ALLOC = DISTRICTS.reduce((s, d) => s + d.alloc, 0);
export const TOT_Y1 = DISTRICTS.reduce((s, d) => s + y1Of(d), 0);
export const TOT_PLANTED = DISTRICTS.reduce((s, d) => s + plantedOf(d), 0);
export const W_SURV = DISTRICTS.reduce((s, d) => s + d.survival * plantedOf(d), 0) / TOT_PLANTED;
export const TOT_NUR = DISTRICTS.reduce((s, d) => s + d.nurseries, 0);
export const UTIL_TOTAL = FUNDS.reduce((a, f) => a + f[4], 0);
export const UTIL_PER_LAKH = UTIL_TOTAL / TOT_PLANTED;
export const zoneAlloc = (zi: number) => DISTRICTS.filter(d => d.zone === zi).reduce((s, d) => s + d.alloc, 0);

export const ACCESS_CODE = "000000"; // prototype step-up code
