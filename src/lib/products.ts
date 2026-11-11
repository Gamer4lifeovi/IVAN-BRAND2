/** Shape of a row in public.products (managed from /admin/products). */
export type Product = {
  id: number; name: string; category: string; price: number; tag: string; art: string; blurb: string;
  colors: string[]; sizes: string[]; image_url: string | null; active: boolean; sort: number;
};

export const money = (n: number) => `₦${n.toLocaleString("en-NG")}`;

export const gradient = (colors: string[]) => {
  const c = colors.length >= 2 ? colors : ["#ff0055", "#7c3aed", "#120a24"];
  return `linear-gradient(135deg, ${c.join(", ")})`;
};

/** Handy presets for the admin colour picker (brand-friendly gradients). */
export const colorPresets: { name: string; colors: string[] }[] = [
  { name: "Fire", colors: ["#ff0055", "#ff8a00", "#1a0b22"] },
  { name: "Acid", colors: ["#00ff85", "#d5ff00", "#0b1f18"] },
  { name: "Riot", colors: ["#b7a4ff", "#ff0055", "#150b26"] },
  { name: "Mono", colors: ["#f4f4f6", "#00ff85", "#0b1f18"] },
  { name: "Tag", colors: ["#ff0055", "#7c3aed", "#120a24"] },
  { name: "Sea", colors: ["#00aaff", "#00ff85", "#071a22"] },
];

/** Only used when Supabase env vars are missing (local demo without a backend). */
export const fallbackProducts: Product[] = [
  { id: 1, name: "Monster Mode Trucker", category: "Custom Caps", price: 28000, tag: "1-OF-1 HAND PAINTED", art: "MONSTER / 01", blurb: "A hand-painted trucker with a monster that follows you around.", colors: ["#ff0055", "#ff8a00", "#1a0b22"], sizes: [], image_url: null, active: true, sort: 1 },
  { id: 2, name: "Anarchy Star Cap", category: "New Release", price: 32000, tag: "LIMITED DROP", art: "NO RULES", blurb: "A limited run cap for people who skip the dress code.", colors: ["#00ff85", "#d5ff00", "#0b1f18"], sizes: [], image_url: null, active: true, sort: 2 },
  { id: 3, name: "Paint Riot Kicks", category: "Custom Kicks", price: 65000, tag: "CUSTOM PAIR", art: "PAINT RIOT", blurb: "A full custom pair, painted by hand.", colors: ["#b7a4ff", "#ff0055", "#150b26"], sizes: ["40", "41", "42", "43", "44", "45"], image_url: null, active: true, sort: 3 },
];
