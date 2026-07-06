import instance from "./instance.json";

// Feature toggles for this instance. Absent keys default to off, so forks
// opt in explicitly. Both features are Supabase-backed and require
// VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY when enabled.
export const annotationsEnabled = instance.features?.annotations ?? false;
export const toursEnabled = instance.features?.tours ?? false;
