import { useDrag } from "react-dnd";
import { DRAWING_TOOLS } from "../../utils/mapUtils";
import FeatureList from "../FeatureList/FeatureList";

// Tool card component that can be dragged onto the map
const ToolCard = ({ type, name, icon }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "DRAWING_TOOL",
    item: { type },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className="tool-card"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span className="tool-icon">{icon}</span>
      <span>{name}</span>
    </div>
  );
};

// Sidebar component containing drawing tools and feature list
const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1>Mapping Tools</h1>
      </div>

      <div className="drawing-tools">
        <h2>Feature Tools</h2>
        <p className="instruction">Drag any tool onto the map</p>

        <ToolCard type={DRAWING_TOOLS.POLYGON} name="Area/Polygon" icon="🔷" />
        <ToolCard type={DRAWING_TOOLS.LINE} name="Path/Line" icon="📏" />
        <ToolCard type={DRAWING_TOOLS.POINT} name="Point/Marker" icon="📍" />
      </div>

      <FeatureList />
    </div>
  );
};

export default Sidebar;
