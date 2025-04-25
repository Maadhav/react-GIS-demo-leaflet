// Map constants and utility functions
import useMapStore from "../store/useMapStore";

export const MAP_CENTER = [20.5937, 78.9629]; // Center of India
export const DEFAULT_ZOOM = 6;

export const DRAWING_TOOLS = {
  POLYGON: "polygon",
  LINE: "line",
  POINT: "point",
};

// Map feature styling
export const getFeatureStyle = (type, isActive = false) => {
  const baseStyle = {
    color: "#3388ff",
    weight: 3,
    opacity: isActive ? 1 : 0.7,
    fillOpacity: isActive ? 0.3 : 0.2,
  };

  // Custom styling based on feature type
  switch (type) {
    case DRAWING_TOOLS.POLYGON:
      return {
        ...baseStyle,
        color: isActive ? "#2c3e50" : "#3498db",
        fillColor: "#3498db",
      };
    case DRAWING_TOOLS.LINE:
      return {
        ...baseStyle,
        color: isActive ? "#8e44ad" : "#9b59b6",
        weight: isActive ? 4 : 3,
      };
    case DRAWING_TOOLS.POINT:
      return {
        radius: isActive ? 8 : 6,
        fillColor: "#e74c3c",
        color: "#c0392b",
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      };
    default:
      return baseStyle;
  }
};

// Helper to generate a default label for a feature with incremental naming
export const generateDefaultLabel = (type) => {
  // Get current features to determine the next number
  const { features } = useMapStore.getState();
  
  // Count existing features by type
  const typeCount = features.filter(feature => feature.type === type).length + 1;
  
  switch (type) {
    case DRAWING_TOOLS.POLYGON:
      return `Polygon ${typeCount}`;
    case DRAWING_TOOLS.LINE:
      return `Line ${typeCount}`;
    case DRAWING_TOOLS.POINT:
      return `Point ${typeCount}`;
    default:
      return `Feature ${typeCount}`;
  }
};

// Convert Leaflet layer to GeoJSON
export const layerToGeoJSON = (layer, type) => {
  // Get lat/lngs from the layer
  let coordinates;

  if (type === DRAWING_TOOLS.POLYGON) {
    coordinates = layer
      .getLatLngs()[0]
      .map((latLng) => [latLng.lng, latLng.lat]);
    // Close the polygon by adding the first point again
    coordinates.push([...coordinates[0]]);
    return {
      type: "Feature",
      geometry: {
        type: "Polygon",
        coordinates: [coordinates],
      },
    };
  } else if (type === DRAWING_TOOLS.LINE) {
    coordinates = layer.getLatLngs().map((latLng) => [latLng.lng, latLng.lat]);
    return {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: coordinates,
      },
    };
  } else if (type === DRAWING_TOOLS.POINT) {
    const latLng = layer.getLatLng();
    coordinates = [latLng.lng, latLng.lat];
    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: coordinates,
      },
    };
  }

  return null;
};
