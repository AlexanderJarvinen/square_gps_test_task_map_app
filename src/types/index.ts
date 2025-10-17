export type Id = string;

export type NextWithVm = (cb: (vm: Vue) => void) => void;

export interface WithId {
  id: Id;
}

export interface Marker extends WithId {
  title: string;
  lat: number;
  lng: number;
  address?: string;
}

export interface RootState {
  markers: Marker[];
  loading: boolean;
  error: string | null;
  selectedId: string | null;
  lastAddress: string | null;
  suggestionError: string | null;
}

export type MarkerDTO = {
  id: string;
  title: string;
  lat: number;
  lng: number;
  address?: string;
};

export type GeoSuggestion = {
  label: string;
  value: {
    lat: number;
    lng: number;
    display: string;
  };
  error?: string;
};

export type VAutocompleteRef = {
  isMenuActive: boolean;
  blur: () => void;
  focus: () => void;
};
