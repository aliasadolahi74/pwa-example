import type {Metadata} from "next";
import {Vazirmatn} from "next/font/google";
import "./globals.css";
import PWAProvider from "@/app/PWAProvider";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const vazirmatn = Vazirmatn({subsets: ["arabic"]})

export const metadata: Metadata = {
    title: "Polygon Draw",
};

export default function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    return (
        <html lang="en">
        <body
            className={`${vazirmatn.className} antialiased`}
        >
        <PWAProvider>
            <ToastContainer />
            {children}
        </PWAProvider>
        </body>
        </html>
    );
}
