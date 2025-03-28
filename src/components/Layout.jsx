import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../scenes/global/Sidebar";
import Topbar from "../scenes/global/Topbar";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado para abrir/cerrar el Sidebar

  return (
    <div className="app" style={{ display: "flex" }}>
      {/* Sidebar con dimensiones dinámicas */}
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <main
        className="content"
        style={{
          flex: 1, // Ocupa el resto del espacio disponible
          marginLeft: isSidebarOpen ? "1px" : "1px", // Ajuste de margen según el estado del sidebar
          transition: "margin-left 0.3s ease-in-out", // Transición suave para el cambio de margen
        }}
      >
        <Topbar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
