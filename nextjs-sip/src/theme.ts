import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1565c0"
    },
    secondary: {
      main: "#00897b"
    }
  },
  shape: { borderRadius: 10 }
});

export default theme;