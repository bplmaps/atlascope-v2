import { mapState } from "../state.svelte.js";
import instanceVariables from "../../config/instance.json";

export const appURL = instanceVariables.baseURL;

// Reads mapState directly rather than taking arguments: every caller wants the
// view the user is looking at right now, and calling this inside a $derived
// still tracks the state it touches.
export function shareViewURL() {
  return `${instanceVariables.baseURL}/#/view:share$mode:${mapState.viewMode}$center:${mapState.center
    .map((c) => c.toFixed(6))
    .join(",")}$zoom:${mapState.zoom.toFixed(2)}$base:${
    mapState.layers.base.id
  }$overlay:${mapState.layers.overlay.id}`;
}
