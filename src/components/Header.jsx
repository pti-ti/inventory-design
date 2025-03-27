import { Typography, Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const Header = ({ title, subtitle }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box mb={{ xs: "20px", sm: "25px", md: "30px" }} textAlign="center">
      <Typography
        variant="h4"
        sx={{
          fontSize: { xs: "1.5rem", sm: "2rem", md: "2.5rem", lg: "3rem" },
          fontWeight: "bold",
          color: colors.grey[100],
          marginBottom: "5px",
        }}
      >
        {title}
      </Typography>
      <Typography
        variant="h6"
        sx={{
          fontSize: { xs: "1rem", sm: "1.2rem", md: "1.5rem" },
          color: colors.greenAccent[400],
        }}
      >
        {subtitle}
      </Typography>
    </Box>
  );
};

export default Header;