export type Position = {
  value: string;
  label: string;
  description: string;
  eligibleClasses: string[];
};

export const CLASSES = ["P1", "P2", "P3", "P4", "P5", "P6", "P7"];
export const STREAMS = ["Blue", "Red", "Green", "Yellow"];

/** Only P.5 Orange pupils may apply for prefectship. */
export const APPLY_CLASS = "P.5";
export const APPLY_STREAM = "Orange";
export const PUPILS = ["Wasswa Hardy", "Buyondo Trinity", "Nabunya Joweria", "Abigaba Chloe", "Ssuubi Jordan", "Kato Harry", "Ayella James", "Nandutu Norah", "Liam Desmond", "Muyimbwa Rauben", "Kaliisa Warren", "Ssetaba Benson", "Balekere Garrisone", "Bulondo Victa Auther", "Nattabi Mary Hana", "Mukiibi Nicolas", "Kisozi Hisham", "Lukwago Awathi Fashan", "Namukwaya Brenda", "Nakabiito Jemimah", "Ntambaazi Shawna G", "Nakato Barbrah", "Aheirwe Marilyne Buki", "Nakirijja Precious", "Nalutaaya Noeline", "Muchunguzi Adrian", "Ntege Aiden", "Babirye Brenda", "Nansimbi Brianah", "Aisu Daniel", "Ainebyona Isaac", "Luzige Spencer", "Namugwanya Gabriella", "Amuli Elyom Morison", "Naluganzi Teopista", "Mpologoma Radia", "Ssemanda Shakim", "Mwesigwa Gabriel", "Nanyange Tara", "Nsubuga Isiah", "Nagayi Bahira", "Mirembe Desire", "Lukwago Mario", "Muwanga Benard", "Nabaggala Kayla", "Mutenza Shaban", "Nakigozi Promise", "Bugembe Anthony", "Nsereko Shawn", "Natukunda Shaneez", "Asiimwe Abra"];

export const POSITIONS: Position[] = [
  { value: "mathematics_coordinator", label: "Mathematics Coordinator", description: "Champion Mathematics activities and support fellow pupils in Maths", eligibleClasses: ["P5"] },
  { value: "science_coordinator", label: "Science Coordinator", description: "Lead Science activities, experiments and clubs", eligibleClasses: ["P5"] },
  { value: "english_coordinator", label: "English Coordinator", description: "Promote reading, writing and spoken English across the school", eligibleClasses: ["P5"] },
  { value: "social_studies_coordinator", label: "Social Studies Coordinator", description: "Coordinate Social Studies activities and projects", eligibleClasses: ["P5"] },
  { value: "religious_education_coordinator", label: "Religious Education Coordinator", description: "Coordinate Religious Education activities and fellowship", eligibleClasses: ["P5"] },
];

/** Default pupil password (what pupils type). */
export const DEFAULT_PIN = "6667";
export const PUPIL_DOMAIN = "kpm.com";

/** Login emails: first name @kpm.com, numbered when a first name repeats (e.g. lukwago2@kpm.com). */
export function pupilEmails(): { name: string; email: string }[] {
  const seen = new Map<string, number>();
  return PUPILS.map((name) => {
    const first = (name.split(/\s+/)[0] ?? "").toLowerCase().replace(/[^a-z]/g, "");
    const n = (seen.get(first) ?? 0) + 1;
    seen.set(first, n);
    return { name, email: `${first}${n > 1 ? n : ""}@${PUPIL_DOMAIN}` };
  });
}

export function isPupilEmail(email: string) {
  return pupilEmails().some((p) => p.email === email.trim().toLowerCase());
}

/** Accounts require 6+ characters, so the 4-digit PIN is padded internally. */
export function pupilPassword(pin: string) {
  return `kpm-${pin}`;
}

export function positionLabel(value: string) {
  return POSITIONS.find((p) => p.value === value)?.label ?? value;
}

export function positionsForClass(className: string) {
  return POSITIONS.filter((p) => p.eligibleClasses.includes(className.replace(".", "")));
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
