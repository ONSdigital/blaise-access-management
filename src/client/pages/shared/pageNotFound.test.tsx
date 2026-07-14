import { cleanup, render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";

import PageNotFound from "./pageNotFound";

afterEach(cleanup);

describe("PageNotFound", () => {
  it("renders Page not found heading", () => {
    render(
      <BrowserRouter>
        <PageNotFound />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Page not found/i)).toBeDefined();
  });

  it("renders a link back to home", () => {
    render(
      <BrowserRouter>
        <PageNotFound />
      </BrowserRouter>,
    );

    const link = screen.getByRole("link", { name: /home/i });

    expect(link).toBeDefined();
  });

  it("renders helpful guidance text", () => {
    render(
      <BrowserRouter>
        <PageNotFound />
      </BrowserRouter>,
    );

    expect(screen.getByText(/check it is correct/i)).toBeDefined();
  });
});
