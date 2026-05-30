import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        bg0: '#04040e',
        bg1: '#080818',
        bg2: '#0d0d28',
        bg3: '#121238',
        bg4: '#181848',
        accent: '#7c6eff',
        'accent2': '#5a4fcc',
        cyan: '#00e5cc',
        gold: '#ffd93d',
        danger: '#ff4060',
        border: '#1c1c44',
        border2: '#242460',
        card: '#0f0f2a',
        text1: '#f0f0ff',
        text2: '#a0a0c8',
        text3: '#606088',
      },
    },
  },
  plugins: [],
} satisfies Config;
