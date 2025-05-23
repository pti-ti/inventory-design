import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { ColorModeContext, useMode } from "./theme";
import Login from "./scenes/login";
import Layout from "./components/Layout";
import Dashboard from "./scenes/dashboard";
import Device from "./scenes/device/deviceList";
import User from "./scenes/user/userList";
import Location from "./scenes/location/locationList";
import Status from "./scenes/status/statusList";
import Brand from "./scenes/brand/brandList";
import Model from "./scenes/model/modelList";
import Logbook from "./scenes/logbook/logbookList";
import Maintenance from "./scenes/maintenance/maintenanceList";
import UserRegister from "./scenes/form/UserRegister";
import DeviceRegister from "./scenes/form/DeviceRegister";
import LogbookRegister from "./scenes/form/LogbookRegister";
import MaintenanceRegister from "./scenes/form/MaintenanceRegister";

function App() {
  const [theme, colorMode] = useMode();
  const location = useLocation();

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Routes>
          {/* Redirigir la raíz "/" a "/auth/login" */}
          <Route path="/" element={<Navigate to="/auth/login" />} />

          {/* Página de Login sin el Layout */}
          <Route path="/auth/login" element={<Login />} />

          {/* Layout con Sidebar y Topbar */}
          <Route path="/*" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="dispositivos" element={<Device />} />
            <Route path="marcas" element={<Brand />} />
            <Route path="modelos" element={<Model />} />
            <Route path="usuarios" element={<User />} />
            <Route path="ubicaciones" element={<Location />} />
            <Route path="estados" element={<Status />} />
            <Route path="bitacoras" element={<Logbook />} />
            <Route path="mantenimientos" element={<Maintenance />} />
            <Route path="admin" element={<UserRegister />} />
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
