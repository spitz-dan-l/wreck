module.exports = {
  presets: [
    "@babel/env",
    "@babel/react"
  ],
  plugins: [
    "@babel/proposal-class-properties",
    "@babel/proposal-object-rest-spread"
  ],
  overrides: [
        {
          // Only set 'test' if explicitly requested, since it requires that
          // Babel is being called`
          test: /\.ts$/,
          plugins: [["@babel/plugin-transform-typescript", { "jsxPragma": "react" }]],
        },
        {
          // Only set 'test' if explicitly requested, since it requires that
          // Babel is being called`
          test: /\.tsx$/,
          plugins: [["@babel/plugin-transform-typescript", { "jsxPragma": "react", "isTSX": true }]],
        }
    ]
}