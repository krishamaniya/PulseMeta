// const MetaApi = require('metaapi.cloud-sdk').default;

// const token = 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiJiMmRlMDI3MDk0YjU3YjkzZDFhMTg2MGZlMDAyN2ZhMiIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVzdC1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcnBjLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJtZXRhc3RhdHMtYXBpIiwibWV0aG9kcyI6WyJtZXRhc3RhdHMtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbIio6JFVTRVJfSUQkOioiXX0seyJpZCI6InJpc2stbWFuYWdlbWVudC1hcGkiLCJtZXRob2RzIjpbInJpc2stbWFuYWdlbWVudC1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfSx7ImlkIjoibXQtbWFuYWdlci1hcGkiLCJtZXRob2RzIjpbIm10LW1hbmFnZXItYXBpOnJlc3Q6ZGVhbGluZzoqOioiLCJtdC1tYW5hZ2VyLWFwaTpyZXN0OnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyIqOiRVU0VSX0lEJDoqIl19LHsiaWQiOiJiaWxsaW5nLWFwaSIsIm1ldGhvZHMiOlsiYmlsbGluZy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiKjokVVNFUl9JRCQ6KiJdfV0sImlnbm9yZVJhdGVMaW1pdHMiOmZhbHNlLCJ0b2tlbklkIjoiMjAyMTAyMTMiLCJpbXBlcnNvbmF0ZWQiOmZhbHNlLCJyZWFsVXNlcklkIjoiYjJkZTAyNzA5NGI1N2I5M2QxYTE4NjBmZTAwMjdmYTIiLCJpYXQiOjE3NDQwODY0NDIsImV4cCI6MTc0NjY3ODQ0Mn0.oLZZGl4ljophP-fUrs8cMPKvysQ78CIomegTwhQHnQIEdOOvTzsKsL02gepMJQjf5rZWCj282Zj46QJjp-Jil3ifHe-XNDUSl7vIwZTcgxye4ZGG4UUGc2Up5qMMqDOVv_qNCWsyT1o0LpORF8Sd_ny-C5muxZqx11NzShbwubdOcWgaB2QYPuSgKne_PZWo39WCffDqliQraCkVrU8rlsmpfUMkhZDsrV3gRYhgK-wI8reTZuFHCUsRBvPDhLYU8qfwI8Qqh36OMeQ9TI8bSVLK3PJp0X4ClCkYxOTRYob_PA2c5VBYMA-M-y5rVynX3VZfUI2EKnLyfFEdetdupbBEmjpF2j1OLfuH8FRLmeQa87UEX3U4O2bQYc81MMV8LfryACiK578QtnXIjYlMZDnnpCqhVYZaqsN0CmOPdJToymgyWoHJ-jQjLedMUIufA3bzoJ85B80_fJ46i959DIUL49ThD5MfuxmjQKRPRkUgGedEC51gVCCEXwtaYaf4br7w0GjWcN70UIe8nGcl8qbmjWWvhSZm19i7TrMDIjHV8w8DNPTW307SwyrzRvYXGWzEa3kh4FO-Fk8B2O7eNk6WobF2J-DMOkd5oSsK8S46g8Bu0dSVrkRvAnprv3u3A0dkUSpnEQKeBCy1RRjS9TizkOVVHoSxLtAowMriwQw'; // replace this with your token
// const accountId = '0b536648-a04e-407a-abd8-e39b9f20664e'; // replace this with your MT4 account ID from MetaApi

// const metaApi = new MetaApi(token);

// async function getUserData() {
//   try {
//     const account = await metaApi.metatraderAccountApi.getAccount(accountId);

//     if (account.state !== 'DEPLOYED') {
//       console.log('Deploying account...');
//       await account.deploy();
//     }

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


// const axios = require('axios');

// async function fetchMT4Users(apiKey) {
//     try {
//         const response = await axios.get('https://broker-api.com/mt4/users', {
//             headers: {
//                 'Authorization': `${apiKey}`,
//                 'Content-Type': 'application/json'
//             }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching MT4 users:', error.response?.data || error.message);
//         throw error;
//     }
// }

// // Usage
// const API_KEY = 'your_broker_api_key';
// fetchMT4Users(API_KEY)
//     .then(users => console.log('MT4 Users:', users))
//     .catch(console.error);


// mt4-webservice.js


const express = require('express');
const axios = require('axios');
const app = express();

const MT4_WEBSERVICE = {
  URL: 'http://mt4-api.dev4traders.com/v1/users/',
  AUTH_TOKEN: 'http://mt4mng.mtapi.io/Connect?user=1023&password=some_pass&server=8.215.74.230'
};

app.get('/api/user/:login', async (req, res) => {
  try {
    const response = await axios.get(`${MT4_WEBSERVICE.URL}/user/${req.params.login}`, {
      headers: { 'Authorization': `${MT4_WEBSERVICE.AUTH_TOKEN}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});