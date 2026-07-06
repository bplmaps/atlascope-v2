import { getClient } from "../helpers/supabaseClient.js";

export const loadAllTours = async () => {
  return getClient()
    .from("tours")
    .select()
    .eq("published", true)
    .order("id", { ascending: true });
};

export const loadSingleTour = async (ref) => {
  return getClient().from("tours").select().eq("id", ref);
};
