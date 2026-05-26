export type SmartMapMarker = {
  id: string;
  label: string;
  t: number;
  lampT: number;
};

// Place map boards just after visible street lamps on the main spine.
export const SMART_MAP_MARKERS: SmartMapMarker[] = [
  {
    id: "smart-map-a",
    label: "Sector A Map",
    lampT: 0.2,
    t: 0.22,
  },
  {
    id: "smart-map-b",
    label: "Sector B Map",
    lampT: 0.42,
    t: 0.44,
  },
  {
    id: "smart-map-c",
    label: "Terminal Map",
    lampT: 0.96,
    t: 0.98,
  },
];
