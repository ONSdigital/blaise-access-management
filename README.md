# Blaise User Management

[![codecov](https://codecov.io/gh/ONSdigital/blaise-user-management/branch/main/graph/badge.svg)](https://codecov.io/gh/ONSdigital/blaise-user-management)
[![CI status](https://github.com/ONSdigital/blaise-user-management/workflows/Test%20coverage%20report/badge.svg)](https://github.com/ONSdigital/blaise-user-management/workflows/Test%20coverage%20report/badge.svg)
<img src="https://img.shields.io/github/release/ONSdigital/blaise-user-management.svg?style=flat-square" alt="Nisra Case Mover release verison">
[![GitHub pull requests](https://img.shields.io/github/issues-pr-raw/ONSdigital/blaise-user-management.svg)](https://github.com/ONSdigital/blaise-user-management/pulls)
[![Github last commit](https://img.shields.io/github/last-commit/ONSdigital/blaise-user-management.svg)](https://github.com/ONSdigital/blaise-user-management/commits)
[![Github contributors](https://img.shields.io/github/contributors/ONSdigital/blaise-user-management.svg)](https://github.com/ONSdigital/blaise-user-management/graphs/contributors)

Dashboard for managing Blaise users.

This project is a React application which when built is rendered by a Node.js express server.

![React and NodeJS server setup diagram](.github/ReactNodeJSDiagram.jpg)

### Setup

#### Prerequisites
To run Blaise User Management locally, you'll need to have [Node installed](https://nodejs.org/en/), as well as [yarn](https://classic.yarnpkg.com/en/docs/install#mac-stable).

To have the list of users and roles load on the page, you'll need to have [Blaise Rest API](https://github.com/ONSdigital/blaise-api-rest) running locally (On a Windows machine), or you 
can [create an Identity-Aware Proxy (IAP) tunnel](https://cloud.google.com/sdk/gcloud/reference/compute/start-iap-tunnel) from a GCP Compute
Instance running the rest API in a sandbox. An example command to connect to the rest api VM on local port `5011`:

```shell
sudo gcloud compute start-iap-tunnel restapi-1 80 --local-host-port=localhost:5011 --zone europe-west2-a
```

#### Setup locally steps

Clone the Repo

```shell script
git clone https://github.com/ONSdigital/blaise-user-management.git
```

Create a new .env file and add the following variables.

| Variable            | Description                                                                                                                                                                                                                                                                            | Var Example          |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------|
| PORT                | **Optional variable**, specify the Port for express server to run on. If not passed in this is set as 5000 by default. <br><br>It's best not to set this as the react project will try and use the variable as well and conflict. By default, React project locally runs on port 3000. | 5009                 |
| VM_EXTERNAL_WEB_URL | External Url used for CATI dashboard and survey links.                                                                                                                                                                                                                                 | tel-client-server.uk |
| BLAISE_API_URL      | Url that Blaise Instrument Checker is running on to send calls to.                                                                                                                                                                                                                     | localhost:5003       |
| SERVER_PARK         | Blaise Server Park Name, required for creating users in the correct server park                                                                                                                                                                                                        | gusty                |


The .env file should be setup as below

```.env
VM_EXTERNAL_WEB_URL='tel-client-server.uk'
BLAISE_API_URL='localhost:5003'
SERVER_PARK=gusty
```

Install required modules

```shell script
yarn install
```

##### Run commands

The following run commands are available, these are all setup in the `package.json` under `scripts`.

| Command             | Description                                                                                                                                                                              |
|---------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `yarn start-server` | Start the express server, Note: For the website to be rendered the React Project will need to be built.                                                                                  |
| `yarn start-react`  | Starts React project in local development setup with quick reloading on making changes. Note: For instruments to be shown the server needs to be running.                                |
| `yarn build-react`  | Compiles build project ready to be served by express. The build in outputted to the the `build` directory which express points to with the var `buildFolder` in `server/server.js`.      |
| `yarn test`         | Runs all tests for server and React Components and outputs coverage statistics.                                                                                                          |
| `gcp-build`         | [App Engine custom build step](https://cloud.google.com/appengine/docs/standard/nodejs/running-custom-build-step) which builds the react application and complies the TypeScript server. |

##### Simple setup for local development

Setup express project to be call Blaise Instrument Checker. By default, will be running on PORT 5000.

```shell script
yarn start-server
```

Next, to make sure the React project make requests the Express server make sure the proxy option is set to the right port
in the 'package.json'

```.json
"proxy": "http://localhost:5000",
```

Run the React project for local development. By default, this will be running on PORT 3000

```shell script
yarn start-server
```

To test express sever serving the React project, you need to compile the React project, then you can see it running
at [http://localhost:5000/](http://localhost:5000/)

```shell script
yarn build-react
```

### Tests

The [Jest testing framework](https://jestjs.io/en/) has been setup in this project, all tests currently reside in
the `tests` directory. This is currently only running tests on the health check endpoint, haven't got the hang of mocking
Axios yet.

To run all tests run

```shell script
yarn test
```

Other test command can be seen in the Run Commands section above.

### Manually deploying to app engine

To deploy the locally edited service to app engine in your environment, you can run the cloubuild trigger with
the following line, changing the environment variables as needed.

```.shell
gcloud builds submit --substitutions=_PROJECT_ID=ons-blaise-v2-dev-matt-54,_VM_EXTERNAL_WEB_URL=test,_BLAISE_API_URL=/,_SERVER_PARK=gusty
```
