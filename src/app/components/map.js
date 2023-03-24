import React, { Component } from 'react';
import { withGoogleMap, GoogleMap, Marker, InfoWindow } from 'react-google-maps';

// ID Project for API Key for Google Maps:  curaduria-1-bucaramanga
// API Key; AIzaSyAx41SbPzO1qUp7uX3oNCbxQNNJk19E-Mc
// Google Cloud Platform 
// Coordinates 7.123617514589584, -73.11354332976984

class Map extends Component {
    render() {
        const coords = { lat: 7.123617514589584, lng: -73.11354332976984 }
        const GoogleMapAddress = withGoogleMap(props => (
            <GoogleMap
                defaultCenter={coords}
                defaultZoom={18}
            >
                <Marker position={coords}>
                    <InfoWindow>
                        <span><strong>Curaduria Urbana N° 1 de Bucaramanga</strong></span>
                    </ InfoWindow >
                </ Marker >
            </GoogleMap>
        )); return (
            <div style={{width: '100%' }}>
                <GoogleMapAddress
                    containerElement={<div style={{ height: `250px`, width: '100%' }} />}
                    mapElement={<div style={{ height: `250px`, width: '100%' }} />}
                />
            </div>
        );
    }
}; export default Map;