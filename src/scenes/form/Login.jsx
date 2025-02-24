import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import "../assets/styles/Login.css"
import { FaLock, FaUser } from "react-icons/fa";

const API_URL = "http://localhost:8085/api/v1/security/login";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) =>{
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: username, password }),
      });
  
      // Verifica si la respuesta es válida
      if (!response.ok) {
        const errorData = await response.text(); // Intenta leer el error como texto
        throw new Error(errorData || "Credenciales incorrectas");
      }
  
      const data = await response.json(); // Ahora sí el backend devuelve JSON
  
      if (!data.token) {
        throw new Error("Token no recibido");
      }
  
      localStorage.setItem("token", data.token);
      alert("Login exitoso");
  
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container"> {/* Aplica el fondo solo al login */}
      <div className="wrapper">
        <form onSubmit={handleSubmit}>
          <h1>Login</h1>
          {error && <div className="error-message">{error}</div>}
          <div className="input-box">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <FaUser className="icon" />
          </div>
          <div className="input-box">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <FaLock className="icon" />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? "Cargando..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
  /* return (
    <div className='wrapper'>
        <form action="">
            <h1>Login</h1>
            <div className='input-box'>
                <input type="text" placeholder='Username' required />
                <FaUser className='icon'/>
            </div>
            <div className='input-box'>
                <input type="password" placeholder='Password' required />
                <FaLock className='icon'/>
            </div>
            <button type='submit'>Login</button>
        </form>
    </div>
  );
}; */