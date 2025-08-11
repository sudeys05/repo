import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import { 
  Car, 
  Truck, 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  XCircle,
  Navigation,
  Radio,
  MapPin,
  Phone,
  User
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './MapStyles.css';
import L from 'leaflet';
import IncidentMarkers from './IncidentMarkers';
import VehicleTrackingControls from './VehicleTrackingControls';
import InteractiveLegend from './InteractiveLegend';
import AddressShareModal from './AddressShareModal';
import VehicleStatusDashboard from './VehicleStatusDashboard';

// Fix leaflet default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbXNfN1+VX2fX2AVKN5QiAiSuAQIFQOIQAk0n9V2QEu2SWxuHJjGvfr6b5t+9+T7Z7tv3z4z59757xvO/9d96Df7+v99hCEZhGk5z6XLQF2u+WF+7x8L4Ft0jb4HKWz3D2kq8P3Qb5j8yQ6qMd8V4sJA5DBwYDQlGsGCGEU5j0V8+z5r8H8gGfQhgm8tLKhLKr85MEoE4gK5xHaHD9NTABAOiZaGIZQMc9B5CvZjQRfDW7IQ/a3nO4aFNFggqnAQ=',
  iconUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAApCAYAAADAk4LOAAAFgUlEQVR4Aa1XA5BjWRTN2oW17d3YaZtr2962HUzbXNfN1+VX2fX2AVKN5QiAiSuAQIFQOIQAk0n9V2QEu2SWxuHJjGvfr6b5t+9+T7Z7tv3z4z59757xvO/9d96Df7+v99hCEZhGk5z6XLQF2u+WF+7x8L4Ft0jb4HKWz3D2kq8P3Qb5j8yQ6qMd8V4sJA5DBwYDQlGsGCGEU5j0V8+z5r8H8gGfQhgm8tLKhLKr85MEoE4gK5xHaHD9NTABAOiZaGIZQMc9B5CvZjQRfDW7IQ/a3nO4aFNFggqnAQ=',
  shadowUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAECUlEQVR4AaSTBUIwDENpKjKgBMsFFkkdWFSMY4JlNHBMsVWsNDawWGwYhFVHlJ4RvVoWJGZhMhJ8rvpAJCkFPD8RDCJEhYrHhJzD7nCu3z6DjnNnQGBRjOTDEZDQ4w8MYZGRzAGwJAsJApBRjMTDEZAAw8ZQZDZGUTMZ'
});

// Create custom vehicle icons
const createVehicleIcon = (vehicleType, status) => {
  const colors = {
    available: '#2ecc71',
    on_patrol: '#3498db', 
    responding: '#e74c3c',
    out_of_service: '#95a5a6'
  };

  const iconHtml = `
    <div class="custom-vehicle-marker" style="background-color: ${colors[status] || '#7f8c8d'}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
        ${vehicleType === 'motorcycle' ? '<path d="M5 11h14c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1 .45-1 1s.45 1 1 1zm0 4h14c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1 .45-1 1s.45 1 1 1zm0 4h14c.55 0 1-.45 1-1s-.45-1-1-1H5c-.55 0-1 .45-1 1s.45 1 1 1z"/>' : 
          vehicleType === 'k9' ? '<path d="M12 2L13.09 8.26L22 9L17 14L18.18 23L12 19.77L5.82 23L7 14L2 9L10.91 8.26L12 2Z"/>' :
          '<path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>'}
      </svg>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

// Component to fit map bounds to show all vehicles
const FitBounds = ({ vehicles }) => {
  const map = useMap();
  
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const validVehicles = vehicles.filter(v => {
        try {
          const coords = JSON.parse(v.currentLocation);
          return coords && Array.isArray(coords) && coords.length === 2;
        } catch {
          return false;
        }
      });

      if (validVehicles.length > 0) {
        const bounds = L.latLngBounds(
          validVehicles.map(vehicle => {
            const [lng, lat] = JSON.parse(vehicle.currentLocation);
            return [lat, lng];
          })
        );
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [vehicles, map]);

  return null;
};

const RealWorldMap = ({ 
  vehicles = [], 
  cases = [], 
  showPatrolAreas = true, 
  showIncidents = true,
  onVehicleSelect,
  onCaseSelect,
  onAddVehicle 
}) => {
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [trackingMode, setTrackingMode] = useState('view');
  const [statusFilters, setStatusFilters] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [sharedAddresses, setSharedAddresses] = useState([]);
  const mapRef = useRef(null);

  // Default center - San Francisco for initial view
  const defaultCenter = [37.7749, -122.4194]; // San Francisco City Hall  
  const defaultZoom = 11;

  const handleVehicleClick = (vehicle) => {
    setSelectedVehicle(vehicle);
    if (onVehicleSelect) {
      onVehicleSelect(vehicle);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      available: '#2ecc71',
      on_patrol: '#3498db',
      responding: '#e74c3c', 
      out_of_service: '#95a5a6'
    };
    return colors[status] || '#7f8c8d';
  };

  const getStatusIcon = (status) => {
    const iconProps = { size: 16 };
    switch (status) {
      case 'available': return <CheckCircle {...iconProps} />;
      case 'on_patrol': return <Navigation {...iconProps} />;
      case 'responding': return <AlertTriangle {...iconProps} />;
      case 'out_of_service': return <XCircle {...iconProps} />;
      default: return <Clock {...iconProps} />;
    }
  };

  const getVehicleIcon = (vehicleType) => {
    const iconProps = { size: 20 };
    switch (vehicleType) {
      case 'motorcycle': return <Car {...iconProps} />;
      case 'k9': return <Shield {...iconProps} />;
      case 'special': return <Truck {...iconProps} />;
      default: return <Car {...iconProps} />;
    }
  };

  // Filter vehicles based on status filters
  const filteredVehicles = statusFilters.length === 0 
    ? vehicles 
    : vehicles.filter(vehicle => statusFilters.includes(vehicle.status));

  // Calculate status counts
  const statusCounts = vehicles.reduce((counts, vehicle) => {
    counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
    return counts;
  }, {});

  const handleStatusFilter = (status) => {
    setStatusFilters(prev => {
      if (prev.includes(status)) {
        return prev.filter(s => s !== status);
      } else {
        return [...prev, status];
      }
    });
  };

  const handleShareAddress = () => {
    setShowShareModal(true);
  };

  const handleAddressSubmit = async (locationData) => {
    try {
      // Find the vehicle ID from existing vehicles or use provided ID
      const vehicleResponse = await fetch(`/api/police-vehicles`);
      const allVehicles = await vehicleResponse.json();
      const targetVehicle = allVehicles.find(v => v.vehicleId === locationData.vehicleId);
      
      if (targetVehicle) {
        const response = await fetch(`/api/police-vehicles/${targetVehicle.id}/location`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: [locationData.coordinates?.lng || 0, locationData.coordinates?.lat || 0]
          })
        });

        if (response.ok) {
          setSharedAddresses(prev => [...prev, {
            ...locationData,
            id: Date.now()
          }]);
          
          setShowShareModal(false);
          alert(`Vehicle ${locationData.vehicleId} location shared successfully!`);
        }
      } else {
        alert('Vehicle not found!');
      }
    } catch (error) {
      console.error('Error sharing address:', error);
      alert('Failed to share vehicle location');
    }
  };

  const handleTrackVehicle = () => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log('Tracking position:', { latitude, longitude });
          // This could be used to continuously update vehicle position
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to track location. Please enable location services.');
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
      
      // Store watchId to clear it later if needed
      setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);
      }, 30000); // Stop tracking after 30 seconds
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  };

  return (
    <div className="real-world-map-container">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        style={{ height: '100%', width: '100%' }}
        ref={mapRef}
        eventHandlers={{
          click: (e) => {
            if (trackingMode === 'add') {
              // Dispatch custom event for vehicle tracking controls
              const event = new CustomEvent('mapClick', {
                detail: { lat: e.latlng.lat, lng: e.latlng.lng }
              });
              window.dispatchEvent(event);
            }
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Police Management System'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />
        
        <FitBounds vehicles={vehicles} />
        
        {/* Show incident markers */}
        {showIncidents && cases && cases.length > 0 && (
          <IncidentMarkers cases={cases} onCaseSelect={onCaseSelect} />
        )}
        
        {filteredVehicles.map((vehicle) => {
          let coordinates;
          try {
            coordinates = JSON.parse(vehicle.currentLocation);
            if (!Array.isArray(coordinates) || coordinates.length !== 2) {
              return null;
            }
          } catch {
            return null;
          }

          const [lng, lat] = coordinates;
          
          return (
            <div key={vehicle.id}>
              <Marker
                position={[lat, lng]}
                icon={createVehicleIcon(vehicle.vehicleType, vehicle.status)}
                eventHandlers={{
                  click: () => handleVehicleClick(vehicle)
                }}
              >
                <Popup>
                  <div style={{ minWidth: '200px' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>{vehicle.vehicleId}</h4>
                    <p><strong>Vehicle:</strong> {vehicle.make} {vehicle.model} ({vehicle.year})</p>
                    <p><strong>License:</strong> {vehicle.licensePlate}</p>
                    <p><strong>Type:</strong> {vehicle.vehicleType}</p>
                    <p style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <strong>Status:</strong>
                      <span style={{ color: getStatusColor(vehicle.status) }}>
                        {getStatusIcon(vehicle.status)}
                        {vehicle.status.replace('_', ' ')}
                      </span>
                    </p>
                    <p><strong>Last Update:</strong> {new Date(vehicle.lastUpdate).toLocaleString()}</p>
                    {vehicle.assignedOfficerId && (
                      <p><strong>Assigned Officer:</strong> Officer #{vehicle.assignedOfficerId}</p>
                    )}
                    <div style={{ marginTop: '10px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
                      <small><strong>Real-time GPS Tracking</strong></small>
                      <br />
                      <small>Lat: {coordinates[0].toFixed(4)}, Lng: {coordinates[1].toFixed(4)}</small>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Show patrol area as circle if coordinates exist */}
              {showPatrolAreas && vehicle.assignedArea && (
                <Circle
                  center={[lat, lng]}
                  radius={1000} // 1km radius - adjust as needed
                  pathOptions={{
                    color: getStatusColor(vehicle.status),
                    fillColor: getStatusColor(vehicle.status),
                    fillOpacity: 0.1,
                    weight: 2,
                    dashArray: '5, 5'
                  }}
                />
              )}
            </div>
          );
        })}
      </MapContainer>
      {/* Vehicle Tracking Controls */}
      <VehicleTrackingControls 
        onAddVehicle={onAddVehicle}
        onTrackingModeChange={setTrackingMode}
        trackingMode={trackingMode}
      />
      {/* Advanced Vehicle Status Dashboard */}
      <VehicleStatusDashboard 
        vehicles={vehicles}
        selectedVehicle={selectedVehicle}
        onVehicleSelect={handleVehicleClick}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        getVehicleIcon={getVehicleIcon}
      />
      {/* Selected Vehicle Details */}
      {selectedVehicle && (
        <div className="vehicle-details-popup">
          <div className="popup-header">
            <h4 style={{ margin: 0 }}>{selectedVehicle.vehicleId}</h4>
            <button 
              className="close-btn"
              onClick={() => setSelectedVehicle(null)}
            >
              ×
            </button>
          </div>
          <div className="details-content">
            <div className="detail-row">
              <span className="label">Vehicle:</span>
              <span>{selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})</span>
            </div>
            <div className="detail-row">
              <span className="label">License:</span>
              <span>{selectedVehicle.licensePlate}</span>
            </div>
            <div className="detail-row">
              <span className="label">Type:</span>
              <span>{selectedVehicle.vehicleType}</span>
            </div>
            <div className="detail-row">
              <span className="label">Status:</span>
              <span 
                className="status-text"
                style={{ color: getStatusColor(selectedVehicle.status) }}
              >
                {getStatusIcon(selectedVehicle.status)}
                {selectedVehicle.status.replace('_', ' ')}
              </span>
            </div>
            <div className="detail-row">
              <span className="label">Last Update:</span>
              <span>{new Date(selectedVehicle.lastUpdate).toLocaleString()}</span>
            </div>
            {selectedVehicle.assignedOfficerId && (
              <div className="detail-row">
                <span className="label">Assigned Officer:</span>
                <span>Officer #{selectedVehicle.assignedOfficerId}</span>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Enhanced Interactive Legend */}
      <InteractiveLegend 
        onStatusFilter={handleStatusFilter}
        statusCounts={statusCounts}
        activeFilters={statusFilters}
        onShareAddress={handleShareAddress}
        onTrackVehicle={handleTrackVehicle}
      />
      {/* Address Share Modal */}
      <AddressShareModal 
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onAddressSubmit={handleAddressSubmit}
      />
    </div>
  );
};

export default RealWorldMap;