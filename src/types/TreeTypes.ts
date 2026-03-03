export type TreeSpecies = 'oak' | 'pine' | 'palm' | 'cherry' | 'birch';
export type TreeShape   = 'round' | 'cone' | 'palm' | 'small';

export interface TreeTypeConfig {
  species:      TreeSpecies;
  name:         string;
  emoji:        string;
  foliageColor: number;   // main canopy colour
  darkColor:    number;   // shadow / underside colour
  trunkColor:   number;
  co2PerYear:   number;   // kg CO₂ at full maturity (365 days)
  shape:        TreeShape;
  description:  string;
}

export const TREE_TYPES: TreeTypeConfig[] = [
  {
    species:      'oak',
    name:         'Oak',
    emoji:        '🌳',
    foliageColor: 0x3aaa3a,
    darkColor:    0x1e6e1e,
    trunkColor:   0x7b4a22,
    co2PerYear:   22,
    shape:        'round',
    description:  'Broad canopy, great CO₂ absorber',
  },
  {
    species:      'pine',
    name:         'Pine',
    emoji:        '🌲',
    foliageColor: 0x1d6b2a,
    darkColor:    0x0d3d18,
    trunkColor:   0x5a3010,
    co2PerYear:   15,
    shape:        'cone',
    description:  'Tall conifer, grows fast',
  },
  {
    species:      'palm',
    name:         'Palm',
    emoji:        '🌴',
    foliageColor: 0x72cc44,
    darkColor:    0x3c7820,
    trunkColor:   0xc8a050,
    co2PerYear:   10,
    shape:        'palm',
    description:  'Tropical, loves warm climates',
  },
  {
    species:      'cherry',
    name:         'Cherry',
    emoji:        '🌸',
    foliageColor: 0xf4a0c8,
    darkColor:    0xc05888,
    trunkColor:   0x6b3a1f,
    co2PerYear:   13,
    shape:        'round',
    description:  'Beautiful blossoms, medium CO₂',
  },
  {
    species:      'birch',
    name:         'Birch',
    emoji:        '🪵',
    foliageColor: 0xc4e858,
    darkColor:    0x7aaa20,
    trunkColor:   0xdcdcd0,
    co2PerYear:   12,
    shape:        'small',
    description:  'Slender, light-seeking pioneer',
  },
];

export function getTreeType(species: TreeSpecies): TreeTypeConfig {
  return TREE_TYPES.find(t => t.species === species) ?? TREE_TYPES[0];
}
