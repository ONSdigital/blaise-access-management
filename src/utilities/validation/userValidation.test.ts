import { User, UserRole } from "blaise-api-node-client";
import { ImportUser } from "../../../Interfaces";
import { validateUser, validateImportedUsers } from "./userValidation";
import { getAllRoles, getAllUsers } from "../http";

// set mocks
type getRolesListResponse = [boolean, UserRole[]];
type getUsersListResponse = [boolean, User[]];

jest.mock( "../http");

const getAllRolesMock = getAllRoles as jest.Mock<Promise<getRolesListResponse>>;
const getAllUsersMock = getAllUsers as jest.Mock<Promise<getUsersListResponse>>;

describe("Function validateImportedUsers", () => {

    const importedUsers: ImportUser[] = [
        {
            name:"Jamie",
            password:"pass",
            role:"BDSS",
            valid:false,
            warnings:[]
        },
        {
            name:"Rob",
            password:"pass2",
            role:"DST",
            valid:false,
            warnings:[]
        },
        {
            name:"Rich",
            password:"pass",
            role:"BDSS",
            valid:false,
            warnings:[]
        }
        ];

    const roles: getRolesListResponse = [
        true,
        [
        {
            name: "BDSS",
            description: "",
            permissions: []
        },
        {
            name: "DST",
            description: "",
            permissions: []
        }
    ]];

    const existingUsers: getUsersListResponse = [
        true,
        []
    ];

    beforeEach(() => {
        getAllRolesMock.mockImplementation(() => Promise.resolve(roles));
        getAllUsersMock.mockImplementation(() => Promise.resolve(existingUsers));
      });

     it("should mark the valid status to true if users are valid", async () => {
        // act
        await validateImportedUsers(importedUsers);

        // assert
        expect(importedUsers[0].valid).toBeTruthy();
        expect(importedUsers[1].valid).toBeTruthy();
        expect(importedUsers[2].valid).toBeTruthy();
    });

    it("should not populate the warnings list if users are valid", async () => {
        // act
        await validateImportedUsers(importedUsers);

        // assert
        expect(importedUsers[0].warnings).toEqual([]);
        expect(importedUsers[1].warnings).toEqual([]);
        expect(importedUsers[2].warnings).toEqual([]);
    });

    it("should mark the valid status to false if a user already exists", async () => {
        // arrange
        const matchingExistingUsers: getUsersListResponse = [
            true,
            [{
                name:"Jamie",
                role:"BDSS",
                serverParks:[],
                defaultServerPark:""
            },
            {
                name:"Rich",
                role:"BDSS",
                serverParks:[],
                defaultServerPark:""
            }]
        ];

        getAllUsersMock.mockImplementation(() => Promise.resolve(matchingExistingUsers));

        // act
        await validateImportedUsers(importedUsers);

        // assert
        expect(importedUsers[0].valid).toBeFalsy();
        expect(importedUsers[1].valid).toBeTruthy();
        expect(importedUsers[2].valid).toBeFalsy();
    });

    it("should set an appropriate warning message if a user is in multiple times", async () => {
        // arrange
        const matchingExistingUsers: getUsersListResponse = [
            true,
            [{
                name:"Jamie",
                role:"BDSS",
                serverParks:[],
                defaultServerPark:""
            },
            {
                name:"Rich",
                role:"BDSS",
                serverParks:[],
                defaultServerPark:""
            }]
        ];

        getAllUsersMock.mockImplementation(() => Promise.resolve(matchingExistingUsers));

        // act
        await validateImportedUsers(importedUsers);

        // assert
        expect(importedUsers[0].warnings).toEqual(["User already exists"]);
        expect(importedUsers[1].warnings).toEqual([]);
        expect(importedUsers[2].warnings).toEqual(["User already exists"]);
    });

    afterAll(() => {
        jest.clearAllMocks();
    });
});

describe("Function validateUser", () => {

    const validRoles: UserRole[] = [
        {
            name: "BDSS",
            description: "",
            permissions: []
        },
        {
            name: "DST",
            description: "",
            permissions: []
        }
    ];

    it("The valid property should be set to true if the user is valid", async () => {
        // arrange

        const validUser: ImportUser =
            {
                name:"Jamie",
                password:"pass",
                role:"BDSS",
                valid:false, // set to opposite of we want to ensure test intregrity
                warnings:[]
            };

        // act
        validateUser(validUser, validRoles, []);

        // assert
        expect(validUser.valid).toBeTruthy();
    });

    it("No warnings should be set if the user is valid", async () => {
        // arrange

        const validUser: ImportUser =
            {
                name:"Jamie",
                password:"pass",
                role:"BDSS",
                valid:false, // set to opposite of we want to ensure test intregrity
                warnings:[]
            };

        // act
        validateUser(validUser, validRoles, []);

        // assert
        expect(validUser.warnings).toEqual([]);
    });

   it("The valid property should be set to false if the user already exists", async () => {
        // arrange

        const invalidMatchingUser: ImportUser =
            {
                name:"Jamie",
                password:"pass",
                role:"BDSS",
                valid:true, // set to opposite of we want to ensure test intregrity
                warnings:[]
            };

        const matchingExistingUser: User[] =
            [{
                name:"Jamie",
                role:"BDSS",
                serverParks:[],
                defaultServerPark:""
            }];

        // act
        validateUser(invalidMatchingUser, validRoles, matchingExistingUser);

        // assert
        expect(invalidMatchingUser.valid).toBeFalsy();
    });

    it("The waring list should be set if the user already exists", async () => {
        // arrange

        const invalidMatchingUser: ImportUser =
            {
                name:"Jamie",
                password:"pass",
                role:"BDSS",
                valid:true, // set to opposite of we want to ensure test intregrity
                warnings:[]
            };

        const matchingExistingUser: User[] =
            [{
                name:"Jamie",
                role:"BDSS",
                serverParks:[],
                defaultServerPark:""
            }];

        // act
        validateUser(invalidMatchingUser, validRoles, matchingExistingUser);

        // assert
        expect(invalidMatchingUser.warnings).toEqual(["User already exists"]);
    });

    it("The valid property should be set to false if the password is not supplied", async () => {
        // arrange

        const validUser: ImportUser =
            {
                name:"Jamie",
                password:undefined,
                role:"BDSS",
                valid:true, // set to opposite of we want to ensure test intregrity
                warnings:[]
            };

        // act
        validateUser(validUser, validRoles, []);

        // assert
        expect(validUser.valid).toBeFalsy();
    });

    it("The waring list should be set if the password is not supplied", async () => {
        // arrange

        const validUser: ImportUser =
            {
                name:"Jamie",
                password:undefined,
                role:"BDSS",
                valid:true, // set to opposite of we want to ensure test intregrity
                warnings:[]
            };

        // act
        validateUser(validUser, validRoles, []);

        // assert
        expect(validUser.warnings).toEqual(["Invalid password"]);
    });
});