const crypto = require("crypto");

const prisma = require("../prisma/client");
const ApiError = require("../utils/ApiError");
const { hashPassword } = require("../utils/bcrypt");
const { sendEmail } = require("../utils/email");
const refreshTokenService = require("./refreshToken.service");

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const createInvitation = async (companyId, invitedById, { email, role, teamId }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(409, "A user with this email already exists");
  }

  if (teamId) {
    const team = await prisma.team.findFirst({ where: { id: teamId, companyId } });
    if (!team) {
      throw new ApiError(404, "Team not found in this company");
    }
  }

  const existingPending = await prisma.invitation.findFirst({
    where: { email, companyId, status: "PENDING" },
  });
  if (existingPending) {
    throw new ApiError(409, "An active invitation already exists for this email");
  }

  const token = crypto.randomBytes(32).toString("hex");

  const invitation = await prisma.invitation.create({
    data: {
      email,
      role: role || "REP",
      teamId: teamId || null,
      token,
      companyId,
      invitedById,
      expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
    },
  });

  const company = await prisma.company.findUnique({ where: { id: companyId } });

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const inviteUrl = `${clientUrl}/accept-invitation/${token}`;
  const htmlContent = `
    <div style="font-family: sans-serif; padding: 20px; color: #333;">
      <h2>You've been invited to join ${company?.name || "a company"} on PulseCRM</h2>
      <p>You've been invited as <strong>${invitation.role}</strong>. Click below to set up your account:</p>
      <p style="margin: 20px 0;">
        <a href="${inviteUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
      </p>
      <p>This invitation expires in 7 days.</p>
      <p>Or copy this link to your browser:</p>
      <p>${inviteUrl}</p>
    </div>
  `;
  sendEmail({
    to: email,
    subject: "You're invited to join PulseCRM",
    html: htmlContent,
  }).catch((err) => console.error("Error sending invitation email:", err.message));

  return invitation;
};

const listInvitations = async (companyId) => {
  return prisma.invitation.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
};

// Public — used to prefill/validate the "accept invitation" page before
// the invitee has an account.
const getInvitationByToken = async (token) => {
  const invitation = await prisma.invitation.findUnique({
    where: { token },
    include: { company: { select: { name: true } }, team: { select: { name: true } } },
  });

  if (!invitation) {
    throw new ApiError(404, "Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    throw new ApiError(400, `This invitation has already been ${invitation.status.toLowerCase()}`);
  }

  if (invitation.expiresAt < new Date()) {
    await prisma.invitation.update({
      where: { id: invitation.id },
      data: { status: "EXPIRED" },
    });
    throw new ApiError(400, "This invitation has expired");
  }

  return invitation;
};

// Accepting an invitation creates the User and marks the Invitation
// ACCEPTED atomically, then logs the new user in immediately.
const acceptInvitation = async (token, { name, password }) => {
  const invitation = await getInvitationByToken(token);

  const hashedPassword = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name,
        email: invitation.email,
        password: hashedPassword,
        role: invitation.role,
        companyId: invitation.companyId,
        teamId: invitation.teamId,
        emailVerified: true, // accepting a company invite implicitly verifies the email
      },
    });

    await tx.invitation.update({
      where: { id: invitation.id },
      data: { status: "ACCEPTED" },
    });

    return createdUser;
  });

  const { accessToken, refreshToken } = await refreshTokenService.issueTokenPair(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken,
  };
};

const revokeInvitation = async (companyId, invitationId) => {
  const invitation = await prisma.invitation.findFirst({
    where: { id: invitationId, companyId },
  });

  if (!invitation) {
    throw new ApiError(404, "Invitation not found");
  }

  if (invitation.status !== "PENDING") {
    throw new ApiError(400, `Cannot revoke an invitation that is already ${invitation.status.toLowerCase()}`);
  }

  return prisma.invitation.update({
    where: { id: invitationId },
    data: { status: "REVOKED" },
  });
};

module.exports = {
  createInvitation,
  listInvitations,
  getInvitationByToken,
  acceptInvitation,
  revokeInvitation,
};
