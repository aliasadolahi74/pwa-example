"use client";
import React from 'react';
import Link from "next/link";

const OfflinePage = () => {
    return (
        <div className="bg-gray-500">
            <h1>
                You are offline --- 1!
                <Link href="/offline2">Link</Link>
            </h1>

            <button className="flex flex-col items-center bg-teal-800 rounded-full">Click Here</button>
        </div>

    );
};

export default OfflinePage;