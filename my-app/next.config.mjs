/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, context) => {
    if (config.plugins) {
      config.plugins.push(
        new context.webpack.IgnorePlugin({
          resourceRegExp: /^(lokijs|pino-pretty|encoding)$/,
        }),
      );
    }
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'shdw-drive.genesysgo.net',
      },
    ],
  },
  experimental:{
    serverComponentsExternalPackages: ["@coral-xyz/anchor"]
  },
};;

export default nextConfig;
