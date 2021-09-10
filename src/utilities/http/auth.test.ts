import {cleanup} from "@testing-library/react";
import {mock_server_request_function, mock_server_request_Return_JSON} from "../../tests/utils";
import {getAllUsers} from "./users";
import {loginUser} from "./auth";
import {User} from "../../../Interfaces";



describe("Function loginUser(username: string, password: string) ", () => {

    const testUser: User = {
        defaultServerPark: "",
        password: "",
        serverParks: [],
        name: "test_user", role: ""
    };

    it("It should return true with user object if the user is logged in successfully", async () => {
        mock_server_request_Return_JSON(200, testUser);
        const [success, user] = await loginUser("test_user", "correct_password");
        expect(success).toBeTruthy();
        expect(user).toEqual(testUser);
    });

    it("It should return true with a null object if the user auth fails and returns a 403", async () => {
        mock_server_request_Return_JSON(403, null);
        const [success, user] = await loginUser("test_user", "incorrect_password");
        expect(success).toBeTruthy();
        expect(user).toEqual(null);
    });

    it("It should return false with a null object if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const [success, user] = await loginUser("test_user", "correct_password");
        expect(success).toBeFalsy();
        expect(user).toEqual(null);
    });

    it("It should return false with a null object if request JSON is invalid", async () => {
        mock_server_request_Return_JSON(200, {name: "NAME"});
        const [success, users] = await getAllUsers();
        expect(success).toBeFalsy();
        expect(users).toEqual([]);
    });

    it("It should return false with a null object if request call fails", async () => {
        mock_server_request_function(jest.fn(() =>
            Promise.resolve(() => {
                throw "error";
            })
        ));
        const [success, user] = await loginUser("test_user", "correct_password");
        expect(success).toBeFalsy();
        expect(user).toEqual(null);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});
