const declare = require("@babel/helper-plugin-utils").declare;
const transformTypeScript = require("@babel/plugin-transform-typescript");

module.exports = declare(
  (api, { jsxPragma, allExtensions = false, isTSX = false }) => {
    api.assertVersion(7);

    if (typeof allExtensions !== "boolean") {
      throw new Error(".allExtensions must be a boolean, or undefined");
    }
    if (typeof isTSX !== "boolean") {
      throw new Error(".isTSX must be a boolean, or undefined");
    }

    if (isTSX && !allExtensions) {
      throw new Error("isTSX:true requires allExtensions:true");
    }

    return {
      overrides: allExtensions
        ? [
            {
              plugins: [[transformTypeScript, { jsxPragma, isTSX }]],
            },
          ]
        : [
            {
              // Only set 'test' if explicitly requested, since it requires that
              // Babel is being called`
              test: /\.ts$/,
              plugins: [[transformTypeScript, { jsxPragma }]],
            },
            {
              // Only set 'test' if explicitly requested, since it requires that
              // Babel is being called`
              test: /\.tsx$/,
              plugins: [[transformTypeScript, { jsxPragma, isTSX: true }]],
            },
          ],
    };
  },
);