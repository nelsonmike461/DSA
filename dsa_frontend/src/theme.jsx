import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    background: {
      default: "#FFEFD5",
    },
  },
  typography: {
    // This sets the default font for Material-UI components.
    fontFamily: '"JetBrains Mono", monospace',
  },
});

export default theme;
