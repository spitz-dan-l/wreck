module.exports = {
  presets: [
    "@babel/env",
    // "@babel/react",
    ["./preset-typescript-updated", { jsxPragma: 'createElement' } ]
  ],
  plugins: [
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread"
  ]
}