const companyService = require("../services/company.service");

const getMyCompany = async (req, res) => {
  try {
    const company = await companyService.getMyCompany(req.user.companyId);
    return res.status(200).json({ success: true, data: company });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const updateMyCompany = async (req, res) => {
  try {
    const company = await companyService.updateMyCompany(
      req.user.companyId,
      req.body
    );
    return res.status(200).json({
      success: true,
      message: "Company updated successfully",
      data: company,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

module.exports = { getMyCompany, updateMyCompany };
