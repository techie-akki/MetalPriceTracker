import {MetalDefinition} from './types';

export const METALS: MetalDefinition[] = [
  {
    symbol: 'XAU',
    name: 'Gold',
    accent: '#F5C15C',
    gradient: [
      'rgba(245,193,92,0.34)',
      'rgba(255,255,255,0.12)',
      'rgba(16,18,27,0.86)',
    ],
  },
  {
    symbol: 'XAG',
    name: 'Silver',
    accent: '#C9D6E8',
    gradient: [
      'rgba(201,214,232,0.28)',
      'rgba(255,255,255,0.12)',
      'rgba(16,18,27,0.86)',
    ],
  },
  {
    symbol: 'XPT',
    name: 'Platinum',
    accent: '#89F0CF',
    gradient: [
      'rgba(137,240,207,0.24)',
      'rgba(255,255,255,0.11)',
      'rgba(16,18,27,0.86)',
    ],
  },
  {
    symbol: 'XPD',
    name: 'Palladium',
    accent: '#F3A9D3',
    gradient: [
      'rgba(243,169,211,0.26)',
      'rgba(255,255,255,0.11)',
      'rgba(16,18,27,0.86)',
    ],
  },
];
