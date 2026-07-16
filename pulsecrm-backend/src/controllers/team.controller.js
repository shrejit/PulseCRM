const teamService = require("../services/team.service");

const listTeams = async (req, res) => {
  try {
    const teams = await teamService.listTeams(req.user.companyId);
    return res.status(200).json({ success: true, data: teams });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const getTeam = async (req, res) => {
  try {
    const team = await teamService.getTeam(req.user.companyId, req.params.id);
    return res.status(200).json({ success: true, data: team });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const createTeam = async (req, res) => {
  try {
    const team = await teamService.createTeam(req.user.companyId, req.body);
    return res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: team,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const updateTeam = async (req, res) => {
  try {
    const team = await teamService.updateTeam(
      req.user.companyId,
      req.params.id,
      req.body
    );
    return res.status(200).json({
      success: true,
      message: "Team updated successfully",
      data: team,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const deleteTeam = async (req, res) => {
  try {
    await teamService.deleteTeam(req.user.companyId, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Team deleted successfully",
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

module.exports = { listTeams, getTeam, createTeam, updateTeam, deleteTeam };
