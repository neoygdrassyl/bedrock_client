import React, { useState } from 'react';
import { LoadScript, GoogleMap, MarkerF, InfoWindowF } from '@react-google-maps/api';

// ID Project for API Key for Google Maps:  curaduria-1-bucaramanga
// API key is provided via VITE_GOOGLE_MAPS_KEY (see .env.example)
// Google Cloud Platform
// Coordinates 7.123617514589584, -73.11354332976984

const containerStyle = {
    height: '250px',
    width: '100%'
};

const center = { lat: 7.123617514589584, lng: -73.11354332976984 };

function Map() {
    const [infoOpen, setInfoOpen] = useState(true);

    return (
        <div style={{ width: '100%' }}>
            <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_KEY}>
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={18}
                >
                    <MarkerF
                        position={center}
                        onClick={() => setInfoOpen(true)}
                    >
                        {infoOpen && (
                            <InfoWindowF
                                position={center}
                                onCloseClick={() => setInfoOpen(false)}
                            >
                                <span><strong>Curaduria Urbana N° 1 de Bucaramanga</strong></span>
                            </InfoWindowF>
                        )}
                    </MarkerF>
                </GoogleMap>
            </LoadScript>
        </div>
    );
}

export default Map;
