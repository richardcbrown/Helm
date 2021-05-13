const path = require("path")
const CopyPlugin = require("copy-webpack-plugin")
const GenerateJsonPlugin = require("generate-json-webpack-plugin")
const { merge } = require("webpack-merge")
const TerserPlugin = require("terser-webpack-plugin")

module.exports = (env, argv) => {
    const { manifest, entryPoints, dependencies } = require("./index")(env)

    const externals = {}
    const externalLibs = {}
    const ieExternalLibs = {}

    Object.keys(dependencies).forEach((dep) => (externals[dep] = dep))

    Object.keys(manifest.libraries).forEach((lib) => {
        externalLibs[lib] = manifest.libraries[lib].webpackPath
        ieExternalLibs[`ie/${lib}`] = manifest.libraries[lib].webpackPath
    })

    const panels = {}
    const iepanels = {}

    Object.keys(entryPoints).forEach((panel) => {
        panels[panel] = entryPoints[panel].webpackPath
        iepanels[`ie/${panel}`] = entryPoints[panel].webpackPath

        if (entryPoints[panel].configuration) {
            const { configuration } = entryPoints[panel]

            panels[configuration.webpackName] = configuration.webpackPath
            iepanels[`ie/${configuration.webpackName}`] = configuration.webpackPath
        }
    })

    console.log(manifest)
    console.log(panels)
    console.log(iepanels)
    console.log(externals)

    const webpackConfigurations = [
        {
            target: "web",
            mode: "development",
            entry: {
                ...panels,
                ...externalLibs,
            },
            devtool: argv.mode === "production" ? false : "source-map",
            resolve: {
                extensions: [".js"],
            },
            output: {
                path: path.join(__dirname, "/dist"),
                filename: "[name].js",
                libraryTarget: "system",
            },
            module: {
                rules: [
                    {
                        test: /\.(png|jpe?g|gif)$/i,
                        use: [
                            "file-loader",
                            {
                                loader: "image-webpack-loader",
                            },
                        ],
                    },
                    {
                        test: /\.scss$/,
                        use: ["raw-loader", "sass-loader"],
                    },
                    {
                        test: /\.css$/,
                        use: ["raw-loader"],
                    },
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /node_modules/,
                        use: {
                            loader: "babel-loader",
                        },
                    },
                ],
            },
            plugins: [
                new CopyPlugin({
                    patterns: [{ from: "./src/index.js", to: "", flatten: true }],
                }),
                new GenerateJsonPlugin("manifest.json", manifest),
            ],
            externals,
        },
        {
            target: "web",
            mode: "development",
            entry: {
                ...iepanels,
                ...ieExternalLibs,
            },
            devtool: argv.mode === "production" ? false : "source-map",
            resolve: {
                extensions: [".js"],
            },
            output: {
                path: path.join(__dirname, "/dist"),
                filename: "[name].js",
                libraryTarget: "system",
            },
            module: {
                rules: [
                    {
                        test: /\.(png|jpe?g|gif)$/i,
                        use: [
                            {
                                loader: "file-loader",
                            },
                        ],
                    },
                    {
                        test: /\.scss$/,
                        use: ["raw-loader", "sass-loader"],
                    },
                    {
                        test: /\.css$/,
                        use: ["raw-loader"],
                    },
                    {
                        test: /\.(js|jsx)$/,
                        exclude: /(node_modules\/(?!@lhncbc)|bower_components)/,
                        use: {
                            loader: "babel-loader",
                            options: {
                                presets: [
                                    [
                                        "@babel/preset-env",
                                        {
                                            useBuiltIns: false,
                                            targets: { ie: "11" },
                                        },
                                    ],
                                    "@babel/preset-react",
                                ],
                            },
                        },
                    },
                ],
            },
            externals,
        },
    ]

    return webpackConfigurations.map((wpc) => {
        return argv.mode === "production"
            ? merge(wpc, {
                  optimization: {
                      minimize: true,
                      minimizer: [
                          new TerserPlugin({
                              extractComments: "all",
                              parallel: true,
                          }),
                      ],
                  },
              })
            : wpc
    })
}
