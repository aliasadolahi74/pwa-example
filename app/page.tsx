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
    const [distanceToStart, setDistanceToStart] = useState<number>(0);
    const [distanceToLast, setDistanceToLast] = useState<number>(0);


    const setData = (callback?: () => void) => {
        if(response.accuracy) {
            if(response.accuracy < 20) {
                callback ? callback() : undefined;
            } else {
                toast("Low Accuracy", {type: "error", theme: "colored"});
            }
        } else {
            toast("No Accuracy attribute found", {type: "error", theme: "colored"});
        }
    }

    const handleClickStart = () => {
        setData(() => {
            setPoints([{latitude: response.latitude, longitude: response.longitude, altitude: response.altitude}]);
            setStarted(true)
        })
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
                    setDistanceToLast(distanceToLastPoint);
                    setDistanceToStart(distanceToStartingPoint);
                    if (distanceToStartingPoint < 1 && points.length > 2) {
                        toast("Do you want to finish it?", {type: "info", theme: "colored"});
                    }
                    if (distanceToLastPoint >= 3) {
                        setData(() => {
                            draft.push(currentPoint);
                            setPoints(draft)
                        })
                    }
                } else {
                    setData(() => {
                        draft.push(currentPoint);
                        setPoints(draft)
                    })
                }

            }
        }, 1000);

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
                            <div><span>distance to start:</span> <span>{distanceToStart}</span></div>
                            <div><span>distance to last:</span> <span>{distanceToLast}</span></div>
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
