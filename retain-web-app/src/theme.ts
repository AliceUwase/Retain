import { createTheme } from '@mui/material/styles';

const rust = '#A3492A'; // burnt sienna: buttons, active nav item, links
const darkRust = '#4E2416'; // deep brown: budget banner, login panel
const lightRust = '#F7E6DC'; // pale peach: selected nav background, chips
const border = '#E6E6DF'; // card and table borders

const theme = createTheme({
  palette: {
    primary: { main: rust, dark: darkRust, light: lightRust, contrastText: '#FFFFFF' },
    // budget statuses keep traffic-light colours so they don't blend with the rust
    success: { main: '#276B45', light: '#E3F1E8' }, // Within budget
    warning: { main: '#8F5B0E', light: '#FBF0DC' }, // Approaching budget
    error: { main: '#C0362C', light: '#FCE8E6' }, // Over budget
    background: { default: '#F5F5F0', paper: '#FFFFFF' }, // off-white page, white cards
    text: { primary: '#2B2420', secondary: '#776B63' }, // warm dark brown and grey
    divider: border,
  },

  typography: {
    fontFamily: '"Inter", system-ui, sans-serif',
    h1: { fontSize: '2rem', fontWeight: 600 }, // page titles
    h2: { fontSize: '1.25rem', fontWeight: 600 }, // card titles
    h3: { fontSize: '1rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 }, 
  },

  shape: { borderRadius: 8 },

  components: {
    MuiButton: {
      defaultProps: { disableElevation: true }, // flat buttons
    },
    MuiCard: {
      defaultProps: { variant: 'outlined' }, // thin border
      styleOverrides: { root: { borderRadius: 12 } },
    },
    MuiOutlinedInput: {
      styleOverrides: { root: { backgroundColor: '#FFFFFF' } },
    },
    MuiTableCell: {
      styleOverrides: {
        root: { borderColor: border },
        // Small grey capital headers
        head: { backgroundColor: '#F7F7F3', color: '#776B63', fontSize: '0.75rem', textTransform: 'uppercase' },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { height: 8, borderRadius: 4, backgroundColor: '#ECECE6' },
        bar: { borderRadius: 4 },
      },
    },
  },
});

export default theme;
