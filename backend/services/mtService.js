const { metaApi, connectionOptions } = require('../config/metaApiConfig');
const logger = require('../utils/logger');

class MTService {
  constructor() {
    this.connections = new Map(); // Store active connections
  }

  /**
   * Connect to MetaTrader account
   * @param {string} accountId - MetaApi account ID
   * @returns {Promise<Object>} - MT connection
   */
  async connect(accountId) {
    try {
      if (this.connections.has(accountId)) {
        return this.connections.get(accountId);
      }

      const account = await metaApi.metatraderAccountApi.getAccount(accountId);
      const connection = account.getRPCConnection();
      
      await connection.connect();
      await connection.waitSynchronized();
      
      this.connections.set(accountId, connection);
      logger.info(`Connected to MT account ${accountId}`);
      
      return connection;
    } catch (error) {
      logger.error(`Connection failed for account ${accountId}:`, error);
      throw new Error(`Failed to connect to MT account: ${error.message}`);
    }
  }

  /**
   * Disconnect from MetaTrader account
   * @param {string} accountId - MetaApi account ID
   */
  async disconnect(accountId) {
    try {
      if (this.connections.has(accountId)) {
        const connection = this.connections.get(accountId);
        await connection.close();
        this.connections.delete(accountId);
        logger.info(`Disconnected from MT account ${accountId}`);
      }
    } catch (error) {
      logger.error(`Disconnection failed for account ${accountId}:`, error);
    }
  }

  /**
   * Check if connected to account
   * @param {string} accountId - MetaApi account ID
   * @returns {boolean} - Connection status
   */
  isConnected(accountId) {
    return this.connections.has(accountId) && 
           this.connections.get(accountId).connected;
  }
}

module.exports = new MTService();