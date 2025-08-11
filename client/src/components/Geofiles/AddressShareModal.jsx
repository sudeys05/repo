import React, { useState, useEffect } from 'react';
import { Share2, MapPin, Copy, CheckCircle, X, Navigation, Clock } from 'lucide-react';
import './MapStyles.css';

const AddressShareModal = ({ isOpen, onClose, onAddressSubmit }) => {
  const [address, setAddress] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [shareMethod, setShareMethod] = useState('text');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);

  const getCurrentLocation = () => {
    setIsGettingLocation(true);
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });
          
          // Reverse geocoding to get address
          fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`)
            .then(response => response.json())
            .then(data => {
              const formattedAddress = `${data.locality}, ${data.principalSubdivision}, ${data.countryName}`;
              setAddress(formattedAddress);
              setIsGettingLocation(false);
            })
            .catch(() => {
              setAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
              setIsGettingLocation(false);
            });
        },
        (error) => {
          console.error('Geolocation error:', error);
          setIsGettingLocation(false);
          alert('Unable to get current location. Please enter address manually.');
        }
      );
    } else {
      setIsGettingLocation(false);
      alert('Geolocation is not supported by this browser.');
    }
  };

  const generateShareUrl = () => {
    if (address && vehicleId) {
      const baseUrl = window.location.origin;
      const params = new URLSearchParams({
        vehicle: vehicleId,
        address: address,
        timestamp: new Date().toISOString()
      });
      const url = `${baseUrl}/track?${params.toString()}`;
      setShareUrl(url);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (address && vehicleId) {
      const locationData = {
        vehicleId,
        address,
        coordinates: currentLocation,
        shareMethod,
        timestamp: new Date().toISOString()
      };
      
      if (onAddressSubmit) {
        onAddressSubmit(locationData);
      }
      
      // Generate share URL
      generateShareUrl();
    }
  };

  useEffect(() => {
    if (address && vehicleId) {
      generateShareUrl();
    }
  }, [address, vehicleId]);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px'
        }}>
          <h3 style={{
            margin: 0,
            color: '#2c3e50',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Share2 size={20} />
            Share Vehicle Location
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#666',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 'bold',
              color: '#333',
              fontSize: '14px'
            }}>
              Vehicle ID *
            </label>
            <input
              type="text"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              placeholder="e.g., PATROL-001"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 'bold',
              color: '#333',
              fontSize: '14px'
            }}>
              Current Location *
            </label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address or use current location"
                style={{
                  flex: 1,
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
                required
              />
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                style={{
                  padding: '10px 12px',
                  border: '1px solid #3498db',
                  borderRadius: '6px',
                  background: isGettingLocation ? '#bdc3c7' : '#3498db',
                  color: 'white',
                  cursor: isGettingLocation ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isGettingLocation ? <Clock size={16} /> : <Navigation size={16} />}
                {isGettingLocation ? 'Getting...' : 'Current'}
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: 'bold',
              color: '#333',
              fontSize: '14px'
            }}>
              Share Method
            </label>
            <select
              value={shareMethod}
              onChange={(e) => setShareMethod(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
            >
              <option value="text">Text Message</option>
              <option value="email">Email</option>
              <option value="url">Share URL</option>
              <option value="qr">QR Code</option>
            </select>
          </div>

          {shareUrl && (
            <div style={{
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <MapPin size={16} color="#3498db" />
                <span style={{ fontWeight: 'bold', color: '#2c3e50', fontSize: '14px' }}>
                  Share URL Generated
                </span>
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    fontSize: '12px',
                    backgroundColor: 'white'
                  }}
                />
                <button
                  type="button"
                  onClick={copyToClipboard}
                  style={{
                    padding: '8px 12px',
                    border: 'none',
                    borderRadius: '4px',
                    background: copied ? '#2ecc71' : '#3498db',
                    color: 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s'
                  }}
                >
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                background: 'white',
                color: '#666',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                background: '#3498db',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={16} />
              Share Location
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressShareModal;