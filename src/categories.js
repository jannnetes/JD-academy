// Single source of truth for the 18 platform categories.
// Used everywhere: navbar, catalog filters, course cards, teacher create-course.
// Colors per the EDUFLOW warm system — category color drives the whole card.

export const CATEGORIES = [
  { slug: "design",      name: "DESIGN",        icon: "🎨", color: "#F73B20", text: "#FFFFFF" },
  { slug: "it",          name: "IT & CODE",     icon: "💻", color: "#1A3FD4", text: "#FFFFFF" },
  { slug: "business",    name: "BUSINESS",      icon: "📈", color: "#0D0D0D", text: "#FFFFFF" },
  { slug: "languages",   name: "LANGUAGES",     icon: "🗣", color: "#4A7856", text: "#FFFFFF" },
  { slug: "psychology",  name: "PSYCHOLOGY",    icon: "🧠", color: "#8B4513", text: "#FFFFFF" },
  { slug: "sport",       name: "SPORT & FITNESS", icon: "💪", color: "#4A7856", text: "#FFFFFF" },
  { slug: "beauty",      name: "BEAUTY",        icon: "💄", color: "#8B0000", text: "#FFFFFF" },
  { slug: "music",       name: "MUSIC",         icon: "🎵", color: "#6B21A8", text: "#FFFFFF" },
  { slug: "finance",     name: "FINANCE",       icon: "📊", color: "#0D0D0D", text: "#FFFFFF" },
  { slug: "photo",       name: "PHOTO & VIDEO", icon: "📸", color: "#F73B20", text: "#FFFFFF" },
  { slug: "cooking",     name: "COOKING",       icon: "🍳", color: "#C8FF00", text: "#0D0D0D" },
  { slug: "copywriting", name: "COPYWRITING",   icon: "✍️", color: "#1A3FD4", text: "#FFFFFF" },
  { slug: "health",      name: "HEALTH",        icon: "🏥", color: "#8B0000", text: "#FFFFFF" },
  { slug: "interior",    name: "INTERIOR",      icon: "🏠", color: "#4A7856", text: "#FFFFFF" },
  { slug: "fashion",     name: "FASHION",       icon: "👗", color: "#FB2D54", text: "#FFFFFF" },
  { slug: "eco",         name: "ECO",           icon: "🌿", color: "#4A7856", text: "#FFFFFF" },
  { slug: "growth",      name: "SELF-GROWTH",   icon: "📚", color: "#F0E87A", text: "#0D0D0D" },
  { slug: "art",         name: "ART",           icon: "🎭", color: "#6B21A8", text: "#FFFFFF" },
];

// Map course industries (from seed data) onto category names.
const INDUSTRY_MAP = {
  "Languages": "LANGUAGES",
  "Test Prep": "SELF-GROWTH",
  "Programming": "IT & CODE",
  "Design": "DESIGN",
  "Business": "BUSINESS",
};

export function categoryForIndustry(industry) {
  const name = INDUSTRY_MAP[industry] || industry?.toUpperCase();
  return CATEGORIES.find((c) => c.name === name) || null;
}

export function categoryColor(industry) {
  return categoryForIndustry(industry)?.color || "#F73B20";
}
export function categoryText(industry) {
  return categoryForIndustry(industry)?.text || "#FFFFFF";
}
