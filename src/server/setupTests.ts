import type { Request, Response } from "express";

process.env.PROJECT_ID ??= "test-project-id";
process.env.BLAISE_API_URL ??= "http://localhost:1337";
process.env.SERVER_PARK ??= "gusty";
process.env.URL_DOMAIN ??= "surveys.test";
process.env.SESSION_SECRET ??= "test-session-secret";

vi.mock("blaise-login-react-server", async () => {
  const actual = await vi.importActual("blaise-login-react-server");
  const expressModule = await import("express");

  return {
    ...actual,
    newLoginHandler: vi.fn(() => {
      const router = expressModule.Router();

      router.use(expressModule.json({ limit: "10kb" }));
      router.get("/_ah/start", (_req: Request, res: Response) => {
        res.sendStatus(200);
      });

      return router;
    }),
  };
});
