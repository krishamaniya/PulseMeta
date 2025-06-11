const express = require("express");
const router = express.Router();


const { adminLogin ,createAdminProfile ,getAdminProfile ,updateAdminProfile ,deleteAdmin } = require("../controller/admin.controller");

const upload = require("../middleware/adminphoto.middleware");
const verifyAdmin = require("../middleware/verifyadmin");



router.post("/adminlogin",adminLogin);
router.post("/createAdminProfile", upload.single("profilephoto"), createAdminProfile);
router.get("/getAdminProfile",verifyAdmin, getAdminProfile);
router.patch("/updateAdminProfile", verifyAdmin, upload.single("profilePhoto"), updateAdminProfile);
router.delete("/deleteAdmin",verifyAdmin, deleteAdmin);

module.exports = router;



