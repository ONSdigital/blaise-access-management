import React from "react";
import { render, waitFor, cleanup, RenderResult } from "@testing-library/react";
import "@testing-library/jest-dom";
import { act } from "react-dom/test-utils";
import { ImportUser } from "../../../Interfaces";
import UsersToUploadSummary from "./UsersToUploadSummary";
import { getAllRoles, getAllUsers } from "../../../utilities/http";
import { User, UserRole } from "blaise-api-node-client";
import { BrowserRouter } from "react-router-dom";

// set global vars
let view:RenderResult;

// set mocks
type getRolesListResponse = [boolean, UserRole[]];
type getUsersListResponse = [boolean, User[]];

jest.mock("../../../utilities/http");

const getAllRolesMock = getAllRoles as jest.Mock<Promise<getRolesListResponse>>;
const getAllUsersMock = getAllUsers as jest.Mock<Promise<getUsersListResponse>>;

describe("Upload summary tests", () => {
    const importedUsers: ImportUser[] = [
        {
            name:"Jamie",
            password:"pass",
            role:"BDSS",
            valid:false,
            warnings:[]
        },
        {
            name:"Rob",
            password:"pass2",
            role:"DST",
            valid:false,
            warnings:[]
        },
        {
            name:"Rich",
            password:"pass",
            role:"BDSS",
            valid:false,
            warnings:[]
        }
        ];

    const roles: getRolesListResponse = [
        true,
        [
        {
            name: "BDSS",
            description: "",
            permissions: []
        },
        {
            name: "DST",
            description: "",
            permissions: []
        }
    ]];

    const existingUsers: getUsersListResponse = [
        true,
        []
    ];

    beforeEach(() => {
        getAllRolesMock.mockImplementation(() => Promise.resolve(roles));
        getAllUsersMock.mockImplementation(() => Promise.resolve(existingUsers));
    });

    it("Upload summary pages for valid imported users matches Snapshot", async () => {
        //arrange

        // act
        await act(async () => {
            view = render(
                <UsersToUploadSummary usersToImport={importedUsers} uploadUsers={() => {return;}}/>,
                { wrapper: BrowserRouter }
            );
        });

        // assert
        await waitFor(() => {
            expect(view).toMatchSnapshot();
        });
    });

    it("Upload summary pages for valid imported users displays correct summary", async () => {
        //arrange

        // act
        await act(async () => {
            view = render(
                <UsersToUploadSummary usersToImport={importedUsers} uploadUsers={() => {return;}}/>,
                { wrapper: BrowserRouter }
            );
        });

        // assert
        const summary = view.getByTestId("summary-panel");
        expect(summary).toHaveTextContent("3 of 3 users are valid and will be uploaded");

        const user1Summary = view.getByTestId("user-table-row-0");
        expect(user1Summary).toHaveTextContent("Jamie");
        expect(user1Summary).toHaveTextContent("BDSS");
        expect(user1Summary).toHaveTextContent("Valid User");

        const user2Summary = view.getByTestId("user-table-row-1");
        expect(user2Summary).toHaveTextContent("Rob");
        expect(user2Summary).toHaveTextContent("DST");
        expect(user2Summary).toHaveTextContent("Valid User");

        const user3Summary = view.getByTestId("user-table-row-2");
        expect(user3Summary).toHaveTextContent("Rich");
        expect(user3Summary).toHaveTextContent("BDSS");
        expect(user3Summary).toHaveTextContent("Valid User");
    });

    it("Upload summary pages for two valid and one invalid users matches Snapshot", async () => {
        //arrange
        const invalidImportedUsers: ImportUser[] = [
            {
                name:"Jamie",
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            },
            {
                name:"Rob",
                password:"pass2",
                role:"BOB", // invalid role
                valid:false,
                warnings:[]
            },
            {
                name:"Rich",
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            }
            ];

        // act
        await act(async () => {
            view = render(
                <UsersToUploadSummary usersToImport={invalidImportedUsers} uploadUsers={() => {return;}}/>,
                { wrapper: BrowserRouter }
            );
        });

        // assert
        await waitFor(() => {
            expect(view).toMatchSnapshot();
        });
    });

    it("Upload summary pages for two valid and one invalid users displays correct summary", async () => {
        //arrange
        const invalidImportedUsers: ImportUser[] = [
            {
                name:"Jamie",
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            },
            {
                name:"Rob",
                password:"pass2",
                role:"BOB", // invalid role
                valid:false,
                warnings:[]
            },
            {
                name:"Rich",
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            }
            ];

        // act
        await act(async () => {
            view = render(
                <UsersToUploadSummary usersToImport={invalidImportedUsers} uploadUsers={() => {return;}}/>,
                { wrapper: BrowserRouter }
            );
        });

        // assert
        const summary = view.getByTestId("summary-panel");
        expect(summary).toHaveTextContent("2 of 3 users are valid and will be uploaded");

        const user1Summary = view.getByTestId("user-table-row-0");
        expect(user1Summary).toHaveTextContent("Rob");
        expect(user1Summary).toHaveTextContent("BOB");
        expect(user1Summary).toHaveTextContent("Not a valid role");

        const user2Summary = view.getByTestId("user-table-row-1");
        expect(user2Summary).toHaveTextContent("Jamie");
        expect(user2Summary).toHaveTextContent("BDSS");
        expect(user2Summary).toHaveTextContent("Valid User");

        const user3Summary = view.getByTestId("user-table-row-2");
        expect(user3Summary).toHaveTextContent("Rich");
        expect(user3Summary).toHaveTextContent("BDSS");
        expect(user3Summary).toHaveTextContent("Valid User");
    });

    it("Upload summary pages for an imported users that already exist matches Snapshot", async () => {
        //arrange
        const importedUsersIncludingExisting: ImportUser[] = [
            {
                name:"Jamie", // user already exists
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            },
            {
                name:"Rob",
                password:"pass2",
                role:"DST",
                valid:false,
                warnings:[]
            },
            {
                name:"Rich", // user already exists
                password:"pass3",
                role:"BDSS",
                valid:false,
                warnings:[]
            }
            ];

        const matchingExistingUsers: getUsersListResponse = [
            true,
            [{
                name:"Jamie",
                role:"BDSS",
                serverParks:[],
                defaultServerPark:""
            },
            {
                name:"Rich",
                role:"BDSS",
                serverParks:[],
                defaultServerPark:""
            }]
        ];

        getAllUsersMock.mockImplementation(() => Promise.resolve(matchingExistingUsers));

        // act
        await act(async () => {
            view = render(
                <UsersToUploadSummary usersToImport={importedUsersIncludingExisting} uploadUsers={() => {return;}}/>,
                { wrapper: BrowserRouter }
            );
        });

        // assert
        await waitFor(() => {
            expect(view).toMatchSnapshot();
        });
    });

    it("Upload summary pages for two users with the same name displays correct summary", async () => {
        //arrange
        const importedUsersIncludingExisting: ImportUser[] = [
            {
                name:"Jamie", // user already exists
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            },
            {
                name:"Rob",
                password:"pass2",
                role:"DST",
                valid:false,
                warnings:[]
            },
            {
                name:"Rich", // user already exists
                password:"pass3",
                role:"BDSS",
                valid:false,
                warnings:[]
            }
            ];

        const matchingExistingUsers: getUsersListResponse = [
            true,
            [{
                name:"Jamie",
                role:"BDSS",
                serverParks:[],
                defaultServerPark:""
            },
            {
                name:"Rich",
                role:"BDSS",
                serverParks:[],
                defaultServerPark:""
            }]
        ];

        getAllUsersMock.mockImplementation(() => Promise.resolve(matchingExistingUsers));

        // act
        await act(async () => {
            view = render(
                <UsersToUploadSummary usersToImport={importedUsersIncludingExisting} uploadUsers={() => {return;}}/>,
                { wrapper: BrowserRouter }
            );
        });

        // assert
        const summary = view.getByTestId("summary-panel");
        expect(summary).toHaveTextContent("1 of 3 users are valid and will be uploaded");

        const user1Summary = view.getByTestId("user-table-row-0");
        expect(user1Summary).toHaveTextContent("Jamie");
        expect(user1Summary).toHaveTextContent("BDSS");
        expect(user1Summary).toHaveTextContent("User already exists");

        const user2Summary = view.getByTestId("user-table-row-1");
        expect(user2Summary).toHaveTextContent("Rich");
        expect(user2Summary).toHaveTextContent("BDSS");
        expect(user2Summary).toHaveTextContent("User already exists");

        const user3Summary = view.getByTestId("user-table-row-2");
        expect(user3Summary).toHaveTextContent("Rob");
        expect(user3Summary).toHaveTextContent("DST");
        expect(user3Summary).toHaveTextContent("Valid User");

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});