const express = require("express");


const { clientLogin, registerClient, getClientProfile, getAllClients, 
    updateClientProfile,updateClientStatus,updateClientDeleteStatus,getDeletedClients } = require("../controller/client.controller");
const {forgotPassword , resetPassword } = require("../controller/forgotpassword.controller");

const upload = require("../middleware/clientphoto.middleware");
const verifyClient = require("../middleware/verifyclient");
const verifyAdmin = require("../middleware/verifyadmin");

const router = express.Router();


// Public Routes
router.post("/clientLogin",clientLogin);
router.post("/registerClient", upload.single("profilePhoto"), registerClient);
router.get("/getClientProfile",verifyClient,getClientProfile);
router.get("/getAllClients",verifyAdmin,getAllClients);
router.patch("/updateClientProfile", verifyClient, upload.single("profilePhoto"), updateClientProfile);
router.put("/updateClientStatus", verifyAdmin, updateClientStatus);
router.put("/updateClientDeleteStatus", verifyAdmin, updateClientDeleteStatus);
router.get("/getDeletedClients",verifyAdmin, getDeletedClients);
router.post("/forgotPassword", forgotPassword);
router.post("/resetPassword", resetPassword);


module.exports = router;






