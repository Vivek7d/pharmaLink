import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Polyline } from "@react-google-maps/api";
import { aStar, Node } from './astar';  // Assuming you've already exported aStar and Node from your code

const containerStyle = {
  width: "100%",
  height: "100vh",
};

const MapScreen2 = () => {
  const [map, setMap] = useState(null);
  const [center] = useState({ lat: 19.0760, lng: 76.8777 }); // Default center
  const [path, setPath] = useState([]);
  
  const locations = {
    mainWarehouse: { lat: 17.4399, lng: 78.4983, name: "Hyderabad - Main Warehouse" },
    branches: [
      { lat: 19.9975, lng: 73.7898, name: "Nashik Branch" },
      { lat: 20.9374, lng: 77.7796, name: "Amravati Branch" },
      { lat: 16.7050, lng: 74.2433, name: "Kolhapur Branch" },
      { lat: 21.1458, lng: 79.0882, name: "Nagpur Branch" },
      { lat: 18.5204, lng: 73.8567, name: "Pune Branch" },
      { lat: 22.7196, lng: 75.8577, name: "Indore Branch" },
      { lat: 15.2993, lng: 74.1240, name: "Goa Branch" },
    ],
  };
  useEffect(() => {
    if (map) {
      // Convert lat/lng of warehouse and branches to grid coordinates
      const grid = createGrid(map);
  
      // Convert locations to nodes for A* pathfinding
      const startNode = latLngToNode(locations.mainWarehouse);
      const branchNodes = locations.branches.map((branch) => latLngToNode(branch));
  
      // Log grid and nodes for debugging
      console.log('Grid:', grid);
      console.log('Start Node:', startNode);
      console.log('Branch Nodes:', branchNodes);
  
      // Calculate the route for all branches in sequence
      const totalPath = [startNode];
      for (let i = 0; i < branchNodes.length; i++) {
        const endNode = branchNodes[i];
        const foundPath = aStar(grid, totalPath[totalPath.length - 1], endNode);
  
        console.log(`Path from stop ${i} to stop ${i + 1}:`, foundPath);
        
        if (foundPath.length === 0) {
          console.error(`No path found from stop ${i} to stop ${i + 1}`);
        } else {
          totalPath.push(...foundPath);
        }
      }
  
      // Convert the grid path to lat/lng
      const pathInLatLng = totalPath.map((node) => nodeToLatLng(node));
      setPath(pathInLatLng);
    }
  }, [map]);
  

  // Convert lat/lng to a grid node
  const latLngToNode = ({ lat, lng }) => {
    const x = Math.floor((lat - 17.0) * 10); // Just an example transformation to grid
    const y = Math.floor((lng - 73.0) * 10);
    return new Node(x, y);
  };

  // Convert grid node to lat/lng
  const nodeToLatLng = (node) => {
    const lat = 17.0 + node.x / 10;
    const lng = 73.0 + node.y / 10;
    return { lat, lng };
  };

  // Create a grid (dummy grid for example purposes)
  const createGrid = (map) => {
    const rows = 10; // Example grid size
    const cols = 10;
    const grid = Array.from({ length: rows }, (_, i) =>
      Array.from({ length: cols }, (_, j) => new Node(i, j, true))
    );
    return grid;
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={6}
        onLoad={setMap}
      >
        {path.length > 0 && (
          <Polyline
            path={path}
            geodesic={true}
            options={{
              strokeColor: "#FF0000",
              strokeOpacity: 1.0,
              strokeWeight: 2,
            }}
          />
        )}

        <Marker position={locations.mainWarehouse} title={locations.mainWarehouse.name} />
        {locations.branches.map((branch) => (
          <Marker key={branch.name} position={branch} title={branch.name} />
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default MapScreen2;
