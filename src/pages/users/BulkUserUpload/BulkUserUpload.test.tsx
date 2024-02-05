import React from "react";
import {render, waitFor, cleanup, screen, fireEvent} from "@testing-library/react";
import "@testing-library/jest-dom";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import { ImportUser } from "../../../../Interfaces";
import BulkUserUpload from "./BulkUserUpload";

describe("Upload summary tests", () => {

    var userList: ImportUser[] = [
    {
        name:'Jamie',
        password:'pass',
        role:'BDSS',
        valid:true,
        warnings:[]
    },
    {
        name:'Rob',
        password:'pass2',
        role:'DST',
        valid:true,
        warnings:[]
    },    
    {
        name:'Jamie',
        password:'pass',
        role:'BDSS',
        valid:true,
        warnings:[]
    },       
    ]

    beforeAll(() => {        
        // @ts-ignore`
        jest.spyOn(BulkUserUpload.prototype, 'getusersToUpload').mockReturnValue(userList);
       
    });

    it("view users page matches Snapshot", async () => {
        //arrange
        const history = createMemoryHistory();
        const view = render(
            <Router history={history}>
                <BulkUserUpload />
            </Router>
        );

        // act
        await act(async () => {
            const uploadButton = view.getByTestId(`button`);
            fireEvent.click(uploadButton);
            await new Promise(process.nextTick);
        });

        // assert
        await waitFor(() => {
            expect(view).toMatchSnapshot();
        });

    });

/*     it("should render correctly", async () => {
        const history = createMemoryHistory();
        render(
            <Router history={history}>
                <Users currentUser={signedInUser}/>
            </Router>
        );

        await act(async () => {
            await new Promise(process.nextTick);
        });

        await waitFor(() => {
            expect(screen.getByText(/Manage users/i)).toBeDefined();
            expect(screen.getByText(/Create new user/i)).toBeDefined();
            expect(screen.getByText(/TestUser123/i)).toBeDefined();
            expect(screen.getByText(/SecondUser/i)).toBeDefined();
            expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
        });
    }); */

    afterAll(() => {
        jest.clearAllMocks();
        cleanup();
    });
});

