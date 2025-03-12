import { useState, useContext } from "react";
import { ProSidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Box, IconButton, Typography, useTheme } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import "react-pro-sidebar/dist/css/styles.css";
import { tokens } from "../../theme";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DevicesOtherOutlinedIcon from "@mui/icons-material/DevicesOtherOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import HandymanOutlinedIcon from "@mui/icons-material/HandymanOutlined";
import MenuOutlinedIcon from "@mui/icons-material/MenuOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { AuthContext } from "../../context/AuthContext";

const Item = ({ title, to, icon, selected, setSelected }) => {
  return (
    <MenuItem
      active={selected === title}
      onClick={() => setSelected(title)}
      icon={icon}
    >
      <Typography>{title}</Typography>
      <Link to={to} />
    </MenuItem>
  );
};

const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [selected, setSelected] = useState("Dashboard");

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  console.log("Usuario en Sidebar:", user);

  const cleanRole = (role) => role?.replace("ROLE_", "");

  const roleLabels = {
    ADMIN: "Administrador",
    USER: "Usuario",
    TECHNICIAN: "Técnico",
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  }

  return (
    <Box
      sx={{
        "& .pro-sidebar-inner": {
          background: `${colors.primary[400]} !important`,
        },
        "& .pro-icon-wrapper": {
          backgroundColor: "transparent !important",
        },
        "& .pro-inner-item": {
          padding: "5px 35px 5px 20px !important",
        },
        "& .pro-inner-item:hover": {
          color: "#868dfb !important",
        },
        "& .pro-menu-item.active": {
          color: "#6870fa !important",
        },
      }}
    >

      <ProSidebar collapsed={isCollapsed}>
        <Menu iconShape="square">
          {/* Botón de colapsar menú */}
          <MenuItem
            onClick={() => setIsCollapsed(!isCollapsed)}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: "10px 0 20px 0",
              color: colors.grey[100],
            }}
          >
            {!isCollapsed && (
              <Box display="flex" justifyContent="center" textAlign="center">
                <Typography variant="h2" color={colors.grey[100]}>
                  {/* Admin */}
                </Typography>
                <IconButton onClick={() => setIsCollapsed(!isCollapsed)}>
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {/* Datos del usuario */}
          {!isCollapsed && user && (
            <Box mb="25px">
              <Box textAlign="center">
                <Typography
                  variant="h7"
                  color={colors.grey[100]}
                  fontWeight="bold"
                  sx={{ m: "10px 0 0 0" }}
                >
                  {user.username}
                </Typography>
                <Typography variant="h5" color={colors.greenAccent[500]}>
                  {roleLabels[cleanRole(user?.userType)] || cleanRole(user?.userType) || "Sin rol"}
                </Typography>

              </Box>
            </Box>
          )}

          <Box paddingLeft={isCollapsed ? undefined : "10%"}>
            <Item
              title="Dashboard"
              to="/dashboard"
              icon={<HomeOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {!isCollapsed && (
              <Typography
                variant="h2"
                color={colors.grey[300]}
                sx={{ m: "50px 0 5px 20px" }}
              >
                Datos
              </Typography>
            )}

            <Item
              title="Dispositivos"
              to="/dispositivos"
              icon={<DevicesOtherOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            {/* Mostrar solo si es ADMIN */}
            {user?.userType === "ADMIN" && (
              <Item
                title="Usuarios"
                to="/usuarios"
                icon={<PersonOutlinedIcon />}
                selected={selected}
                setSelected={setSelected}
              />
            )}

            <Item
              title="Bitácoras"
              to="/bitacoras"
              icon={<MenuBookOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />

            <Item
              title="Mantenimientos"
              to="/mantenimientos"
              icon={<HandymanOutlinedIcon />}
              selected={selected}
              setSelected={setSelected}
            />


            {!isCollapsed && (
              <Typography
                variant="h2"
                color={colors.grey[300]}
                sx={{ m: "100px 0 10px 20px" }}
              >
                Sesión
              </Typography>
            )}

            {user && (
              <MenuItem
              onClick={handleLogout} // Usar la nueva función con navegación
              icon={<LogoutOutlinedIcon />}
              style={{ color: "red" }}
            >
              <Typography>Cerrar Sesión</Typography>
            </MenuItem>
            )}
          </Box>
        </Menu>
      </ProSidebar>
    </Box>
  );
};

export default Sidebar;
