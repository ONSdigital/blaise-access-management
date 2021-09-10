import express, {Request, Response, Router} from "express";
import axios, {AxiosRequestConfig} from "axios";
import {EnvironmentVariables} from "../Config";

type PromiseResponse = [number, any];

export default function BlaiseAPIRouter(environmentVariables: EnvironmentVariables, logger: any): Router {
    const {BLAISE_API_URL, SERVER_PARK}: EnvironmentVariables = environmentVariables;
    const router = express.Router();

    const configHeaders = {
        "content-type": "application/json",
        "Accept": "application/json"
    };

    // Generic function to make requests to the API
    function SendBlaiseAPIRequest(req: Request, res: Response, url: string, method: AxiosRequestConfig["method"], data: any = null) {
        logger(req, res);
        const fullUrl = `http://${BLAISE_API_URL}${url}`;
        return new Promise((resolve: (object: PromiseResponse) => void) => {
            axios({
                url: fullUrl,
                method: method,
                headers: configHeaders,
                data: data,
                validateStatus: function (status) {
                    return status >= 200;
                },
            }).then((response) => {
                if (response.status >= 200 && response.status < 300) {
                    req.log.info(`Status ${response.status} from ${method} ${url}`);
                } else {
                    req.log.warn(`Status ${response.status} from ${method} ${url}`);
                }
                resolve([response.status, response.data]);
            }).catch((error) => {
                req.log.error(error, `${method} ${url} endpoint failed`);
                resolve([500, null]);
            });
        });
    }

    interface ResponseQuery extends Request {
        query: { filename: string }
    }

    // Get health status for Blaise connections
    router.get("/api/health", function (req: ResponseQuery, res: Response) {
        const url = "/api/v1/health";

        SendBlaiseAPIRequest(req, res, url, "GET")
            .then(([status, data]) => {
                res.status(status).json(data);
            });
    });

    router.get("/api/serverparks", async function (req: Request, res: Response) {
        const url = "/api/v1/serverparks";
        SendBlaiseAPIRequest(req, res, url, "GET")
            .then(([status, data]) => {
                res.status(status).json(data);
            });
    });

    router.get("/api/roles", async function (req: Request, res: Response) {
        const url = "/api/v1/userroles";
        SendBlaiseAPIRequest(req, res, url, "GET")
            .then(([status, data]) => {
                res.status(status).json(data);
            });
    });

    router.get("/api/users", async function (req: Request, res: Response) {
        const url = "/api/v1/users";
        SendBlaiseAPIRequest(req, res, url, "GET")
            .then(([status, data]) => {
                res.status(status).json(data);
            });
    });

    router.get("/api/login/:user", async function (req: Request, res: Response) {
        const {user} = req.params;
        const {password} = req.headers;

        let url = `/api/v1/users/${user}/password/${password}/validate`;
        const [status, validated] = await SendBlaiseAPIRequest(req, res, url, "GET");

        if (status !== 200) {
            res.status(status).json(validated);
            return;
        }

        if (!validated) {
            res.status(403).json(validated);
            return;
        }

        url = `/api/v1/users/${user}`;
        SendBlaiseAPIRequest(req, res, url, "GET")
            .then(([status, data]) => {
                res.status(status).json(data);
            });
    });

    router.get("/api/change_password/:user", (req, res) => {
        console.log("change_password");
        const {user} = req.params;
        const {password} = req.headers;
        const data = {
            "password": password
        };

        const url = `/api/v1/users/${user}/password`;
        SendBlaiseAPIRequest(req, res, url, "PATCH", data)
            .then(([status, data]) => {
                res.status(status).json(data);
            });

    });

    router.delete("/api/users", (req, res) => {
        console.log("delete_user");
        const {user} = req.headers;

        const url = `/api/v1/users/${user}`;
        SendBlaiseAPIRequest(req, res, url, "DELETE")
            .then(([status, data]) => {
                res.status(status).json(data);
            });
    });


    router.post("/api/users", (req, res) => {
        console.log("add user");
        const data = req.body;
        console.log(data);
        data.serverParks = [SERVER_PARK];
        data.defaultServerPark = SERVER_PARK;


        const url = "/api/v1/users";
        SendBlaiseAPIRequest(req, res, url, "POST", data)
            .then(([status, data]) => {
                res.status(status).json(data);
            });
    });

    router.post("/api/roles", (req, res) => {
        console.log("add role");
        const data = req.body;
        console.log(data);

        // data.permissions = ["Deployment", "Deployment.ServerParkManagement", "Deployment.InstrumentManagement", "AppManagement", "Apps.Appfeatures", "Appfeatures.login", "Appfeatures.getlistofinstruments", "Appfeatures.installsurvey", "Appfeatures.removesurvey", "Appfeatures.startsurvey", "Appfeatures.browsedata", "Appfeatures.deletedata", "Appfeatures.uploaddata", "Appfeatures.downloadcases", "Appfeatures.updatesettings", "Appfeatures.viewsettings", "Appfeatures.viewsurveydetails", "SurveyDataAccess", "SurveyDataAccess.webviewer", "UserManagement", "user.createuser", "user.updateuser", "user.removeuser", "user.createrole", "user.updaterole", "user.removerole", "user.adsync", "SkillManagement", "user.createskill", "user.updateskill", "user.removeskill", "user.updateuserskill", "CustomReports", "CR.viewreports", "CR.setreports", "CR.runreport", "CATI", "CATI.setcatispecification", "CATI.setgeneralparameters", "CATI.setgeneralparameters.setsurveydescription", "CATI.setappointmentparameters", "CATI.setappointmentparameters.setappointmentbuffer", "CATI.setappointmentparameters.setkeeptimeofexpiredappointment", "CATI.setappointmentparameters.settreatexpiredappointmentasmedium", "CATI.setdaybatchparameters", "CATI.setdaybatchparameters.setdaybatchsize", "CATI.setdaybatchparameters.setmaxnumberofcalls", "CATI.setdaybatchparameters.setdaysbetweennoanswers", "CATI.setdaybatchparameters.setdaysbetweenansweringmachine", "CATI.setlaunchersettings", "CATI.setlaunchersettings.setschedulerkind", "CATI.setlaunchersettings.settargetresponserate", "CATI.setlaunchersettings.setworkloadforoneresponse", "CATI.setschedulerparameters", "CATI.setschedulerparameters.setmaxnumberofbusydials", "CATI.setschedulerparameters.setmaxnumberofdials", "CATI.setschedulerparameters.setminimumtimebetweennoanswer", "CATI.setschedulerparameters.setminutesbetweenbusydials", "CATI.setschedulerparameters.setnosamedayansweringmachinecalls", "CATI.setschedulerparameters.setgroupdeactivationdelay", "CATI.setschedulerparameters.setinterviewerdeactivationdelay", "CATI.setschedulerparameters.setonlyexpireondeactiviationdelays", "CATI.setfieldselection", "CATI.setfieldselection.setshowinviewer", "CATI.setfieldselection.setwritetohist", "CATI.setselectfieldsettings", "CATI.setselectfieldsettings.setfields", "CATI.setselectfieldsettings.setfields.setfieldinclude", "CATI.setselectfieldsettings.setfields.setfieldvalues", "CATI.setselectfieldsettings.setactive", "CATI.setsortfieldsettings", "CATI.setsortfieldsettings.setactive", "CATI.settimezonesettings", "CATI.settimezonesettings.setappointmentgrace", "CATI.settimezonesettings.setdonotcallbefore", "CATI.settimezonesettings.setdonotcallafter", "CATI.setquotasettings", "CATI.setquotasettings.setactive", "CATI.setsurveydaysettings", "CATI.createdaybatch", "CATI.createdaybatchwithautorevoke", "CATI.extenddaybatch", "CATI.revokecase", "CATI.makesuperappointment", "CATI.adddaybatchrecord", "CATI.updatedaybatchentry", "CATI.removefromdaybatch", "CATI.setdialednumber", "CATI.backupinstrumentdata", "CATI.clearinstrumentdata", "CATI.setoperationtimesettings", "CATI.setdialresult", "CATI.setnotes", "CATI.setcasedeliveryoptions", "CATI.setcasedeliveryoptions.setenabled", "CATI.setcasedeliveryoptions.setweightfactor", "CATI.viewcatispecificationpage", "CATI.viewappointments", "CATI.selectfromcaseinfo", "CATI.selectfromdaybatch", "Deployment", "Deployment.ServerParkManagement", "Deployment.InstrumentManagement", "AppManagement", "Apps.Appfeatures", "Appfeatures.login", "Appfeatures.getlistofinstruments", "Appfeatures.installsurvey", "Appfeatures.removesurvey", "Appfeatures.startsurvey", "Appfeatures.browsedata", "Appfeatures.deletedata", "Appfeatures.uploaddata", "Appfeatures.downloadcases", "Appfeatures.updatesettings", "Appfeatures.viewsettings", "Appfeatures.viewsurveydetails", "SurveyDataAccess", "SurveyDataAccess.webviewer", "UserManagement", "user.createuser", "user.updateuser", "user.removeuser", "user.createrole", "user.updaterole", "user.removerole", "user.adsync", "SkillManagement", "user.createskill", "user.updateskill", "user.removeskill", "user.updateuserskill", "CustomReports", "CR.viewreports", "CR.setreports", "CR.runreport", "CATI", "CATI.setcatispecification", "CATI.setgeneralparameters", "CATI.setgeneralparameters.setsurveydescription", "CATI.setappointmentparameters", "CATI.setappointmentparameters.setappointmentbuffer", "CATI.setappointmentparameters.setkeeptimeofexpiredappointment", "CATI.setappointmentparameters.settreatexpiredappointmentasmedium", "CATI.setdaybatchparameters", "CATI.setdaybatchparameters.setdaybatchsize", "CATI.setdaybatchparameters.setmaxnumberofcalls", "CATI.setdaybatchparameters.setdaysbetweennoanswers", "CATI.setdaybatchparameters.setdaysbetweenansweringmachine", "CATI.setlaunchersettings", "CATI.setlaunchersettings.setschedulerkind", "CATI.setlaunchersettings.settargetresponserate", "CATI.setlaunchersettings.setworkloadforoneresponse", "CATI.setschedulerparameters", "CATI.setschedulerparameters.setmaxnumberofbusydials", "CATI.setschedulerparameters.setmaxnumberofdials", "CATI.setschedulerparameters.setminimumtimebetweennoanswer", "CATI.setschedulerparameters.setminutesbetweenbusydials", "CATI.setschedulerparameters.setnosamedayansweringmachinecalls", "CATI.setschedulerparameters.setgroupdeactivationdelay", "CATI.setschedulerparameters.setinterviewerdeactivationdelay", "CATI.setschedulerparameters.setonlyexpireondeactiviationdelays", "CATI.setfieldselection", "CATI.setfieldselection.setshowinviewer", "CATI.setfieldselection.setwritetohist", "CATI.setselectfieldsettings", "CATI.setselectfieldsettings.setfields", "CATI.setselectfieldsettings.setfields.setfieldinclude", "CATI.setselectfieldsettings.setfields.setfieldvalues", "CATI.setselectfieldsettings.setactive", "CATI.setsortfieldsettings", "CATI.setsortfieldsettings.setactive", "CATI.settimezonesettings", "CATI.settimezonesettings.setappointmentgrace", "CATI.settimezonesettings.setdonotcallbefore", "CATI.settimezonesettings.setdonotcallafter", "CATI.setquotasettings", "CATI.setquotasettings.setactive", "CATI.setsurveydaysettings", "CATI.createdaybatch", "CATI.createdaybatchwithautorevoke", "CATI.extenddaybatch", "CATI.revokecase", "CATI.makesuperappointment", "CATI.adddaybatchrecord", "CATI.updatedaybatchentry", "CATI.removefromdaybatch", "CATI.setdialednumber", "CATI.backupinstrumentdata", "CATI.clearinstrumentdata", "CATI.setoperationtimesettings", "CATI.setdialresult", "CATI.setnotes", "CATI.setcasedeliveryoptions", "CATI.setcasedeliveryoptions.setenabled", "CATI.setcasedeliveryoptions.setweightfactor", "CATI.viewcatispecificationpage", "CATI.viewappointments", "CATI.selectfromcaseinfo", "CATI.selectfromdaybatch", "CATI.selectfromdaybatchmeta", "CATI.selectfromdialhistory", "CATI.selectfromevents", "CATI.modifyclock"];
        data.permissions = ["Root", "Deployment", "Deployment.ServerParkManagement", "Deployment.InstrumentManagement", "Apps", "AppManagement", "Apps.Appfeatures", "Appfeatures.login", "Appfeatures.getlistofinstruments", "Appfeatures.installsurvey", "Appfeatures.removesurvey", "Appfeatures.startsurvey", "Appfeatures.browsedata", "Appfeatures.deletedata", "Appfeatures.uploaddata", "Appfeatures.downloadcases", "Appfeatures.updatesettings", "Appfeatures.viewsettings", "Appfeatures.viewsurveydetails", "SurveyDataAccess", "SurveyDataAccess.webviewer", "UserManagement", "user.createuser", "user.updateuser", "user.removeuser", "user.createrole", "user.updaterole", "user.removerole", "user.adsync", "SkillManagement", "user.createskill", "user.updateskill", "user.removeskill", "user.updateuserskill", "CustomReports", "CR.viewreports", "CR.setreports", "CR.runreport", "CATI", "CATI.setcatispecification", "CATI.setgeneralparameters", "CATI.setgeneralparameters.setsurveydescription", "CATI.setappointmentparameters", "CATI.setappointmentparameters.setappointmentbuffer", "CATI.setappointmentparameters.setkeeptimeofexpiredappointment", "CATI.setappointmentparameters.settreatexpiredappointmentasmedium", "CATI.setdaybatchparameters", "CATI.setdaybatchparameters.setdaybatchsize", "CATI.setdaybatchparameters.setmaxnumberofcalls", "CATI.setdaybatchparameters.setdaysbetweennoanswers", "CATI.setdaybatchparameters.setdaysbetweenansweringmachine", "CATI.setlaunchersettings", "CATI.setlaunchersettings.setschedulerkind", "CATI.setlaunchersettings.settargetresponserate", "CATI.setlaunchersettings.setworkloadforoneresponse", "CATI.setschedulerparameters", "CATI.setschedulerparameters.setmaxnumberofbusydials", "CATI.setschedulerparameters.setmaxnumberofdials", "CATI.setschedulerparameters.setminimumtimebetweennoanswer", "CATI.setschedulerparameters.setminutesbetweenbusydials", "CATI.setschedulerparameters.setnosamedayansweringmachinecalls", "CATI.setschedulerparameters.setgroupdeactivationdelay", "CATI.setschedulerparameters.setinterviewerdeactivationdelay", "CATI.setschedulerparameters.setonlyexpireondeactiviationdelays", "CATI.setfieldselection", "CATI.setfieldselection.setshowinviewer", "CATI.setfieldselection.setwritetohist", "CATI.setselectfieldsettings", "CATI.setselectfieldsettings.setfields", "CATI.setselectfieldsettings.setfields.setfieldinclude", "CATI.setselectfieldsettings.setfields.setfieldvalues", "CATI.setselectfieldsettings.setactive", "CATI.setsortfieldsettings", "CATI.setsortfieldsettings.setactive", "CATI.settimezonesettings", "CATI.settimezonesettings.setappointmentgrace", "CATI.settimezonesettings.setdonotcallbefore", "CATI.settimezonesettings.setdonotcallafter", "CATI.setquotasettings", "CATI.setquotasettings.setactive", "CATI.setsurveydaysettings", "CATI.createdaybatch", "CATI.createdaybatchwithautorevoke", "CATI.extenddaybatch", "CATI.revokecase", "CATI.makesuperappointment", "CATI.adddaybatchrecord", "CATI.updatedaybatchentry", "CATI.removefromdaybatch", "CATI.setdialednumber", "CATI.backupinstrumentdata", "CATI.clearinstrumentdata", "CATI.setoperationtimesettings", "CATI.setdialresult", "CATI.setnotes", "CATI.setcasedeliveryoptions", "CATI.setcasedeliveryoptions.setenabled", "CATI.setcasedeliveryoptions.setweightfactor", "CATI.viewcatispecificationpage", "CATI.viewappointments", "CATI.selectfromcaseinfo", "CATI.selectfromdaybatch", "CATI.selectfromdaybatchmeta", "CATI.selectfromdialhistory", "CATI.selectfromevents", "CATI.modifyclock"]

        const url = "/api/v1/userroles";
        SendBlaiseAPIRequest(req, res, url, "POST", data)
            .then(([status, data]) => {
                res.status(status).json(data);
            });
    });

    return router;
}

