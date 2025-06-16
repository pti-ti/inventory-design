import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../scenes/global/Sidebar";
import Topbar from "../scenes/global/Topbar";
import Footer from "../scenes/global/Footer";

const SIDEBAR_WIDTH_OPEN = 210;
const SIDEBAR_WIDTH_CLOSED = 70;

const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="app" style={{ display: "flex" }}>
      {/* Sidebar con dimensiones dinámicas */}
      <Sidebar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
        {/* Topbar fuera del main */}
        <Topbar
          isSidebarOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main className="content" style={{ flex: 1, minWidth: 0 }}>
          <Outlet />
        </main>

        <Footer isSidebarOpen={isSidebarOpen} />
      </div>
    </div>
  );
};

export default Layout;