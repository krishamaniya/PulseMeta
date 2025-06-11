const { MongoClient } = require('mongodb');

class MongoChangeStream {
  constructor(io) {
    this.io = io;

    if (!process.env.MONGO_DB_URL) {
      throw new Error('MONGO_DB_URL is not defined');
    }

    let connectionString = process.env.MONGO_DB_URL.trim();
    if (!connectionString.includes('retryWrites=true')) {
      connectionString += (connectionString.includes('?') ? '&' : '?') + 'retryWrites=true&w=majority';
    }

    this.client = new MongoClient(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      readPreference: 'primary'
    });

    this.changeStreams = {};
  }

  async watchCollection(dbName, collectionName) {
    try {
      await this.client.connect();
      console.log('Connected to MongoDB');

      const topologyType = this.client.topology?.description?.type;
      if (topologyType !== 'ReplicaSetWithPrimary' && topologyType !== 'ReplicaSetNoPrimary') {
        console.warn(`⚠️ Change streams require a replica set. Current topology: ${topologyType}`);
        return; // Skip watching since it's not a replica set
      }

      const collection = this.client.db(dbName).collection(collectionName);

      const changeStream = collection.watch([], {
        fullDocument: 'updateLookup',
        batchSize: 1
      });

      changeStream.on('change', (change) => {
        console.log('Change detected:', change.operationType);
        this.handleChange(collectionName, change);
      });

      changeStream.on('error', (error) => {
        console.error(`${collectionName} change stream error:`, error);
        setTimeout(() => this.watchCollection(dbName, collectionName), 5000);
      });

      changeStream.on('end', () => {
        console.log('Change stream ended, reconnecting...');
        this.watchCollection(dbName, collectionName);
      });

      console.log(`Watching collection: ${collectionName}`);
    } catch (error) {
      console.error(`Failed to watch ${collectionName}:`, error.message);
      setTimeout(() => this.watchCollection(dbName, collectionName), 5000);
    }
  }

  handleChange(collectionName, change) {
    try {
      if (['update', 'insert', 'replace'].includes(change.operationType)) {
        const document = change.fullDocument;
        if (!document) {
          console.warn('No fullDocument in change event');
          return;
        }

        const roomId = document.connectId || document._id?.toString();
        if (!roomId) {
          console.warn('No roomId available for change event');
          return;
        }

        this.io.to(roomId).emit('mongoUpdate', {
          collection: collectionName,
          operation: change.operationType,
          data: document,
          timestamp: new Date()
        });
      }
    } catch (error) {
      console.error('Error handling change event:', error);
    }
  }

  async close() {
    try {
      await this.client.close();
      console.log('MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
}

module.exports = MongoChangeStream;
