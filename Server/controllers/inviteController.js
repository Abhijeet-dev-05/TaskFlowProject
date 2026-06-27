import { createClerkClient } from '@clerk/express';
import prisma from '../configs/prisma.js';
import crypto from 'crypto';

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

// ============================================================================
// Existing: Clerk Organization Invite
// ============================================================================
export const inviteMember = async (req, res) => {
    try {
        const { userId, orgId } = await req.auth();

        if (!userId || !orgId) {
            return res.status(401).json({ message: "Unauthorized - must be signed in with an organization" });
        }

        const { emailAddress, role, redirectUrl } = req.body;

        if (!emailAddress || !role) {
            return res.status(400).json({ message: "Email address and role are required" });
        }

        const invitation = await clerkClient.organizations.createOrganizationInvitation({
            organizationId: orgId,
            emailAddress,
            role,
            inviterUserId: userId,
            redirectUrl: redirectUrl || 'http://localhost:5173/',
        });

        res.json({
            success: true,
            message: "Invitation sent successfully",
            invitation,
        });
    } catch (error) {
        console.error("Invite member error:", error);

        const clerkErrors = error?.errors;
        const message = clerkErrors?.[0]?.longMessage
            || clerkErrors?.[0]?.message
            || error?.message
            || "Failed to send invitation";

        res.status(error?.status || 500).json({
            success: false,
            message,
        });
    }
};


// ============================================================================
// Feature: Shareable Project Invite Links
// ============================================================================

// Generate a shareable invite link for a project
export const createProjectInvite = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { projectId } = req.params;
        const { maxUses = 10, expiresInDays = 7 } = req.body;

        // Find project
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { members: true },
        });

        if (!project) {
            return res.status(404).json({ message: "Project not found" });
        }

        // Only project lead can generate invite links
        if (project.team_lead !== userId) {
            return res.status(403).json({ message: "Only the project lead can generate invite links" });
        }

        // Generate secure random token
        const token = crypto.randomBytes(32).toString('hex');

        // Calculate expiry date
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiresInDays);

        // Create invite record
        const invite = await prisma.projectInvite.create({
            data: {
                projectId,
                token,
                maxUses: Math.min(Math.max(1, maxUses), 100), // clamp 1-100
                expiresAt,
                createdBy: userId,
            },
        });

        res.json({
            invite,
            inviteUrl: `${req.headers.origin || 'http://localhost:5173'}/invite/${token}`,
            message: "Invite link created successfully",
        });
    } catch (error) {
        console.error("Create invite error:", error);
        res.status(500).json({ message: error?.message || "Failed to create invite link" });
    }
};


// Get invite info (for the invite landing page)
export const getInviteInfo = async (req, res) => {
    try {
        const { token } = req.params;

        const invite = await prisma.projectInvite.findUnique({
            where: { token },
            include: {
                project: {
                    include: {
                        members: { include: { user: true } },
                        owner: true,
                    },
                },
            },
        });

        if (!invite) {
            return res.status(404).json({ message: "Invite link not found or invalid" });
        }

        // Check expiry
        if (new Date() > new Date(invite.expiresAt)) {
            return res.status(410).json({ message: "This invite link has expired" });
        }

        // Check usage limit
        if (invite.uses >= invite.maxUses) {
            return res.status(410).json({ message: "This invite link has reached its usage limit" });
        }

        // Check if current user is already a member
        const { userId } = await req.auth();
        const isMember = invite.project.members.some(m => m.userId === userId);

        res.json({
            projectName: invite.project.name,
            projectDescription: invite.project.description,
            projectStatus: invite.project.status,
            teamLead: invite.project.owner?.name || "Unknown",
            memberCount: invite.project.members.length,
            remainingUses: invite.maxUses - invite.uses,
            expiresAt: invite.expiresAt,
            isMember,
        });
    } catch (error) {
        console.error("Get invite info error:", error);
        res.status(500).json({ message: error?.message || "Failed to fetch invite info" });
    }
};


// Accept an invite link and join the project
export const acceptProjectInvite = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { token } = req.params;

        const invite = await prisma.projectInvite.findUnique({
            where: { token },
            include: {
                project: {
                    include: { members: true },
                },
            },
        });

        if (!invite) {
            return res.status(404).json({ message: "Invite link not found or invalid" });
        }

        // Check expiry
        if (new Date() > new Date(invite.expiresAt)) {
            return res.status(410).json({ message: "This invite link has expired" });
        }

        // Check usage limit
        if (invite.uses >= invite.maxUses) {
            return res.status(410).json({ message: "This invite link has reached its usage limit" });
        }

        // Check if already a member
        const alreadyMember = invite.project.members.some(m => m.userId === userId);
        if (alreadyMember) {
            return res.status(400).json({ message: "You are already a member of this project" });
        }

        // Add user to project
        await prisma.projectMember.create({
            data: {
                userId,
                projectId: invite.projectId,
            },
        });

        // Increment usage counter
        await prisma.projectInvite.update({
            where: { id: invite.id },
            data: { uses: { increment: 1 } },
        });

        res.json({
            message: "Successfully joined the project!",
            projectId: invite.projectId,
        });
    } catch (error) {
        console.error("Accept invite error:", error);
        res.status(500).json({ message: error?.message || "Failed to accept invite" });
    }
};
