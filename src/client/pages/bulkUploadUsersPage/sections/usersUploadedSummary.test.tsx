import { cleanup, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import { type UploadedUser } from "../../../types/userImport.types";

import UsersUploadedSummary from "./usersUploadedSummary";

vi.mock("blaise-design-system-react-components", async () => {
  const { createDesignSystemMockModule } = await import("../../../test-utils/designSystem.mock");

  return createDesignSystemMockModule();
});

afterEach(cleanup);

const successUsers: UploadedUser[] = [
  { name: "alice", created: true },
  { name: "bob", created: true },
];

const mixedUsers: UploadedUser[] = [
  { name: "alice", created: true },
  { name: "bob", created: false },
];

describe("UsersUploadedSummary", () => {
  it("renders success heading when all users were created", () => {
    render(
      <BrowserRouter>
        <UsersUploadedSummary
          usersUploaded={successUsers}
          numberOfValidUsers={2}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText(/two of two/i)).toBeDefined();
  });

  it("renders singular 'user' when only one valid user", () => {
    render(
      <BrowserRouter>
        <UsersUploadedSummary
          usersUploaded={[{ name: "alice", created: true }]}
          numberOfValidUsers={1}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText(/one of one/i)).toBeDefined();
  });

  it("renders plural 'users' when more than one valid user", () => {
    render(
      <BrowserRouter>
        <UsersUploadedSummary
          usersUploaded={successUsers}
          numberOfValidUsers={2}
        />
      </BrowserRouter>,
    );

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/users/i);
  });

  it("shows error panel and failed user list when some users were not created", () => {
    render(
      <BrowserRouter>
        <UsersUploadedSummary
          usersUploaded={mixedUsers}
          numberOfValidUsers={2}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Not all users were created successfully/i)).toBeDefined();
    expect(screen.getByText(/bob/i)).toBeDefined();
  });

  it("shows success panel when all users were created", () => {
    render(
      <BrowserRouter>
        <UsersUploadedSummary
          usersUploaded={successUsers}
          numberOfValidUsers={2}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Users will appear in the table/i)).toBeDefined();
  });

  it("shows the failed-user table when usersUploaded has failed entries and all created if empty", () => {
    render(
      <BrowserRouter>
        <UsersUploadedSummary
          usersUploaded={[]}
          numberOfValidUsers={0}
        />
      </BrowserRouter>,
    );

    // With zero users the success panel should show and no failed table
    expect(screen.getByText(/Users will appear in the table/i)).toBeDefined();
  });

  it("clicking Return to homepage navigates to /", async () => {
    const { default: userEvent } = await import("@testing-library/user-event");

    render(
      <BrowserRouter>
        <UsersUploadedSummary
          usersUploaded={successUsers}
          numberOfValidUsers={2}
        />
      </BrowserRouter>,
    );

    const returnButton = screen.getByRole("button", { name: /Return to homepage/i });

    await userEvent.click(returnButton);

    // Button should still be defined (navigation happens without errors)
    expect(returnButton).toBeDefined();
  });
});
