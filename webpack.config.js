const config = {
  plugins: [
    new webpack.ProvidePlugin({
      PIXI: "pixi.js",
    }),
  ],
};
module.exports = config;
