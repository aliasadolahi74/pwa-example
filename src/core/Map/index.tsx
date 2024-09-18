"use client"
import "leaflet/dist/leaflet.css";
import React from 'react';
import {MapContainer, TileLayer} from "react-leaflet";
import MapContext from "@/src/core/Map/MapContext";

const Map = () => {

    return (
        <MapContainer minZoom={5}  style={{position: "absolute", inset: 0}} center={[32.4279, 53.6880]} zoom={5}>
            <MapContext />
            <TileLayer
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
                attribution=""
                maxNativeZoom={22}
                maxZoom={22}
                url="https://{s}.google.com/vt?lyrs=s,h&x={x}&y={y}&z={z}"
            />
        </MapContainer>
    );
};

export default Map;