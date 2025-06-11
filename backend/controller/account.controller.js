const Account = require("../model/account");


const createAccount = async (req, res) => {
    try {
        const { name, accountNumber, broker, currency, balance, equity, livePL, 
            trade, username, password, status, validUpto, subscription, payment, primeMember, 
            brokerServer, comment, validateLogin, orderPlacement } = req.body;

        const existingAccount = await Account.findOne({ accountNumber });
        if (existingAccount) return res.status(400).json({ message: "Account number already exists." });

        const newAccount = new Account({
            name,
            accountNumber,
            broker,
            currency,
            balance,
            equity,
            livePL,
            trade,
            username,
            password, 
            status,
            validUpto,
            subscription,
            payment,
            primeMember,
            brokerServer,
            comment,
            validateLogin,
            orderPlacement
        });

        await newAccount.save();
        res.status(201).json({ message: "Account created successfully", account: newAccount });
    } catch (error) {
        res.status(500).json({ message: "Error creating account", error: error.message });
    }
};


const getAllAccounts = async (req, res) => {
    try {
        const accounts = await Account.find();
        res.status(200).json(accounts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching accounts", error: error.message });
    }
};


const getAccountById = async (req, res) => {
    try {
        const account = await Account.findById(req.body.id);
        if (!account) return res.status(404).json({ message: "Account not found" });
        res.status(200).json(account);
    } catch (error) {
        res.status(500).json({ message: "Error fetching account", error: error.message });
    }
};


const updateAccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndUpdate(req.body.id, req.body, { new: true });
        if (!account) return res.status(404).json({ message: "Account not found" });
        res.status(200).json({ message: "Account updated successfully", account });
    } catch (error) {
        res.status(500).json({ message: "Error updating account", error: error.message });
    }
};


const deleteAccount = async (req, res) => {
    try {
        const account = await Account.findByIdAndDelete(req.body.id);
        if (!account) return res.status(404).json({ message: "Account not found" });
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting account", error: error.message });
    }
};

module.exports ={createAccount,getAllAccounts,getAccountById,updateAccount,deleteAccount}