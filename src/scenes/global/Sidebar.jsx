import React, { useState, useContext } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, Typography, useTheme, Snackbar } from "@mui/material";
import MuiAlert from '@mui/material/Alert';
import { Link, useNavigate } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import {
  HomeOutlined as HomeIcon,
  CheckCircleOutline as CheckIcon,
  LabelOutlined as LabelIcon,
  LocationOnOutlined as LocationIcon,
  MenuBookOutlined as BookIcon,
  DevicesOtherOutlined as DevicesOtherIcon,
  Devices as DevicesIcon,
  PersonOutlined as PersonIcon,
  HandymanOutlined as ToolsIcon,
  LogoutOutlined as LogoutIcon,
  Menu as MenuIcon,
  GroupOutlined as GroupIcon,
  AdminPanelSettingsOutlined as AdminIcon
} from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";

// Snackbar personalizado
const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

// SidebarItem separado para claridad
const SidebarItem = ({ title, icon, isSidebarOpen, onClick }) => (
  <MenuItem icon={icon} onClick={onClick}>
    {isSidebarOpen && <Typography>{title}</Typography>}
  </MenuItem>
);

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const role = user?.userType?.replace("ROLE_", "");
  const roleLabels = {
    ADMIN: "Administrador",
    USER: "Usuario",
    TECHNICIAN: "Técnico",
  };

  const menuItems = [
    { title: "Dashboard", to: "/dashboard", icon: <HomeIcon />, roles: ["ADMIN", "TECHNICIAN"] },
    { title: "Dispositivos", to: "/dispositivos", icon: <DevicesOtherIcon />, roles: ["ADMIN", "TECHNICIAN"] },
    { title: "Marcas", to: "/marcas", icon: <LabelIcon />, roles: ["ADMIN"] },
    { title: "Modelos", to: "/modelos", icon: <DevicesIcon />, roles: ["ADMIN"] },
    { title: "Colaboradores", to: "/usuarios", icon: <GroupIcon />, roles: ["ADMIN"] },
    { title: "Ubicación", to: "/ubicaciones", icon: <LocationIcon />, roles: ["ADMIN"] },
    { title: "Estado", to: "/estados", icon: <CheckIcon />, roles: ["ADMIN"] },
    { title: "Bitácoras", to: "/bitacoras", icon: <BookIcon />, roles: ["ADMIN", "TECHNICIAN"] },
    { title: "Mantenimientos", to: "/mantenimientos", icon: <ToolsIcon />, roles: ["ADMIN", "TECHNICIAN"] },
    { title: "Usuarios", to: "/admin", icon: <AdminIcon />, roles: ["ADMIN"] },
  ];

  const handleAccessDenied = (title) => {
    setSnackbarMsg(`Acceso denegado a "${title}"`);
    setSnackbarOpen(true);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getUsername = (email) => email?.split("@")[0] || "";

  return (
    <Box
      sx={{
        width: isSidebarOpen ? "210px" : "70px",
        height: "150vh",
        transition: "width 0.3s ease-in-out",
        backgroundColor: colors.primary[1000],
        boxShadow: "4px 4px 10px rgba(0, 0, 0, 0.4)",
        display: "flex",
        flexDirection: "column",
        "& .pro-sidebar-inner": {
          backgroundColor: "inherit !important",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >
      <ProSidebar
        collapsed={!isSidebarOpen}
        width={isSidebarOpen ? 210 : 70} // Usa los mismos valores que en Layout.jsx
      >
        <Menu iconShape="square">
          <MenuItem onClick={toggleSidebar} icon={<MenuIcon />} style={{ textAlign: "center" }}>
            {isSidebarOpen && <Typography variant="h6">Menú</Typography>}
          </MenuItem>

          {isSidebarOpen && (
            <Typography variant="h6" color={colors.grey[300]} sx={{ m: "10px 0 5px 10px" }}>
              Datos
            </Typography>
          )}

          {menuItems.map((item, index) => (
            <SidebarItem
              key={index}
              {...item}
              isSidebarOpen={isSidebarOpen}
              onClick={() =>
                item.roles.includes(role)
                  ? navigate(item.to)
                  : handleAccessDenied(item.title)
              }
            />
          ))}

          {isSidebarOpen && (
            <Typography variant="h6" color={colors.grey[300]} sx={{ m: "20px 0 5px 10px" }}>
              Sesión
            </Typography>
          )}

          {user && isSidebarOpen && (
            <Box mb="20px" textAlign="center" sx={{ padding: "10px" }}>
              <Typography variant="h6" color={colors.grey[100]} fontWeight="bold">
                {getUsername(user.username)}
              </Typography>
              <Typography variant="body2" color={colors.greenAccent[500]}>
                {roleLabels[role] || "Sin rol"}
              </Typography>
            </Box>
          )}

          {user && (
            <MenuItem onClick={handleLogout} icon={<LogoutIcon />} style={{ color: "red" }}>
              {isSidebarOpen && <Typography>Cerrar Sesión</Typography>}
            </MenuItem>
          )}
        </Menu>

        <Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity="warning" sx={{ width: "100%" }}>
            {snackbarMsg}
          </Alert>
        </Snackbar>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;