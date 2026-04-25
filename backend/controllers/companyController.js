const { Company } = require('../models');

exports.getCompanySettings = async (req, res) => {
    try {
        let company = await Company.findOne();
        if (!company) {
            company = await Company.create({
                name: 'EduConnect',
                whatsappNumber: '7871444323'
            });
        } else if (company.whatsappNumber !== '7871444323') {
            await company.update({ whatsappNumber: '7871444323' });
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateCompanySettings = async (req, res) => {
    try {
        let company = await Company.findOne();
        if (!company) {
            company = await Company.create(req.body);
        } else {
            await company.update(req.body);
        }
        res.json(company);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
