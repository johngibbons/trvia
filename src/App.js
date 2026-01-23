import React from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Root from "./Root";
import store from "./store";

const theme = createTheme({
  palette: {
    primary: {
      main: "#b7a261",
    },
    text: {
      primary: "#424242",
    },
  },
  typography: {
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell","Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
});

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Root store={store} />
    </ThemeProvider>
  );
};

export default App;
