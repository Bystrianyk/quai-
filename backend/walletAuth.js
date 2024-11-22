// backend/walletAuth.js
const verifySignature = (signature, address, message) => {
    return true; // Псевдокод, перевірка підпису через SDK
};

module.exports.authenticate = (req, res) => {
    const { signature, address, message } = req.body;
    if (verifySignature(signature, address, message)) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: "Невірна верифікація" });
    }
};
