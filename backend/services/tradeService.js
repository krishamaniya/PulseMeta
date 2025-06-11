const MTService = require('./mtService');
const AccountService = require('./accountService');
const logger = require('../utils/logger');

class TradeService {
  /**
   * Execute market order
   * @param {string} accountId - MetaApi account ID
   * @param {Object} tradeData - Trade parameters
   * @returns {Promise<Object>} - Trade result
   */
  async executeMarketOrder(accountId, tradeData) {
    try {
      const { symbol, action, volume, stopLoss, takeProfit, comment } = tradeData;
      const connection = await MTService.connect(accountId);
      
      const direction = action.toLowerCase() === 'buy' ? 
        'ORDER_DIRECTION_BUY' : 'ORDER_DIRECTION_SELL';
      
      const result = await connection.createMarketBuyOrder(
        symbol,
        volume,
        stopLoss,
        takeProfit,
        comment || 'TV-CRM Trade'
      );
      
      logger.info(`Executed trade on ${accountId}: ${JSON.stringify(result)}`);
      
      return {
        success: true,
        ticket: result.orderId,
        symbol,
        action,
        volume,
        price: result.price,
        stopLoss,
        takeProfit,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Trade execution failed for ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Close position by ID
   * @param {string} accountId - MetaApi account ID
   * @param {string} positionId - Position ID to close
   * @returns {Promise<Object>} - Close result
   */
  async closePosition(accountId, positionId) {
    try {
      const connection = await MTService.connect(accountId);
      const result = await connection.closePosition(positionId);
      
      logger.info(`Closed position ${positionId} on ${accountId}`);
      
      return {
        success: true,
        positionId,
        ticket: result.orderId,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Position close failed for ${accountId}:`, error);
      throw error;
    }
  }

  /**
   * Modify position
   * @param {string} accountId - MetaApi account ID
   * @param {Object} modifyData - Modification parameters
   * @returns {Promise<Object>} - Modify result
   */
  async modifyPosition(accountId, modifyData) {
    try {
      const { positionId, stopLoss, takeProfit } = modifyData;
      const connection = await MTService.connect(accountId);
      const result = await connection.modifyPosition(
        positionId,
        stopLoss,
        takeProfit
      );
      
      logger.info(`Modified position ${positionId} on ${accountId}`);
      
      return {
        success: true,
        positionId,
        stopLoss,
        takeProfit,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      logger.error(`Position modify failed for ${accountId}:`, error);
      throw error;
    }
  }
}

module.exports = new TradeService();