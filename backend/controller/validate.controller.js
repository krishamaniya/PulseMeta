const Server = require('../model/server');
const axios = require('axios');

const fetchServers = async (req, res) => {
  const query = req.params.query || 'exness';

  try {
    const response = await axios.get('https://mt5.mtapi.io/Search', {
      headers: { Accept: 'application/json' },
      params: { company: query }
    });

    const data = response.data;

    // Check if data is an array
    if (!Array.isArray(data)) {
      console.error('Unexpected response format:', data);
      return res.status(500).json({
        error: 'Failed to fetch server list',
        details: 'Unexpected response format: data is not an array'
      });
    }

    const allBrokers = [];

    for (const brokerData of data) {
      const companyName = brokerData.companyName;
      const results = brokerData.results || [];

      // Extract server names
      const serverNames = results.map(server => server.name);

      allBrokers.push({ broker: companyName, servers: serverNames });

      await Server.findOneAndUpdate(
        { broker: companyName },
        { servers: serverNames },
        { upsert: true, new: true }
      );
    }

    res.status(200).json({
      message: `Fetched and saved server data for '${query}'`,
      data: allBrokers
    });
  } catch (error) {
    console.error('API Error:', error.message);
    res.status(500).json({
      error: 'Failed to fetch server list',
      details: error.response?.data || error.message
    });
  }
};


const validateServerName = async (serverName) => {
  try {
    // First check if server exists in our database
    const serverData = await Server.findOne({
      servers: serverName
    });

    if (serverData) {
      return { valid: true, broker: serverData.broker };
    }

    // If not found in DB, check with MetaAPI
    const brokerPrefix = serverName.split('-')[0];
    const response = await axios.get(
      'https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/known-mt-servers/5/search',
      {
        headers: {
          'auth-token': process.env.META_API_TOKEN,
          'Accept': 'application/json'
        },
        params: { query: brokerPrefix }
      }
    );

    const allServers = Object.values(response.data).flat();
    if (allServers.includes(serverName)) {
      // Update our database with this server
      const broker = Object.keys(response.data).find(b => 
        response.data[b].includes(serverName)
      );
      await Server.findOneAndUpdate(
        { broker },
        { $addToSet: { servers: serverName } },
        { upsert: true }
      );
      return { valid: true, broker };
    }

    // Find similar servers
    const similarServers = allServers.filter(s => 
      s.toLowerCase().includes(brokerPrefix.toLowerCase())
    );

    return {
      valid: false,
      suggestions: similarServers,
      broker: Object.keys(response.data).find(b => 
        response.data[b].includes(similarServers[0])
      )
    };
  } catch (error) {
    console.error('Validation Error:', error.message);
    return { 
      valid: false, 
      error: error.message,
      details: error.response?.data 
    };
  }
};

const getStoredServers = async (req, res) => {
  try {
    const servers = await Server.find({});
    res.status(200).json({ data: servers });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve servers' });
  }
};


module.exports ={ fetchServers , validateServerName,getStoredServers};