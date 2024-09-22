"use client";
import * as L from "leaflet";
import {LatLng} from "leaflet";
import useGeoLocation from "@/src/core/Map/utils/useGeoLocation";
import {useMap} from "react-leaflet";
import {useEffect} from "react";


let marker: null | L.Marker = null;

const MapContext = () => {

    const map = useMap()
    const response = useGeoLocation();
    map.locate({watch: true, setView: true, enableHighAccuracy: true, maxZoom: 23});
    console.log("response", response);

    useEffect(() => {
        const latlng = new LatLng(response.latitude, response.longitude);
        if(marker) {
            marker.setLatLng(latlng)
        } else {
            if(response.latitude && response.longitude) {
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