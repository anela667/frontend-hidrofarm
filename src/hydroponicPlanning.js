// Shared hydroponic planning helpers used by the planting form.
// NOTE: the plant-count estimate here must stay in sync with
// `PLANT_DENSITY_PER_M2` in the backend (controller/farm/plan.js), since
// the backend recalculates and stores the authoritative value — this
// version is only used to preview the estimate before submitting.

export const METHOD_OPTIONS = ["NFT", "Wick System"];

const PLANT_DENSITY_PER_M2 = {
  NFT: 25,
  "Wick System": 16,
};

export function estimatePlantCount(method, area) {
  const density = PLANT_DENSITY_PER_M2[method] ?? PLANT_DENSITY_PER_M2["Wick System"];
  const numericArea = Number(area) || 0;
  return Math.max(Math.round(numericArea * density), 0);
}

// Plants with a heavier/bushier growth habit need wider pipes and more
// support, so the recommended PVC ("paralon") diameter differs by plant.
const HEAVY_FRUITING_PLANTS = ["Tomat Ceri"];

function recommendPipeDiameter(plantName) {
  return HEAVY_FRUITING_PLANTS.includes(plantName) ? "4 inch (10 cm)" : "3 inch (7.5 cm)";
}

// Small area = save floor space with a tiered (vertical) rack.
// Larger area = a flat, single-level layout is simpler to install and maintain.
function recommendLayout(area) {
  const numericArea = Number(area) || 0;
  return numericArea <= 2
    ? {
        layout: "Bertingkat (rak vertikal)",
        note: "Luas lahanmu tergolong kecil, jadi rak bertingkat (2-3 tingkat) akan memanfaatkan ruang vertikal dengan lebih baik.",
      }
    : {
        layout: "Datar (satu tingkat)",
        note: "Luas lahanmu cukup luas untuk tata letak datar satu tingkat, yang lebih mudah dipasang dan dirawat.",
      };
}

// Returns the list of materials/preparation info to show the user in the
// second step of the planting form, based on the method, land area, and
// plant chosen. This replaces the old free-form checklist with concrete
// guidance the user can act on.
export function getMaterialsInfo(method, area, plantName) {
  const count = estimatePlantCount(method, area);
  const numericArea = Number(area) || 0;

  if (method === "NFT") {
    const { layout, note } = recommendLayout(numericArea);
    const pipeDiameter = recommendPipeDiameter(plantName);
    const pipeCount = Math.max(Math.ceil(count / 15), 1); // ~15 planting holes per 3 m pipe

    return {
      title: "Bahan yang perlu disiapkan (sistem NFT)",
      summary: `Untuk ${numericArea || "-"} m² ${plantName || "tanamanmu"} menggunakan NFT, kamu memerlukan sekitar ${count} slot tanam.`,
      layout,
      layoutNote: note,
      items: [
        `Pipa PVC (paralon), diameter ${pipeDiameter}, sekitar ${pipeCount} batang pipa panjang 3 m`,
        `Net pot, sekitar ${count} buah (satu per lubang tanam)`,
        "Pompa air + timer, untuk mengalirkan larutan nutrisi secara terus-menerus",
        "Tandon/wadah nutrisi",
        "Rockwool atau media tanam untuk bibit",
        "Larutan nutrisi A & B, pH meter, dan TDS/EC meter",
        `Rak/penyangga ${layout} untuk menahan pipa dengan sedikit kemiringan`,
      ],
    };
  }

  // Wick System
  const reservoirLiters = Math.max(Math.round(count * 1.5), 5);

  return {
    title: "Bahan yang perlu disiapkan (Wick System)",
    summary: `Untuk ${numericArea || "-"} m² ${plantName || "tanamanmu"} menggunakan Wick System, kamu memerlukan sekitar ${count} slot tanam.`,
    layout: recommendLayout(numericArea).layout,
    layoutNote: recommendLayout(numericArea).note,
    items: [
      `Net pot, sekitar ${count} buah`,
      "Sumbu (kain flanel atau tali katun), satu per net pot",
      `Wadah nutrisi, dengan kapasitas total sekitar ${reservoirLiters} liter`,
      "Rockwool atau media tanam untuk bibit",
      "Larutan nutrisi A & B, pH meter, dan TDS/EC meter",
      "Nampan semai untuk perkecambahan",
      `Nampan/penyangga ${recommendLayout(numericArea).layout} untuk menahan net pot`,
    ],
  };
}
