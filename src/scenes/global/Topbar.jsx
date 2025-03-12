import { Box, IconButton, useTheme } from "@mui/material";
import { useContext, useState } from "react";
import { ColorModeContext, tokens } from "../../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import logoClaro from "../../assets/logoClaro.png";
import logoOscuro from "../../assets/logoOscuro.png";
//import SearchIcon from "@mui/icons-material/Search";

const Topbar = ({ onSearch }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const colorMode = useContext(ColorModeContext);
    const [searchTerm, setSearchTerm] = useState("");

    const logo = theme.palette.mode === "dark" ? logoClaro :logoOscuro;


    const handleSearch = () => {
        if (onSearch) {
            onSearch(searchTerm);
        }
    };

    return (
        <Box display="flex" justifyContent="space-between" alignItems="center" p={2}>
            {/* ICONOS */}
            <Box display="flex" alignItems="center">
                <IconButton onClick={colorMode.toggleColorMode}>
                    {theme.palette.mode === "dark" ? (
                        <DarkModeOutlinedIcon />
                    ) : (
                        <LightModeOutlinedIcon />
                    )}
                </IconButton>
            </Box>

            {/* LOGO EN LA ESQUINA SUPERIOR DERECHA */}
            <Box>
            <img src={logo} alt="Logo" style={{ height: 50, width: "auto" }} />
            </Box>
        </Box>
    );
};

export default Topbar;