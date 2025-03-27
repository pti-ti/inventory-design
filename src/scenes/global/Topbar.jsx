import { Box, IconButton, useTheme } from "@mui/material";
import { useContext } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import logoClaro from "../../assets/logoClaro.png";
import logoOscuro from "../../assets/logoOscuro.png";

const Topbar = ({ isSidebarOpen }) => {
    const theme = useTheme();
    const colorMode = useContext(ColorModeContext);

    const logo = theme.palette.mode === "dark" ? logoClaro : logoOscuro;

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            p={{ xs: 1, sm: 2 }}
            sx={{
                width: "100%",
                position: "fixed", // 🔹 Fijo en la parte superior
                top: 0,
                left: 0,
                right: 0,
                zIndex: 1100, // 🔹 Debajo del Sidebar para no superponerse
                boxShadow: "none", // 🔹 Sin sombra
                backgroundColor: "transparent", // 🔹 Fondo completamente transparente
            }}
        >
            {/* ICONO DEL TEMA */}
            <Box
                sx={{
                    position: "fixed",
                    top: "15px",
                    left: isSidebarOpen ? "220px" : "90px", // 🔹 Se ajusta con el sidebar
                    transition: "left 0.3s ease-in-out",
                    zIndex: 1200,
                }}
            >
                <IconButton onClick={colorMode.toggleColorMode}>
                    {theme.palette.mode === "dark" ? (
                        <DarkModeOutlinedIcon />
                    ) : (
                        <LightModeOutlinedIcon />
                    )}
                </IconButton>
            </Box>

            {/* LOGO */}
            <Box
                sx={{
                    position: "fixed",
                    top: "10px",
                    right: "20px", // 🔹 Se mantiene en la esquina derecha
                    transition: "right 0.3s ease-in-out",
                    zIndex: 1200,
                }}
            >
                <img
                    src={logo}
                    alt="Logo"
                    style={{
                        height: "auto",
                        width: "100%",
                        maxWidth: "100px",
                    }}
                />
            </Box>
        </Box>
    );
};

export default Topbar;
