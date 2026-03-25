/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  output: "export",
  // GitHub Pages のリポジトリ名に合わせる（ユーザーサイト <username>.github.io の場合は "" にする）
  basePath: isProd ? "/LinearAlgebra" : "",
  assetPrefix: isProd ? "/LinearAlgebra/" : "",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
