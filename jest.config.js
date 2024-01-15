process.env = Object.assign(process.env, {
    BLAISE_API_URL: "mock",
    PROJECT_ID: "mock-project",
    SERVER_PARK: "mock-server-park"
});

module.exports = {
    moduleNameMapper: {
        axios: "axios/dist/node/axios.cjs"
    }
};
