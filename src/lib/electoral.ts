export type Position = {
  value: string;
  label: string;
  description: string;
  eligibleClasses: string[];
};

export const CLASSES = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];
export const STREAMS = ["Blue", "Red", "Green", "Yellow"];

export const POSITIONS: Position[] = [
  { value: "head_prefect", label: "Head Prefect", description: "Lead the entire student body and represent students to school administration", eligibleClasses: ["P5", "P6"] },
  { value: "academic_prefect", label: "Academic Prefect", description: "Oversee academic activities and support student learning initiatives", eligibleClasses: ["P5", "P6"] },
  { value: "head_monitors", label: "Head Monitor(es)", description: "Coordinate monitor activities and maintain school discipline", eligibleClasses: ["P3", "P4"] },
  { value: "welfare_prefect", label: "Welfare Prefect (Mess Prefect)", description: "Manage student welfare and dining hall operations", eligibleClasses: ["P4", "P5"] },
  { value: "entertainment_prefect", label: "Entertainment Prefect", description: "Organize school events and entertainment activities", eligibleClasses: ["P3", "P4", "P5"] },
  { value: "games_sports_prefect", label: "Games and Sports Prefect", description: "Coordinate sports activities and represent the school in competitions", eligibleClasses: ["P4", "P5"] },
  { value: "health_sanitation", label: "Health & Sanitation", description: "Maintain school hygiene and promote health awareness", eligibleClasses: ["P3", "P4", "P5"] },
  { value: "uniform_uniformity", label: "Uniform & Uniformity", description: "Ensure proper school uniform standards and dress code compliance", eligibleClasses: ["P2", "P3", "P4"] },
  { value: "time_keeper", label: "Time Keeper", description: "Manage school schedules and ensure punctuality", eligibleClasses: ["P4", "P5"] },
  { value: "ict_prefect", label: "ICT Prefect", description: "Support technology use and digital learning initiatives", eligibleClasses: ["P3", "P4"] },
  { value: "furniture_prefect", label: "Furniture Prefect(s)", description: "Maintain and oversee school furniture and property", eligibleClasses: ["P3", "P4", "P5"] },
  { value: "prefect_upper_section", label: "Prefect for Upper Section", description: "Oversee and coordinate activities for upper section students", eligibleClasses: ["P5"] },
  { value: "prefect_lower_section", label: "Prefect for Lower Section", description: "Oversee and coordinate activities for lower section students", eligibleClasses: ["P2"] },
  { value: "discipline_prefect", label: "Prefect in Charge of Discipline", description: "Maintain school discipline and enforce school rules", eligibleClasses: ["P3", "P4", "P5"] },
];

export function positionLabel(value: string) {
  return POSITIONS.find((p) => p.value === value)?.label ?? value;
}

export function positionsForClass(className: string) {
  return POSITIONS.filter((p) => p.eligibleClasses.includes(className));
}

export function initials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((s) => s[0]?.toUpperCase()).join("");
}

/** Resize an image file to a small JPEG data URL so it can be stored with the application. */
export function fileToSmallDataUrl(file: File, max = 480): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL("image/jpeg", 0.8));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
