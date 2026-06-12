import { createTheme, alpha } from '@mui/material/styles';

// ── Warm Brown / Orange palette (inspired by TransitFlow design system) ──
const BROWN = '#8B3A0E';
const BROWN_DARK = '#6D2D09';
const BROWN_LIGHT = '#A0522D';
const ORANGE = '#E8700A';
const ORANGE_LIGHT = '#F59E0B';
const BG_WARM = '#FAF9F7';
const DARK = '#1A1A2E';
const GRAY = '#6B7280';

const theme = createTheme({
  palette: {
    primary: {
      main: BROWN,
      dark: BROWN_DARK,
      light: BROWN_LIGHT,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: ORANGE,
      light: ORANGE_LIGHT,
      dark: '#CC5F00',
      contrastText: '#FFFFFF',
    },
    background: {
      default: BG_WARM,
      paper: '#FFFFFF',
    },
    text: {
      primary: DARK,
      secondary: GRAY,
    },
    success: { main: '#22C55E' },
    warning: { main: '#F59E0B' },
    error: { main: '#EF4444' },
    info: { main: '#3B82F6' },
    divider: alpha('#000', 0.06),
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, fontSize: '1.75rem', letterSpacing: '-0.02em', color: DARK },
    h5: { fontWeight: 700, fontSize: '1.35rem', letterSpacing: '-0.01em', color: DARK },
    h6: { fontWeight: 600, fontSize: '1.1rem', color: DARK },
    subtitle1: { fontWeight: 600, fontSize: '0.95rem' },
    subtitle2: { fontWeight: 500, fontSize: '0.85rem', color: GRAY },
    body2: { fontSize: '0.85rem', color: GRAY },
    button: { textTransform: 'none' as const, fontWeight: 600 },
  },
  shape: { borderRadius: 14 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12, padding: '10px 24px', fontWeight: 600,
          boxShadow: 'none', '&:hover': { boxShadow: 'none' },
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${BROWN} 0%, ${BROWN_DARK} 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, ${BROWN_DARK} 0%, #5A2307 100%)`,
          },
        },
        containedSecondary: {
          background: `linear-gradient(135deg, ${ORANGE} 0%, #CC5F00 100%)`,
          '&:hover': {
            background: `linear-gradient(135deg, #CC5F00 0%, #A04D00 100%)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18, border: '1px solid rgba(0,0,0,0.04)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.03), 0 6px 20px rgba(0,0,0,0.025)',
          transition: 'box-shadow 0.25s ease, transform 0.25s ease',
          '&:hover': { boxShadow: '0 4px 20px rgba(139,58,14,0.08)' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: { root: { borderRadius: 18 } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 600, borderRadius: 10, fontSize: '0.75rem' } },
    },
    MuiTableCell: {
      styleOverrides: {
        head: { fontWeight: 600, color: GRAY, fontSize: '0.78rem', textTransform: 'uppercase' as const, letterSpacing: '0.06em' },
        root: { borderBottom: '1px solid rgba(0,0,0,0.04)', padding: '14px 16px' },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: { '& .MuiOutlinedInput-root': { borderRadius: 12 } },
      },
    },
    MuiDialog: {
      styleOverrides: { paper: { borderRadius: 22 } },
    },
  },
});

export default theme;
