const axios = require('axios');
const WebSocket = require('ws');

// MT5 Credentials (replace with actual values or pull from env or database)
const user = '240728287';
const password = 'Krisha@111';
const server = 'Exness-MT5Trial6'; 

// Connect to MT5 via ConnectEx API
async function connectToMT5AndStartWebSocket() {
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

    if (connectId === 'INVALID_ACCOUNT' || typeof connectId !== 'string') {
      console.error("Invalid MT5 credentials or failed to connect:", response.data);
      return;
    }

    console.log("Connected to MT5. Token:", connectId);

    // Now open WebSocket using connectId
    startWebSocket(connectId);

  } catch (error) {
    console.error("Error connecting to MT5:", error.message);
  }
}

function startWebSocket(connectId) {
  const wsUrl = `wss://mt5.mtapi.io/OnQuote?id=${connectId}`;
  const socket = new WebSocket(wsUrl);

  socket.on('open', () => {
    console.log('WebSocket connected to MT5');
  });

  socket.on('message', (data) => {
    try {
      const parsed = JSON.parse(data);

      if (parsed?.type === 'OrderUpdate' && parsed?.data) {
        const profit = parsed.data.profit;

        // Only log if profit has changed
        if (profit !== lastProfit) {
          console.log(`Profit updated: ${profit}`);
          lastProfit = profit;
        }
      }

    } catch (err) {
      console.error('Error parsing message:', err);
    }
  });

  socket.on('error', (err) => {
    console.error('WebSocket error:', err.message || err);
  });

  socket.on('close', () => {
    console.log('WebSocket disconnected');
    // Optional: auto-reconnect
    // setTimeout(() => startWebSocket(connectId), 5000);
  });

  process.on('SIGINT', () => {
    console.log('Closing WebSocket...');
    socket.close();
    process.exit();
  });
}

// Start the process
connectToMT5AndStartWebSocket();
