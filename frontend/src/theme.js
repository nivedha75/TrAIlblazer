import { ThemeProvider, createTheme } from "@mui/material/styles";

// Create custom theme
const theme = createTheme({
  palette: {
    purple: { main: "#c902e3" },
    apple: { main: "#5DBA40" },
    steelBlue: { main: "#5C76B7" },
    violet: { main: "#BC00A3" },
  },
  typography: {
    fontFamily: "Inter, Arial, sans-serif",
    fontSize: 8, // represents "8px"
  },
});

export default theme;