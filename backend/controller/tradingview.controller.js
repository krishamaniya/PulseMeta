const TradeService = require('../services/tradeService');
const AccountService = require('../services/accountService');
const MTService = require('../services/mtService');
const { isValidSymbol, isValidVolume } = require('../utils/mtHelpers');
const MetaApi = require('metaapi.cloud-sdk').default;
const client = new MetaApi(process.env.META_API_TOKEN);

exports.executeTrade = async (req, res) => {
  try {
    const { accountId, symbol, action, volume } = req.body;
    
    // Validate inputs
    if (!isValidSymbol(symbol)) {
      return res.status(400).json({ error: 'Invalid symbol' });
    }
    
    if (!isValidVolume(volume, symbol)) {
      return res.status(400).json({ error: 'Invalid volume' });
    }
    
    // Execute trade
    const result = await TradeService.executeMarketOrder(accountId, {
      symbol,
      action,
      volume,
      stopLoss,
      takeProfit
    });
    
    // Get updated account data
    const accountData = await AccountService.getCompleteAccountData(accountId);
    
    res.json({
      success: true,
      trade: result,
      accountData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

exports.getAccountData = async (req, res) => {
  try {
    const { accountId } = req.params;
    const data = await AccountService.getCompleteAccountData(accountId);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAccountInfo = async (accountId)  => {
  const account = client.metatraderAccountApi.getAccount(accountId);
  await account.waitConnected();
  const balance = await account.getAccountBalance();
  const positions = await account.getOpenPositions();
  return { balance, positions };
}

// To place order:
async function placeOrder(accountId, symbol, volume, side) {
  const account = client.metatraderAccountApi.getAccount(accountId);
  await account.waitConnected();
  const order = {
    symbol,
    volume,
    type: side === 'buy' ? 'buy' : 'sell',
    // more parameters as needed
  };
  const result = await account.createMarketOrder(order);
  return result;
}

// exports.fetchAccountData = async (req, res) => {
//   try {
//     const { accountNo, password, serverName } = req.body;

//     // Validate inputs
//     if (!accountNo || !password || !serverName) {
//       return res.status(400).json({ 
//         error: 'Account number, password, and server name are required',
//         code: 'MISSING_CREDENTIALS'
//       });
//     }

//     logger.info(`Attempting to connect to MT account ${accountNo} on ${serverName}`);

//     let connection;
//     try {
//       // Connect to MT account
//       connection = await MTService.connectWithCredentials({
//         accountNo,
//         password,
//         serverName
//       });
//       logger.info(`Successfully connected to MT account ${accountNo}`);
//     } catch (connectError) {
//       logger.error(`Connection failed for account ${accountNo}:`, connectError);
//       return res.status(401).json({
//         error: 'Failed to connect to MetaTrader account',
//         code: 'CONNECTION_FAILED',
//         details: connectError.message.includes('invalid credentials') 
//           ? 'Invalid account credentials' 
//           : connectError.message
//       });
//     }

//     try {
//       // Fetch all required data
//       logger.info(`Fetching data for account ${accountNo}`);
//       const [accountInfo, positions, orders, history] = await Promise.all([
//         connection.getAccountInformation(),
//         connection.getPositions(),
//         connection.getOrders(),
//         connection.getHistory()
//       ]);

//       // Calculate live P/L
//       const livePL = positions.reduce((sum, pos) => sum + pos.profit, 0);

//       // Format response
//       const response = {
//         name: accountInfo.name || 'N/A',
//         accountNo: accountInfo.login,
//         broker: serverName,
//         currency: accountInfo.currency,
//         balance: accountInfo.balance,
//         equity: accountInfo.equity,
//         livePL,
//         login: accountInfo.login,
//         positions: positions.map(p => ({
//           symbol: p.symbol,
//           type: p.type,
//           volume: p.volume,
//           profit: p.profit
//         })),
//         lastUpdated: new Date()
//       };

//       logger.info(`Successfully fetched data for account ${accountNo}`);
//       res.json(response);
//     } catch (dataError) {
//       logger.error(`Data fetch failed for account ${accountNo}:`, dataError);
//       return res.status(500).json({
//         error: 'Failed to fetch account data',
//         code: 'DATA_FETCH_FAILED',
//         details: dataError.message
//       });
//     } finally {
//       try {
//         if (connection) {
//           await connection.close();
//           logger.info(`Closed connection for account ${accountNo}`);
//         }
//       } catch (closeError) {
//         logger.warn(`Error closing connection for account ${accountNo}:`, closeError);
//       }
//     }
//   } catch (error) {
//     logger.error('Unexpected error in fetchAccountData:', error);
//     res.status(500).json({ 
//       error: 'Internal server error',
//       code: 'INTERNAL_ERROR',
//       details: error.message 
//     });
//   }
// };

// exports.getAccountDetails = async (req, res) => {
//   // ... existing implementation
// };

// exports.getAllAccounts = async (req, res) => {
//   // ... existing implementation
// };
// const TradingViewAlert = require('../tradingview-mt4-crm/src/models/tradingview.model');
// const PublisherService =require('../tradingview-mt4-crm/src/services/mt4-bridge/zeromq/publisher.service');
// const logger = require('../tradingview-mt4-crm/src/utils/logger');
// const { validateTradingViewAlert } = require('../tradingview-mt4-crm/src/utils/validator');

// exports.processAlert = async (req, res) => {
//   try {
//     // Validate incoming alert
//     const { error } = validateTradingViewAlert(req.body);
//     if (error) return res.status(400).send(error.details[0].message);

//     const alert = {
//       ...req.body,
//       timestamp: new Date(),
//       status: 'pending'
//     };

//     // Publish alert to MT4 via ZeroMQ
//     await PublisherService.publishTrade({
//       topic: 'ALERT',
//       message: JSON.stringify(alert)
//     });

//     // Save alert to database
//     const savedAlert = new TradingViewAlert(alert);
//     await savedAlert.save();

//     logger.info(`Processed TradingView alert: ${alert.alertId}`);
//     res.status(200).send(savedAlert);
//   } catch (error) {
//     logger.error(`Error processing TradingView alert: ${error.message}`);
//     res.status(500).send('Error processing alert');
//   }
// };

// exports.getAlerts = async (req, res) => {
//   try {
//     const { userId, status, symbol } = req.query;
//     const query = {};
    
//     if (userId) query.userId = userId;
//     if (status) query.status = status;
//     if (symbol) query.symbol = symbol;
    
//     const alerts = await TradingViewAlert.find(query)
//       .sort({ timestamp: -1 })
//       .limit(50);
      
//     res.status(200).send(alerts);
//   } catch (error) {
//     logger.error(`Error fetching TradingView alerts: ${error.message}`);
//     res.status(500).send('Error fetching alerts');
//   }
// };