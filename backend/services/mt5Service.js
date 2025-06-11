const MT5Profile = require('../model/accountsummary');
const axios = require('axios');

class MT5Service {
  static async updateMT5Profile(connectId, clientId) {
    try {
      const response = await axios.get("https://mt5.mtapi.io/AccountSummary", {
        params: { id: connectId }
      });

      const data = response.data;
      
      return await MT5Profile.findOneAndUpdate(
        { connectId },
        {
          connectId,
          clientId,
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
        },
        { 
          upsert: true, 
          new: true, 
          setDefaultsOnInsert: true
        }
      );
    } catch (error) {
      throw error;
    }
  }
}

module.exports = MT5Service;