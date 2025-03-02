import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

// Container style to take full height of the page
const containerStyle = {
  width: "100%",
  height: "100vh",
};

const uberStyle = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#333333" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "administrative",
    elementType: "geometry.fill",
    stylers: [{ color: "#e3e3e3" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#dcdcdc" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#b0b0b0" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#a2c4c9" }],
  },
];

const Map = () => {
  const [map, setMap] = useState(null);
  const [center] = useState({ lat: 19.0760, lng: 76.8777 }); // Default center (can be dynamic)
  
  // Locations for warehouse and branches
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

  // Marker icons state
  const [warehouseIcon, setWarehouseIcon] = useState(null);
  const [branchIcon, setBranchIcon] = useState(null);

  // Set icons on initial load
  useEffect(() => {
    if (window.google) {
      setWarehouseIcon({
        url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        scaledSize: { width: 40, height: 40 },
      });
      setBranchIcon({
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
        scaledSize: { width: 30, height: 30 },
      });
    }
  }, []);

  // Handle map load/unload
  const onLoad = (mapInstance) => setMap(mapInstance);
  const onUnmount = () => setMap(null);

  // Map route logic (calculate routes and display estimated times)
  useEffect(() => {
    if (map && window.google && warehouseIcon && branchIcon) {
      const directionsService = new window.google.maps.DirectionsService();
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        map: map,
        suppressMarkers: true,
      });

      const calculateRoute = (origin, destinations) => {
        const waypoints = destinations.map((destination) => ({
          location: new window.google.maps.LatLng(destination.lat, destination.lng),
          stopover: true,
        }));

        const routeRequest = {
          origin: origin,
          destination: origin, // Returning to warehouse
          travelMode: window.google.maps.TravelMode.DRIVING,
          waypoints: waypoints,
          optimizeWaypoints: true, // Optional optimization
        };

        directionsService.route(routeRequest, (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(result);
            displayEstimatedTimes(result);
          } else {
            console.error("Error fetching directions:", status);
          }
        });
      };

      const displayEstimatedTimes = (directionsResult) => {
        const legs = directionsResult.routes[0].legs;
        legs.forEach((leg) => {
          const time = leg.duration.text;
          const distance = leg.distance.text;
          const start = leg.start_location;
          const end = leg.end_location;
          const midLat = (start.lat() + end.lat()) / 2;
          const midLng = (start.lng() + end.lng()) / 2;

          const markerPosition = new window.google.maps.LatLng(midLat, midLng);

          new window.google.maps.Marker({
            position: markerPosition,
            map: map,
            icon: null, // No icon, just a label with text
            label: {
              text: `${time}`,
              color: "black",
              fontSize: "14px",
              fontWeight: "bold",
              backgroundColor: "white",
              padding: "5px",
            },
            title: `Time: ${time}, Distance: ${distance}`,
          });
        });
      };

      calculateRoute(locations.mainWarehouse, locations.branches);

      locations.branches.forEach((branch) => {
        const infoWindow = new window.google.maps.InfoWindow({
          content: `<div style="padding: 10px;">
            <h3 style="margin: 0;">${branch.name}</h3>
            <p style="margin: 5px 0;">Part of distribution route</p>
          </div>`,
        });

        const marker = new window.google.maps.Marker({
          position: branch,
          map: map,
          icon: branchIcon,
          title: branch.name,
        });

        marker.addListener("click", () => {
          infoWindow.open(map, marker);
        });
      });
    }
  }, [map, warehouseIcon, branchIcon]);

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={6}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: uberStyle,
          disableDefaultUI: true,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        }}
      >
        {warehouseIcon && (
          <Marker
            position={locations.mainWarehouse}
            icon={warehouseIcon}
            title={locations.mainWarehouse.name}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
