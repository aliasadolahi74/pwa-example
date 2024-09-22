"use client";
import dynamic from "next/dynamic";

import useGeoLocation from "@/src/core/Map/utils/useGeoLocation";
import {useEffect, useRef, useState} from "react";
const Map = dynamic(() => import("@/src/core/Map"), {ssr: false});
import measureDistance from "@/src/core/Map/utils/measureDistance";
import {toast} from "react-toastify";

export default function Home() {
    const response = useGeoLocation();
    const [started, setStarted] = useState(false);
    const [points, setPoints] = useState<{ latitude: number; longitude: number; altitude: number | null; }[]>([]);
    const interval = useRef<NodeJS.Timeout>();

    const handleClickStart = () => {
        if(response.accuracy && response.accuracy < 20) {
            toast("Low Accuracy");
        } else {
            setPoints([{latitude: response.latitude, longitude: response.longitude, altitude: response.altitude}]);
            setStarted(true);
        }
    }

    useEffect(() => {
        interval.current = setInterval(() => {
            if (started) {
                const draft = [...points];
                const currentPoint = {
                    latitude: response.latitude,
                    longitude: response.longitude,
                    altitude: response.altitude || null
                };
                if (points.length > 0) {
                    const startingPoint = points[0];
                    const lastPoint = points[points.length - 1];
                    const distanceToStartingPoint = measureDistance(startingPoint, currentPoint);
                    const distanceToLastPoint = measureDistance(lastPoint, currentPoint);
                    if (distanceToStartingPoint < 3 && points.length > 2) {
                        setStarted(false);
                    }
                    if (distanceToLastPoint >= 3) {
                        draft.push(currentPoint);
                        setPoints(draft)
                    }
                } else {
                    draft.push(currentPoint);
                    setPoints(draft)
                }

            }
        }, 3000);

        return () => {
            clearInterval(interval.current)
        };
    }, [started, points, response]);


    return (
        <div className="flex flex-col min-h-screen w-full">
            <div className="p-4 flex flex-grow w-full">
                <div className="flex flex-col items-center w-full bg-white">
                    <div className="h-full w-full flex flex-col">
                        <div className="border-b border-b-gray-500 h-[70%] w-full relative mb-4"><Map/></div>
                        <div className="w-full top-0 right-0 text-black">
                            <div><span>latitude:</span> <span>{response.latitude}</span></div>
                            <div><span>longitude:</span> <span>{response.longitude}</span></div>
                            <div><span>altitude:</span> <span>{response.altitude}</span></div>
                            <div><span>accuracy:</span> <span>{response.accuracy}</span></div>
                        </div>
                    </div>

                    <hr/>


                    {started ? <button onClick={() => setStarted(false)}
                                       className="bg-red-500 text-white px-4 rounded-lg py-2">Stop</button> :
                        <button onClick={handleClickStart}
                                className="bg-teal-500 text-white px-4 rounded-lg py-2">Start</button>}


                    <div className="flex flex-col items-center mt-4 w-full">
                        <table className="table-auto w-full">
                            <thead>
                            <tr>
                                <th>Latitude</th>
                                <th>Longitude</th>
                            </tr>
                            </thead>
                            <tbody>
                            {points.map((point, i) => (
                                <tr key={`${i}-${Math.random()}`}>
                                    <td>{point.latitude}</td>
                                    <td>{point.longitude}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
