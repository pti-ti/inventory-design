import { Box, IconButton, useTheme } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import logoClaro from "../../assets/logoClaro.png";
import logoOscuro from "../../assets/logoOscuro.png";

const Topbar = ({ onSearch }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const [searchTerm, setSearchTerm] = useState("");

    const logo = theme.palette.mode === "dark" ? logoClaro : logoOscuro;

    const handleSearch = () => {
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between" // Distribuye los elementos a los extremos
            flexDirection={{ xs: "column", sm: "row" }}
            p={{ xs: 1, sm: 2 }}
            sx={{
                maxWidth: "1920px",
                maxHeight: "1080px",
                transform: {
                    xs: "scale(1)", // Normal en móviles
                    sm: "scale(1)", // Normal en pantallas pequeñas
                    md: "scale(0.95)", // Se encoge en laptops 1920x1200
                    lg: "scale(0.9)", // Se reduce en pantallas más grandes
                },
                transformOrigin: "top",
                overflow: "hidden",
            }}
        >
            {/* ICONO DEL TEMA (A LA IZQUIERDA) */}
            <Box>
                <IconButton onClick={colorMode.toggleColorMode} sx={{ ml: "-5px" }}>
                    {theme.palette.mode === "dark" ? (
                        <DarkModeOutlinedIcon />
                    ) : (
                        <LightModeOutlinedIcon />
                    )}
                </IconButton>
            </Box>
    
            {/* LOGO (A LA DERECHA) */}
            <Box ml="auto">
                <img
                    src={logo}
                    alt="Logo"
                    style={{
                        height: "auto",
                        width: "100%",
                        maxWidth: "150px",
                    }}
                />
            </Box>
        </Box>
    );
};

export default Topbar;
