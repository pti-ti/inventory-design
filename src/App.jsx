import { Routes, Route } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Login from "./scenes/login";
import Layout from "./components/Layout";
import Dashboard from "./scenes/dashboard";
import Device from "./scenes/device/deviceList";
import User from "./scenes/user/userList";
import Logbook from "./scenes/logbook/logbookList";
import Maintenance from "./scenes/maintenance/maintenanceList";
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
            <Route path="usuarios" element={<User />} />
            <Route path="bitacoras" element={<Logbook />} />
            <Route path="mantenimientos" element={<Maintenance />} />
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
