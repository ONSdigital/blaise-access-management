import React from "react";
import {render, waitFor, cleanup, screen, RenderResult} from "@testing-library/react";
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
jest.mock('../../../utilities/http');
const getAllRolesMock = getAllRoles as jest.Mock<Promise<getRolesListResponse>>;

describe("Upload summary tests", () => {

    var roles: getRolesListResponse = [
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
    ]]

    beforeEach(() => {
        getAllRolesMock.mockImplementation(() => Promise.resolve(roles));
      });


    it("view users page matches Snapshot", async () => {
        //arrange
        var userList: ImportUser[] = [
            {
                name:'Jamie',
                password:'pass',
                role:'BDSS',
                valid:false,
                warnings:[]
            },
            {
                name:'Rob',
                password:'pass2',
                role:'DST',
                valid:false,
                warnings:[]
            },    
            {
                name:'Jamie',
                password:'pass',
                role:'BDSS',
                valid:false,
                warnings:[]
            },       
            ]

        const history = createMemoryHistory();
        const view = render(
            <Router history={history}>
                <UsersToUploadSummary usersToImport={userList} uploadUsers={() => {}}/>
            </Router>
        );

        // act
        await act(async () => {
            await new Promise(process.nextTick);
        });

        // assert
        await waitFor(() => {
            expect(view).toMatchSnapshot();
        });
    });

    it("Upload summary pages for three valid users matches Snapshot", async () => {
        //arrange
        var userList: ImportUser[] = [
            {
                name:'Jamie',
                password:'pass',
                role:'BDSS',
                valid:false,
                warnings:[]
            },
            {
                name:'Rob',
                password:'pass2',
                role:'DST',
                valid:false,
                warnings:[]
            },    
            {
                name:'Rich',
                password:'pass',
                role:'BDSS',
                valid:false,
                warnings:[]
            },       
            ]

        // act
        await act(async () => {
            const history = createMemoryHistory();
            const view = render(
                <Router history={history}>
                    <UsersToUploadSummary usersToImport={userList} uploadUsers={() => {}}/>
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
        var userList: ImportUser[] = [
            {
                name:'Jamie',
                password:'pass',
                role:'BDSS',
                valid:false,
                warnings:[]
            },
            {
                name:'Rob',
                password:'pass2',
                role:'DST',
                valid:false,
                warnings:[]
            },    
            {
                name:'Rich',
                password:'pass',
                role:'BDSS',
                valid:false,
                warnings:[]
            },       
            ]

        // act
        // act
        await act(async () => {
            const history = createMemoryHistory();
            const view = render(
                <Router history={history}>
                    <UsersToUploadSummary usersToImport={userList} uploadUsers={() => {}}/>
                </Router>
            );
        });

        // assert
        expect(screen.getByText(/3 of 3 users are valid and will be uploaded/i)).toBeDefined();        
    });    

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

