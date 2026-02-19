const { Company } = require('../models');

exports.getCompanySettings = async (req, res) => {
    try {
        let company = await Company.findOne();
        if (!company) {
            company = await Company.create({ name: 'EduConnect' });
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
