require('dotenv').config(); // This must be at the very top
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const connect_to_db = require("./config/db.config.js");  
// const MongoChangeStream = require("./services/mongochangestream");

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Verify MongoDB URL is loaded
// console.log('Using MongoDB URL:', process.env.MONGO_DB_URL);

// Initialize MongoDB Change Streams
// try {
//   const mongoWatcher = new MongoChangeStream(io);
//   mongoWatcher.watchCollection('tradedb', 'mt5profiles'); // Use your actual DB name
// } catch (error) {
//   console.error('Failed to initialize MongoDB watcher:', error);
//   process.exit(1);
// }

// Connect to database
connect_to_db();

// Middleware
app.use(express.json());
app.use(cors());  
app.use(bodyParser.json());

// Routes
app.use("/api/admin", require("./routes/admin.routes.js"));
app.use("/api/client", require("./routes/client.routes.js"));
app.use("/api/connect", require("./routes/mt5connection.routes.js"));
app.use("/api/server", require("./routes/server.routes.js"));

// Start server
const PORT = process.env.PORT || 8000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on ${PORT}`);
  console.log(`Socket.IO running on ${PORT}`);
});

// app.use("/api/webhook",require("./routes/webhook.routes.js"));
// app.use("/api/broker", require("./routes/broker.routes.js"));
// app.use("/api/account", require("./routes/account.routes.js"));
// app.use('/api/mtaccounts', require("./routes/MT4account.js"));
// app.use('/api/auth', require('./routes/auth.js'));
// app.use('/api/accounts',require('./routes/trade.routes.js'));


// app.post('/api/mt4data', (req, res) => {
//   const userData = req.body;  // Data sent from MT4
//   console.log('Received data from MT4:', userData);
  
//   // Respond back to MT4 (you can customize this response as needed)
//   res.status(200).send('Data received successfully');
// });


// const MetaApi = require('metaapi.cloud-sdk').default;

// const token = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxYTkzNGM5MmY3NDRjNDgzMDliMmE1MWEyMjEyYTEzMyIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiXSwicmVzb3VyY2VzIjpbImFjY291bnQ6JFVTRVJfSUQkOjM4MTZkZjFiLTViYTUtNGM1NS1hZGRlLWJmM2EwMzU3NDNjMSJdfSx7ImlkIjoibWV0YWFwaS1yZXN0LWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiYWNjb3VudDokVVNFUl9JRCQ6MzgxNmRmMWItNWJhNS00YzU1LWFkZGUtYmYzYTAzNTc0M2MxIl19LHsiaWQiOiJtZXRhYXBpLXJwYy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyJhY2NvdW50OiRVU0VSX0lEJDozODE2ZGYxYi01YmE1LTRjNTUtYWRkZS1iZjNhMDM1NzQzYzEiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyJhY2NvdW50OiRVU0VSX0lEJDozODE2ZGYxYi01YmE1LTRjNTUtYWRkZS1iZjNhMDM1NzQzYzEiXX0seyJpZCI6Im1ldGFzdGF0cy1hcGkiLCJtZXRob2RzIjpbIm1ldGFzdGF0cy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiYWNjb3VudDokVVNFUl9JRCQ6MzgxNmRmMWItNWJhNS00YzU1LWFkZGUtYmYzYTAzNTc0M2MxIl19LHsiaWQiOiJyaXNrLW1hbmFnZW1lbnQtYXBpIiwibWV0aG9kcyI6WyJyaXNrLW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiXSwicmVzb3VyY2VzIjpbImFjY291bnQ6JFVTRVJfSUQkOjM4MTZkZjFiLTViYTUtNGM1NS1hZGRlLWJmM2EwMzU3NDNjMSJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiMWE5MzRjOTJmNzQ0YzQ4MzA5YjJhNTFhMjIxMmExMzMiLCJpYXQiOjE3NDQ2MTE2MTMsImV4cCI6MTc1MjM4NzYxM30.PQrselVUyu6KrFSntgJuQlwtO5ARapEtjrqLE4ng5N-DLT78SpSUqwzHjf00wD4vf50fAlBlVG9sodqTfyNPgdNMjUFm9x6gw4WFJDTr9oxRD5N7N5IIImKGDjKXhPEdx2Pcke9BpPe8mpsck5JD1bQ67M2PenY2yXCVvi9OWV87U0adpfT6ueuoXPoL8JSAgqloDUP1N0zrKimys3bDtxtlZ-GPd2X7EWtMJGp6N554ac5Lf2ozw0VNWuBi6OPO2fcpQpFhccGcjW2AjcNViQ8zLZpmjRyeHiIYIdaCgZ5ruXdStO_WJu2cl3unChmRmI-UK2I5Dwt9x4tSdil9XfDDwbAiLKERf9-q5Ph9v3kKcwotLbbKy4fsKWePlvXTlp7FcTDoFniQ8zFVpLANP2T0Hhy9jTbVeWSNCZGB6O7f869HPHG0TVt4Q2mbDaD6P5me--Lb3fORq8BaZ40s9F7UAOwm1WUTErWbL7wfHSFyW4qRrUhDK7DwmKuf_dQaIoju53QvJSQ44VRhaAg-hDKctPgx7Ja1RYR1NH2PlzVyUe9yBu-7L0cSAWV6OL9ODf9XgCK15ruBe2bIaogaitgYSRPlTarH5Hk-VfT2WQkgHiq8H_a6JECdcPy3KLaPHI3xqPrHoM7pyZS4g_gz2DQsH49mOG8er1ZMO7q3LMA'; 
// const accountId = '3816df1b-5ba5-4c55-adde-bf3a035743c1'; 

// const metaApi = new MetaApi(token);

// async function getUserData() {
//     try {
//     const account = await metaApi.metatraderAccountApi.getAccount(accountId);

//     if (account.state !== 'DEPLOYED') {
//         console.log('Deploying account...');
//         await account.deploy();
//       }                                                                                                                                                                                                                                                                                                                                                        
  
//     console.log('Waiting for MT4 terminal to connect...');
//     await account.waitConnected();

//     const connection = account.getRPCConnection();
//     await connection.connect();

//     const accountInfo = await connection.getAccountInformation();
//     console.log('Account Info:', accountInfo);
//   } catch (error) {
//     console.error('Error fetching MT4 user data:', error.message);
//   }
// }

// getUserData();



// const port = process.env.PORT || 8000;
// app.listen(port, () => {
//   console.log(`Server Running at http://localhost:${port}`);
// });
  
