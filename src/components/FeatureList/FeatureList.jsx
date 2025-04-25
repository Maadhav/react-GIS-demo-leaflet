import { useRef } from "react";
import useMapStore from "../../store/useMapStore";
import { DRAWING_TOOLS } from "../../utils/mapUtils";

const FeatureList = () => {
  const { features, activeFeature, setActiveFeature, deleteFeature } =
    useMapStore();

  const getFeatureIcon = (type) => {
    switch (type) {
      case DRAWING_TOOLS.POLYGON:
        return "🔷";
      case DRAWING_TOOLS.LINE:
        return "📏";
      case DRAWING_TOOLS.POINT:
        return "📍";
      default:
        return "📌";
    }
  };

  const handleFeatureClick = (feature) => {
    setActiveFeature(feature);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this feature?")) {
      deleteFeature(id);
    }
  };

  return (
    <div className="feature-list" style={{ paddingBottom: "30px" }}>
      <h2>Created Features</h2>

      {features.length === 0 ? (
        <div className="empty-list">
          <div className="empty-state-icon">📋</div>
          <p>No features created yet</p>
          <p className="empty-state-hint">
            Drag a tool onto the map to create features
          </p>
        </div>
      ) : (
        <div className="feature-items">
          {features.map((feature) => (
            <div
              key={feature.id}
              className={`feature-item ${
                activeFeature?.id === feature.id ? "active" : ""
              }`}
              onClick={() => handleFeatureClick(feature)}
            >
              <div className="feature-name">
                <span className="feature-type-icon">
                  {getFeatureIcon(feature.type)}
                </span>
                <span>{feature.label || "Unnamed feature"}</span>
              </div>

              <div className="feature-actions">
                <button
                  className="edit-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleFeatureClick(feature);
                  }}
                  title="Edit feature"
                >
                  ✏️
                </button>
                <button
                  className="delete-btn"
                  onClick={(e) => handleDelete(e, feature.id)}
                  title="Delete feature"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeatureList;
