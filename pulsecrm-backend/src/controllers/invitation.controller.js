const invitationService = require("../services/invitation.service");

const createInvitation = async (req, res) => {
  try {
    const invitation = await invitationService.createInvitation(
      req.user.companyId,
      req.user.id,
      req.body
    );
    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      data: invitation,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const listInvitations = async (req, res) => {
  try {
    const invitations = await invitationService.listInvitations(req.user.companyId);
    return res.status(200).json({ success: true, data: invitations });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

// Public — no auth yet, the invitee doesn't have an account.
const getInvitationByToken = async (req, res) => {
  try {
    const invitation = await invitationService.getInvitationByToken(req.params.token);
    return res.status(200).json({
      success: true,
      data: {
        email: invitation.email,
        role: invitation.role,
        companyName: invitation.company?.name,
        teamName: invitation.team?.name || null,
        expiresAt: invitation.expiresAt,
      },
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

// Public — creates the account and logs the user in.
const acceptInvitation = async (req, res) => {
  try {
    const result = await invitationService.acceptInvitation(req.params.token, req.body);
    return res.status(201).json({
      success: true,
      message: "Invitation accepted successfully",
      data: result,
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

const revokeInvitation = async (req, res) => {
  try {
    await invitationService.revokeInvitation(req.user.companyId, req.params.id);
    return res.status(200).json({
      success: true,
      message: "Invitation revoked successfully",
    });
  } catch (error) {
    return res
      .status(error.statusCode || 400)
      .json({ success: false, message: error.message });
  }
};

module.exports = {
  createInvitation,
  listInvitations,
  getInvitationByToken,
  acceptInvitation,
  revokeInvitation,
};
