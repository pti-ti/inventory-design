import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Button,
} from "@mui/material";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const adminModal = ({ open, onClose, ubicaciones = [], onSuccess }) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    userType: "",
    locationId: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      email: formData.email,
      password: formData.password,
      userType: formData.userType,
      location: {
        id: parseInt(formData.locationId),
      },
    };

    try {
        await axios.post(`${API_BASE_URL}/api/v1/users/create`, payload, { headers });
        if (onSuccess) onSuccess();
        handleClose();
      } catch (error) {
        console.error("Error al registrar usuario:", error);
        alert("Error al registrar el usuario.");
      }
      

  const handleClose = () => {
    setFormData({
      email: "",
      password: "",
      userType: "",
      locationId: ""
    });
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 400,
        bgcolor: "background.paper",
        boxShadow: 24,
        p: 4,
        borderRadius: 2,
      }}>
        <Typography variant="h6" gutterBottom>
          Registrar Usuario
        </Typography>

        <TextField
          fullWidth
          margin="normal"
          label="Correo"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          margin="normal"
          label="Contraseña"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel>Tipo de Usuario</InputLabel>
          <Select
            name="userType"
            value={formData.userType}
            onChange={handleChange}
          >
            <MenuItem value="ADMIN">ADMIN</MenuItem>
            <MenuItem value="TECHNICIAN">TECHNICIAN</MenuItem>
          </Select>
        </FormControl>

        <FormControl fullWidth margin="normal">
          <InputLabel>Ubicación</InputLabel>
          <Select
            name="locationId"
            value={formData.locationId}
            onChange={handleChange}
          >
            {ubicaciones.map((loc) => (
              <MenuItem key={loc.id} value={loc.id}>
                {loc.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box mt={2}>
          <Button variant="contained" fullWidth onClick={handleSubmit}>
            Registrar
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default adminModal;
