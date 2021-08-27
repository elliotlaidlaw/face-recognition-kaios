# Face Recognition for KaiOS

Facial verification proof of concept app for KaiOS 2.5 devices, installed with the [2.5 simulator](https://developer.kaiostech.com/docs/getting-started/env-setup/simulator).

This project was bootstrapped with [Create KaiOS App](https://github.com/jzhangs/create-kaios-app).

It's a pure javascript KaiOS app, but still uses kaios-scripts to build and pack the app. The build step will place the bundled scripts under 'src/' folder into the `<body>` tag.

## Installation

**You’ll need to have Node 8.10.0 or later on your local development machine**. You can use [nvm](https://github.com/creationix/nvm#installation) (macOS/Linux) to easily switch Node versions between different projects.

Since the `node_modules` folder is too large to upload to Github, you will first need to create a new app using:

```
yarn create kaios-app newapp
```
and extract the `node_modules` folder, placing it into the directory of this app.

In the directory of the app, you run:
```
npm install @tensorflow/tfjs
npm install @vladmandic/face-api
```
which installs the necessary libraries in the `node_modules` folder.

## Available Scripts

In the project directory, you can run:

### `yarn build`

Builds the app for production to the `build` folder. The build is minified and the filenames include the hashes. Now the `build` folder is ready to be installed on the device.

### `yarn push`

Install the app in `build` folder to KaiOS devices.
