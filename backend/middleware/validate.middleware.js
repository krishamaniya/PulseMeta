const { validateServerName } = require('../controller/validate.controller');
const axios = require('axios');

module.exports = async (req, res, next) => {
    const { serverName } = req.params;
    
    if (!serverName) {
        return res.status(400).json({ 
            success: false,
            error: 'Server name is required' 
        });
    }

    // Validate server name format
    if (!/^[a-zA-Z0-9\-_]+$/.test(serverName)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid server name format'
        });
    }

    try {
        // First check if server is provisioned
        try {
            const serverResponse = await axios.get(
                `https://mt-provisioning-api-v1.agiliumtrade.agiliumtrade.ai/users/current/servers/${serverName}`,
                {
                    headers: {
                        'auth-token': process.env.META_API_TOKEN,
                        'Accept': 'application/json'
                    }
                }
            );
            
            req.server = serverResponse.data;
            req.broker = serverResponse.data.brokerName || 'Unknown Broker';
            return next();
            
        } catch (provisionError) {
            // Handle 404 - server not provisioned
            if (provisionError.response?.status === 404) {
                const validation = await validateServerName(serverName);
                
                if (!validation.valid) {
                    return res.status(404).json({
                        success: false,
                        error: validation.error || 'Server not found',
                        suggestions: validation.suggestions || []
                    });
                }

                return res.status(403).json({
                    success: false,
                    error: 'Server exists but requires manual provisioning',
                    details: `Please add ${serverName} to your MetaAPI account first`,
                    provisioningLink: `https://app.metaapi.cloud/configure-trading-account-credentials/${process.env.METAAPI_ACCOUNT_ID}/${serverName}`,
                    broker: validation.broker
                });
            }

            // Re-throw other errors
            throw provisionError;
        }

    } catch (error) {
        console.error('Server validation error:', error.response?.data || error.message);
        
        // Handle specific provisioning errors
        if (error.response?.status === 403 && 
            error.response.data?.message?.includes('not provisioned')) {
            return res.status(403).json({
                success: false,
                error: 'Server exists but requires manual provisioning',
                details: `Please add ${serverName} to your MetaAPI account first`,
                provisioningLink: `https://app.metaapi.cloud/configure-trading-account-credentials/${process.env.METAAPI_ACCOUNT_ID}/${serverName}`
            });
        }

        return res.status(500).json({
            success: false,
            error: 'Server validation failed',
            details: error.response?.data || error.message
        });
    }
};