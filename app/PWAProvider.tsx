"use client";
import React, { useEffect, useRef } from "react";

const PWAProvider = ({ children }: { children: React.ReactNode }) => {
    const registeredRef = useRef(false);

    useEffect(() => {
        if (typeof window !== "undefined" && "serviceWorker" in navigator && !registeredRef.current) {
            const registerServiceWorker = async () => {
                console.log("Registering Service Worker");
                try {
                    const registration = await navigator.serviceWorker.register("/service-worker.js");
                    console.log("Service Worker registered with scope:", registration.scope);

                    registration.addEventListener("updatefound", () => {
                        const newWorker = registration.installing;
                        console.log("Service Worker update found!");

                        newWorker?.addEventListener("statechange", () => {
                            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                // New service worker available
                                console.log("New content is available; please refresh.");
                                if (confirm('New version available! Refresh to update?')) {
                                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                                    window.location.reload();
                                }
                            } else if (newWorker.state === "activated") {
                                console.log("New Service Worker activated.");
                            }
                        });
                    });

                    registeredRef.current = true;
                } catch (error) {
                    console.error("Service Worker registration failed:", error);
                }
            };

            registerServiceWorker();

            let refreshing = false;
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (!refreshing) {
                    window.location.reload();
                    refreshing = true;
                }
            });
        }
    }, []);

    return <>{children}</>;
};

export default PWAProvider;
