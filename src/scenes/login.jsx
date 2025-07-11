import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { IconButton, useTheme, Snackbar, Alert } from "@mui/material";
import { ColorModeContext } from "../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import logoClaro from "../assets/logoClaro.png";
import logoOscuro from "../assets/logoOscuro.png";
import "../styles/Login.css";


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const { login } = useContext(AuthContext);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [username, setUsername] = useState(() => localStorage.getItem("rememberedUsername") || "");
  const [password, setPassword] = useState(() => localStorage.getItem("rememberedPassword") || "");
  const [remember, setRemember] = useState(
    !!localStorage.getItem("rememberedUsername") && !!localStorage.getItem("rememberedPassword")
  )
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const textColor = theme.palette.mode === "dark" ? "#fff" : "#000";

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("API_BASE_URL:", API_BASE_URL);
      const response = await fetch(`${API_BASE_URL}/api/v1/security/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      if (!response.ok) throw new Error("Credenciales incorrectas");

      const data = await response.json();
      login({ username, userType: data.userType }, data.token);

      // Guardar  o limpiar credenciales
      if (remember) {
        localStorage.setItem("rememberedUsername", username);
        localStorage.setItem("rememberedPassword", password);
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberedPassword");
      }

      setSnackbar({ open: true, message: "¡Login exitoso!", severity: "success" });

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);

    } catch (err) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  return (
    <div className={`login-container ${theme.palette.mode === "dark" ? "dark-mode" : "light-mode"}`} style={{ color: textColor }}>

      {/* Logo y Tema */}
      <div className="logo-container">
        <img src={theme.palette.mode === "dark" ? logoClaro : logoOscuro} alt="Logo" className="logo" />
      </div>
      <div className="theme-toggle">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
        </IconButton>
      </div>

      {/* Formulario */}
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1 style={{ color: textColor }}>Login</h1>

          <div className="input-box">
            <input
              type="text"
              placeholder="Email"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ color: textColor }}
            />
            <AccountCircleOutlinedIcon className="icon" style={{ color: textColor }} />
          </div>

          <div className="input-box">
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ color: textColor }}
            />
            <LockOutlinedIcon className="icon" style={{ color: textColor }} />
          </div>

          {/* Casilla de recordar credenciales */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
            <input
              type="checkbox"
              id="remember"
              checked={remember}
              onChange={() => setRemember(!remember)}
              style={{ marginRight: 8 }}
            />
            <label htmlFor="remember" style={{ color: textColor, cursor: "pointer" }}>
              Recordar credenciales
            </label>
          </div>

          <button type="submit">Iniciar Sesión</button>
        </form>
      </div>

      {/* Snackbar para mostrar alertas */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Login;
