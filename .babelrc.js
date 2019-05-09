module.exports = {
  presets: [
    "@babel/env",
    "@babel/react",
    "./preset-typescript-updated"
  ],
  plugins: [
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread"
  ]
}