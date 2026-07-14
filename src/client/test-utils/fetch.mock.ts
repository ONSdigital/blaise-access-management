export function mockFetchJsonResponse(returnedStatus: number, returnedJSON: unknown): void {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        status: returnedStatus,
        json: () => Promise.resolve(returnedJSON),
      }),
    ),
  );
}

export function mockFetchImplementation(
  mockFunction: (input: RequestInfo | URL, init?: RequestInit) => Promise<unknown>,
): void {
  globalThis.fetch = mockFunction as typeof fetch;
}
