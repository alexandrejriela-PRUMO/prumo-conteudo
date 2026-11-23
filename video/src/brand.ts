import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

export const FONT = 'Poppins';

loadFont({family: FONT, url: staticFile('fonts/poppins-700.woff2'), weight: '700'});
loadFont({family: FONT, url: staticFile('fonts/poppins-500.woff2'), weight: '500'});

export const C = {
  gold: '#EBCB5E',
  white: '#FFFFFF',
  greenDeep: '#03140D',
  green: '#0A2E1F',
  greenGlow: '#155E3A',
  orangeA: '#F5A10B',
  orangeB: '#F97316',
};

export const clamp = {
  extrapolateLeft: 'clamp',
  extrapolateRight: 'clamp',
} as const;
