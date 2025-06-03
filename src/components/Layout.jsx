import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../scenes/global/Sidebar";
import Topbar from "../scenes/global/Topbar";

const SIDEBAR_WIDTH_OPEN = 210;   // Ajusta según el ancho real de tu sidebar abierto
const SIDEBAR_WIDTH_CLOSED = 70;  // Ajusta según el ancho real de tu sidebar cerrado

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
          flex: 1,
          transition: "margin-left 0.3s ease-in-out",
          minWidth: 0,
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