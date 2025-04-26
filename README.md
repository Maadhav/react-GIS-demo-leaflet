# GIS Network Drawing Application - Demo Version

A single-page React application bootstrapped with Vite that demonstrates basic GIS network drawing capabilities on an OpenStreetMap base layer. This application is intended as a demonstration tool to showcase the capabilities of Leaflet.js and provide insights into how geographic information systems (GIS) can be developed using modern web technologies.

## Demo Purpose

This project serves as a demo version of a GIS application with the following goals:
- Demonstrate the fundamental capabi   lities of Leaflet.js for interactive mapping
- Showcase how to implement common GIS features in a React application
- Provide a starting point for developers interested in building their own GIS applications
- Illustrate best practices for handling geographic data in web applications

This is not a production-ready GIS solution but rather a learning and demonstration tool for developers and GIS enthusiasts.

## Features

- **OpenStreetMap Integration**: Uses Leaflet and react-leaflet for rendering map layers
- **Enhanced Drawing Tools**: Drag-and-drop drawing tools with live preview for polygons, lines, and points
- **Visual Feedback**: Real-time drawing visualization with preview lines and customized cursors
- **Feature Management**: Comprehensive list view of all created features with ability to zoom to them
- **Feature Editing**: Edit labels for features by clicking on them with intuitive form interface
- **Persistent Storage**: Automatically saves features to localStorage to survive page reloads
- **Status Information**: Status bar displaying feature count, application state, and current date
- **Customized Map Cursors**: Specialized cursor indicators for each drawing tool type

## Tech Stack

- **React 19**: Latest version of the React UI library
- **Vite**: Fast development and build tool
- **Leaflet & react-leaflet**: Map rendering components
- **React DnD**: Drag-and-drop functionality
- **Zustand**: State management with persistence
- **OpenStreetMap**: Base map tiles

## Installation and Setup

1. Clone the repository:
```
git clone [repository URL]
cd gis-codedecoders
```

2. Install dependencies:
```
npm install
```

3. Run the development server:
```
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:5173/
```

## Usage Instructions

1. **Drawing Features**: 
   - Drag a tool (Polygon, Line, Point) from the sidebar onto the map
   - For polygons: Click to add points, right-click to finish (preview line guides your drawing)
   - For lines: Click to add points, double-click or right-click to finish (with preview line)
   - For points: Click once to place a point

2. **Editing Features**:
   - Click on any feature to edit its label
   - Click save to update or cancel to discard changes

3. **Managing Features**:
   - View all created features in the feature list
   - Click on a feature in the list to zoom to it on the map
   - Use the delete button to remove features

4. **Status Information**:
   - View feature count in the status bar
   - See application status and current date

## Project Structure

```
src/
  ├── components/
  │   ├── Map/
  │   │   └── Map.jsx               # Map component with drawing functionality
  │   ├── Sidebar/
  │   │   └── Sidebar.jsx           # Sidebar with drawing tools
  │   ├── FeatureList/
  │   │   └── FeatureList.jsx       # Feature listing and management
  │   ├── Header/
  │   │   └── Header.jsx            # Application header component
  │   └── StatusBar/
  │       └── StatusBar.jsx         # Status bar with app information
  ├── store/
  │   └── useMapStore.js            # Zustand store for state management
  ├── styles/
  │   ├── main.css                  # Main application styles
  │   └── map-cursors.css           # Specialized cursor styles
  ├── utils/
  │   └── mapUtils.js               # Utility functions and constants
  ├── App.jsx                       # Main application component
  └── main.jsx                      # Application entry point
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
