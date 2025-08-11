import React, { useState } from 'react';
import { Plus, MapPin, Navigation, Target, Settings } from 'lucide-react';
import './MapStyles.css';

const VehicleTrackingControls = ({ onAddVehicle, onTrackingModeChange, trackingMode = 'view' }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicleId: '',
    licensePlate: '',
    vehicleType: 'patrol',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'available'
  });

  const [clickLocation, setClickLocation] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newVehicle.vehicleId || !newVehicle.licensePlate || !clickLocation) {
      alert('Please fill all required fields and click on the map to set location');
      return;
    }

    const vehicleData = {
      ...newVehicle,
      currentLocation: JSON.stringify([clickLocation.lng, clickLocation.lat]),
      assignedArea: JSON.stringify([]), // Will be set later
      lastUpdate: new Date(),
      assignedOfficerId: null
    };

    if (onAddVehicle) {
      onAddVehicle(vehicleData);
    }

    // Reset form
    setNewVehicle({
      vehicleId: '',
      licensePlate: '',
      vehicleType: 'patrol',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      status: 'available'
    });
    setClickLocation(null);
    setShowAddForm(false);
    onTrackingModeChange('view');
  };

  const handleModeChange = (mode) => {
    if (onTrackingModeChange) {
      onTrackingModeChange(mode);
    }
    if (mode === 'add') {
      setShowAddForm(true);
    } else {
      setShowAddForm(false);
    }
  };

  // Listen for map clicks when in add mode
  React.useEffect(() => {
    if (trackingMode === 'add') {
      const handleMapClick = (e) => {
        if (e.detail && e.detail.lat && e.detail.lng) {
          setClickLocation({ lat: e.detail.lat, lng: e.detail.lng });
        }
      };

      window.addEventListener('mapClick', handleMapClick);
      return () => window.removeEventListener('mapClick', handleMapClick);
    }
  }, [trackingMode]);

  return (
    <div className="advanced-vehicle-controls">
      <div className="controls-header">
        <div className="header-info">
          <Settings size={18} className="header-icon" />
          <div>
            <h4 className="controls-title">Vehicle Command Center</h4>
            <span className="controls-subtitle">Real-time Fleet Management</span>
          </div>
        </div>
        <div className="mode-indicator">
          <span className="mode-badge mode-view text-[#a2ab65e3]">
            {trackingMode === 'view' && <Navigation size={12} />}
            {trackingMode === 'add' && <Plus size={12} />}
            {trackingMode === 'track' && <Target size={12} />}
            {trackingMode.charAt(0).toUpperCase() + trackingMode.slice(1)} Mode
          </span>
        </div>
      </div>
      <div className="control-tabs">
        <button 
          className={`control-tab ${trackingMode === 'view' ? 'active' : ''}`}
          onClick={() => handleModeChange('view')}
        >
          <Navigation size={16} />
          <span>Monitor</span>
        </button>
        
        <button 
          className={`control-tab ${trackingMode === 'add' ? 'active' : ''}`}
          onClick={() => handleModeChange('add')}
        >
          <Plus size={16} />
          <span>Deploy</span>
        </button>
        
        <button 
          className={`control-tab ${trackingMode === 'track' ? 'active' : ''}`}
          onClick={() => handleModeChange('track')}
        >
          <Target size={16} />
          <span>Track</span>
        </button>
      </div>
      {showAddForm && (
        <div className="deployment-form">
          <div className="form-header">
            <h5 className="form-title">Deploy New Vehicle</h5>
            <div className="location-status">
              {clickLocation ? (
                <div className="location-confirmed">
                  <MapPin size={14} />
                  <span>GPS: {clickLocation.lat.toFixed(4)}, {clickLocation.lng.toFixed(4)}</span>
                </div>
              ) : (
                <div className="location-pending">
                  <MapPin size={14} />
                  <span>Select deployment location on map</span>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="vehicle-form">
            <div className="form-section">
              <label className="form-label">Vehicle Identification</label>
              <div className="input-group">
                <input
                  type="text"
                  placeholder="Vehicle ID (e.g., UNIT-001)"
                  value={newVehicle.vehicleId}
                  onChange={(e) => setNewVehicle({...newVehicle, vehicleId: e.target.value})}
                  className="form-input"
                  required
                />
                <input
                  type="text"
                  placeholder="License Plate"
                  value={newVehicle.licensePlate}
                  onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                  className="form-input"
                  required
                />
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Vehicle Configuration</label>
              <div className="select-group">
                <select
                  value={newVehicle.vehicleType}
                  onChange={(e) => setNewVehicle({...newVehicle, vehicleType: e.target.value})}
                  className="form-select"
                >
                  <option value="patrol">🚗 Patrol Car</option>
                  <option value="motorcycle">🏍️ Motorcycle</option>
                  <option value="k9">🐕 K9 Unit</option>
                  <option value="special">🚙 Special Operations</option>
                </select>
                <select
                  value={newVehicle.status}
                  onChange={(e) => setNewVehicle({...newVehicle, status: e.target.value})}
                  className="form-select"
                >
                  <option value="available">✅ Available</option>
                  <option value="on_patrol">🔄 On Patrol</option>
                  <option value="responding">🚨 Responding</option>
                  <option value="out_of_service">⚠️ Out of Service</option>
                </select>
              </div>
            </div>

            <div className="form-section">
              <label className="form-label">Vehicle Specifications</label>
              <div className="spec-group">
                <input
                  type="text"
                  placeholder="Make"
                  value={newVehicle.make}
                  onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                  className="form-input spec-input"
                />
                <input
                  type="text"
                  placeholder="Model"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                  className="form-input spec-input"
                />
                <input
                  type="number"
                  placeholder="Year"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({...newVehicle, year: parseInt(e.target.value)})}
                  className="form-input spec-input"
                  min="1990"
                  max={new Date().getFullYear() + 1}
                />
              </div>
            </div>
          
            <div className="form-actions">
              <button 
                type="submit" 
                className="deploy-btn"
                disabled={!clickLocation || !newVehicle.vehicleId || !newVehicle.licensePlate}
              >
                <Plus size={16} />
                Deploy Vehicle
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false);
                  handleModeChange('view');
                }}
                className="cancel-btn"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default VehicleTrackingControls;