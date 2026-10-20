export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
  };
}

export interface TipoPokemon {
  name: string;
  url: string;
}

export interface ElencoTipi {
  count: number;
  next: string | null;
  previous: string | null;
  results: TipoPokemon[];
}
