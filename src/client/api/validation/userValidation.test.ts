import { type ImportUser } from "../../types/userImport.types";
import { getAllRoles, getAllUsers } from "../http";

import { validateImportedUsers, validateUser } from "./userValidation";

import type { User, UserRole } from "blaise-api-node-client";

type MockRolesResponse = { success: boolean; status: number; message: string; data: UserRole[] };
type MockUsersResponse = { success: boolean; status: number; message: string; data: User[] };

vi.mock("../http");

const getAllRolesMock = vi.mocked(getAllRoles);
const getAllUsersMock = vi.mocked(getAllUsers);

describe("Function validateImportedUsers", () => {
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

  it("should mark the valid status to true if users are valid", async () => {
    await validateImportedUsers(importedUsers);

    expect(importedUsers[0].valid).toBeTruthy();
    expect(importedUsers[1].valid).toBeTruthy();
    expect(importedUsers[2].valid).toBeTruthy();
  });

  it("should not populate the warnings list if users are valid", async () => {
    await validateImportedUsers(importedUsers);

    expect(importedUsers[0].warnings).toEqual([]);
    expect(importedUsers[1].warnings).toEqual([]);
    expect(importedUsers[2].warnings).toEqual([]);
  });

  it("should mark the valid status to false if a user already exists", async () => {
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

    await validateImportedUsers(importedUsers);

    expect(importedUsers[0].valid).toBeFalsy();
    expect(importedUsers[1].valid).toBeTruthy();
    expect(importedUsers[2].valid).toBeFalsy();
  });

  it("should set an appropriate warning message if a user is in multiple times", async () => {
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

    await validateImportedUsers(importedUsers);

    expect(importedUsers[0].warnings).toEqual(["User already exists"]);
    expect(importedUsers[1].warnings).toEqual([]);
    expect(importedUsers[2].warnings).toEqual(["User already exists"]);
  });

  afterAll(() => {
    vi.clearAllMocks();
  });
});

describe("validateImportedUsers – when API calls fail", () => {
  const importedUsers: ImportUser[] = [
    { name: "Alice", password: "pass", role: "BDSS", valid: false, warnings: [] },
  ];

  it("handles getAllRoles returning false (getRoles returns [])", async () => {
    getAllRolesMock.mockResolvedValueOnce({
      success: false,
      status: 500,
      message: "Request failed",
      data: [],
    });
    getAllUsersMock.mockResolvedValueOnce({
      success: true,
      status: 200,
      message: "Request completed",
      data: [],
    });

    await validateImportedUsers(importedUsers);

    expect(importedUsers[0]?.warnings).toContain("Not a valid role");
  });

  it("handles getAllUsers returning false (getExistingUsers returns [])", async () => {
    getAllRolesMock.mockResolvedValueOnce({
      success: true,
      status: 200,
      message: "Request completed",
      data: [{ name: "BDSS", permissions: [], description: "" }],
    });
    getAllUsersMock.mockResolvedValueOnce({
      success: false,
      status: 500,
      message: "Request failed",
      data: [],
    });

    importedUsers[0]!.valid = false;
    importedUsers[0]!.warnings = [];

    await validateImportedUsers(importedUsers);

    expect(importedUsers[0]?.valid).toBeTruthy();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
});

describe("Function validateUser", () => {
  const validRoles: UserRole[] = [
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
  ];

  it("The valid property should be set to true if the user is valid", async () => {
    const validUser: ImportUser = {
      name: "Jamie",
      password: "pass",
      role: "BDSS",
      valid: false,
      warnings: [],
    };

    validateUser(validUser, validRoles, []);

    expect(validUser.valid).toBeTruthy();
  });

  it("No warnings should be set if the user is valid", async () => {
    const validUser: ImportUser = {
      name: "Jamie",
      password: "pass",
      role: "BDSS",
      valid: false,
      warnings: [],
    };

    validateUser(validUser, validRoles, []);

    expect(validUser.warnings).toEqual([]);
  });

  it("The valid property should be set to false if the user already exists", async () => {
    const invalidMatchingUser: ImportUser = {
      name: "Jamie",
      password: "pass",
      role: "BDSS",
      valid: true,
      warnings: [],
    };

    const matchingExistingUser: User[] = [
      {
        name: "Jamie",
        role: "BDSS",
        serverParks: [],
        defaultServerPark: "",
      },
    ];

    validateUser(invalidMatchingUser, validRoles, matchingExistingUser);

    expect(invalidMatchingUser.valid).toBeFalsy();
  });

  it("The warning list should be set if the user already exists", async () => {
    const invalidMatchingUser: ImportUser = {
      name: "Jamie",
      password: "pass",
      role: "BDSS",
      valid: true,
      warnings: [],
    };

    const matchingExistingUser: User[] = [
      {
        name: "Jamie",
        role: "BDSS",
        serverParks: [],
        defaultServerPark: "",
      },
    ];

    validateUser(invalidMatchingUser, validRoles, matchingExistingUser);

    expect(invalidMatchingUser.warnings).toEqual(["User already exists"]);
  });

  it("The valid property should be set to false if the password is not supplied", async () => {
    const validUser: ImportUser = {
      name: "Jamie",
      password: "",
      role: "BDSS",
      valid: true,
      warnings: [],
    };

    validateUser(validUser, validRoles, []);

    expect(validUser.valid).toBeFalsy();
  });

  it("The warning list should be set if the password is not supplied", async () => {
    const validUser: ImportUser = {
      name: "Jamie",
      password: "",
      role: "BDSS",
      valid: true,
      warnings: [],
    };

    validateUser(validUser, validRoles, []);

    expect(validUser.warnings).toEqual(["Invalid password"]);
  });

  it("should set valid=false and push 'Invalid name' when user.name is null", () => {
    const user: ImportUser = {
      name: null as unknown as string,
      password: "pass",
      role: "BDSS",
      valid: true,
      warnings: [],
    };

    validateUser(user, validRoles, []);

    expect(user.valid).toBeFalsy();
    expect(user.warnings).toContain("Invalid name");
  });

  it("should set valid=false and push 'Invalid role' when user.role is null", () => {
    const user: ImportUser = {
      name: "Jamie",
      password: "pass",
      role: null as unknown as string,
      valid: true,
      warnings: [],
    };

    validateUser(user, validRoles, []);

    expect(user.valid).toBeFalsy();
    expect(user.warnings).toContain("Invalid role");
  });
});
