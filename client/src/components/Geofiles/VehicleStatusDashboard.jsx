import React, { useState } from 'react';
import { 
  Radio, 
  ChevronDown, 
  ChevronUp, 
  Activity,
  Eye,
  EyeOff,
  Filter
} from 'lucide-react';

const VehicleStatusDashboard = ({ 
  vehicles = [], 
  selectedVehicle,
  onVehicleSelect,
  getStatusColor,
  getStatusIcon,
  getVehicleIcon 
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter vehicles by status
  const filteredVehicles = statusFilter === 'all' 
    ? vehicles 
    : vehicles.filter(vehicle => vehicle.status === statusFilter);

  // Get status counts for statistics
  const statusCounts = vehicles.reduce((counts, vehicle) => {
    counts[vehicle.status] = (counts[vehicle.status] || 0) + 1;
    counts.total = (counts.total || 0) + 1;
    return counts;
  }, {});

  const statusOptions = [
    { value: 'all', label: 'All Units', count: statusCounts.total || 0 },
    { value: 'available', label: 'Available', count: statusCounts.available || 0 },
    { value: 'on_patrol', label: 'On Patrol', count: statusCounts.on_patrol || 0 },
    { value: 'responding', label: 'Responding', count: statusCounts.responding || 0 },
    { value: 'out_of_service', label: 'Out of Service', count: statusCounts.out_of_service || 0 },
  ];

  return (
    <div className="vehicle-status-dashboard">
      {/* Dashboard Header */}
      <div className="dashboard-header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="header-left">
          <div className="dashboard-icon">
            <Radio size={18} />
            <div className="pulse-ring"></div>
          </div>
          <div className="header-title">
            <h3>Fleet Command</h3>
            <span className="unit-count">{vehicles.length} Active Units</span>
          </div>
        </div>
        <div className="header-controls">
          <div className="quick-stats">
            <div className="stat-item active">
              <span className="stat-value">{statusCounts.available || 0}</span>
              <span className="stat-label">Ready</span>
            </div>
            <div className="stat-item patrol">
              <span className="stat-value">{statusCounts.on_patrol || 0}</span>
              <span className="stat-label">Patrol</span>
            </div>
            <div className="stat-item emergency">
              <span className="stat-value">{statusCounts.responding || 0}</span>
              <span className="stat-label">Alert</span>
            </div>
          </div>
          <button className="collapse-btn">
            {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>
      {/* Dashboard Content */}
      {!isCollapsed && (
        <div className="dashboard-content">
          {/* Status Filter */}
          <div className="status-filter">
            <Filter size={14} />
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </div>

          {/* Vehicle List */}
          <div className="vehicle-list">
            {filteredVehicles.map((vehicle) => {
              const isSelected = selectedVehicle?.id === vehicle.id;
              return (
                <div 
                  key={vehicle.id}
                  className={`vehicle-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => onVehicleSelect(vehicle)}
                >
                  <div className="card-left">
                    <div 
                      className="vehicle-icon" 
                      style={{ color: getStatusColor(vehicle.status) }}
                    >
                      {getVehicleIcon(vehicle.vehicleType)}
                    </div>
                    <div className="vehicle-info">
                      <div className="vehicle-id">{vehicle.vehicleId}</div>
                      <div className="vehicle-model">
                        {vehicle.make} {vehicle.model}
                      </div>
                      <div className="last-update">
                        {new Date(vehicle.lastUpdate).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div className="card-right">
                    <div 
                      className="status-indicator"
                      style={{ backgroundColor: getStatusColor(vehicle.status) }}
                    >
                      {getStatusIcon(vehicle.status)}
                    </div>
                    <div className="status-text text-[#477078d4]">
                      {vehicle.status.replace('_', ' ').toUpperCase()}
                    </div>
                    <div className="action-indicator">
                      {isSelected ? <EyeOff size={12} /> : <Eye size={12} />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="empty-state">
              <Activity size={24} />
              <p>No vehicles match the current filter</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VehicleStatusDashboard;