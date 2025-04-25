import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Sidebar from "./components/Sidebar/Sidebar";
import Map from "./components/Map/Map";
import Header from "./components/Header/Header";
import StatusBar from "./components/StatusBar/StatusBar";
import "./App.css";
import "./styles/main.css";

function App() {
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
