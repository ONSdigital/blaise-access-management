import { formatLogMessage } from "../../logger/cloudLogging";

describe("formatLogMessage utility function ensures complex log messages are sanitized but still readable", () => {
    it("should preserve newlines and carriage returns", () => {
        const inputMessage = "Error: Something went wrong\nDetails: Invalid input\r\nPlease try again.";
        const expectedOutput = "AUDIT_LOG: Error: Something went wrong\nDetails: Invalid input\r\nPlease try again.";

        const formattedMessage = formatLogMessage(inputMessage);

        console.log("Expected log format:", JSON.stringify(expectedOutput));
        console.log("Received log format:", JSON.stringify(formattedMessage));

        expect(formattedMessage).toBe(expectedOutput);
    });

    it("should remove non-printable characters", () => {
        const message = "Error: Something went wrong\x01\x02\n    at FunctionName (file.js:10:15)\x03\x04\n    at AnotherFunction (file.js:20:25)\r\n    at YetAnotherFunction (file.js:30:35)";
        const expectedOutput = "AUDIT_LOG: Error: Something went wrong\n    at FunctionName (file.js:10:15)\n    at AnotherFunction (file.js:20:25)\r\n    at YetAnotherFunction (file.js:30:35)";
        const formattedMessage = formatLogMessage(message);

        console.log("Expected log format:", JSON.stringify(expectedOutput));
        console.log("Received log format:", JSON.stringify(formattedMessage));

        expect(formattedMessage).toBe(expectedOutput);
    });
});