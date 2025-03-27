import { Outlet } from "react-router-dom";
import Sidebar from "../scenes/global/Sidebar";
import Topbar from "../scenes/global/Topbar";
import { useState } from "react";

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Estado para abrir/cerrar el Sidebar

  return (
    <div className="app" style={{ display: "flex" }}>
      {/* Sidebar con las dimensiones corregidas */}
      <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <main
        className="content"
        style={{
          flex: 1, // 🔹 Para que el contenido ocupe todo el espacio restante
          marginLeft: isSidebarOpen ? "1px" : "1px", // 🔹 Se ajusta el margen según el estado
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        {/* Topbar solo una vez */}
        <Topbar isSidebarOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
