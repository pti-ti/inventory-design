import { useContext } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, Typography, useTheme } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import {
  HomeOutlined as HomeIcon,
  CheckCircleOutline as CheckIcon,
  LocationOnOutlined as LocationIcon,
  MenuBookOutlined as BookIcon,
  DevicesOtherOutlined as DevicesIcon,
  PersonOutlined as PersonIcon,
  HandymanOutlined as ToolsIcon,
  LogoutOutlined as LogoutIcon,
  Menu as MenuIcon,
} from "@mui/icons-material";
import { AuthContext } from "../../context/AuthContext";

const SidebarItem = ({ title, to, icon, isSidebarOpen }) => (
  <MenuItem icon={icon} component={Link} to={to}>
    {isSidebarOpen && <Typography>{title}</Typography>}
  </MenuItem>
);

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const roleLabels = {
    ADMIN: "Administrador",
    USER: "Usuario",
    TECHNICIAN: "Técnico",
  };

  const menuItems = [
    { title: "Dashboard", to: "/dashboard", icon: <HomeIcon /> },
    { title: "Dispositivos", to: "/dispositivos", icon: <DevicesIcon /> },
    { title: "Usuarios", to: "/usuarios", icon: <PersonIcon /> },
    { title: "Ubicación", to: "/ubicaciones", icon: <LocationIcon /> },
    { title: "Estado", to: "/estados", icon: <CheckIcon /> },
    { title: "Bitácoras", to: "/bitacoras", icon: <BookIcon /> },
    { title: "Mantenimientos", to: "/mantenimientos", icon: <ToolsIcon /> },
  ];

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box
      sx={{
        width: isSidebarOpen ? "260px" : "70px",
        height: "100vh",
        transition: "width 0.3s ease-in-out",
        backgroundColor: colors.primary[400],
        display: "flex",
        flexDirection: "column",
        "& .pro-sidebar-inner": {
          backgroundColor: "inherit !important",
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important", // 🔹 Mantengo el hover en azul claro como antes
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important", // 🔹 Color del ítem activo en azul oscuro como lo tenías
        },
      }}
    >
      <ProSidebar collapsed={!isSidebarOpen} width="100%">
        <Menu iconShape="square">
          {/* Botón para colapsar/expandir el sidebar */}
          <MenuItem onClick={toggleSidebar} icon={<MenuIcon />} style={{ textAlign: "center" }}>
            {isSidebarOpen && <Typography variant="h6">Menú</Typography>}
          </MenuItem>

          {/* Información del usuario */}
          {user && isSidebarOpen && (
            <Box mb="20px" textAlign="center">
              <Typography variant="h6" color={colors.grey[100]} fontWeight="bold">
                {user.username}
              </Typography>
              <Typography variant="body2" color={colors.greenAccent[500]}>
                {roleLabels[user?.userType?.replace("ROLE_", "")] || "Sin rol"}
              </Typography>
            </Box>
          )}

          {/* Sección de navegación */}
          {isSidebarOpen && (
            <Typography variant="h6" color={colors.grey[300]} sx={{ m: "10px 0 5px 10px" }}>
              Datos
            </Typography>
          )}

          {menuItems.map((item, index) => (
            <SidebarItem key={index} {...item} isSidebarOpen={isSidebarOpen} />
          ))}

          {/* Sección de sesión */}
          {isSidebarOpen && (
            <Typography variant="h6" color={colors.grey[300]} sx={{ m: "20px 0 5px 10px" }}>
              Sesión
            </Typography>
          )}

          {user && (
            <MenuItem onClick={handleLogout} icon={<LogoutIcon />} style={{ color: "red" }}>
              {isSidebarOpen && <Typography>Cerrar Sesión</Typography>}
            </MenuItem>
          )}
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
