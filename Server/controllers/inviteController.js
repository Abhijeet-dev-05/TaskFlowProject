import { createClerkClient } from '@clerk/express';

const clerkClient = createClerkClient({
    secretKey: process.env.CLERK_SECRET_KEY,
});

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

        // Use Clerk Backend API to create invitation WITH redirectUrl
        // This ensures the invitation email link points to OUR app, not Clerk's hosted pages
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

        // Extract Clerk error messages
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
