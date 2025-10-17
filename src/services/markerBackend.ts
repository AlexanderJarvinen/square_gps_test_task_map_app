import { Backend } from "./Backend";
import { Marker } from "@/types";

export const markersBackend = new Backend<Marker>({
  namespace: "markers",
  latencyMs: 150,
});
