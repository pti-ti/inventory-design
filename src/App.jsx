import { Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Login from "./scenes/login";
import Layout from "./components/Layout";
import Dashboard from "./scenes/dashboard";
import Device from "./scenes/device/index";
import Invoices from "./scenes/invoices";
import Contacts from "./scenes/contacts";
import UserRegister from "./scenes/form/UserRegister";
import DeviceRegister from "./scenes/form/DeviceRegister";
import LogbookRegister from "./scenes/form/LogbookRegister";
import MaintenanceRegister from "./scenes/form/MaintenanceRegister";

function App() {
  const [theme, colorMode] = useMode();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Login sin Sidebar */}
          <Route path="/" element={<Login />} />

          {/* Layout con Sidebar y Topbar */}
          <Route path="/*" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dispositivos" element={<Device />} />
            <Route path="contacts" element={<Contacts />} />
            <Route path="invoices" element={<Invoices />} />
            <Route path="registrar-usuario" element={<UserRegister />} />
            <Route path="registrar-dispositivo" element={<DeviceRegister />} />
            <Route path="registrar-bitacora" element={<LogbookRegister />} />
            <Route path="registrar-mantenimiento" element={<MaintenanceRegister />} />
          </Route>
        </Routes>
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
}

export default App;
