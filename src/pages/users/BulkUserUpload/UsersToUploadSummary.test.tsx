import React from "react";
import {render, waitFor, cleanup, RenderResult} from "@testing-library/react";
import "@testing-library/jest-dom";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import { ImportUser } from "../../../../Interfaces";
import UsersToUploadSummary from "./UsersToUploadSummary";
import { getAllRoles } from "../../../utilities/http";
import { UserRole } from "blaise-api-node-client";

// set global vars
let view:RenderResult;

// set mocks
type getRolesListResponse = [boolean, UserRole[]];
jest.mock("../../../utilities/http");
const getAllRolesMock = getAllRoles as jest.Mock<Promise<getRolesListResponse>>;

describe("Upload summary tests", () => {

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

    beforeEach(() => {
        getAllRolesMock.mockImplementation(() => Promise.resolve(roles));
      });

    it("Upload summary pages for three valid users matches Snapshot", async () => {
        //arrange
        const userList: ImportUser[] = [
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

        // act
        await act(async () => {
            const history = createMemoryHistory();
            view = render(
                <Router history={history}>
                    <UsersToUploadSummary usersToImport={userList} uploadUsers={() => {return;}}/>
                </Router>
            );
        });

        // assert
        await waitFor(() => {
            expect(view).toMatchSnapshot();
        });

    });

    it("Upload summary pages for three valid users displays correct summary", async () => {
        //arrange
        const userList: ImportUser[] = [
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

        // act
        // act
        await act(async () => {
            const history = createMemoryHistory();
            view = render(
                <Router history={history}>
                    <UsersToUploadSummary usersToImport={userList} uploadUsers={() => {return;}}/>
                </Router>
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
        const userList: ImportUser[] = [
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
            const history = createMemoryHistory();
            view = render(
                <Router history={history}>
                    <UsersToUploadSummary usersToImport={userList} uploadUsers={() => {return;}}/>
                </Router>
            );
        });

        // assert
        await waitFor(() => {
            expect(view).toMatchSnapshot();
        });
    });

    it("Upload summary pages for two valid and one invalid users displays correct summary", async () => {
        //arrange
        const userList: ImportUser[] = [
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
            const history = createMemoryHistory();
            view = render(
                <Router history={history}>
                    <UsersToUploadSummary usersToImport={userList} uploadUsers={() => {return;}}/>
                </Router>
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

    it("Upload summary pages for two users with the same name matches Snapshot", async () => {
        //arrange
        const userList: ImportUser[] = [
            {
                name:"Jamie",
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            },
            {
                name:"Rich",
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            },
            {
                name:"Jamie",
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            }
            ];

        // act
        await act(async () => {
            const history = createMemoryHistory();
            view = render(
                <Router history={history}>
                    <UsersToUploadSummary usersToImport={userList} uploadUsers={() => {return;}}/>
                </Router>
            );
        });

        // assert
        await waitFor(() => {
            expect(view).toMatchSnapshot();
        });
    });

    it("Upload summary pages for two users with the same name displays correct summary", async () => {
        //arrange
        const userList: ImportUser[] = [
            {
                name:"Jamie",
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            },
            {
                name:"Rich",
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            },
            {
                name:"Jamie",
                password:"pass",
                role:"BDSS",
                valid:false,
                warnings:[]
            }
            ];

        // act
        await act(async () => {
            const history = createMemoryHistory();
            view = render(
                <Router history={history}>
                    <UsersToUploadSummary usersToImport={userList} uploadUsers={() => {return;}}/>
                </Router>
            );
        });

        // assert
        const summary = view.getByTestId("summary-panel");
        expect(summary).toHaveTextContent("1 of 3 users are valid and will be uploaded");

        const user1Summary = view.getByTestId("user-table-row-0");
        expect(user1Summary).toHaveTextContent("Jamie");
        expect(user1Summary).toHaveTextContent("BDSS");
        expect(user1Summary).toHaveTextContent("User exists multiple times");

        const user2Summary = view.getByTestId("user-table-row-1");
        expect(user2Summary).toHaveTextContent("Jamie");
        expect(user2Summary).toHaveTextContent("BDSS");
        expect(user2Summary).toHaveTextContent("User exists multiple times");

        const user3Summary = view.getByTestId("user-table-row-2");
        expect(user3Summary).toHaveTextContent("Rich");
        expect(user3Summary).toHaveTextContent("BDSS");
        expect(user3Summary).toHaveTextContent("Valid User");

    });

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

