process.env = Object.assign(process.env, {
    BLAISE_API_URL: "http://mock",
    PROJECT_ID: "mock-project",
    SERVER_PARK: "mock-server-park",
    MOCK_AUTH_TOKEN: "mock-token"
});

module.exports = {
    moduleNameMapper: {
        axios: "axios/dist/node/axios.cjs"
    },
    coveragePathIgnorePatterns: [
        "/node_modules/"
    ],
    testPathIgnorePatterns: [
        "/resources/"
    ],
    testEnvironment: "jsdom"
};
