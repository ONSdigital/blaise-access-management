import React from "react";
import {render, waitFor, cleanup, screen} from "@testing-library/react";
import "@testing-library/jest-dom";
import {act} from "react-dom/test-utils";
import {createMemoryHistory} from "history";
import {Router} from "react-router";
import { ImportUser } from "../../../../Interfaces";
import BulkUserUpload from "./BulkUserUpload";


describe("Upload summary tests", () => {

    beforeAll(() => {
       
    });

    it("view users page matches Snapshot", async () => {
        //arrange
        var users: ImportUser[] = []
        // try to mock the setUploadData state var in the selectfile.tsx. Failing that can we mock the CSVReader to use our list of users
        // click the upload button and see if it takes you to the summary screen 

        const history = createMemoryHistory();
        const wrapper = render(
            <Router history={history}>
                <BulkUserUpload />
            </Router>
        );

        // act
        await act(async () => {
            await new Promise(process.nextTick);
        });

        // assert
        await waitFor(() => {
            expect(wrapper).toMatchSnapshot();
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

