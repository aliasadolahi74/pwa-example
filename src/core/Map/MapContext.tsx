"use client";
import * as L from "leaflet";
import {LatLng} from "leaflet";
import useGeoLocation from "@/src/core/Map/utils/useGeoLocation";
import {useMap} from "react-leaflet";
import {useEffect} from "react";


let marker: null | L.Marker = null;

const MapContext = () => {

    const map = useMap()
    const response = useGeoLocation(1000);
    map.locate({enableHighAccuracy: true, maxZoom: 23});

    useEffect(() => {
        const latlng = new LatLng(response.latitude, response.longitude);
        map.setView(latlng)
        if (marker) {
            marker.setLatLng(latlng)
        } else {
            if (response.latitude && response.longitude) {
                marker = new L.Marker(latlng, {
                    icon: L.icon({
                        iconSize: [20, 20],
                        iconUrl: "/assets/images/marker.png",
                    })
                });
                marker.addTo(map);
            }
        }

    }, [response.latitude, response.longitude]);


    return <></>;
};

export default MapContext;