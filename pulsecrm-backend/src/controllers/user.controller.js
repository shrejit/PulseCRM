const userService = require("../services/user.service");

const listUsers = async (req, res) => {
  try {
    const users = await userService.listUsers(req.user.companyId);
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const assignRole = async (req, res) => {
  try {
    const user = await userService.assignRole(
      req.user.companyId,
      req.params.id,
      req.body.role
    );
    return res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: user,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const assignTeam = async (req, res) => {
  try {
    const user = await userService.assignTeam(
      req.user.companyId,
      req.params.id,
      req.body.teamId
    );
    return res.status(200).json({
      success: true,
      message: "Team assignment updated successfully",
      data: user,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const setStatus = async (req, res) => {
  try {
    const user = await userService.setActiveStatus(
      req.user.companyId,
      req.params.id,
      req.body.isActive
    );
    return res.status(200).json({
      success: true,
      message: "User status updated successfully",
      data: user,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

module.exports = { listUsers, assignRole, assignTeam, setStatus };
