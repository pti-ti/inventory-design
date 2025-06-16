import { Box, Typography, useTheme } from "@mui/material";

const Footer = ({ isSidebarOpen }) => {
    const theme = useTheme();
    const sidebarWidth = isSidebarOpen ? 210 : 70; // Usa el mismo valor que tu Layout

    return (
        <Box
            component="footer"
            sx={{
                width: `calc(100% - ${sidebarWidth}px)`,
                py: 2,
                px: 2,
                position: "fixed",
                left: sidebarWidth,
                bottom: 0,
                zIndex: 1300,
                backgroundColor: "transparent",
                color: theme.palette.text.secondary,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 15,
            }}
        >
            <Typography variant="body2" align="center" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <span style={{ fontSize: 18, fontWeight: "bold" }}>&copy;</span>
                2025 PTI Todos los derechos reservados.
            </Typography>
            <Typography variant="caption" align="center" sx={{ mt: 0.5 }}>
                Desarrollado en el área de TI por Christian Fernando Rojas
            </Typography>
        </Box>
    );
};

export default Footer;