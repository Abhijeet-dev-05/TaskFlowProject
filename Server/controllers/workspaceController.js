import prisma from "../configs/prisma.js";

// Get all workspaces for user
export const getUserWorkspaces = async (req, res) => {
    try {
        const { userId } = await req.auth();

        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId: userId,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: true,
                    },
                },
                projects: {
                    include: {
                        tasks: {
                            include: {
                                assignee: true,
                                comments: {
                                    include: {
                                        user: true,
                                    },
                                },
                            },
                        },
                        members: {
                            include: {
                                user: true,
                            },
                        },
                    },
                },
                owner: true,
            },
        });

        res.json({ workspaces });
    } catch (error) {
        console.error("Error:", error);

        res.status(500).json({
            success: false,
            message: error?.message || "Something went wrong",
        });
    }
};


export const addMember = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { email, role, workspaceId, message } = req.body;

        // 🔹 Check required fields
        if (!workspaceId || !role || !email) {
            return res.status(400).json({ message: "Missing required parameters" });
        }

        // 🔹 Validate role
        if (!["ADMIN", "MEMBER"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        // 🔹 Check if user exists
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // 🔹 Fetch workspace
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { members: true },
        });

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        // 🔹 Check if current user is ADMIN
        const isAdmin = workspace.members.find(
            (member) =>
                member.userId === userId && member.role === "ADMIN"
        );

        if (!isAdmin) {
            return res.status(401).json({
                message: "You do not have admin privileges",
            });
        }

        // 🔹 Check if user already a member
        const existingMember = workspace.members.find(
            (member) => member.userId === user.id
        );

        if (existingMember) {
            return res.status(400).json({
                message: "User is already a member",
            });
        }

        // 🔹 Add member
        const member = await prisma.workspaceMember.create({
            data: {
                userId: user.id,
                workspaceId,
                role,
                message,
            },
        });

        res.json({
            member,
            message: "Member added successfully",
        });
    } catch (error) {
        console.error("Error:", error);

        res.status(500).json({
            message: error?.message || "Something went wrong",
        });
    }
};