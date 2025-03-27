import { useContext } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, Typography, useTheme } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DevicesOtherOutlinedIcon from "@mui/icons-material/DevicesOtherOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { AuthContext } from "../../context/AuthContext";

const Item = ({ title, to, icon, selected, setSelected }) => (
  <MenuItem active={selected === title} onClick={() => setSelected(title)} icon={icon}>
    <Typography>{title}</Typography>
    <Link to={to} />
  </MenuItem>
);

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const cleanRole = (role) => role?.replace("ROLE_", "");

  const roleLabels = {
    ADMIN: "Administrador",
    USER: "Usuario",
    TECHNICIAN: "Técnico",
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Box
      sx={{
        width: { xs: "60px", sm: "120px", md: "10px" }, // Sidebar responsivo
        minHeight: "100vh",
        transition: "width 0.3s ease-in-out",
        "& .pro-sidebar-inner": { background: `${colors.primary[400]} !important` },
        "& .pro-icon-wrapper": { backgroundColor: "transparent !important" },
        "& .pro-inner-item": { padding: { xs: "5px", md: "5px 35px 5px 20px" } },
        "& .pro-inner-item:hover": { color: "#868dfb !important" },
        "& .pro-menu-item.active": { color: "#6870fa !important" },
      }}
    >
      <ProSidebar collapsed={false}>
        <Menu iconShape="square">
          {user && (
            <Box mb="20px" textAlign="center">
              <Typography variant="h7" color={colors.grey[100]} fontWeight="bold">
                {user.username}
              </Typography>
              <Typography variant="h6" color={colors.greenAccent[500]}>
                {roleLabels[cleanRole(user?.userType)] || cleanRole(user?.userType) || "Sin rol"}
              </Typography>
            </Box>
          )}

          <Item title="Dashboard" to="/dashboard" icon={<HomeOutlinedIcon />} />

          <Typography
            variant="h6"
            color={colors.grey[300]}
            sx={{ m: { xs: "10px 0 5px 10px", md: "50px 0 5px 20px" } }}
          >
            Datos
          </Typography>

          <Item title="Dispositivos" to="/dispositivos" icon={<DevicesOtherOutlinedIcon />} />
          <Item title="Usuarios" to="/usuarios" icon={<PersonOutlinedIcon />} />
          <Item title="Ubicación" to="/ubicaciones" icon={<LocationOnOutlinedIcon />} />
          <Item title="Estado" to="/estados" icon={<CheckCircleOutlineIcon />} />
          <Item title="Bitácoras" to="/bitacoras" icon={<MenuBookOutlinedIcon />} />
          <Item title="Mantenimientos" to="/mantenimientos" icon={<HandymanOutlinedIcon />} />

          <Typography
            variant="h6"
            color={colors.grey[300]}
            sx={{ m: { xs: "20px 0 5px 10px", md: "100px 0 10px 20px" } }}
          >
            Sesión
          </Typography>

          {user && (
            <MenuItem onClick={handleLogout} icon={<LogoutOutlinedIcon />} style={{ color: "red" }}>
              <Typography>Cerrar Sesión</Typography>
            </MenuItem>
          )}
        </Menu>
      </ProSidebar>
    </Box>
  );
};

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Sidebar />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          ml: { xs: "60px", sm: "120px", md: "200px" }, // Margen izquierdo según tamaño del sidebar
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
