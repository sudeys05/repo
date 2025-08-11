import React from 'react';
import { Marker, Popup, Circle } from 'react-leaflet';
import { AlertTriangle, FileText, MapPin, Calendar, User } from 'lucide-react';
import L from 'leaflet';
import './MapStyles.css';

// Create custom incident icons based on priority and type
const createIncidentIcon = (priority, type) => {
  const colors = {
    Critical: '#e74c3c',
    High: '#f39c12', 
    Medium: '#3498db',
    Low: '#2ecc71'
  };

  const typeIcons = {
    Burglary: '🏠',
    Traffic: '🚗',
    Assault: '⚠️',
    Other: '📍'
  };

  const iconHtml = `
    <div class="incident-marker" style="background-color: ${colors[priority] || '#95a5a6'}">
      <div class="incident-icon">${typeIcons[type] || '📍'}</div>
    </div>
  `;

  return L.divIcon({
    html: iconHtml,
    className: 'custom-incident-marker',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

const IncidentMarkers = ({ cases = [], onCaseSelect }) => {
  // Convert case locations to coordinates (simplified geocoding)
  const locationToCoords = (location) => {
    const locationMap = {
      'Main Street Electronics Store, Downtown': [37.7849, -122.4094],
      'Highway 101 & Oak Avenue Intersection': [37.7694, -122.3894],
      'Last seen at Downtown Office Building': [37.7849, -122.4194],
      'Downtown SF': [37.7849, -122.4094],
      'Mission District': [37.7594, -122.4194],
      'SOMA': [37.7749, -122.4034]
    };
    
    return locationMap[location] || [37.7749, -122.4194]; // Default to SF
  };

  const handleCaseClick = (caseItem) => {
    if (onCaseSelect) {
      onCaseSelect(caseItem);
    }
  };

  return (
    <div>
      {cases.map((caseItem) => {
        const coordinates = locationToCoords(caseItem.location);
        const [lat, lng] = coordinates;
        
        return (
          <div key={`case-${caseItem.id}`}>
            <Marker
              position={[lat, lng]}
              icon={createIncidentIcon(caseItem.priority, caseItem.type)}
              eventHandlers={{
                click: () => handleCaseClick(caseItem)
              }}
            >
              <Popup>
                <div style={{ minWidth: '250px' }}>
                  <h4 style={{ margin: '0 0 10px 0', color: '#2c3e50' }}>
                    <FileText size={18} style={{ marginRight: '8px', verticalAlign: 'top' }} />
                    {caseItem.caseNumber}
                  </h4>
                  
                  <div style={{ marginBottom: '8px' }}>
                    <strong>{caseItem.title}</strong>
                  </div>
                  
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>
                    {caseItem.description}
                  </div>

                  <div style={{ display: 'grid', gap: '6px', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <AlertTriangle size={14} />
                      <span><strong>Priority:</strong> 
                        <span style={{ 
                          color: caseItem.priority === 'Critical' ? '#e74c3c' : 
                                caseItem.priority === 'High' ? '#f39c12' :
                                caseItem.priority === 'Medium' ? '#3498db' : '#2ecc71',
                          fontWeight: 'bold',
                          marginLeft: '4px'
                        }}>
                          {caseItem.priority}
                        </span>
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <MapPin size={14} />
                      <span><strong>Location:</strong> {caseItem.location}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={14} />
                      <span><strong>Incident Date:</strong> {new Date(caseItem.incidentDate).toLocaleString()}</span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User size={14} />
                      <span><strong>Assigned:</strong> {caseItem.assignedOfficer || 'Unassigned'}</span>
                    </div>
                    
                    <div style={{ 
                      marginTop: '8px', 
                      padding: '4px 8px', 
                      backgroundColor: caseItem.status === 'Open' ? '#e8f5e8' : '#fff3cd',
                      borderRadius: '4px',
                      textAlign: 'center'
                    }}>
                      <small><strong>Status:</strong> {caseItem.status}</small>
                    </div>
                  </div>

                  <div style={{ 
                    marginTop: '12px', 
                    borderTop: '1px solid #eee', 
                    paddingTop: '8px',
                    textAlign: 'center'
                  }}>
                    <small style={{ color: '#666' }}>
                      Click for full case details
                    </small>
                  </div>
                </div>
              </Popup>
            </Marker>

            {/* Add incident area circle */}
            <Circle
              center={[lat, lng]}
              radius={200} // 200m radius around incident
              pathOptions={{
                color: caseItem.priority === 'Critical' ? '#e74c3c' : 
                       caseItem.priority === 'High' ? '#f39c12' :
                       caseItem.priority === 'Medium' ? '#3498db' : '#2ecc71',
                fillColor: caseItem.priority === 'Critical' ? '#e74c3c' : 
                          caseItem.priority === 'High' ? '#f39c12' :
                          caseItem.priority === 'Medium' ? '#3498db' : '#2ecc71',
                fillOpacity: 0.05,
                weight: 1,
                opacity: 0.3,
                dashArray: '3, 3'
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default IncidentMarkers;