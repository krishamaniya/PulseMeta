const express = require("express");
const router = express.Router();
const socketIO = require('socket.io');
const http = require('http');
const {connectMT5 ,getMT5AccountSummary, getAllSavedMT5AccountSummaries ,saveMT5Account, 
 getAndStoreAccountSummary,getAllMyMT5Summaries, getAllAccountSummaries,handleMT5Order,
    getOrderHistory,getAllConnectedId,startWebSocketAPI, fetchAndEmitProfileAPI,
    getAccountDetailByConnectId,getMT5liveAccountSummary,closeMT5Trade,sendMT5Order,getSymbols,getOpenTrades,
    deleteMT5Connection,modifyMT5Order} = require("../controller/mt5connection.controller");

const authenticateUser = require('../middleware/auth.middleware');    

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000", // Your React app's URL
    methods: ["GET", "POST"]
  }
}); 
app.use(express.json());


// POST /api/connect-mt5
router.post("/connectmt5",authenticateUser, connectMT5);

router.get("/getMT5AccountSummary/:connectId", authenticateUser, getMT5AccountSummary);

router.get("/getMT5liveAccountSummary/:connectId", getMT5liveAccountSummary);

router.get("/getAllSavedMT5AccountSummaries", authenticateUser, getAllSavedMT5AccountSummaries);

router.get("/getAllMyMT5Summaries",authenticateUser, getAllMyMT5Summaries);

router.post("/sendMT5Order/:connectId",authenticateUser, sendMT5Order);

router.post("/handleMT5Order/:connectId", handleMT5Order);

router.post("/modifyMT5Order/:connectId",authenticateUser, modifyMT5Order);

router.post("/closeMT5Trade/:connectId",authenticateUser, closeMT5Trade);

router.get('/getOpenTrades/:connectId', authenticateUser, getOpenTrades);

router.post("/getSymbols/:connectId"  , getSymbols);

router.post("/saveMT5Account", authenticateUser, saveMT5Account);

router.post('/startwebsocket', authenticateUser, startWebSocketAPI(io));

// router.post('/closeOrder/:connectId/:ticket', closeOrder);

// router.post('/tradeclose', authenticateUser, tradeclose);

router.delete('/deleteMT5Connection/:connectId' , authenticateUser , deleteMT5Connection);

router.get('/getAccountDetailByConnectId/:connectId',authenticateUser, getAccountDetailByConnectId);

// router.post('/stopwebsocket', stopWebSocket);

router.post ("/fetchupdateprofile",authenticateUser, fetchAndEmitProfileAPI(io));

router.get("/accountsummary/:connectId",authenticateUser, getAndStoreAccountSummary);

router.get("/accounts",authenticateUser, getAllAccountSummaries);

router.post("/accounts",authenticateUser, getAllAccountSummaries);

router.post('/history',authenticateUser, getOrderHistory);

router.get('/getAllConnectedId/:clientId',authenticateUser, getAllConnectedId);


module.exports = router;
