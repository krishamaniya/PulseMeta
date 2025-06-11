// const MetaApi = require('metaapi.cloud-sdk').default;

// const client = new MetaApi(process.env.META_API_TOKEN);

// async function getAccountInfo(accountId) {
//   const account = client.metatraderAccountApi.getAccount(accountId);
//   await account.waitConnected();
//   const balance = await account.getAccountBalance();
//   const positions = await account.getOpenPositions();
//   return { balance, positions };
// }

// // To place order:
// async function placeOrder(accountId, symbol, volume, side) {
//   const account = client.metatraderAccountApi.getAccount(accountId);
//   await account.waitConnected();
//   const order = {
//     symbol,
//     volume,
//     type: side === 'buy' ? 'buy' : 'sell',
//     // more parameters as needed
//   };
//   const result = await account.createMarketOrder(order);
//   return result;
// }


// let MetaApi = require('metaapi.cloud-sdk').default;

// let token = process.env.TOKEN || 'eyJhbGciOiJSUzUxMiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiIxYTkzNGM5MmY3NDRjNDgzMDliMmE1MWEyMjEyYTEzMyIsImFjY2Vzc1J1bGVzIjpbeyJpZCI6InRyYWRpbmctYWNjb3VudC1tYW5hZ2VtZW50LWFwaSIsIm1ldGhvZHMiOlsidHJhZGluZy1hY2NvdW50LW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbImFjY291bnQ6JFVTRVJfSUQkOjM4MTZkZjFiLTViYTUtNGM1NS1hZGRlLWJmM2EwMzU3NDNjMSJdfSx7ImlkIjoibWV0YWFwaS1yZXN0LWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiYWNjb3VudDokVVNFUl9JRCQ6MzgxNmRmMWItNWJhNS00YzU1LWFkZGUtYmYzYTAzNTc0M2MxIl19LHsiaWQiOiJtZXRhYXBpLXJwYy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyJhY2NvdW50OiRVU0VSX0lEJDozODE2ZGYxYi01YmE1LTRjNTUtYWRkZS1iZjNhMDM1NzQzYzEiXX0seyJpZCI6Im1ldGFhcGktcmVhbC10aW1lLXN0cmVhbWluZy1hcGkiLCJtZXRob2RzIjpbIm1ldGFhcGktYXBpOndzOnB1YmxpYzoqOioiXSwicm9sZXMiOlsicmVhZGVyIiwid3JpdGVyIl0sInJlc291cmNlcyI6WyJhY2NvdW50OiRVU0VSX0lEJDozODE2ZGYxYi01YmE1LTRjNTUtYWRkZS1iZjNhMDM1NzQzYzEiXX0seyJpZCI6Im1ldGFzdGF0cy1hcGkiLCJtZXRob2RzIjpbIm1ldGFzdGF0cy1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciJdLCJyZXNvdXJjZXMiOlsiYWNjb3VudDokVVNFUl9JRCQ6MzgxNmRmMWItNWJhNS00YzU1LWFkZGUtYmYzYTAzNTc0M2MxIl19LHsiaWQiOiJyaXNrLW1hbmFnZW1lbnQtYXBpIiwibWV0aG9kcyI6WyJyaXNrLW1hbmFnZW1lbnQtYXBpOnJlc3Q6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbImFjY291bnQ6JFVTRVJfSUQkOjM4MTZkZjFiLTViYTUtNGM1NS1hZGRlLWJmM2EwMzU3NDNjMSJdfSx7ImlkIjoibWV0YWFwaS1yZWFsLXRpbWUtc3RyZWFtaW5nLWFwaSIsIm1ldGhvZHMiOlsibWV0YWFwaS1hcGk6d3M6cHVibGljOio6KiJdLCJyb2xlcyI6WyJyZWFkZXIiLCJ3cml0ZXIiXSwicmVzb3VyY2VzIjpbImFjY291bnQ6JFVTRVJfSUQkOjM4MTZkZjFiLTViYTUtNGM1NS1hZGRlLWJmM2EwMzU3NDNjMSJdfSx7ImlkIjoiY29weWZhY3RvcnktYXBpIiwibWV0aG9kcyI6WyJjb3B5ZmFjdG9yeS1hcGk6cmVzdDpwdWJsaWM6KjoqIl0sInJvbGVzIjpbInJlYWRlciIsIndyaXRlciJdLCJyZXNvdXJjZXMiOlsiYWNjb3VudDokVVNFUl9JRCQ6MzgxNmRmMWItNWJhNS00YzU1LWFkZGUtYmYzYTAzNTc0M2MxIl19XSwiaWdub3JlUmF0ZUxpbWl0cyI6ZmFsc2UsInRva2VuSWQiOiIyMDIxMDIxMyIsImltcGVyc29uYXRlZCI6ZmFsc2UsInJlYWxVc2VySWQiOiIxYTkzNGM5MmY3NDRjNDgzMDliMmE1MWEyMjEyYTEzMyIsImlhdCI6MTc0NDYxMTc0MSwiZXhwIjoxNzQ3MjAzNzQxfQ.DpIg-EB7V7QhcPcuG1usjo1wOqT-SjOHvZjZMUi4xvb_8WKUwjRCswjzJ6oGTjnU9qke3sl5Y8gkVyagqQ4112NyH2c-rC3qKCgh2SD8iKU8GqMQL-zysB5btoEoXiIMkmXYNYN9f9yNf4LT2-CyQyZ79BGPYJs2vER2BDs21gPVSZ31S4noT_pxJT1mKeG9wBAQo7OH8lCfxp8R0jqtP2YPDDiMILLIU27H4Oog31MNbVsfO6vL6fVdgMmzN8KMotIPiSEyWHFUc3cBjPXNaIeAjZOC8zTuGqqIS2zuPmNR2H60Dxwd0p6iqsZKt618e0WnBEwT4dvtYBfF3VdSylchBVbWoNFu4pqiEpM2KDiy2bvdiSXlpEgsz-MZOrAi6fsZ_pBmW_gc3QNzZCytJ7vBYdWfOLP6QjQIOv5VNE3kDN9eTDsuSBaHI_TbIhQRMOILLM81JyglvkLT1ThUaH9oEpBm1_1awPgDh2hZItMkikR0-e6XqnmMUaGdTyLxFYKzc-R2pMSk_0KmpnNruAENnH4jpZuqHfTqXSifggtaB9nKYBfr57kjdHDbs5kpJ_SOCJw6VdmYpgFOtJZSNvGRe6kEejPWuqW01H_i2CbmD0v7FdE0cwvZVfjcp2jnv_HBtz3hM2-dYn1EHef3fU3dqaDVgf9sj1zgK1Et908';
// let accountId = process.env.ACCOUNT_ID || '3816df1b-5ba5-4c55-adde-bf3a035743c1';

// const api = new MetaApi(token);

// async function testMetaApiSynchronization() {
//   try {
//     const account = await api.metatraderAccountApi.getAccount(accountId);
//     const initialState = account.state;
//     const deployedStates = ['DEPLOYING', 'DEPLOYED'];

//     if(!deployedStates.includes(initialState)) {
//       // wait until account is deployed and connected to broker
//       console.log('Deploying account');
//       await account.deploy();
//     }
  
//     console.log('Waiting for API server to connect to broker (may take couple of minutes)');
//     await account.waitConnected();

//     // connect to MetaApi API
//     let connection = account.getRPCConnection();
//     await connection.connect();

//     // wait until terminal state synchronized to the local state
//     console.log('Waiting for SDK to synchronize to terminal state (may take some time depending on your history size)');
//     await connection.waitSynchronized();

//     // invoke RPC API (replace ticket numbers with actual ticket numbers which exist in your MT account)
//     console.log('Testing MetaAPI RPC API');
//     console.log('account information:', await connection.getAccountInformation());
//     console.log('positions:', await connection.getPositions());
//     //console.log(await connection.getPosition('1234567'));
//     console.log('open orders:', await connection.getOrders());
//     //console.log(await connection.getOrder('1234567'));
//     console.log('history orders by ticket:', await connection.getHistoryOrdersByTicket('1234567'));
//     console.log('history orders by position:', await connection.getHistoryOrdersByPosition('1234567'));
//     console.log('history orders (~last 3 months):', 
//       await connection.getHistoryOrdersByTimeRange(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()));
//     console.log('history deals by ticket:', await connection.getDealsByTicket('1234567'));
//     console.log('history deals by position:', await connection.getDealsByPosition('1234567'));
//     console.log('history deals (~last 3 months):', 
//       await connection.getDealsByTimeRange(new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), new Date()));
//     console.log('server time', await connection.getServerTime());

//     // calculate margin required for trade
//     console.log('margin required for trade', await connection.calculateMargin({
//       symbol: 'GBPUSD',
//       type: 'ORDER_TYPE_BUY',
//       volume: 0.1,
//       openPrice: 1.1
//     }));

//     // trade
//     console.log('Submitting pending order');
//     try {
//       let result = await
//       connection.createLimitBuyOrder('GBPUSD', 0.07, 1.0, 0.9, 2.0, {
//         comment: 'comm',
//         clientId: 'TE_GBPUSD_7hyINWqAlE',
//         expiration: {
//           type: 'ORDER_TIME_SPECIFIED',
//           time: new Date(Date.now() + 24 * 60 * 60 * 1000)
//         }
//       });
//       console.log('Trade successful, result code is ' + result.stringCode);
//     } catch (err) {
//       console.log('Trade failed with result code ' + err.stringCode);
//     }

//     if(!deployedStates.includes(initialState)) {
//       // undeploy account if it was undeployed
//       console.log('Undeploying account');
//       await connection.close();
//       await account.undeploy();
//     }
  
//   } catch (err) {
//     console.error(err);
//   }
//   process.exit();
// }

// testMetaApiSynchronization();
