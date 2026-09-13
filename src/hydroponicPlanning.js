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

const HEAVY_FRUITING_PLANTS = ["Tomat Ceri"];

function recommendPipeDiameter(plantName) {
  return HEAVY_FRUITING_PLANTS.includes(plantName) ? "4 inch (10 cm)" : "3 inch (7.5 cm)";
}

const METHOD_RECOMMENDATION = {
  Sawi: {
    recommended: ["NFT", "Wick System"],
    reason:
      "Sawi adalah sayuran daun yang ringan dengan akar dangkal dan kebutuhan nutrisi rendah, jadi cocok tumbuh dengan kedua metode.",
  },
  Selada: {
    recommended: ["NFT", "Wick System"],
    reason:
      "Selada adalah sayuran daun yang ringan dengan akar dangkal dan kebutuhan nutrisi rendah, jadi cocok tumbuh dengan kedua metode.",
  },
  "Tomat Ceri": {
    recommended: ["NFT"],
    reason:
      "Tomat ceri adalah tanaman buah yang berat dan butuh banyak nutrisi serta air saat mulai berbuah. Wick System (sistem sumbu pasif) berisiko tidak mampu mengimbangi kebutuhan itu seiring tanaman tumbuh besar, jadi NFT (aliran nutrisi aktif) lebih disarankan.",
  },
};

export function getMethodWarning(plantName, method) {
  if (!plantName || !method) return null;

  const info = METHOD_RECOMMENDATION[plantName];
  if (!info || info.recommended.includes(method)) return null;

  return `Untuk tanaman ${plantName}, metode yang disarankan adalah ${info.recommended.join(
    " atau "
  )}. ${info.reason} Anda tetap bisa melanjutkan dengan ${method}, tapi hasilnya mungkin kurang optimal.`;
}

function recommendLayout(area) {
  const numericArea = Number(area) || 0;
  return numericArea <= 2
    ? {
        layout: "Bertingkat (rak vertikal)",
        note: "Luas lahan Anda tergolong kecil, jadi rak bertingkat/multi-level (2-3 tingkat) lebih memanfaatkan ruang vertikal.",
      }
    : {
        layout: "Datar (satu tingkat)",
        note: "Luas lahan Anda cukup lega untuk tata letak datar satu tingkat, yang lebih simpel dipasang dan dirawat.",
      };
}

export function getMaterialsInfo(method, area, plantName) {
  const count = estimatePlantCount(method, area);
  const numericArea = Number(area) || 0;

  if (method === "NFT") {
    const { layout, note } = recommendLayout(numericArea);
    const pipeDiameter = recommendPipeDiameter(plantName);
    const pipeCount = Math.max(Math.ceil(count / 15), 1); // ~15 lubang tanam per pipa 3 m

    return {
      title: "Bahan yang perlu disiapkan (sistem NFT)",
      summary: `Untuk lahan ${numericArea || "-"} m² tanaman ${plantName || "Anda"} dengan metode NFT, Anda butuh sekitar ${count} lubang tanam.`,
      layout,
      layoutNote: note,
      items: [
        `Pipa PVC ("paralon") diameter ${pipeDiameter}, sekitar ${pipeCount} batang (panjang 3 m)`,
        `Net pot, sekitar ${count} buah (satu per lubang tanam)`,
        "Pompa air + timer, untuk mengalirkan larutan nutrisi secara terus-menerus",
        "Tandon/wadah larutan nutrisi",
        "Rockwool atau media tanam untuk bibit",
        "Larutan nutrisi A & B, pH meter, dan TDS/EC meter",
        `Rak/dudukan model ${layout.toLowerCase()} untuk menahan pipa dengan sedikit kemiringan`,
      ],
    };
  }

  // Wick System
  const reservoirLiters = Math.max(Math.round(count * 1.5), 5);

  return {
    title: "Bahan yang perlu disiapkan (Wick System)",
    summary: `Untuk lahan ${numericArea || "-"} m² tanaman ${plantName || "Anda"} dengan metode Wick System, Anda butuh sekitar ${count} lubang tanam.`,
    layout: recommendLayout(numericArea).layout,
    layoutNote: recommendLayout(numericArea).note,
    items: [
      `Net pot, sekitar ${count} buah`,
      "Sumbu (kain flanel atau tali katun), satu per net pot",
      `Wadah/tandon nutrisi, kapasitas total sekitar ${reservoirLiters} liter`,
      "Rockwool atau media tanam untuk bibit",
      "Larutan nutrisi A & B, pH meter, dan TDS/EC meter",
      "Nampan semai untuk perkecambahan",
      `Rak/dudukan model ${recommendLayout(numericArea).layout.toLowerCase()} untuk menahan net pot`,
    ],
  };
}
