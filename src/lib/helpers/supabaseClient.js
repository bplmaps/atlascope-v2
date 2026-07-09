import { createClient } from "@supabase/supabase-js";

// Created lazily so instances that disable the Supabase-backed features
// (tours, annotations) — or forks without credentials configured — never
// construct a client. Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// only fails when a Supabase-backed feature is actually used.
let client;

export function getClient() {
  client ??= createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
  );
  return client;
}
