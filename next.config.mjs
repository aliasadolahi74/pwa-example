// next-pwa.config.js (or in next.config.js if preferred)
import {InjectManifest} from "workbox-webpack-plugin";

const withPWA = (nextConfig = {}) => {
    return {
        ...nextConfig,
        webpack: (config, { isServer }) => {
            if (!isServer) {
                config.output.globalObject = 'self';
            }
            return config;
        },
    };
};

export default withPWA({
    reactStrictMode: true, // Add other Next.js config here
});
