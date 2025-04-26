import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar/Sidebar";
import Map from "./components/Map/Map";
import Header from "./components/Header/Header";
import StatusBar from "./components/StatusBar/StatusBar";
import MobileNotice from "./components/MobileNotice/MobileNotice";
import "./App.css";
import "./styles/main.css";

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Function to check if the device is mobile (screen width < 768px)
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Check immediately on mount
    checkMobile();

    // Add event listener for window resize
    window.addEventListener("resize", checkMobile);

    // Clean up event listener
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // If on a mobile device, show the mobile notice
  if (isMobile) {
    return <MobileNotice />;
  }

  // Otherwise show the normal GIS application
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app-container">
        <Header />
        <Sidebar />
        <Map />
        <StatusBar />
      </div>
    </DndProvider>
  );
}

export default App;
