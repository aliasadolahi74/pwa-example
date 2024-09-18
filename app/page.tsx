"use client";
// import dynamic from "next/dynamic";

// const Map = dynamic(() => import("@/src/core/Map"), {ssr: false});
import useGeoLocation from "@/src/core/Map/utils/useGeoLocation";

export default function Home() {
    const response = useGeoLocation();
    console.log("response", response)


    return (
        <div className="flex flex-col min-h-screen w-full">
            <div className="p-4 flex flex-grow w-full">
                <div className="flex flex-col items-center w-full bg-white">
                    <div className="h-full w-full flex flex-col">
                        {/*<div className="border-b border-b-gray-500 h-[70%] w-full relative"><Map/></div>*/}
                        <div className="w-full top-0 right-0 text-black">
                            <div><span>latitude:</span> <span>{response.latitude}</span></div>
                            <div><span>longitude:</span> <span>{response.longitude}</span></div>
                            <div><span>altitude:</span> <span>{response.altitude}</span></div>
                            <div><span>accuracy:</span> <span>{response.accuracy}</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
