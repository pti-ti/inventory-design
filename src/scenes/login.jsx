import React, { useState, useContext } from "react";
import "../styles/Login.css";
import { AuthContext } from "../context/AuthContext";
import { IconButton, useTheme } from "@mui/material";
import { ColorModeContext } from "../theme";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import AccountCircleOutlinedIcon from "@mui/icons-material/AccountCircleOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

const API_URL = "http://localhost:8085/api/v1/security/login";

const Login = () => {
  const { login } = useContext(AuthContext);
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const textColor = theme.palette.mode === "dark" ? "#fff" : "#000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password }),
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }

      const data = await response.json();
      console.log("Respuesta del backend:", data);

      login({ username, userType: data.userType }, data.token);

      alert("Login exitoso");
      window.location.href = "/dispositivos";
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container" style={{ color: textColor }}>
      <div className="theme-toggle">
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === "dark" ? (
            <DarkModeOutlinedIcon />
          ) : (
            <LightModeOutlinedIcon />
          )}
        </IconButton>
      </div>

      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1 style={{ color: textColor }}>Login</h1>
          {error && <div className="error-message">{error}</div>}
          
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

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
