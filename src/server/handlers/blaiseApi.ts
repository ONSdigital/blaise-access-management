import express from "express";
import multer from "multer";

import type { CustomConfig } from "../types/server.types.js";
import type AuditLogger from "../utils/auditLogger.js";
import type { BlaiseApiClient } from "blaise-api-node-client";
import type { Auth } from "blaise-login-react-server";
import type { Request, Response, Router } from "express";

function singleValue(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export { singleValue };

function sanitiseForAuditLog(value: unknown): string {
  return String(value)
    .replace(/[\r\n]+/g, " ")
    .replace(/[^\x20-\x7E]+/g, "");
}

function getServerParksForRole(
  config: CustomConfig,
  role: string,
): {
  serverParks: string[];
  defaultServerPark: string;
} {
  const roleServerParksOverride = config.RoleToServerParksMap[role];

  if (roleServerParksOverride != null) {
    return {
      serverParks: roleServerParksOverride,
      defaultServerPark: roleServerParksOverride[0],
    };
  }

  const defaultServerParks = config.RoleToServerParksMap["DEFAULT"];

  return {
    serverParks: defaultServerParks,
    defaultServerPark: defaultServerParks[0],
  };
}

export default function createBlaiseApiHandler(
  config: CustomConfig,
  auth: Auth,
  blaiseApiClient: BlaiseApiClient,
  auditLogger: AuditLogger,
): Router {
  const router = express.Router();
  const upload = multer();

  router.get("/api/audit", auth.middleware, async function (req: Request, res: Response) {
    try {
      return res.status(200).json(await auditLogger.getLogs());
    } catch (error) {
      auditLogger.error(
        req.log,
        `Error whilst trying to retrieve audit logs: ${sanitiseForAuditLog(error)}`,
      );

      return res.status(500).json({ error: "Failed to retrieve audit logs" });
    }
  });

  router.get("/api/roles", auth.middleware, async function (req: Request, res: Response) {
    res.status(200).json(await blaiseApiClient.getUserRoles());
  });

  router.get("/api/users", auth.middleware, async function (req: Request, res: Response) {
    res.status(200).json(await blaiseApiClient.getUsers());
  });

  router.patch(
    "/api/users/:user/rolesAndPermissions",
    auth.middleware,
    async function (req: Request, res: Response) {
      const currentUser = auth.getUser(auth.getToken(req));
      const role = singleValue(req.body.role);
      const previousRole = singleValue(req.body.previousRole) || "Unknown";
      const user = singleValue(req.params.user);

      if (!user || !role) {
        return res.status(400).json("No user or role provided");
      }

      const { serverParks, defaultServerPark } = getServerParksForRole(config, role);
      const safeRole = sanitiseForAuditLog(role);
      const safePreviousRole = sanitiseForAuditLog(previousRole);
      const safeUser = sanitiseForAuditLog(user);
      const safeCurrentUser = sanitiseForAuditLog(currentUser?.name || "Unknown user");

      try {
        await blaiseApiClient.changeUserRole(user, role);
        await blaiseApiClient.changeUserServerParks(user, serverParks, defaultServerPark);
        const successMessage = `${safeCurrentUser} changed user ${safeUser} role to ${safeRole} (previously ${safePreviousRole})`;

        auditLogger.info(req.log, successMessage);

        return res.status(200).json({
          message: "Successfully updated role to " + role + " for user " + user,
        });
      } catch (error) {
        const errorMessage = `Error whilst trying to update user role and permissions to ${safeRole} for ${safeUser}, with error message: ${sanitiseForAuditLog(error)}`;

        auditLogger.info(
          req.log,
          `${safeCurrentUser} has failed to update user role and permissions to ${safeRole} for ${safeUser}`,
        );
        auditLogger.error(req.log, errorMessage);

        return res.status(500).json({
          message: "Failed to update user role and permissions to " + role + " for " + user,
        });
      }
    },
  );

  router.get("/api/users/:user", auth.middleware, async function (req: Request, res: Response) {
    const userName = singleValue(req.params.user);

    if (!userName) {
      return res.status(400).json({
        message: "No user provided",
      });
    }

    try {
      const user = await blaiseApiClient.getUser(userName);
      const successMessage = `Successfully fetched user details for ${userName}`;

      return res.status(200).json({
        message: successMessage,
        data: user,
      });
    } catch (error) {
      const errorMessage = `Error whilst trying to retrieve user ${userName}: ${error}`;

      return res.status(500).json({
        message: errorMessage,
        error: error,
      });
    }
  });

  router.post(
    "/api/change-password/:user",
    auth.middleware,
    upload.any(),
    async function (req: Request, res: Response) {
      const currentUser = auth.getUser(auth.getToken(req));
      const data = req.body;
      const userName = singleValue(req.params.user);
      const safeUserName = sanitiseForAuditLog(userName);
      const safeCurrentUser = sanitiseForAuditLog(currentUser?.name || "Unknown");

      if (Array.isArray(data.password)) {
        data.password = data.password.join("");
      }

      if (!userName || !data.password) {
        return res.status(400).json("No user or password provided");
      }

      blaiseApiClient
        .changePassword(userName, data.password)
        .then(() => {
          auditLogger.info(req.log, `${safeCurrentUser} changed password for user ${safeUserName}`);

          return res.status(204).json(null);
        })
        .catch((error: unknown) => {
          auditLogger.info(
            req.log,
            `${safeCurrentUser} has failed to change the password for ${safeUserName}`,
          );
          auditLogger.error(
            req.log,
            `Error whilst trying to change password for ${safeUserName}: ${sanitiseForAuditLog(error)}`,
          );

          return res.status(500).json(error);
        });
    },
  );

  router.delete("/api/users", auth.middleware, async function (req: Request, res: Response) {
    try {
      const currentUser = auth.getUser(auth.getToken(req));
      let { user } = req.headers;

      if (Array.isArray(user)) {
        user = user.join("");
      }

      if (!user) {
        auditLogger.error(req.log, "No user provided for deletion");

        return res.status(400).json();
      }

      await blaiseApiClient.deleteUser(user);

      auditLogger.info(
        req.log,
        `${sanitiseForAuditLog(currentUser?.name || "Unknown")} deleted user ${sanitiseForAuditLog(user)}`,
      );

      return res.status(204).json();
    } catch (error) {
      const errorMessage = String(error);

      auditLogger.error(
        req.log,
        `Error whilst trying to delete user, ${sanitiseForAuditLog(req.headers.user)}, with error message: ${sanitiseForAuditLog(errorMessage)}`,
      );

      return res.status(500).json({ error: "Internal server error" });
    }
  });

  router.post(
    "/api/users",
    auth.middleware,
    upload.any(),
    async function (req: Request, res: Response) {
      try {
        const currentUser = auth.getUser(auth.getToken(req));
        const role = singleValue(req.body.role);

        if (!role) {
          return res.status(400).json({ message: "No role provided for user creation" });
        }

        const { serverParks, defaultServerPark } = getServerParksForRole(config, role);
        const data = {
          ...req.body,
          role,
          serverParks,
          defaultServerPark,
        };

        const createdUser = await blaiseApiClient.createUser(data);
        const safeCurrentUser = sanitiseForAuditLog(currentUser?.name || "Unknown");
        const safeUserName = sanitiseForAuditLog(data.name);
        const safeRole = sanitiseForAuditLog(role);

        auditLogger.info(
          req.log,
          `${safeCurrentUser} created user ${safeUserName} with role ${safeRole}`,
        );

        return res.status(200).json(createdUser);
      } catch (error) {
        const errorMessage = String(error);

        auditLogger.error(
          req.log,
          `Error whilst trying to create new user, ${sanitiseForAuditLog(req.body.name)}, with error message: ${sanitiseForAuditLog(errorMessage)}`,
        );

        return res.status(500).json({ error: "Internal server error" });
      }
    },
  );

  return router;
}
