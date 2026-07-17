import "@testing-library/jest-dom/vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";

import { mockFetchImplementation, mockFetchJsonResponse } from "../../test-utils/fetch.mock";

import AuditPage from "./auditPage";

const auditLogsList = [
  {
    id: "602fb3250003c61e92b25da0",
    timestamp: "2021-02-19T12:46:29.000Z",
    message: "rich created user bob",
    severity: "INFO",
  },
];

const auditLogsList2 = [
  {
    id: "602fb3250003c61e92b25da1",
    timestamp: "2021-02-19T12:47:29.000Z",
    message: "rich deleted user bob",
    severity: "INFO",
  },
];

describe("Audit page", () => {
  beforeEach(() => {
    mockFetchJsonResponse(200, auditLogsList);
  });

  it("view Audit page matches Snapshot", async () => {
    const wrapper = render(<AuditPage />, { wrapper: BrowserRouter });

    await screen.findByText(/rich created user bob/i);

    await waitFor(() => {
      expect(wrapper).toMatchSnapshot();
    });
  });

  it("renders loaded audit logs", async () => {
    render(<AuditPage />, { wrapper: BrowserRouter });

    expect(screen.queryByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Access history/i)).toBeDefined();
      expect(screen.getByText(/rich created user bob/i)).toBeDefined();
      expect(screen.getByText(/19\/02\/2021 12:46:29/i)).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  it("refreshes the list when Reload is pressed", async () => {
    render(<AuditPage />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText(/rich created user bob/i)).toBeDefined();
    });

    mockFetchJsonResponse(200, auditLogsList2);

    await userEvent.click(screen.getByText("Reload"));

    await waitFor(() => {
      expect(screen.getByText(/rich deleted user bob/i)).toBeDefined();
      expect(screen.getByText(/19\/02\/2021 12:47:29/i)).toBeDefined();
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Given the API returns a 500 status", () => {
  beforeEach(() => {
    mockFetchJsonResponse(500, []);
  });

  it("renders with the error message displayed", async () => {
    render(<AuditPage />, { wrapper: BrowserRouter });

    expect(screen.queryByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Unable to load access history./i)).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Given the API returns malformed json", () => {
  beforeEach(() => {
    mockFetchJsonResponse(200, { text: "Hello" });
  });

  it("renders with the error message displayed", async () => {
    render(<AuditPage />, { wrapper: BrowserRouter });

    expect(screen.queryByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Unable to load access history./i)).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("Given the API returns an empty list", () => {
  beforeEach(() => {
    mockFetchImplementation(
      vi.fn(() =>
        Promise.resolve({
          status: 200,
          json: () => Promise.resolve([]),
        }),
      ),
    );
  });

  it("renders with an empty state message", async () => {
    render(<AuditPage />, { wrapper: BrowserRouter });

    expect(screen.queryByText(/Loading/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/No recent access history found./i)).toBeDefined();
      expect(screen.queryByText(/Loading/i)).not.toBeInTheDocument();
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});

describe("formatTimestamp – invalid timestamp renders raw value", () => {
  it("shows the raw timestamp string when it cannot be parsed as a date", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          status: 200,
          json: () =>
            Promise.resolve([
              {
                id: "1",
                timestamp: "not-a-valid-date",
                message: "test message",
                severity: "INFO",
              },
            ]),
        }),
      ),
    );

    render(<AuditPage />, { wrapper: BrowserRouter });

    await waitFor(() => {
      expect(screen.getByText("not-a-valid-date")).toBeDefined();
    });
  });

  afterAll(() => {
    vi.clearAllMocks();
    cleanup();
  });
});
