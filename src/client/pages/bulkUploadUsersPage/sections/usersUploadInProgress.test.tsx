import { cleanup, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import UsersUploadInProgress from "./usersUploadInProgress";

afterEach(cleanup);

vi.mock("blaise-design-system-react-components", async () => {
  const { createDesignSystemMockModule } = await import("../../../test-utils/designSystem.mock");

  return createDesignSystemMockModule();
});

describe("UsersUploadInProgress", () => {
  it("renders the in-progress heading", () => {
    render(
      <BrowserRouter>
        <UsersUploadInProgress />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Upload in progress/i)).toBeDefined();
  });

  it("renders a loading indicator", () => {
    render(
      <BrowserRouter>
        <UsersUploadInProgress />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Loading/i)).toBeDefined();
  });
});
