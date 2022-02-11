import { loadConfigFromEnv } from "../Config";

describe("Config setup", () => {
    afterEach(() => {
        jest.clearAllMocks();
        jest.resetModules();
    });

    it("should return the correct environment variables", () => {
        const config = loadConfigFromEnv();


        expect(config.ProjectId).toBe("mock-project");
        expect(config.ServerPark).toBe("mock-server-park");
        expect(config.BlaiseApiUrl).toBe("http://mock");
        expect(config.CatiDashboardUrl).toBe("https://external-web-url/Blaise");
    });

    it("should return variables with default string if variables are not defined", () => {
        process.env = Object.assign({
            PROJECT_ID: undefined,
            BLAISE_API_URL: undefined,
            SERVER_PARK: undefined,
            CATI_DASHBOARD_URL: undefined
        });

        const config = loadConfigFromEnv();


        expect(config.ProjectId).toBe("ENV_VAR_NOT_SET");
        expect(config.ServerPark).toBe("ENV_VAR_NOT_SET");
        expect(config.BlaiseApiUrl).toBe("http://ENV_VAR_NOT_SET");
        expect(config.CatiDashboardUrl).toBe("https://undefined/Blaise");
    });
});
