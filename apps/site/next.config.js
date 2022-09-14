/** @type {import('next').NextConfig} */

const withTM = require("next-transpile-modules")([
    "@excalibur/wallet",
    "@excalibur/wallet-ui",
    "@excalibur/drm",
    "@excalibur/solana-provider",
    "@excalibur/config",
]);

module.exports = withTM({
    reactStrictMode: true,
    swcMinify: true,
    async redirects() {
        return [
            {
                source: "/about",
                destination: "/",
                permanent: true,
            },
        ];
    },
    experimental: {
        images: {
            allowFutureImage: true,
        },
    },
    webpack5: true,
    webpack: (config) => {
        config.resolve.fallback = {
            fs: false,
        };

        return config;
    },
});
