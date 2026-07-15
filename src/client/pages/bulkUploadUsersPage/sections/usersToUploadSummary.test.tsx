import { cleanup, render, type RenderResult, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { act } from "react-dom/test-utils";
import { BrowserRouter } from "react-router-dom";

import { getAllRoles, getAllUsers } from "../../../api/http";
import { type ImportUser } from "../../../types/userImport.types";

import UsersToUploadSummary from "./usersToUploadSummary";

import type { User, UserRole } from "blaise-api-node-client";

let view: RenderResult;

type MockRolesResponse = { success: boolean; status: number; message: string; data: UserRole[] };
type MockUsersResponse = { success: boolean; status: number; message: string; data: User[] };

vi.mock("../../../api/http");

const getAllRolesMock = vi.mocked(getAllRoles);
const getAllUsersMock = vi.mocked(getAllUsers);

describe("Upload summary tests", () => {
  const importedUsers: ImportUser[] = [
    {
      name: "Jamie",
      password: "pass",
      role: "BDSS",
      valid: false,
      warnings: [],
    },
    {
      name: "Rob",
      password: "pass2",
      role: "DST",
      valid: false,
      warnings: [],
    },
    {
      name: "Rich",
      password: "pass",
      role: "BDSS",
      valid: false,
      warnings: [],
    },
  ];

  const roles: MockRolesResponse = {
    success: true,
    status: 200,
    message: "Request completed",
    data: [
      {
        name: "BDSS",
        description: "",
        permissions: [],
      },
      {
        name: "DST",
        description: "",
        permissions: [],
      },
    ],
  };

  const existingUsers: MockUsersResponse = {
    success: true,
    status: 200,
    message: "Request completed",
    data: [],
  };

  beforeEach(() => {
    getAllRolesMock.mockImplementation(() => Promise.resolve(roles));
    getAllUsersMock.mockImplementation(() => Promise.resolve(existingUsers));
  });

  it("Upload summary pages for valid imported users matches Snapshot", async () => {
    await act(async () => {
      view = render(
        <UsersToUploadSummary
          usersToImport={importedUsers}
          uploadUsers={() => {
            return;
          }}
        />,
        { wrapper: BrowserRouter },
      );
    });

    await waitFor(() => {
      expect(view).toMatchSnapshot();
    });
  });

  it("Upload summary pages for valid imported users displays correct summary", async () => {
    await act(async () => {
      view = render(
        <UsersToUploadSummary
          usersToImport={importedUsers}
          uploadUsers={() => {
            return;
          }}
        />,
        { wrapper: BrowserRouter },
      );
    });

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
        name: "Jamie",
        password: "pass",
        role: "BDSS",
        valid: false,
        warnings: [],
      },
      {
        name: "Rob",
        password: "pass2",
        role: "BOB",
        valid: false,
        warnings: [],
      },
      {
        name: "Rich",
        password: "pass",
        role: "BDSS",
        valid: false,
        warnings: [],
      },
    ];

    await act(async () => {
      view = render(
        <UsersToUploadSummary
          usersToImport={invalidImportedUsers}
          uploadUsers={() => {
            return;
          }}
        />,
        { wrapper: BrowserRouter },
      );
    });

    await waitFor(() => {
      expect(view).toMatchSnapshot();
    });
  });

  it("Upload summary pages for two valid and one invalid users displays correct summary", async () => {
    //arrange
    const invalidImportedUsers: ImportUser[] = [
      {
        name: "Jamie",
        password: "pass",
        role: "BDSS",
        valid: false,
        warnings: [],
      },
      {
        name: "Rob",
        password: "pass2",
        role: "BOB",
        valid: false,
        warnings: [],
      },
      {
        name: "Rich",
        password: "pass",
        role: "BDSS",
        valid: false,
        warnings: [],
      },
    ];

    await act(async () => {
      view = render(
        <UsersToUploadSummary
          usersToImport={invalidImportedUsers}
          uploadUsers={() => {
            return;
          }}
        />,
        { wrapper: BrowserRouter },
      );
    });

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
        name: "Jamie",
        password: "pass",
        role: "BDSS",
        valid: false,
        warnings: [],
      },
      {
        name: "Rob",
        password: "pass2",
        role: "DST",
        valid: false,
        warnings: [],
      },
      {
        name: "Rich",
        password: "pass3",
        role: "BDSS",
        valid: false,
        warnings: [],
      },
    ];

    const matchingExistingUsers: MockUsersResponse = {
      success: true,
      status: 200,
      message: "Request completed",
      data: [
        {
          name: "Jamie",
          role: "BDSS",
          serverParks: [],
          defaultServerPark: "",
        },
        {
          name: "Rich",
          role: "BDSS",
          serverParks: [],
          defaultServerPark: "",
        },
      ],
    };

    getAllUsersMock.mockImplementation(() => Promise.resolve(matchingExistingUsers));

    await act(async () => {
      view = render(
        <UsersToUploadSummary
          usersToImport={importedUsersIncludingExisting}
          uploadUsers={() => {
            return;
          }}
        />,
        { wrapper: BrowserRouter },
      );
    });

    await waitFor(() => {
      expect(view).toMatchSnapshot();
    });
  });

  it("Upload summary pages for two users with the same name displays correct summary", async () => {
    const importedUsersIncludingExisting: ImportUser[] = [
      {
        name: "Jamie",
        password: "pass",
        role: "BDSS",
        valid: false,
        warnings: [],
      },
      {
        name: "Rob",
        password: "pass2",
        role: "DST",
        valid: false,
        warnings: [],
      },
      {
        name: "Rich",
        password: "pass3",
        role: "BDSS",
        valid: false,
        warnings: [],
      },
    ];

    const matchingExistingUsers: MockUsersResponse = {
      success: true,
      status: 200,
      message: "Request completed",
      data: [
        {
          name: "Jamie",
          role: "BDSS",
          serverParks: [],
          defaultServerPark: "",
        },
        {
          name: "Rich",
          role: "BDSS",
          serverParks: [],
          defaultServerPark: "",
        },
      ],
    };

    getAllUsersMock.mockImplementation(() => Promise.resolve(matchingExistingUsers));

    await act(async () => {
      view = render(
        <UsersToUploadSummary
          usersToImport={importedUsersIncludingExisting}
          uploadUsers={() => {
            return;
          }}
        />,
        { wrapper: BrowserRouter },
      );
    });

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
    vi.clearAllMocks();
    cleanup();
  });
});

describe("UsersToUploadSummary – empty users list", () => {
  it("shows No users found to upload when usersToImport is empty", async () => {
    const getAllRolesMock = vi.mocked(getAllRoles);
    const getAllUsersMock = vi.mocked(getAllUsers);

    getAllRolesMock.mockResolvedValue({
      success: true,
      status: 200,
      message: "Request completed",
      data: [{ name: "DST", permissions: [], description: "" }],
    });
    getAllUsersMock.mockResolvedValue({
      success: true,
      status: 200,
      message: "Request completed",
      data: [],
    });

    const uploadUsers = vi.fn();

    render(
      <BrowserRouter>
        <UsersToUploadSummary
          usersToImport={[]}
          uploadUsers={uploadUsers}
        />
      </BrowserRouter>,
    );

    await act(async () => {});

    await waitFor(() => {
      expect(document.body.textContent).toContain("No users found to upload");
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});
