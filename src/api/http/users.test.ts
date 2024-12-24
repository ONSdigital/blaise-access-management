/**
 * @jest-environment jsdom
 */

import { cleanup } from "@testing-library/react";
import { mock_server_request_function, mock_server_request_Return_JSON } from "../../tests/utils";
import { addNewUser, deleteUser, editPassword, getAllUsers } from "./users";
import { NewUser, User } from "blaise-api-node-client";

const userList: User[] = [
    { defaultServerPark: "gusty", name: "TestUser123", role: "DST", serverParks: ["gusty"] },
    { defaultServerPark: "gusty", name: "SecondUser", role: "BDSS", serverParks: ["gusty"] }
];

describe("Function getAllUsers(filename: string) ", () => {

    it("It should return true with data if the list is returned successfully", async () => {
        mock_server_request_Return_JSON(200, userList);
        const [success, users] = await getAllUsers();
        expect(success).toBeTruthy();
        expect(users).toEqual(userList);
    });

    it("It should return true with an empty list if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, []);
        const [success, users] = await getAllUsers();
        expect(success).toBeTruthy();
        expect(users).toEqual([]);
    });

    it("It should return false with an empty list if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const [success, users] = await getAllUsers();
        expect(success).toBeFalsy();
        expect(users).toEqual([]);
    });

    it("It should return false with an empty list if request JSON is not a list", async () => {
        mock_server_request_function(jest.fn(() => Promise.resolve({
            status: 400,
            json: () => Promise.reject("Failed")
        })));

        const [success, users] = await getAllUsers();
        expect(success).toBeFalsy();
        expect(users).toEqual([]);
    });

    it("It should return false with an empty list if request JSON is invalid", async () => {
        mock_server_request_Return_JSON(200, { name: "NAME" });
        const [success, users] = await getAllUsers();
        expect(success).toBeFalsy();
        expect(users).toEqual([]);
    });

    it("It should return false with an empty list if request call fails", async () => {
        mock_server_request_function(jest.fn(() => {
            throw new Error("Network error");
        }));

        const [success, users] = await getAllUsers();
        expect(success).toBeFalsy();
        expect(users).toEqual([]);
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

const newUser: NewUser = {
    name: "New User",
    password: "password",
    role: "DST",
    defaultServerPark: "gusty",
    serverParks: ["gusty"]
};

describe("Function addNewUser(user: User) ", () => {

    it("It should return true if the user has been created successfully", async () => {
        mock_server_request_Return_JSON(201, {});
        const success = await addNewUser(newUser);
        expect(success).toBeTruthy();
    });

    it("It should return false if a password is not provided", async () => {
        mock_server_request_Return_JSON(201, {});
        const newUser: NewUser = {
            defaultServerPark: "",
            name: "username",
            password: "",
            role: "",
            serverParks: []
        };

        const success = await addNewUser(newUser);
        expect(success).toBeFalsy();
    });

    it("It should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, []);
        const success = await addNewUser(newUser);
        expect(success).toBeFalsy();
    });

    it("It should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await addNewUser(newUser);
        expect(success).toBeFalsy();
    });

    it("It should return false if request call fails", async () => {
        mock_server_request_function(jest.fn(() => {
            throw new Error("Network error");
        }));

        const success = await addNewUser(newUser);
        expect(success).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Function deleteUser(username: string) ", () => {

    const userToDelete = "dave01";

    it("It should return true if the user has been deleted successfully", async () => {
        mock_server_request_Return_JSON(204, {});
        const success = await deleteUser(userToDelete);
        expect(success).toBeTruthy();
    });

    it("It should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, []);
        const success = await deleteUser(userToDelete);
        expect(success).toBeFalsy();
    });

    it("It should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});
        const success = await deleteUser(userToDelete);
        expect(success).toBeFalsy();
    });

    it("It should return false if request call fails", async () => {
        mock_server_request_function(jest.fn(() => {
            throw new Error("Network error");
        }));

        const success = await deleteUser(userToDelete);
        expect(success).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

describe("Function editPassword(username: string, newPassword: string) ", () => {

    const username = "testUser";
    const newPassword = "password123";

    it("It should return true if the password has been updated successfully", async () => {
        mock_server_request_Return_JSON(204, {});

        const response = await editPassword(username, newPassword);
        expect(response).toBeTruthy();
    });

    it("It should return false if a password is not provided", async () => {
        const invalidPassword = "";

        mock_server_request_Return_JSON(204, {});

        const response = await editPassword(username, invalidPassword);
        expect(response).toBeFalsy();
    });

    it("It should return false if a 404 is returned from the server", async () => {
        mock_server_request_Return_JSON(404, []);

        const success = await editPassword(username, newPassword);
        expect(success).toBeFalsy();
    });

    it("It should return false if request returns an error code", async () => {
        mock_server_request_Return_JSON(500, {});

        const success = await editPassword(username, newPassword);
        expect(success).toBeFalsy();
    });

    it("It should return false if request call fails", async () => {

        mock_server_request_function(jest.fn(() => {
            throw new Error("Network error");
        }));

        const success = await editPassword(username, newPassword);
        expect(success).toBeFalsy();
    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});