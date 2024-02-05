import { UserRole } from "blaise-api-node-client";
import { ImportUser } from "../../../Interfaces";
import { validateUser, validateUsers } from "./userValidation";

describe("Function validateUsers", () => {

    var validRoles: UserRole[] = [
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
    ]

    var userList: ImportUser[] = [
        {
            name:'Jamie',
            password:'pass',
            role:'BDSS',
            valid:true,
            warnings:[]
        },
        {
            name:'Rob',
            password:'pass2',
            role:'DST',
            valid:true,
            warnings:[]
        },    
        {
            name:'Jamie',
            password:'pass',
            role:'BDSS',
            valid:true,
            warnings:[]
        },       
        ]

    it("It should mark the valid status to false if a user is in multiple times", async () => {
        // act
        validateUsers(userList, validRoles);

        // assert
        expect(userList[0].valid).tobeFalsy();
        expect(userList[1].valid).toBeTruthy();
        expect(userList[2].valid).tobeFalsy();
    });

    it("It should set an appropriate warning message if a user is in multiple times", async () => {
        // act
        validateUsers(userList, validRoles);

        // assert
        expect(userList[0].warnings).toEqual(['User exists multiple times']);
        expect(userList[1].valid).toEqual([]);
        expect(userList[2].valid).toEqual(['User exists multiple times']);
    });    
});


describe("Function validateUser", () => {

    var validRoles: UserRole[] = [
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
    ]

    it("The valid property should be set to true if the user is valid", async () => {
        // arrange

        var validUser: ImportUser =
            {
                name:'Jamie',
                password:'pass',
                role:'BDSS',
                valid:false, // set to opposite of we want to ensure test intregrity
                warnings:[]
            }    

        // act
        validateUser(validUser, validRoles);

        // assert
        expect(validUser.valid).toBeTruthy();
    });

    it("The valid property should be set to false if the password is empty", async () => {
        // arrange

        var validUser: ImportUser =
            {
                name:'Jamie',
                password:'',
                role:'BDSS',
                valid:true, // set to opposite of we want to ensure test intregrity
                warnings:[]
            }       

        // act
        validateUser(validUser, validRoles);

        // assert
        expect(validUser.valid).toBeFalsy();
    });    
});