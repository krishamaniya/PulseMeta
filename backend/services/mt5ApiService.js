import MT5Profile from '../model/accountsummary.js';
import mt5Api from '../utils/axiosConfig.js';

class MT5Service {
  static async fetchAccountSummary(connectId) {
    try {
      return await mt5Api.get('/AccountSummary', {
        params: { id: connectId }
      });
    } catch (error) {
      console.error(`MT5 API Error: ${error.message}`);
      throw new Error(`Failed to fetch account summary: ${error.message}`);
    }
  }

  static async updateOrCreateProfile(connectId, clientId, data) {
    const updateData = {
      clientId,
      profit: data.profit || 0,
      balance: data.balance || 0,
      equity: data.equity || 0,
      margin: data.margin || 0,
      freeMargin: data.freeMargin || 0,
      credit: data.credit || 0,
      marginLevel: data.marginLevel || 0,
      openedOrders: data.openedOrders || [],
      updateType: 'api',
      updatedAt: new Date()
    };

    try {
      return await MT5Profile.findOneAndUpdate(
        { connectId },
        updateData,
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
          runValidators: true
        }
      );
    } catch (error) {
      console.error(`Database Error: ${error.message}`);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  static async getLiveData(connectId, clientId) {
    const apiData = await this.fetchAccountSummary(connectId);
    return await this.updateOrCreateProfile(connectId, clientId, apiData);
  }
}

export default MT5Service;