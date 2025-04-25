import React, { useState, useEffect, useRef } from "react";
import { useDrop } from "react-dnd";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Polyline,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import useMapStore from "../../store/useMapStore";
import {
  MAP_CENTER,
  DEFAULT_ZOOM,
  DRAWING_TOOLS,
  getFeatureStyle,
  generateDefaultLabel,
  layerToGeoJSON,
} from "../../utils/mapUtils";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

// Fix for the default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Helper function to get cursor class name based on drawing tool
const getCursorClassName = (isDrawing, drawingTool) => {
  if (!isDrawing) return "cursor-grab";

  switch (drawingTool) {
    case DRAWING_TOOLS.POLYGON:
      return "cursor-polygon";
    case DRAWING_TOOLS.LINE:
      return "cursor-line";
    case DRAWING_TOOLS.POINT:
      return "cursor-point";
    default:
      return "cursor-crosshair";
  }
};

// Helper function to get cursor style based on drawing tool
const getCursorStyle = (drawingTool) => {
  switch (drawingTool) {
    case DRAWING_TOOLS.POLYGON:
      return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><polygon fill="%233498db" points="5,5 19,5 19,19 5,19" stroke="%232c3e50" stroke-width="2"/><circle cx="12" cy="12" r="1" fill="white"/></svg>\') 12 12, crosshair';
    case DRAWING_TOOLS.LINE:
      return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><line x1="5" y1="5" x2="19" y2="19" stroke="%239b59b6" stroke-width="2"/><circle cx="12" cy="12" r="1" fill="white"/></svg>\') 12 12, crosshair';
    case DRAWING_TOOLS.POINT:
      return 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill="%23e74c3c" stroke="%23c0392b" stroke-width="1"/><circle cx="12" cy="12" r="1" fill="white"/></svg>\') 12 12, pointer';
    default:
      return "grab";
  }
};

// Helper function to directly set cursor on map elements
const setMapCursor = (map, cursorStyle) => {
  if (!map) return;

  // Get all the relevant elements that need cursor styling
  const container = map.getContainer();
  const panes = container.querySelectorAll(".leaflet-pane");

  // Set cursor on the main container
  container.style.cursor = cursorStyle;

  // Also set cursor on panes to ensure it applies everywhere
  panes.forEach((pane) => {
    pane.style.cursor = cursorStyle;
  });
};

// Component to handle map events and drawing functionality
const MapEventHandler = ({
  onDrop,
  isDrawing,
  drawingTool,
  setIsDrawing,
  addFeature,
  handleNewFeatureCreated,
  mapContainerRef,
}) => {
  const map = useMap();
  const pointsRef = useRef([]);
  const layerRef = useRef(null);
  const previewLayerRef = useRef(null); // New ref for the preview line layer

  // Clean up any temporary drawing layers when drawing is cancelled or completed
  const cleanupDrawing = () => {
    if (layerRef.current) {
      layerRef.current.remove();
      layerRef.current = null;
    }
    if (previewLayerRef.current) {
      previewLayerRef.current.remove();
      previewLayerRef.current = null;
    }
    pointsRef.current = [];
  };

  // Start drawing process
  const startDrawing = (tool) => {
    cleanupDrawing();
    setIsDrawing(true);

    // Set cursor style for drawing
    setMapCursor(map, getCursorStyle(tool));

    // Create a temporary feature layer based on drawing tool type
    if (tool === DRAWING_TOOLS.POLYGON) {
      layerRef.current = L.polygon(
        [],
        getFeatureStyle(DRAWING_TOOLS.POLYGON, true)
      ).addTo(map);

      // For polygon, also add a preview layer with dashed style
      if (!previewLayerRef.current) {
        previewLayerRef.current = L.polyline([], {
          color: getFeatureStyle(DRAWING_TOOLS.POLYGON, true).color,
          weight: 2,
          dashArray: "5, 10",
          opacity: 0.6,
        }).addTo(map);
      }
    } else if (tool === DRAWING_TOOLS.LINE) {
      layerRef.current = L.polyline(
        [],
        getFeatureStyle(DRAWING_TOOLS.LINE, true)
      ).addTo(map);

      // For line, add a preview layer with dashed style
      if (!previewLayerRef.current) {
        previewLayerRef.current = L.polyline([], {
          color: getFeatureStyle(DRAWING_TOOLS.LINE, true).color,
          weight: 2,
          dashArray: "5, 10",
          opacity: 0.7,
        }).addTo(map);
      }
    }
  };

  // Finish drawing and save the feature
  const finishDrawing = (e) => {
    if (pointsRef.current.length < 2 && drawingTool !== DRAWING_TOOLS.POINT) {
      alert("Please add at least 2 points to create a feature");
      return;
    }

    if (layerRef.current) {
      const geoJSON = layerToGeoJSON(layerRef.current, drawingTool);
      const newFeature = {
        type: drawingTool,
        label: generateDefaultLabel(drawingTool),
        geometry: geoJSON.geometry,
        properties: {},
      };

      // Add the feature to the store
      const addedFeature = addFeature(newFeature);

      // Calculate position for the popup
      const mapRect = mapContainerRef.current.getBoundingClientRect();
      let position;

      // For polygons, use the center of the polygon
      if (
        drawingTool === DRAWING_TOOLS.POLYGON ||
        drawingTool === DRAWING_TOOLS.LINE
      ) {
        const bounds = layerRef.current.getBounds();
        const center = bounds.getCenter();
        const point = map.latLngToContainerPoint(center);

        position = {
          x: point.x,
          y: point.y,
        };
      }
      // For other cases, use the last click position
      else if (e) {
        position = {
          x: e.containerPoint.x,
          y: e.containerPoint.y,
        };
      }

      // Trigger the edit popup immediately after drawing is complete
      handleNewFeatureCreated(addedFeature, position);
    }

    setIsDrawing(false);
    cleanupDrawing();

    // Reset cursor style after drawing is finished
    setMapCursor(map, getCursorStyle(null));
  };

  // Handle map clicks for drawing
  useEffect(() => {
    const handleClick = (e) => {
      if (!isDrawing) return;

      const { lat, lng } = e.latlng;

      if (
        drawingTool === DRAWING_TOOLS.POLYGON ||
        drawingTool === DRAWING_TOOLS.LINE
      ) {
        pointsRef.current.push([lat, lng]);

        if (layerRef.current) {
          layerRef.current.setLatLngs(pointsRef.current);
        }

        // Auto-finish line when double-clicking
        if (
          drawingTool === DRAWING_TOOLS.LINE &&
          e.originalEvent.detail === 2
        ) {
          finishDrawing(e);
        }
      }

      // For points, immediately create the feature
      if (drawingTool === DRAWING_TOOLS.POINT) {
        const marker = L.marker([lat, lng]);
        const geoJSON = layerToGeoJSON(marker, DRAWING_TOOLS.POINT);

        const newFeature = {
          type: DRAWING_TOOLS.POINT,
          label: generateDefaultLabel(DRAWING_TOOLS.POINT),
          geometry: geoJSON.geometry,
          properties: {},
        };

        // Add the feature and get the created feature with ID
        const addedFeature = addFeature(newFeature);

        // Show the edit form immediately for the new point
        handleNewFeatureCreated(addedFeature, {
          x: e.containerPoint.x,
          y: e.containerPoint.y,
        });

        setIsDrawing(false);

        // Reset cursor style after drawing is finished
        setMapCursor(map, getCursorStyle(null));
      }
    };

    const handleContextMenu = (e) => {
      if (
        isDrawing &&
        (drawingTool === DRAWING_TOOLS.POLYGON ||
          drawingTool === DRAWING_TOOLS.LINE) &&
        pointsRef.current.length >= 2
      ) {
        finishDrawing(e);
      }
    };

    // Add mousemove event handler to update preview line
    const handleMouseMove = (e) => {
      if (
        !isDrawing ||
        !previewLayerRef.current ||
        pointsRef.current.length === 0
      )
        return;

      const { lat, lng } = e.latlng;

      if (
        drawingTool === DRAWING_TOOLS.LINE ||
        drawingTool === DRAWING_TOOLS.POLYGON
      ) {
        // Create a temporary array with the existing points plus the current mouse position
        const lastPoint = pointsRef.current[pointsRef.current.length - 1];
        const previewLine = [lastPoint, [lat, lng]];

        // Update the preview layer with the temporary line
        previewLayerRef.current.setLatLngs(previewLine);
      }
    };

    map.on("click", handleClick);
    map.on("contextmenu", handleContextMenu);
    map.on("mousemove", handleMouseMove); // Add mousemove event handler

    return () => {
      map.off("click", handleClick);
      map.off("contextmenu", handleContextMenu);
      map.off("mousemove", handleMouseMove); // Clean up mousemove handler
    };
  }, [isDrawing, drawingTool]);

  // Handle tool drop event
  useEffect(() => {
    if (onDrop) {
      startDrawing(onDrop);
    }
  }, [onDrop]);

  return (
    <div className="map-overlay">
      {isDrawing && (
        <div className="map-overlay-text">
          {drawingTool === DRAWING_TOOLS.POLYGON &&
            "Click to add polygon points, right-click to finish"}
          {drawingTool === DRAWING_TOOLS.LINE &&
            "Click to add line points, double-click or right-click to finish"}
          {drawingTool === DRAWING_TOOLS.POINT &&
            "Click on map to place a point"}
        </div>
      )}

      {!isDrawing && (
        <div className="map-overlay-text">
          Drag a tool onto the map to start drawing
        </div>
      )}
    </div>
  );
};

// Feature edit form component
const FeatureEditForm = ({ feature, position, onSave, onCancel }) => {
  const [label, setLabel] = useState(feature.label || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...feature, label });
  };

  return (
    <div
      className="feature-form"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Feature name"
          autoFocus
        />
        <button type="submit">Save</button>
        <button
          type="button"
          className="cancel"
          onClick={() => onCancel(feature)}
        >
          Cancel
        </button>
      </form>
    </div>
  );
};

// Main Map component
const Map = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingTool, setDrawingTool] = useState(null);
  const [editingFeature, setEditingFeature] = useState(null);
  const [editPosition, setEditPosition] = useState({ x: 0, y: 0 });
  const [isNewFeature, setIsNewFeature] = useState(false);
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const {
    features,
    activeFeature,
    addFeature: addFeatureToStore,
    updateFeature,
    deleteFeature,
    clearActiveFeature,
  } = useMapStore();

  // Handle drag and drop of drawing tools onto the map
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "DRAWING_TOOL",
    drop: (item) => {
      setDrawingTool(item.type);
      return { droppedOn: "map" };
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Modified addFeature function that returns the created feature (with ID)
  const addFeature = (feature) => {
    // Get the current state before the update
    const currentState = useMapStore.getState();
    const currentFeatureCount = currentState.features.length;

    // Add the feature using the store function
    addFeatureToStore(feature);

    // Get the updated state to extract the new feature
    const updatedState = useMapStore.getState();

    // Return the added feature (should be the last one in the array)
    if (updatedState.features.length > currentFeatureCount) {
      return updatedState.features[updatedState.features.length - 1];
    }
    return feature;
  };

  // Handle feature edit form
  const handleFeatureEdit = (feature, e) => {
    if (e) {
      // Get the map container dimensions for better positioning
      const mapContainer = mapContainerRef.current;
      const mapRect = mapContainer.getBoundingClientRect();

      // Calculate popup position that ensures it stays within viewport
      const formWidth = 280; // approx width of the form
      const formHeight = 150; // approx height of the form

      let x = e.clientX - mapRect.left;
      let y = e.clientY - mapRect.top;

      // Adjust x position if too close to right edge
      if (x + formWidth > mapRect.width) {
        x = Math.max(20, x - formWidth);
      }

      // Adjust y position if too close to bottom edge
      if (y + formHeight > mapRect.height) {
        y = Math.max(20, y - formHeight);
      }

      setEditPosition({ x, y });
    }
    setEditingFeature(feature);
    setIsNewFeature(false); // Editing existing feature
  };

  // Handle newly created feature - show edit form immediately
  const handleNewFeatureCreated = (feature, position) => {
    setEditPosition(position);
    setEditingFeature(feature);
    setIsNewFeature(true); // Mark as a new feature
  };

  const handleSaveEdit = (updatedFeature) => {
    updateFeature(updatedFeature.id, {
      label: updatedFeature.label,
    });
    setEditingFeature(null);
    setIsNewFeature(false);
  };

  const handleCancelEdit = (feature) => {
    // If it's a new feature that was just created, delete it when cancel is clicked
    if (isNewFeature && feature && feature.id) {
      deleteFeature(feature.id);
    }
    setEditingFeature(null);
    setIsNewFeature(false);
  };

  // The actual map component is rendered once and never re-rendered
  // This is key to preventing the map from resetting on drag
  const MapOnce = React.useMemo(() => {
    // This component is only rendered once and sets up the map
    return (
      <MapContainer
        center={MAP_CENTER}
        zoom={DEFAULT_ZOOM}
        style={{ height: "100%", width: "100%" }}
        whenCreated={(mapInstance) => {
          mapInstanceRef.current = mapInstance;
          setMapReady(true);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* These components will update even though the MapContainer won't re-render */}
        <MapUpdater
          features={features}
          activeFeature={activeFeature}
          isDrawing={isDrawing}
          drawingTool={drawingTool}
          setIsDrawing={setIsDrawing}
          addFeature={addFeature}
          handleFeatureEdit={handleFeatureEdit}
          handleNewFeatureCreated={handleNewFeatureCreated}
          mapContainerRef={mapContainerRef}
          clearActiveFeature={clearActiveFeature}
        />
      </MapContainer>
    );
  }, [features, activeFeature, isDrawing, drawingTool]);

  return (
    <div
      ref={(node) => {
        drop(node);
        mapContainerRef.current = node;
      }}
      className={`map-container ${getCursorClassName(isDrawing, drawingTool)}`}
      style={{
        position: "relative",
      }}
    >
      {/* Visual indicator for drag and drop that doesn't affect the map */}
      {isOver && (
        <div
          className="map-drop-indicator"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            border: "2px dashed #3388ff",
            zIndex: 1000,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Map is only rendered once and never re-rendered */}
      {MapOnce}

      {/* Edit form rendered outside the map to avoid re-renders */}
      {editingFeature && (
        <FeatureEditForm
          feature={editingFeature}
          position={editPosition}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      )}
    </div>
  );
};

// This component handles all map updates without re-rendering MapContainer
const MapUpdater = ({
  features,
  activeFeature,
  isDrawing,
  drawingTool,
  setIsDrawing,
  addFeature,
  handleFeatureEdit,
  handleNewFeatureCreated,
  mapContainerRef,
  clearActiveFeature,
}) => {
  const map = useMap();

  // Setup click handler to clear active feature
  useEffect(() => {
    const handleClick = () => {
      if (!isDrawing) clearActiveFeature();
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
    };
  }, [map, isDrawing, clearActiveFeature]);

  // Handle zoom to active feature
  useEffect(() => {
    if (activeFeature) {
      // For points
      if (activeFeature.type === DRAWING_TOOLS.POINT) {
        const [lng, lat] = activeFeature.geometry.coordinates;
        map.setView([lat, lng], 12);
      }
      // For polygons and lines
      else {
        const coordinates =
          activeFeature.type === DRAWING_TOOLS.POLYGON
            ? activeFeature.geometry.coordinates[0]
            : activeFeature.geometry.coordinates;

        const latLngs = coordinates.map((coord) => [coord[1], coord[0]]);
        const bounds = L.latLngBounds(latLngs);

        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [activeFeature, map]);

  return (
    <>
      {/* Render all features based on their type */}
      {features.map((feature) => {
        const isActive = activeFeature?.id === feature.id;

        if (feature.type === DRAWING_TOOLS.POLYGON) {
          const positions = feature.geometry.coordinates[0].map((coord) => [
            coord[1],
            coord[0],
          ]);
          return (
            <Polygon
              key={feature.id}
              positions={positions}
              pathOptions={getFeatureStyle(DRAWING_TOOLS.POLYGON, isActive)}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  handleFeatureEdit(feature, e.originalEvent);
                },
              }}
            />
          );
        }

        if (feature.type === DRAWING_TOOLS.LINE) {
          const positions = feature.geometry.coordinates.map((coord) => [
            coord[1],
            coord[0],
          ]);
          return (
            <Polyline
              key={feature.id}
              positions={positions}
              pathOptions={getFeatureStyle(DRAWING_TOOLS.LINE, isActive)}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  handleFeatureEdit(feature, e.originalEvent);
                },
              }}
            />
          );
        }

        if (feature.type === DRAWING_TOOLS.POINT) {
          const [lng, lat] = feature.geometry.coordinates;
          return (
            <Marker
              key={feature.id}
              position={[lat, lng]}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  handleFeatureEdit(feature, e.originalEvent);
                },
              }}
            />
          );
        }

        return null;
      })}

      <MapEventHandler
        onDrop={drawingTool}
        isDrawing={isDrawing}
        drawingTool={drawingTool}
        setIsDrawing={setIsDrawing}
        addFeature={addFeature}
        handleNewFeatureCreated={handleNewFeatureCreated}
        mapContainerRef={mapContainerRef}
      />
    </>
  );
};

export default Map;
