const MTService = require('./mtService');
const logger = require('../utils/logger');

class AccountService {
  /**
   * Get account information
   * @param {string} accountId - MetaApi account ID
   * @returns {Promise<Object>} - Account information
   */
  async getAccountInfo(accountId) {
    try {
      const connection = await MTService.connect(accountId);
      const accountInfo = await connection.getAccountInformation();
      
      return {
        balance: accountInfo.balance,
        equity: accountInfo.equity,
        margin: accountInfo.margin,
        freeMargin: accountInfo.freeMargin,
        leverage: accountInfo.leverage,
        currency: accountInfo.currency
      };
    } catch (error) {
      logger.error(`Failed to get account info for ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Get all positions for account
   * @param {string} accountId - MetaApi account ID
   * @returns {Promise<Array>} - Array of positions
   */
  async getPositions(accountId) {
    try {
      const connection = await MTService.connect(accountId);
      const positions = await connection.getPositions();
      
      return positions.map(pos => ({
        id: pos.id,
        symbol: pos.symbol,
        type: pos.type,
        volume: pos.volume,
        profit: pos.profit,
        openPrice: pos.openPrice,
        currentPrice: pos.currentPrice,
        swap: pos.swap,
        commission: pos.commission
      }));
    } catch (error) {
      logger.error(`Failed to get positions for ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Get all orders for account
   * @param {string} accountId - MetaApi account ID
   * @returns {Promise<Array>} - Array of orders
   */
  async getOrders(accountId) {
    try {
      const connection = await MTService.connect(accountId);
      const orders = await connection.getOrders();
      
      return orders.map(order => ({
        id: order.id,
        symbol: order.symbol,
        type: order.type,
        volume: order.volume,
        openPrice: order.openPrice,
        stopLoss: order.stopLoss,
        takeProfit: order.takeProfit,
        state: order.state
      }));
    } catch (error) {
      logger.error(`Failed to get orders for ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Get complete account data snapshot
   * @param {string} accountId - MetaApi account ID
   * @returns {Promise<Object>} - Complete account data
   */
  async getCompleteAccountData(accountId) {
    try {
      const [accountInfo, positions, orders] = await Promise.all([
        this.getAccountInfo(accountId),
        this.getPositions(accountId),
        this.getOrders(accountId)
      ]);
      
      return {
        ...accountInfo,
        positions,
        orders,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Failed to get complete data for ${accountId}:`, error);
      throw error;
    }
  }
}

module.exports = new AccountService();