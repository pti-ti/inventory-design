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
  <MenuItem icon={icon}>
    <Link to={to} style={{ textDecoration: "none", color: "inherit" }}>
      {isSidebarOpen && <Typography>{title}</Typography>}
    </Link>
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

  // Función para extraer solo el nombre de usuario (antes del @)
  const getUsername = (email) => {
    if (!email) return "";
    const [username] = email.split('@');  // Extrae el texto antes del '@'
    return username;
  };

  return (
    <Box
      sx={{
        width: isSidebarOpen ? "190px" : "70px", // Ajuste de las dimensiones del Sidebar
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
          color: "#868dfb !important", // Mantengo el hover en azul claro como antes
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important", // Color del ítem activo en azul oscuro
        },
      }}
    >
      <ProSidebar collapsed={!isSidebarOpen} width="100%">
        <Menu iconShape="square">
          {/* Botón para colapsar/expandir el sidebar */}
          <MenuItem onClick={toggleSidebar} icon={<MenuIcon />} style={{ textAlign: "center" }}>
            {isSidebarOpen && <Typography variant="h6">Menú</Typography>}
          </MenuItem>

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

          {/* Información del usuario debajo de Cerrar sesión */}
          {user && isSidebarOpen && (
            <Box mb="20px" textAlign="center" sx={{ padding: "10px" }}>
              <Typography variant="h6" color={colors.grey[100]} fontWeight="bold">
                {getUsername(user.username)} {/* Muestra solo la parte antes del '@' */}
              </Typography>
              <Typography variant="body2" color={colors.greenAccent[500]}>
                {roleLabels[user?.userType?.replace("ROLE_", "")] || "Sin rol"}
              </Typography>
            </Box>
          )}
        
          {/* Botón de cerrar sesión */}
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
