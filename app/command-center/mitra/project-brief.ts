import "server-only";

export type ProjectBriefTopic =
  | "overview"
  | "constitutional_context"
  | "vision"
  | "iaft"
  | "planning_principles"
  | "site_selection"
  | "plantation_models"
  | "nursery_execution"
  | "aftercare_survival"
  | "governance_monitoring"
  | "department_convergence"
  | "digital_platform"
  | "training_awareness"
  | "farmer_benefits"
  | "costing"
  | "conclusion";

export type ProjectBriefSection = {
  topic: ProjectBriefTopic;
  title: string;
  pages: string;
  keywords: string[];
  answer: string;
  bullets: string[];
};

export const PROJECT_BRIEF_LAST_UPDATED_AT = "2026-07-20T00:00:00+05:30";

export const PROJECT_BRIEF_SOURCE =
  "IAFT Strategic Framework & Plan of Action submitted to KSLSA on 20 July 2026";

export const PROJECT_BRIEF_SECTIONS: ProjectBriefSection[] = [
  {
    topic: "overview",
    title: "Project Overview",
    pages: "1-2",
    keywords: ["poshane", "greening karnataka", "project", "programme", "five crore", "lake", "water bodies", "what is"],
    answer:
      "The project is a KSLSA-led programme for planting five crore saplings across Karnataka and rejuvenating lakes and water bodies. IAFT submitted the strategic framework as Principal Scientific Advisory Body and Program Management Unit for discussion at the KSLSA meeting on 20 July 2026.",
    bullets: [
      "Full title: Greening Karnataka - Afforestation of Five Crore Saplings and Lake Rejuvenation.",
      "Submitted by IAFT in response to the KSLSA meeting notice dated 10 July 2026.",
      "The framework covers vision, institutional capability, execution, accountability, digital infrastructure, training, public awareness, convergence and farmer benefit.",
    ],
  },
  {
    topic: "constitutional_context",
    title: "Constitutional And Environmental Context",
    pages: "3",
    keywords: ["constitution", "article 48a", "51a", "duty", "environment", "forest policy", "tree cover", "33", "22"],
    answer:
      "The framework places the programme within India's constitutional duty to protect the environment. It notes that tree cover is around 22 percent against the national goal of 33 percent, so the gap cannot be closed by forests alone.",
    bullets: [
      "Article 48A directs the State to protect and improve the environment.",
      "Article 51A(g) places a duty on citizens to protect forests, lakes, rivers, wildlife and the natural environment.",
      "The framework treats agroforestry and farm forestry as central to closing the tree-cover gap.",
    ],
  },
  {
    topic: "vision",
    title: "Vision",
    pages: "4",
    keywords: ["vision", "living trees", "minimum horizon", "five years", "ten zones", "transparency", "survival", "lakes", "tanks"],
    answer:
      "The vision is five crore saplings becoming living trees across Karnataka, along with restoration of lakes and tanks, over a minimum five-year horizon. The programme measures success by survival, not by planting count.",
    bullets: [
      "Five crore living trees are the objective.",
      "Ten agro-climatic zones are the planning unit.",
      "Every site should be recorded, geo-tagged and visible through digital monitoring.",
      "Afforestation and lake rejuvenation are treated as one ecological restoration effort.",
    ],
  },
  {
    topic: "iaft",
    title: "IAFT Role And Capability",
    pages: "5",
    keywords: ["iaft", "institution", "scientific advisory", "pmu", "program management", "founded", "registered", "adakoli", "sadashivaiah", "sampangi"],
    answer:
      "IAFT is proposed as the Principal Scientific Advisory Body and Program Management Unit. It brings forestry, agroforestry, horticulture, seed technology and field implementation experience to guide planning, species selection, nursery standards, monitoring and digital systems.",
    bullets: [
      "IAFT began in 2009 as the Institute of Agroforestry and was registered in 2013 under the Societies Registration Act, 1960.",
      "It is a non-profit body run on member subscriptions and contributions.",
      "Its membership includes serving and retired officers, scientists, farmers, technologists, wood-based industrialists and NGOs.",
      "IAFT has already built initial digital infrastructure: a public website, command-and-control platform and field audit application.",
      "Programme data remains the property of KSLSA.",
    ],
  },
  {
    topic: "planning_principles",
    title: "Science Before Scale",
    pages: "6",
    keywords: ["science before scale", "principles", "right species", "right place", "site first", "nursery planning", "geo-tagged", "accountability"],
    answer:
      "The framework says the programme must be scientific, zone-based, survival-oriented and digitally monitored, not a simple plantation drive. Its core principle is right species, right place and right model.",
    bullets: [
      "Site selection comes before plantation.",
      "Nursery supply should be demand-based.",
      "Taluk execution should operate with district and State oversight.",
      "Survival, after-care and protection are core obligations.",
      "Monitoring starts from the beginning through geo-tagged maps, photographs, video and dashboards.",
      "Department-wise accountability and review are required.",
    ],
  },
  {
    topic: "site_selection",
    title: "Site Selection And Approval Gate",
    pages: "6-7",
    keywords: ["site", "land", "approval", "site id", "custodian", "water plan", "protection", "ksrsac", "inventory", "verified"],
    answer:
      "The programme begins with verified land, not targets. A site enters the programme only after legal availability, plantable area, soil, water, protection, plantation model, custodian and maintenance responsibility are confirmed.",
    bullets: [
      "Land may come from campuses, Government premises, roadsides, village commons, farm forestry lands, tank bunds, lake peripheries and permitted institutional or corporate campuses.",
      "Departments confirm land availability; IAFT verifies plantable suitability.",
      "KSRSAC remote-sensing support is proposed to help identify fallow and unused land.",
      "A unique Site ID is created only after the approval gate is passed.",
      "The rule is: no land record, no custodian, no water and protection plan, no Site ID means no planting approval.",
    ],
  },
  {
    topic: "plantation_models",
    title: "Plantation Models",
    pages: "8-9",
    keywords: ["models", "grama vana", "hallige ondu vana", "gomala", "campus", "tank", "lake", "roadside", "micro forest", "agroforestry", "restoration"],
    answer:
      "Each site uses a plantation model matched to its setting, community and purpose. The framework avoids one uniform model for the whole State.",
    bullets: [
      "Models include Grama Vana, Hallige Ondu Vana, gomala silvopasture, school and campus food forests, institutional campus forests, tank and lake belts, roadside corridors, urban micro-forests, agroforestry and ecological restoration.",
      "Species selection favours locally native, pioneering and multifunctional species.",
      "The framework avoids invasive species, blanket monocultures, planting on valuable natural grasslands and high-water-demand species in water-stressed areas.",
    ],
  },
  {
    topic: "nursery_execution",
    title: "Nursery And Planting Execution",
    pages: "9",
    keywords: ["nursery", "seedling", "planting window", "rainfall", "stock", "hardening", "quality", "supply", "logistics"],
    answer:
      "Nursery planning begins only after a demand-based forecast from the district land inventory. Planting is timed to effective soil moisture, not ceremonial dates or the first isolated shower.",
    bullets: [
      "Demand is aggregated district-wise and taluk-wise, then mapped against available nurseries.",
      "Supply may come from Forest and Horticulture Department nurseries, approved private nurseries and specialised nurseries.",
      "Planting stock is checked for height, collar girth, health, container size, hardening, disease-free condition and site suitability.",
      "Each site or block is geo-tagged and photographed on planting.",
    ],
  },
  {
    topic: "aftercare_survival",
    title: "After-Care And Survival Standard",
    pages: "9-10",
    keywords: ["after care", "after-care", "survival", "watering", "weeding", "replacement", "year 1", "year 2", "year 3", "threshold", "protection"],
    answer:
      "Survival is the primary outcome, not the number planted. After-care runs for years and includes watering, soil work, weeding, protection repair, replacement and formal survival audits.",
    bullets: [
      "The first 0-3 months require moisture checks, watering, basin repair, weed control, grazing control and casualty replacement.",
      "The first year includes seasonal watering, soil working, protection repair and a formal survival audit.",
      "Years 2 and 3 include drought support, gap filling, invasive control, final contractual survival assessment and growth measurement.",
      "Years 4 and 5 move into lower-frequency stewardship and ecological outcome audit.",
      "Alive is not enough; vigour, height, collar growth, crown condition and damage are assessed.",
      "Sites below threshold receive corrective action; repeated failure can trigger payment hold, agency review and reallocation.",
    ],
  },
  {
    topic: "governance_monitoring",
    title: "Governance And Monitoring",
    pages: "11-12",
    keywords: ["governance", "committee", "monitoring", "state committee", "district committee", "taluk committee", "village", "hobli", "block", "frequency"],
    answer:
      "The framework proposes a three-tier committee structure under KSLSA and a five-level monitoring architecture from the planting site up to the State dashboard.",
    bullets: [
      "State Afforestation Steering Committee approves the framework, standards and monitoring architecture.",
      "District Afforestation Committee compiles inventory, validates sites, coordinates departments and reviews survival.",
      "Taluk Afforestation Committee maintains local inventory, verifies readiness, coordinates execution and supports app-based reporting.",
      "Monitoring levels are Village/Site, Hobli/Block, Taluk, District and State.",
      "Village/Site monitoring is daily or as needed; Hobli/Block is weekly; Taluk is fortnightly in planting season and monthly thereafter; District is monthly with quarterly survival review; State is monthly dashboard and quarterly strategic review.",
    ],
  },
  {
    topic: "department_convergence",
    title: "Departmental Convergence",
    pages: "13",
    keywords: ["department", "convergence", "forest", "revenue", "rdpr", "horticulture", "education", "urban", "minor irrigation", "kiadb", "railways", "defence", "ngo"],
    answer:
      "The programme depends on convergence across departments and agencies, with each contributing the land, nursery, technical, institutional or field capacity it is best placed to provide.",
    bullets: [
      "Forest Department: nursery support, species guidance, quality and restoration-site coordination.",
      "Revenue Department: Government land identification, land-category data and availability mapping.",
      "Rural Development and Panchayat Raj: village common lands, Gram Panchayat participation and local maintenance support.",
      "Horticulture: horticulture species, nurseries and livelihood-linked models.",
      "Education institutions: campus land and student participation.",
      "Urban agencies, Minor Irrigation, Railways, Defence, KIADB, universities, IT/BT premises, PSUs, NGOs and civil-society partners also have defined indicative roles.",
    ],
  },
  {
    topic: "digital_platform",
    title: "Digital Platform",
    pages: "13-14",
    keywords: ["digital platform", "command center", "dashboard", "field audit", "audit app", "demand survey app", "source of truth", "geo-tag", "replacement job", "alerts"],
    answer:
      "The digital platform is described as the programme's institutional source of truth. It connects field entry, district dashboards, the State dashboard and the Command-and-Control Centre.",
    bullets: [
      "The platform registers each site with a unique identity and geo-tags every location.",
      "It maintains department-wise and district-wise records, photographs, survival tracking, replacement tracking and exception alerts.",
      "It is governed by role-based access, time-stamped updates and an audit trail.",
      "IAFT has built a public website, command-and-control platform and field audit application.",
      "A Demand Survey App and Plantation Audit App are proposed next.",
      "Where mortality is recorded, the system should trigger a replacement job automatically.",
    ],
  },
  {
    topic: "training_awareness",
    title: "Training And Public Awareness",
    pages: "14",
    keywords: ["training", "capacity", "awareness", "communication", "public", "kannada", "launch", "newspaper", "ngo training"],
    answer:
      "Training is treated as the way the programme discipline reaches the field. Public communication is expected to be dignified, institutional and focused on participation and trust.",
    bullets: [
      "Retired forest officers conducting demand surveys receive district-wise training before deployment.",
      "NGOs are evaluated and then given district-wise awareness training before planting season.",
      "Training covers survival-first philosophy, species and site science, planting and after-care, app usage, accountability, payment model and custodian responsibility.",
      "Communication should be phased: formal launch, district land declaration notices, calls for qualified NGOs and volunteers, planting-season visibility and periodic public reporting.",
      "Kannada speaks first, with English for institutional audiences.",
    ],
  },
  {
    topic: "farmer_benefits",
    title: "Farmer Benefit And Incentives",
    pages: "15",
    keywords: ["farmer", "tree patta", "kapy", "krushi aranya", "insurance", "carbon", "carbon sequestration", "incentive", "usufruct", "nwfp"],
    answer:
      "For farmer lands, the framework links survival to farmer benefit through suitable species, tree patta, incentives, insurance and possible carbon value.",
    bullets: [
      "Species should be ecologically viable, socially acceptable and preferably demand-based.",
      "NWFP and food-forestry models are preferred where they provide returns to growers.",
      "Tree patta may confirm the grower's rights over the usufruct of trees raised.",
      "The framework suggests KSLSA support built on KAPY, under which the Forest Department provides Rs 125 per surviving seedling over three years.",
      "Insurance and carbon sequestration partnerships are proposed for consideration.",
    ],
  },
  {
    topic: "costing",
    title: "Costing Framework",
    pages: "15-16",
    keywords: ["cost", "costing", "budget", "estimate", "rate", "model-wise", "sapling rate", "plantation journal", "maintenance"],
    answer:
      "The framework recommends model-wise costing, not a flat per-sapling rate. The final estimate should be prepared after district land and nursery inventories are received.",
    bullets: [
      "Cost heads include seedling raising, procurement, transport, logistics, site preparation, planting labour, watering, after-care, casualty replacement, protection, field supervision, digital platform and audit.",
      "District-wise costing should be linked to land category and plantation model.",
      "For each plantation site, a plantation journal should record all works and costs in sequence and remain available for audit.",
      "Maintenance is proposed for not less than five years.",
    ],
  },
  {
    topic: "conclusion",
    title: "Conclusion",
    pages: "16",
    keywords: ["conclusion", "landmark", "approval", "subject to approval", "kslsa owns", "submitted"],
    answer:
      "The framework presents the initiative as a potential landmark ecological programme for Karnataka, dependent on scientific planning, district land inventory, zone-based species selection, nursery preparedness, digital monitoring and clear after-care responsibility.",
    bullets: [
      "KSLSA is identified as the owning authority.",
      "IAFT is identified as Principal Scientific Advisory Body and Program Management Unit.",
      "The framework is indicative and subject to KSLSA approval.",
    ],
  },
];

export function projectBriefTopics() {
  return PROJECT_BRIEF_SECTIONS.map((section) => section.topic);
}
