const axios = require("axios");
const mongoose = require('mongoose');
const MT5Connection = require("../model/mt5connection");
const MT5Profile = require("../model/accountsummary");
const OrderHistory = require('../model/tradehistory'); 
const WebSocket = require('ws');
const cron = require('node-cron');
  
let activeSockets = {};
// let lastProfits = {};

const connectMT5 = async (req, res) => {
  const { user, password, server } = req.body;
  const clientId = req.user?._id || req.client?._id; // depends on your auth middleware

  if (!user || !password || !server) {
    return res.status(400).json({ message: "User, password, and server are required." });
  }

  if (!clientId) {
    return res.status(401).json({ message: "Unauthorized: Client ID missing from token." });
  }

  try {
    const response = await axios.get("https://mt5.mtapi.io/ConnectEx", {
      params: {
        user,
        password,
        server,
        connectTimeoutSeconds: 60,  
        reconnectOnSymbolUpdate: true
      }
    });

    const connectId = response.data;

    if (!connectId || connectId === 'INVALID_ACCOUNT' || typeof connectId !== 'string') {
      return res.status(400).json({
        error: 'Invalid MT5 credentials or connection failed',
        details: response.data
      });
    }

    let mt5Connection = await MT5Connection.findOne({ connectId });

    if (mt5Connection) {
      mt5Connection.user = user;
      mt5Connection.password = password;
      mt5Connection.server = server;
      mt5Connection.clientId = clientId;
      mt5Connection.isDeleted = false;
      await mt5Connection.save();
    } else {
      mt5Connection = new MT5Connection({
        user,
        password,
        server,
        connectId,
        clientId,
        isDeleted: false
      });
      await mt5Connection.save();
    }

    // Start WebSocket listener (non-blocking)
    startWebSocketAPI(connectId, req.io); // pass `req.io` if needed

    return res.status(200).json({
      message: "MT5 account connected successfully",
       connectId
    });

  } catch (error) {
    console.error("Error connecting to MT5:", error.message);
    return res.status(500).json({
      message: "Failed to connect to MT5",
      error: error.message
    });
  }
}; 

const getMT5AccountSummary = async (req, res) => {
  const { connectId } = req.params;

  if (!connectId) {
    return res.status(400).json({ message: "connectId is required to fetch account summary." });
  }

  try {
    // Get the logged-in client from the request object
    const clientId = req.client._id;

    const response = await axios.get("https://mt5.mtapi.io/AccountSummary", {
      params: { id: connectId }
    });

    const data = response.data;

    // Check if token is invalid or connectId not found
    if (typeof data === "object" && data?.message?.includes("not found")) {
      return res.status(404).json({
        message: "Invalid or expired token",
        details: data
      });
    }

    // Extract and map fields to match your schema
    const profileData = {
      connectId: connectId,
      clientId: clientId, // Using clientId to match your schema
      profit: data.profit,
      balance: data.balance,
      equity: data.equity,
      margin: data.margin,
      freeMargin: data.freeMargin,
      credit: data.credit,
      marginLevel: data.marginLevel,
      openedOrders: data.openedOrders || [],
      updateType: "api",
      updatedAt: new Date()
    };

    // Save or update the profile
    const updatedProfile = await MT5Profile.findOneAndUpdate(
      { connectId }, // Only using connectId since it's unique
      profileData,
      { 
        upsert: true, 
        new: true, 
        setDefaultsOnInsert: true
      }
    );

    return res.status(200).json({
      message: "Account summary fetched and saved successfully",
      summary: updatedProfile
    });

  } catch (error) {
    console.error("Failed to fetch account summary:", error.message);
    return res.status(500).json({
      message: "Failed to fetch account summary",
      error: error.message
    });
  }
};

// const getMT5liveAccountSummary = async (req, res) => {
//   const { connectId } = req.params;

//   if (!connectId) {
//     return res.status(400).json({ message: "connectId is required to fetch account summary." });
//   }

//   try {
//     const clientId = req.client._id;
    
//     // Set response headers for streaming
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
//     res.flushHeaders();

//     // Set up change stream for real-time updates
//     // const changeStream = MT5Profile.watch([
//     //   { $match: { 'fullDocument.connectId': connectId } }
//     // ]);

//     // changeStream.on('change', (change) => {
//     //   res.write(`data: ${JSON.stringify({
//     //     timestamp: new Date(),
//     //     updateType: "database",
//     //     data: change.fullDocument
//     //   })}\n\n`);
//     // });

//     // Set up an interval to fetch updates from API
//     const fetchInterval = setInterval(async () => {
//       try {
//         const response = await axios.get("https://mt5.mtapi.io/AccountSummary", {
//           params: { id: connectId }
//           });

//         const data = response.data;
        
//         const profileData = {
//           connectId: connectId,
//           clientId: clientId,
//           profit: data.profit,
//           balance: data.balance,
//           equity: data.equity,
//           margin: data.margin,
//           freeMargin: data.freeMargin,
//           credit: data.credit,
//           marginLevel: data.marginLevel,
//           openedOrders: data.openedOrders || [],
//           updateType: "api",
//           updatedAt: new Date()
//         };

//         await MT5Profile.findOneAndUpdate(
//           { connectId },
//           profileData,
//           { 
//             upsert: true, 
//             new: true, 
//             setDefaultsOnInsert: true
//           }
//         );

//       } catch (error) {
//         console.error("Error during live update:", error.message);
//         res.write(`event: error\ndata: ${JSON.stringify({
//           message: "Error during live update",
//           error: error.message,
//           timestamp: new Date()
//         })}\n\n`);
//       }
//     }, 1000);

//     // Handle client disconnect
//     req.on('close', () => {
//       clearInterval(fetchInterval);
//       // changeStream.close();
//       res.end();
//     });

//   } catch (initialError) {
//     console.error("Failed to initialize live updates:", initialError.message);
//     return res.status(500).json({
//       message: "Failed to initialize live updates",
//       error: initialError.message
//     });
//   }
// };


const getMT5liveAccountSummary = async (req, res) => {
  const { connectId } = req.params;

  if (!connectId) {
    return res.status(400).json({ message: "connectId is required to fetch account summary." });
  }

  try {
    const clientId = req.client._id;

    // Set response headers for SSE
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.flushHeaders();

    const fetchInterval = setInterval(async () => {
      try {
        // Step 1: Account summary
        const response = await axios.get("https://mt5.mtapi.io/AccountSummary", {
          params: { id: connectId }
        });

        const data = response.data;
        if (!data) throw new Error("Empty response from MT5 AccountSummary API");

        // Step 2: Fetch open trades from another API
          let openedOrders = [];
          try {
            const ordersRes = await axios.get("https://mt5.mtapi.io/OpenedOrders", {
              params: { id: connectId }
            });
            openedOrders = Array.isArray(ordersRes.data) ? ordersRes.data : [];
          } catch (err) {
            console.warn("Warning: Could not fetch open orders:", err.message);
          }


        // Step 3: Prepare and update profile
        const profileData = {
          connectId,
          clientId,
          profit: data.profit,
          balance: data.balance,
          equity: data.equity,
          margin: data.margin,
          freeMargin: data.freeMargin,
          credit: data.credit,
          marginLevel: data.marginLevel,
          openedOrders: openedOrders, // now with real order details
          updateType: "api",
          updatedAt: new Date()
        };

        const updatedProfile = await MT5Profile.findOneAndUpdate(
          { connectId },
          { $set: profileData },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        // Step 4: Push to client
        res.write(`data: ${JSON.stringify({
          timestamp: new Date(),
          updateType: "api",
          data: updatedProfile
        })}\n\n`);

      } catch (error) {
        console.error("Error during live update:", error.message);
        res.write(`event: error\ndata: ${JSON.stringify({
          message: "Error during live update",
          error: error.message,
          timestamp: new Date()
        })}\n\n`);
      }
    }, 1000);

    req.on("close", () => {
      clearInterval(fetchInterval);
      res.end();
    });

  } catch (initialError) {
    console.error("Failed to initialize live updates:", initialError.message);
    return res.status(500).json({
      message: "Failed to initialize live updates",
      error: initialError.message
    });
  }
};
  
const sendMT5Order = async (req, res) => {
  const { connectId } = req.params;
  const { symbol, operation, volume } = req.body;

  // Validate required fields
  if (!connectId || !symbol || !operation || !volume) {
    return res.status(400).json({
      message: "connectId, symbol, operation, and volume are required.",
    });
  }

  try {
    const response = await axios.get("https://mt5.mtapi.io/OrderSend", {
      params: {
        id: connectId,
        symbol,
        operation,         // Buy or Sell
        volume       // e.g. 0.1
      },
    });

    const result = response.data;
    // console.log("OrderSend result:", result);

    if (result?.ticket) {
      return res.status(200).json({
        message: "Trade order sent successfully.",
        order: result,
      });
    } else {
      return res.status(400).json({
        message: "Failed to send trade order.",
        result,
      });
    }

  } catch (error) {
    console.error("Error sending order:", error.message);
    return res.status(500).json({
      message: "Internal server error while sending trade order.",
      error: error.message,
    });
  }
};

const closeMT5Trade = async (req, res) => {
  const { connectId } = req.body;
  const { symbol, operation } = req.body;

  if (!connectId) {
    return res.status(400).json({ message: "connectId is required." });
  }

  if (!symbol || !operation) {
    return res.status(400).json({ message: "symbol and operation are required in body." });
  }

  try {
    const profile = await MT5Profile.findOne({ connectId });

    if (!profile) {
      return res.status(404).json({ message: "No profile found for this connectId." });
    }

    if (!Array.isArray(profile.openedOrders) || profile.openedOrders.length === 0) {
      return res.status(404).json({ 
        message: "No opened orders found for this connectId.",
        openedOrders: profile.openedOrders,
      });
    }

    const matchingTrades = profile.openedOrders.filter(
      order =>
        order.symbol === symbol &&
        String(order.orderType).toLowerCase() === String(operation).toLowerCase()
    );

    if (matchingTrades.length === 0) {
      return res.status(404).json({ message: "No matching trades found with this symbol and operation." });
    }

    const results = [];
    const tradesToUpdate = [];

    for (const trade of matchingTrades) {
      try {
        // First check if the position still exists
        const checkResponse = await axios.get("https://mt5.mtapi.io/PositionGet", {
          params: {
            id: connectId,
            ticket: trade.ticket,
          },
        });

        // If position doesn't exist (404), mark as already closed
        if (checkResponse.status === 404) {
          results.push({
            ticket: trade.ticket,
            symbol: trade.symbol,
            operation: trade.operation,
            status: "already_closed",
            result: { message: "Position was already closed" }
          });
          tradesToUpdate.push(trade.ticket);
          continue;
        }

        // If position exists, attempt to close it
        const closeResponse = await axios.get("https://mt5.mtapi.io/OrderClose", {
          params: {
            id: connectId,
            ticket: trade.ticket,
          },
        });

        const result = closeResponse.data;
        const isClosed = result?.closePrice > 0 &&
                        result?.dealInternalOut?.direction === "Out" &&
                        result?.dealInternalOut?.volume > 0;

        results.push({
          ticket: trade.ticket,
          symbol: trade.symbol,
          operation: trade.operation,
          status: isClosed ? "closed" : "failed",
          result,
        });

        if (isClosed) {
          tradesToUpdate.push(trade.ticket);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          results.push({
            ticket: trade.ticket,
            symbol: trade.symbol,
            operation: trade.operation,
            status: "already_closed",
            error: "Position was already closed",
          });
          tradesToUpdate.push(trade.ticket);
        } else {
          results.push({
            ticket: trade.ticket,
            symbol: trade.symbol,
            operation: trade.operation,
            status: "error",
            error: err.message,
          });
        }
      }
    }

    // Update database to remove closed trades
    if (tradesToUpdate.length > 0) {
      await MT5Profile.updateOne(
        { connectId },
        { $pull: { openedOrders: { ticket: { $in: tradesToUpdate } } } }
      );
    }

    return res.status(200).json({
      message: "Trade close attempts completed.",
      totalTrades: matchingTrades.length,
      results,
      updatedDatabase: tradesToUpdate.length > 0,
    });
  } catch (error) {
    console.error("Error closing trades:", error.message);
    return res.status(500).json({
      message: "Internal server error while closing trades.",
      error: error.message,
    });
  }
};


// Regular sync job (run every 5 minutes)
cron.schedule('*/5 * * * *', async () => {
  console.log('Running periodic MT5 positions sync...');
  const profiles = await MT5Profile.find({});
  for (const profile of profiles) {
    await syncOpenedOrders(profile.connectId);
  }
});

// Helper function to sync local DB with MT5 positions
async function syncOpenedOrders(connectId) {
  try {
    const response = await axios.get("https://mt5.mtapi.io/PositionsGet", {
      params: { id: connectId }
    });
    
    const currentPositions = response.data.positions || [];
    
    await MT5Profile.updateOne(
      { connectId },
      { 
        openedOrders: currentPositions.map(pos => ({
          ticket: pos.PositionId || pos.ticket,
          symbol: pos.Symbol || pos.symbol,
          orderType: pos.Type || pos.type,
          volume: pos.Volume || pos.volume,
          openPrice: pos.PriceOpen || pos.openPrice,
          openTime: pos.Time || pos.openTime,
          profit: pos.Profit || pos.profit,
          swap: pos.Swap || pos.swap
        }))
      }
    );
    
    return true;
  } catch (error) {
    console.error(`Sync failed for connectId ${connectId}:`, error.message);
    return false;
  }
}

// Main order handling function
const handleMT5Order = async (req, res) => {
  const { connectId } = req.params;
  const { symbol, operation } = req.body;

  // Validate required fields
  if (!connectId || !symbol || !operation) {
    return res.status(400).json({
      message: "connectId, symbol, and operation are required.",
    });
  }

  try {
    const op = operation.toLowerCase();
    
    // Sync positions before any operation
    await syncOpenedOrders(connectId);

    // Handle buy/sell operations
    if (op === "buy" || op === "sell") {
      const { volume } = req.body;

      if (!volume) {
        return res.status(400).json({ 
          message: "volume is required for placing an order." 
        });
      }

      const response = await axios.get("https://mt5.mtapi.io/OrderSend", {
        params: { id: connectId, symbol, operation: op, volume },
      });

      const result = response.data;

      if (result?.ticket) {
        // Update local DB after successful order
        await syncOpenedOrders(connectId);
        return res.status(200).json({
          message: "Trade order sent successfully.",
          order: result,
        });
      } 
      return res.status(400).json({
        message: "Failed to send trade order.",
        result,
      });
    }

    // Handle close operations
    if (op === "buyclose" || op === "sellclose") {
      const profile = await MT5Profile.findOne({ connectId });

      if (!profile) {
        return res.status(404).json({ 
          message: "No profile found for this connectId." 
        });
      }

      if (!Array.isArray(profile.openedOrders) || profile.openedOrders.length === 0) {
        return res.status(404).json({
          message: "No opened orders found for this connectId.",
          openedOrders: [],
        });
      }

      const tradeTypeToClose = op.replace("close", "");
      const matchingTrades = profile.openedOrders.filter(
        order =>
          order.symbol === symbol &&
          String(order.orderType).toLowerCase() === tradeTypeToClose
      );

      if (matchingTrades.length === 0) {
        return res.status(404).json({
          message: "No matching trades found with this symbol and operation.",
        });
      }

      const results = [];

      for (const trade of matchingTrades) {
        try {
          // Verify position exists before attempting to close
          const positionCheck = await axios.get("https://mt5.mtapi.io/PositionGet", {
            params: { id: connectId, ticket: trade.ticket }
          });

          if (!positionCheck.data || positionCheck.data.error) {
            results.push({
              ticket: trade.ticket,
              symbol: trade.symbol,
              orderType: trade.orderType,
              status: "already_closed",
              message: "Position not found or already closed"
            });
            continue;
          }

          // Only proceed if position exists
          const response = await axios.get("https://mt5.mtapi.io/OrderClose", {
            params: {
              id: connectId,
              ticket: trade.ticket,
              symbol: trade.symbol,
              volume: trade.volume,
              type: trade.orderType,
            },
          });

          const result = response.data;
          const isClosed = result?.closePrice > 0 &&
                         result?.dealInternalOut?.direction === "Out" &&
                         result?.dealInternalOut?.volume > 0;

          results.push({
            ticket: trade.ticket,
            symbol: trade.symbol,
            orderType: trade.orderType,
            volume: trade.volume,
            status: isClosed ? "closed" : "failed",
            result,
          });
        } catch (err) {
          results.push({
            ticket: trade.ticket,
            symbol: trade.symbol,
            orderType: trade.orderType,
            volume: trade.volume,
            status: "error",
            error: err.response?.data?.message || err.message,
          });
        }
      }

      // Update local DB after closing operations
      await syncOpenedOrders(connectId);

      const closedCount = results.filter(r => r.status === 'closed').length;
      const alreadyClosedCount = results.filter(r => r.status === 'already_closed').length;
      const failedCount = results.filter(r => r.status === 'failed').length;

      return res.status(200).json({
        message: closedCount > 0 
          ? `${closedCount} trade(s) successfully closed` 
          : "No trades could be closed",
        totalTrades: matchingTrades.length,
        closedCount,
        alreadyClosedCount,
        failedCount,
        results,
      });
    }

    return res.status(400).json({
      message: "Invalid operation. Use 'buy', 'sell', 'buyclose', or 'sellclose'.",
    });
  } catch (error) {
    console.error("Error processing order:", error.message);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.response?.data?.message || error.message,
    });
  }
};

// const handleMT5Order = async (req, res) => {
//   const { connectId } = req.params;
//   const { symbol, operation } = req.body;

//   if (!connectId || !symbol || !operation) {
//     return res.status(400).json({
//       message: "connectId, symbol, and operation are required.",
//     });
//   }

//   try {
//     const op = operation.toLowerCase();

    
//     if (op === "buy" || op === "sell") {
//       const { volume } = req.body;

//       if (!volume) {
//         return res.status(400).json({ message: "volume is required for placing an order." });
//       }

//       const response = await axios.get("https://mt5.mtapi.io/OrderSend", {
//         params: { id: connectId, symbol, operation: op, volume },
//       });

//       const result = response.data;

//       if (result?.ticket) {
//         return res.status(200).json({
//           message: "Trade order sent successfully.",
//           order: result,
//         });
//       } else {
//         return res.status(400).json({
//           message: "Failed to send trade order.",
//           result,
//         });
//       }
//     }

    
//     if (op === "buyclose" || op === "sellclose") {
//       const profile = await MT5Profile.findOne({ connectId });

//       if (!profile) {
//         return res.status(404).json({ message: "No profile found for this connectId." });
//       }

//       if (!Array.isArray(profile.openedOrders) || profile.openedOrders.length === 0) {
//         return res.status(404).json({
//           message: "No opened orders found for this connectId.",
//           openedOrders: [],
//         });
//       }

//       const tradeTypeToClose = op.replace("close", ""); 
//       const matchingTrades = profile.openedOrders.filter(
//         order =>
//           order.symbol === symbol &&
//           String(order.orderType).toLowerCase() === tradeTypeToClose
//       );

//       if (matchingTrades.length === 0) {
//         return res.status(404).json({
//           message: "No matching trades found with this symbol and operation.",
//         });
//       }

//       const results = [];

//       for (const trade of matchingTrades) {
//         try {
//           if (!trade.volume || isNaN(trade.volume)) {
//             results.push({
//               ticket: trade.ticket,
//               symbol: trade.symbol,
//               orderType: trade.orderType,
//               status: "error",
//               error: "Invalid or missing volume for trade",
//             });
//             continue;
//           }

//           const response = await axios.get("https://mt5.mtapi.io/OrderClose", {
//             params: {
//               id: connectId,
//               ticket: trade.ticket,
//               symbol: trade.symbol, 
//               volume: trade.volume, 
//               type: trade.orderType, 
//             },
//           });

//           const result = response.data;

//           const isClosed =
//             result?.closePrice > 0 &&
//             result?.dealInternalOut?.direction === "Out" &&
//             result?.dealInternalOut?.volume > 0;

//           results.push({
//             ticket: trade.ticket,
//             symbol: trade.symbol,
//             orderType: trade.orderType,
//             volume: trade.volume,
//             status: isClosed ? "closed" : "failed",
//             result,
//           });
//         } catch (err) {
//           results.push({
//             ticket: trade.ticket,
//             symbol: trade.symbol,
//             orderType: trade.orderType,
//             volume: trade.volume,
//             status: "error",
//             error: err.message,
//           });
//         }
//       }

//       return res.status(200).json({
//         message: "Trade close attempts completed.",
//         totalTrades: matchingTrades.length,
//         results,
//       });
//     }

//     return res.status(400).json({
//       message: "Invalid operation. Use 'buy', 'sell', 'buyclose', or 'sellclose'.",
//     });
//   } catch (error) {
//     console.error("Error processing order:", error.message);
//     return res.status(500).json({
//       message: "Internal server error.",
//       error: error.message,
//     });
//   }
// };

const getOpenTrades = async (req, res) => {
  const { connectId } = req.params;

  if (!connectId) {
    return res.status(400).json({ message: "connectId is required." });
  }

  try {
    const response = await axios.get("https://mt5.mtapi.io/OpenedOrders", {
      params: { id: connectId },
    });

    const openTrades = response.data;

    return res.status(200).json({
      message: "Open trades fetched successfully.",
      trades: openTrades,
    });
  } catch (error) {
    console.error("Error fetching open trades:", error.message);
    return res.status(500).json({
      message: "Internal server error while fetching open trades.",
      error: error.message,
    });
  }
};

const getSymbols = async (req, res) => {
  const { connectId } = req.params;

  if (!connectId) {
    return res.status(400).json({ message: "Missing 'id' parameter" });
  }

  try {
    const response = await axios.get(`https://mt5.mtapi.io/SymbolList?id=${connectId}`);
    res.status(200).json(response.data);
  } catch (error) {
    console.error("Error fetching symbols:", error.message);
    res.status(500).json({ message: "Error fetching symbols", error: error.message });
  }
};

// const getMT5liveAccountSummary = async (req, res) => {
//   const { connectId } = req.params;

//   if (!connectId) {
//     return res.status(400).json({ message: "connectId is required to fetch account summary." });
//   }

//   try {
//     const clientId = req.client._id;

//     // Set response headers for SSE
//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");
//     res.flushHeaders();

//     const fetchInterval = setInterval(async () => {
//       try {
//         const response = await axios.get("https://mt5.mtapi.io/AccountSummary", {
//           params: { id: connectId }
//         });

//         const data = response.data;

//         if (!data) {
//           throw new Error("Empty response from MT5 API");
//         }

//         // Ensure openedOrders is always an array
//         const openedOrders = Array.isArray(data.openedOrders) ? data.openedOrders : [];

//         const profileData = {
//           connectId,
//           clientId,
//           profit: data.profit,
//           balance: data.balance,
//           equity: data.equity,
//           margin: data.margin,
//           freeMargin: data.freeMargin,
//           credit: data.credit,
//           marginLevel: data.marginLevel,
//           openedOrders: openedOrders,
//           updateType: "api",
//           updatedAt: new Date()
//         };

//         const updatedProfile = await MT5Profile.findOneAndUpdate(
//           { connectId },
//           { $set: profileData },
//           { upsert: true, new: true, setDefaultsOnInsert: true }
//         );

//         // Push update to frontend
//         res.write(`data: ${JSON.stringify({
//           timestamp: new Date(),
//           updateType: "api",
//           data: updatedProfile
//         })}\n\n`);

//       } catch (error) {
//         console.error("Error during live update:", error.message);
//         res.write(`event: error\ndata: ${JSON.stringify({
//           message: "Error during live update",
//           error: error.message,
//           timestamp: new Date()
//         })}\n\n`);
//       }
//     }, 1000);

//     req.on("close", () => {
//       clearInterval(fetchInterval);
//       res.end();
//     });

//   } catch (initialError) {
//     console.error("Failed to initialize live updates:", initialError.message);
//     return res.status(500).json({
//       message: "Failed to initialize live updates",
//       error: initialError.message
//     });
//   }
// };

// const getMT5AccountSummary = async (req, res) => {
//   const { connectId } = req.params;

//   if (!connectId) {
//     return res.status(400).json({ message: "connectId is required to fetch account summary." });
//   }

//   try {
//     const clientId = req.client._id;
//     let previousData = null;
//     const updates = [];
    
//     // Set response headers for streaming
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
//     res.flushHeaders();

//     // Set up an interval to fetch updates
//     const fetchInterval = setInterval(async () => {
//       try {
//         const response = await axios.get("https://mt5.mtapi.io/AccountSummary", {
//           params: { id: connectId }
//         });

//         const data = response.data;
        
//         // Always send updates regardless of change (for continuous updates)
//         const profileData = {
//           connectId: connectId,
//           clientId: clientId,
//           profit: data.profit,
//           balance: data.balance,
//           equity: data.equity,
//           margin: data.margin,
//           freeMargin: data.freeMargin,
//           credit: data.credit,
//           marginLevel: data.marginLevel,
//           openedOrders: data.openedOrders || [],
//           updateType: "api",
//           updatedAt: new Date()
//         };

//         // Save the update
//         const updatedProfile = await MT5Profile.findOneAndUpdate(
//           { connectId },
//           profileData,
//           { 
//             upsert: true, 
//             new: true, 
//             setDefaultsOnInsert: true
//           }
//         );

//         // Send SSE (Server-Sent Event) to client
//         res.write(`data: ${JSON.stringify({
//           timestamp: new Date(),
//           profit: data.profit,
//           fullData: updatedProfile
//         })}\n\n`);

//       } catch (error) {
//         console.error("Error during live update:", error);
//         // Send error to client
//         res.write(`event: error\ndata: ${JSON.stringify({
//           message: "Error during live update",
//           error: error.message
//         })}\n\n`);
//       }
//     }, 1000); // Update every second

//     // Handle client disconnect
//     req.on('close', () => {
//       clearInterval(fetchInterval);
//       res.end();
//     });

//   } catch (initialError) {
//     console.error("Failed to initialize live updates:", initialError.message);
//     return res.status(500).json({
//       message: "Failed to initialize live updates",
//       error: initialError.message
//     });
//   }
// };

// const getMT5liveAccountSummary = async (req, res) => {
//   const { connectId } = req.params;

//   if (!connectId) {
//     return res.status(400).json({ message: "connectId is required to fetch account summary." });
//   }

//   try {
//     const clientId = req.client._id;
    
//     // SSE Setup
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
//     res.flushHeaders();

//     // Initial data fetch
//     const sendInitialData = async () => {
//       try {
//         const response = await axios.get("https://mt5.mtapi.io/AccountSummary", {
//           params: { id: connectId }
//         });
        
//         const tradesResponse = await axios.get("https://mt5.mtapi.io/Trades", {
//           params: { id: connectId }
//         });

//         const profileData = {
//           connectId,
//           clientId,
//           profit: response.data.profit,
//           balance: response.data.balance,
//           equity: response.data.equity,
//           margin: response.data.margin,
//           freeMargin: response.data.freeMargin,
//           credit: response.data.credit,
//           marginLevel: response.data.marginLevel,
//           openedOrders: tradesResponse.data.openedOrders || [],
//           closedOrders: tradesResponse.data.closedOrders || [],
//           updateType: "initial",
//           updatedAt: new Date()
//         };

//         await MT5Profile.findOneAndUpdate(
//           { connectId },
//           profileData,
//           { upsert: true, new: true }
//         );

//         res.write(`data: ${JSON.stringify(profileData)}\n\n`);
//       } catch (error) {
//         console.error("Initial fetch error:", error);
//         res.write(`event: error\ndata: ${JSON.stringify({
//           message: "Initial fetch failed",
//           error: error.message
//         })}\n\n`);
//       }
//     };

//     await sendInitialData();

//     // Real-time updates
//     const fetchInterval = setInterval(async () => {
//       try {
//         const [accountResponse, tradesResponse] = await Promise.all([
//           axios.get("https://mt5.mtapi.io/AccountSummary", { params: { id: connectId } }),
//           axios.get("https://mt5.mtapi.io/Trades", { params: { id: connectId } })
//         ]);

//         const updateData = {
//           profit: accountResponse.data.profit,
//           balance: accountResponse.data.balance,
//           equity: accountResponse.data.equity,
//           margin: accountResponse.data.margin,
//           freeMargin: accountResponse.data.freeMargin,
//           marginLevel: accountResponse.data.marginLevel,
//           openedOrders: tradesResponse.data.openedOrders || [],
//           closedOrders: tradesResponse.data.closedOrders || [],
//           updateType: "api",
//           updatedAt: new Date()
//         };

//         // Send trade-specific updates if there are changes
//         if (tradesResponse.data.openedOrders.length || tradesResponse.data.closedOrders.length) {
//           res.write(`event: trades\ndata: ${JSON.stringify({
//             openedOrders: tradesResponse.data.openedOrders,
//             closedOrders: tradesResponse.data.closedOrders,
//             timestamp: new Date()
//           })}\n\n`);
//         }

//         // Send account update
//         res.write(`event: account\ndata: ${JSON.stringify(updateData)}\n\n`);

//         // Update database
//         await MT5Profile.findOneAndUpdate(
//           { connectId },
//           { $set: updateData },
//           { new: true }
//         );

//       } catch (error) {
//         console.error("Update error:", error.message);
//         res.write(`event: error\ndata: ${JSON.stringify({
//           message: "Update failed",
//           error: error.message
//         })}\n\n`);
//       }
//     }, 1000); // Adjust interval as needed

//     // Client disconnect cleanup
//     req.on('close', () => {
//       clearInterval(fetchInterval);
//       res.end();
//     });

//   } catch (initialError) {
//     console.error("Initialization error:", initialError.message);
//     return res.status(500).json({
//       message: "Initialization failed",
//       error: initialError.message
//     });
//   }
// };

const modifyMT5Order = async (req, res) => {
  const { connectId } = req.params;
  const { ticket, stoploss, takeprofit } = req.body;

  // Validate required inputs
  if (!connectId || !ticket) {
    return res.status(400).json({
      message: "connectId and ticket are required.",
    });
  }

  try {
    const response = await axios.get("https://mt5.mtapi.io/OrderModify", {
      params: {
        id: connectId,
        ticket,
        stoploss,
        takeprofit
      },
    });

    const result = response.data;
    console.log("OrderModify result:", result);

    if (result?.success || result?.ticket === Number(ticket)) {
      return res.status(200).json({
        message: "Order modified successfully.",
        result,
      });
    } else {
      return res.status(400).json({
        message: "Failed to modify the order.",
        result,
      });
    }

  } catch (error) {
    console.error("Error modifying order:", error.message);
    return res.status(500).json({
      message: "Internal server error while modifying order.",
      error: error.message,
    });
  }
};

  // const closeMT5Trade = async (req, res) => {
  //   const { connectId } = req.params;
  //   // const {ticket} = req.body;
  //   const { symbol } = req.body; // Optional

  //   if (!connectId) {
  //     return res.status(400).json({ message: "connectId is required." });
  //   }

  //   try {
  //     const profile = await MT5Profile.findOne({ connectId });

  //     if (!profile) {
  //       return res.status(404).json({ message: "No profile found for this connectId." });
  //     }

  //     if (!Array.isArray(profile.openedOrders) || profile.openedOrders.length === 0) {
  //       return res.status(404).json({ 
  //         message: "No opened orders found for this connectId.",
  //         openedOrders: profile.openedOrders,
  //       });
  //     }

  //     // Optional filter by symbol
  //     const trade = symbol
  //       ? profile.openedOrders.find(order => order.symbol === symbol)
  //       : profile.openedOrders[0];

  //     if (!trade) {
  //       return res.status(404).json({ message: "No matching trade found in openedOrders." });
  //     }

  //     const ticket = trade.ticket;

  //     const response = await axios.get("https://mt5.mtapi.io/OrderClose", {
  //       params: {
  //         id: connectId,
  //         ticket: ticket,
  //       },
  //     });

  //     const result = response.data;

  //     const isClosed =
  //       result?.closePrice > 0 &&
  //       result?.dealInternalOut?.direction === "Out" &&
  //       result?.dealInternalOut?.volume > 0;

  //     if (isClosed) {
  //       return res.status(200).json({
  //         message: "Trade closed successfully.",
  //         trade,
  //         result,
  //       });
  //     } else {
  //       return res.status(400).json({
  //         message: "Failed to close the trade.",
  //         result,
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error closing trade:", error.message);
  //     return res.status(500).json({
  //       message: "Internal server error while closing trade.",
  //       error: error.message,
  //     });
  //   }
  // };



// const closeMT5Trade = async (req, res) => {
//   const { connectId } = req.params;
//   const { ticket } = req.body;

//   if (!connectId || !ticket) {
//     return res.status(400).json({ message: "connectId and ticket are required." });
//   }

//   try {
//     const profile = await MT5Profile.findOne({ connectId });

//     if (!profile) {
//       return res.status(404).json({ message: "No live profile found for this connectId." });
//     }

//     const trade = profile.openedOrders.find(order => order.ticket === Number(ticket));

//     if (!trade) {
//       return res.status(404).json({ message: "Trade not found in openedOrders for this ticket." });
//     }

//     const response = await axios.get("https://mt5.mtapi.io/OrderClose", {
//       params: {
//         id: connectId,
//         ticket: ticket,
//       },
//     });

//     const result = response.data;
//     // console.log("OrderClose response:", result);

//     const isClosed =
//       result?.closePrice > 0 &&
//       result?.dealInternalOut?.direction === "Out" &&
//       result?.dealInternalOut?.volume > 0;

//     if (isClosed) {
//       return res.status(200).json({
//         message: "Trade closed successfully.",
//         trade: trade,
//         result: result,
//       });
//     } else {
//       return res.status(400).json({
//         message: "Failed to close the trade.",
//         result: result,
//       });
//     }
//   } catch (error) {
//     console.error("Error closing trade:", error.message);
//     return res.status(500).json({
//       message: "Internal server error while closing trade.",
//       error: error.message,
//     });
//   }
// };


const saveMT5Account = async (req, res) => {
  try {
    const {
      connectId,
      name,
      accountNumber,
      server,
      currency,
      balance,
      equity,
      profit,
      comment,
      mode
    } = req.body;

    // Include clientId from the authenticated request
    const clientId = req.client._id;

    // Find and update or create new
    const savedAccount = await MT5Profile.findOneAndUpdate(
      { connectId },
      {
        $set: {
          clientId, // Add clientId to the document
          accountNumber,
          name,
          server,
          currency,
          balance,
          equity,
          profit,
          comment,
          mode,
          updatedAt: new Date()
        }
      },
      {
        new: true,      // Return the updated document
        upsert: true    // Create the document if it doesn't exist
      }
    );

    return res.status(200).json({
      message: "Account saved or updated successfully",
      savedAccount
    });

  } catch (error) {
    console.error("Error saving account:", error);
    return res.status(500).json({
      message: "Failed to save account",
      error: error.message
    });
  }
};

const getAllSavedMT5AccountSummaries = async (req, res) => {
  try {
    const clientId = req.client._id;
    console.log(`Fetching accounts for client: ${clientId}`); // Debug logging

    const clientProfiles = await MT5Profile.find({ 
      clientId: clientId, 
      isDeleted: { $ne: true } 
    }).lean(); // Use lean() for better performance

    console.log(`Found ${clientProfiles.length} accounts`); // Debug logging

    // Return empty array instead of 404 for better frontend handling
    return res.status(200).json({
      message: clientProfiles.length > 0 
        ? "Account summaries fetched successfully" 
        : "No accounts found",
      summaries: clientProfiles
    });

  } catch (error) {
    console.error("Error fetching saved summaries:", error);
    return res.status(500).json({
      message: "Failed to fetch saved summaries",
      error: error.message
    });
  }
};

const getAccountDetailByConnectId = async (req, res) => {
  const { connectId } = req.params;

  if (!connectId) {
    return res.status(400).json({ message: "connectId is required" });
  }

  try {
    const account = await MT5Connection.findOne({ connectId, isDeleted: false });

    if (!account) {
      return res.status(404).json({ message: "Account not found" });
    }

    return res.status(200).json({ account });
  } catch (error) {
    console.error("Error fetching account:", error.message);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

const startWebSocketAPI = (io) => {
  return async (req, res) => {
    try {
      const { connectId } = req.body;
      
      if (!connectId) {
        return res.status(400).json({ error: "connectId is required" });
      }

      // Close existing connection if present
      if (activeSockets[connectId]) {
        activeSockets[connectId].close();
        delete activeSockets[connectId];
      }

      const wsUrl = `wss://mt5.mtapi.io/OnOrderUpdate?id=${connectId}`;
      const socket = new WebSocket(wsUrl);

      activeSockets[connectId] = socket;

      socket.on('open', () => {
        console.log(`WebSocket connected for ${connectId}`);
        res.status(200).json({ message: `WebSocket connection established for ${connectId}` });
      });

      socket.on('message', async (data) => {
        try {
          const parsed = JSON.parse(data);

          if (parsed?.type === 'OrderUpdate' && parsed?.data) {
            const {
              profit,
              balance,
              equity,
              margin,
              freeMargin,
              credit,
              marginLevel,
              openedOrders,
              update
            } = parsed.data;

            const profileData = {
              connectId,
              profit,
              balance,
              equity,
              margin,
              freeMargin,
              credit,
              marginLevel,
              updateType: update?.type || null,
              openedOrders: openedOrders || [],
              updatedAt: new Date()
            };

            console.log(`Profit updated for ${connectId}: ${profit}`);

            await MT5Profile.findOneAndUpdate(
              { connectId },
              { $set: profileData },
              { upsert: true, new: true }
            );

            io.emit(`mt5-update-${connectId}`, profileData);
          }
        } catch (err) {
          console.error(`Failed to handle message for ${connectId}:`, err.message);
        }
      });

      socket.on('error', (err) => {
        console.error(`WebSocket error for ${connectId}:`, err.message);
        if (!res.headersSent) {
          res.status(500).json({ error: `WebSocket error: ${err.message}` });
        }
      });

      socket.on('close', () => {
        console.log(`WebSocket closed for ${connectId}`);
        delete activeSockets[connectId];
      });

      setTimeout(() => {
        if (socket.readyState !== WebSocket.OPEN && !res.headersSent) {
          res.status(504).json({ error: "WebSocket connection timeout" });
          socket.close();
        }
      }, 60000);

    } catch (err) {
      console.error("Error in startWebSocketAPI:", err);
      res.status(500).json({ error: err.message });
    }
  };
};

// const deleteUserProfile = async (req, res) => {
//   const { id } = req.params; // user ObjectId passed in the URL

//   if (!id) {
//     return res.status(400).json({ message: "User ID is required." });
//   }

//   try {
//     // Delete user profile
//     const user = await MT5Profile.findByIdAndDelete(id);

//     if (!user) {
//       return res.status(404).json({ message: "User not found." });
//     }

//     // Delete related MT5 connections
//     await MT5Connection.deleteMany({ clientId: id });

//     return res.status(200).json({ message: "User profile and related MT5 connections deleted successfully." });
//   } catch (error) {
//     console.error("Error deleting user profile:", error.message);
//     return res.status(500).json({ message: "Internal server error", error: error.message });
//   }
// };


const deleteMT5Connection = async (req, res) => {
  const { connectId } = req.params;
  const clientId = req.user?._id || req.client?._id;

  if (!connectId) {
    return res.status(400).json({ message: "connectId is required." });
  }

  if (!clientId) {
    return res.status(401).json({ message: "Unauthorized: Missing client ID." });
  }

  try {
    // 1. Verify the connection exists and belongs to the client
    const mt5Connection = await MT5Connection.findOne({
      connectId,
      clientId
    });

    if (!mt5Connection) {
      return res.status(404).json({ 
        message: "MT5 connection not found or unauthorized" 
      });
    }

    // 2. Permanently delete the connection
    await MT5Connection.deleteOne({ connectId });

    // 3. Permanently delete all associated profiles
    await MT5Profile.deleteMany({ connectId });

    // 4. Optional: Close WebSocket connection if active
    // disconnectWebSocketAPI(connectId);

    return res.status(200).json({
      message: "MT5 connection and profiles permanently deleted",
      connectId
    });

  } catch (error) {
    console.error("Error deleting MT5 connection:", error);
    return res.status(500).json({
      message: "Failed to delete connection",
      error: error.message
    });
  }
};

// const tradeclose = async (req, res) => {
//   try {
//     const { id, ticket } = req.params;

//     // Validate required params
//     if (!id || !ticket) {
//       return res.status(400).json({ message: 'Missing id or ticket parameter' });
//     }

//     // Call external API
//     const response = await axios.get(`https://mt5.mtapi.io/OrderClose`, {
//       params: {
//         id,
//         ticket
//       }
//     });

//     // Return the external API response
//     res.status(200).json(response.data);
//   } catch (error) {
//     console.error('Error calling MT5 API:', error.message);
//     res.status(500).json({ message: 'Failed to close order', error: error.message });
//   }
// };


// const closeOrder = async (req, res) => {
//   const { connectId, ticket } = req.params;

//   if (!connectId || !ticket) {
//     return res.status(400).json({ error: 'Missing connectId or ticket' });
//   }

//   try {
//     // Optional: Check if connection is active (only if supported by your MT5 API)
//     await axios.get(`https://mt5.mtapi.io/Connect/${connectId}`);

//     // You must know the correct values for these fields (replace with dynamic values if needed)
//     const orderDetails = {
//       connectId,
//       ticket: parseInt(ticket),
//       lots: 0.1,              // Required: update based on your lot size
//       price: 0,               // Use market price or fetch current price
//       slippage: 3             // Max allowed slippage
//     };

//     const response = await axios.post(`https://mt5.mtapi.io/OrderClose`, orderDetails);

//     return res.status(200).json(response.data);

//   } catch (error) {
//     const statusCode = error.response?.status || 500;
//     const errorMsg = error.response?.data?.message || error.message;

//     return res.status(statusCode).json({
//       error: 'Failed to close order',
//       message: errorMsg,
//       code: error.response?.data?.code || 'UNKNOWN_ERROR',
//       stack: error.response?.data?.stackTrace || null,
//     });
//   }
// };


// const getOrderHistory = async (req, res) => {
//   const { accountNumber, fromDate, toDate } = req.body;

//   if (!accountNumber || !fromDate || !toDate) {
//     return res.status(400).json({ error: 'Missing required fields' });
//   }

//   try {
//     const response = await axios.get('https://mt5.mtapi.io/OrderHistory', {
//       params: {
//         id: accountNumber,
//         from: fromDate,
//         to: toDate,
//         sort: 'OpenTime',
//         ascending: true,
//       },
//     });

//     res.json(response.data);
//   } catch (error) {
//     console.error('Error fetching order history:', error.message);
//     res.status(500).json({ error: 'Failed to fetch order history' });
//   }
// };

const getOrderHistory = async (req, res) => { 
  const { accountNumber, fromDate, toDate } = req.body;

  if (!accountNumber || !fromDate || !toDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const response = await axios.get('https://mt5.mtapi.io/OrderHistory', {
      params: {
        id: accountNumber,
        from: fromDate,
        to: toDate,
        sort: 'OpenTime',
        ascending: true,
      },
    });

    // console.log(" MT5 API Response:", JSON.stringify(response.data, null, 2));

    let rawOrders = response?.data?.orders;
    // console.log(response.data)
    // console.log(rawOrders);
    if (!Array.isArray(rawOrders)) {
      return res.status(500).json({
        error: 'Invalid response: orders not found',
        rawData: response.data, // for debugging on frontend/postman
      });
    }

    // Map orders to your expected schema
    const orders = rawOrders.map(order => ({
      name: order.name || '',
      account: order.user || '',
      symbol: order.symbol || '',
      type: order.orderType || '',
      volume: order.volume || order.lots || 0,
      price: order.openPrice || 0,
      sl: order.stopLoss || 0,
      tp: order.takeProfit || 0,
      profit: order.profit || 0,
      orderId: order.ticket || 0,
      openTime: order.openTime ? new Date(order.openTime) : new Date()
    }));

    // Save or update the orders in DB
    const saved = await OrderHistory.findOneAndUpdate(
      { account: accountNumber },
      { $set: { orders } },
      { upsert: true, new: true }
    );

    return res.json({
      message: 'Order history saved successfully',
      data: saved,
    });
  } catch (error) {
    console.error('Error fetching order history:', error.response?.data || error.message);
    return res.status(500).json({
      error: 'Failed to fetch order history',
      details: error.response?.data || error.message,
    });
  }
};

const getAllConnectedId = async (req, res) => {
  try {
    const { clientId } = req.params;

    const connections = await MT5Connection.find({ clientId }).populate('user');

    const result = connections.map(conn => ({
      connectId: conn.connectId,
      user: conn.user // populated user object
    }));

    res.status(200).json({
      success: true,
      count: result.length,
      data: result
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// const getAllConnectedId = async (req, res) => {
//   try {
//     const connections = await MT5Connection.find({ isDeleted: false }).select('connectId user -_id');

//     res.status(200).json({
//       success: true,
//       data: connections, // now contains both connectId and user
//     });
//   } catch (error) {
//     console.error("Error fetching connectIds:", error.message);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch connectIds",
//       error: error.message
//     });
//   }
// };

const fetchAndEmitProfileAPI = (io) => {
  return async (req, res) => {
    console.log("Received request to fetch and emit profile data");

    try {
      const { connectId } = req.body;
      console.log("connectId:", connectId);

      if (!connectId) {
        return res.status(400).json({ error: "connectId is required" });
      }

      //Fetch from DB
      const profile = await MT5Profile.findOne({ connectId });

      if (!profile) {
        return res.status(404).json({ error: "No profile data found for this connectId" });
      }

      //Emit to frontend
      io.emit(`mt5-update-${connectId}`, profile);
      console.log("Emitted profile data to frontend for", connectId);

      //Return the data
      return res.status(200).json({
        message: "Fetched and emitted profile data",
        data: profile
      });

    } catch (err) {
      console.error("Error in fetchAndEmitProfileAPI:", err.message);
      return res.status(500).json({ error: err.message });
    }
  };
};

const getAndStoreAccountSummary = async (req, res) => {
  const { connectId } = req.params;
  const clientId = req.client?._id;

  if (!connectId) {
    return res.status(400).json({ message: "connectId is required" });
  }

  try {
    // 1. Verify this connectId belongs to the logged-in client
    const connection = await MT5Connection.findOne({ connectId, clientId });

    if (!connection) {
      return res.status(403).json({ message: "Forbidden: This MT5 account does not belong to you" });
    }

    // 2. Fetch from MT5 API
    const response = await axios.get("https://mt5.mtapi.io/AccountSummary", {
      params: { id: connectId }
    });

    const summaryData = response.data;

    // 3. Check if already stored
    const existing = await MT5Profile.findOne({ connectId, clientId });

    if (existing) {
      // Update existing
      existing.summary = summaryData;
      existing.fetchedAt = new Date();
      await existing.save();
    } else {
      // Insert new
      const newSummary = new MT5Profile({
        connectId,
        clientId,
        summary: summaryData
      });
      await newSummary.save();
    }

    return res.status(200).json({
      message: "Account summary fetched and stored successfully",
      data: summaryData
    });

  } catch (error) {
    console.error("Error fetching or storing account summary:", error.message);
    return res.status(500).json({
      message: "Failed to fetch/store account summary",
      error: error.message
    });
  }
};

const getAllMyMT5Summaries = async (req, res) => {
  const clientId = req.client?._id;

  if (!clientId) {
    return res.status(401).json({ message: "Unauthorized: Client ID missing" });
  }

  try {
    // Step 1: Find all MT5 accounts belonging to this client
    const connections = await MT5Connection.find({ clientId, isDeleted: false });

    const connectIds = connections.map(conn => conn.connectId);

    if (connectIds.length === 0) {
      return res.status(200).json({ message: "No MT5 accounts found", summaries: [] });
    }

    // Step 2: Find all summaries for these connectIds
    const summaries = await MT5Profile.find({
      connectId: { $in: connectIds },
      clientId: clientId
    }).select("-_id connectId summary fetchedAt");

    return res.status(200).json({
      message: "MT5 summaries fetched successfully",
      summaries
    });

  } catch (error) {
    console.error("Error fetching MT5 summaries:", error.message);
    return res.status(500).json({ message: "Failed to fetch MT5 summaries", error: error.message });
  }
};

const getAllAccountSummaries = async (req, res) => {
  try {
    const summaries = await MT5Profile.find();

    res.status(200).json({
      message: "All account summaries fetched successfully",
      data: summaries
    });
  } catch (error) {
    console.error("Error fetching account summaries:", error.message);
    res.status(500).json({
      message: "Failed to fetch account summaries",
      error: error.message
    });
  }
};


module.exports = {connectMT5 ,getMT5AccountSummary,getAllSavedMT5AccountSummaries, getAndStoreAccountSummary , 
  getAllMyMT5Summaries, getAllAccountSummaries  , getOrderHistory ,getSymbols,handleMT5Order,
  saveMT5Account, getAllConnectedId  ,fetchAndEmitProfileAPI,startWebSocketAPI
  ,getMT5liveAccountSummary,closeMT5Trade,sendMT5Order,modifyMT5Order,getOpenTrades,
  getAccountDetailByConnectId , deleteMT5Connection}
