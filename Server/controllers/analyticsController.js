import prisma from "../configs/prisma.js";

// Get Workload Analytics for a Workspace
export const getWorkloadAnalytics = async (req, res) => {
    try {
        const { userId } = await req.auth();
        const { workspaceId } = req.params;

        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                members: { include: { user: true } },
                projects: {
                    include: {
                        tasks: {
                            include: { assignee: true },
                        },
                        members: { include: { user: true } },
                    },
                },
            },
        });

        if (!workspace) {
            return res.status(404).json({ message: "Workspace not found" });
        }

        const allTasks = workspace.projects.flatMap((p) => p.tasks);
        const now = new Date();

        // Thresholds
        const OVERLOADED_THRESHOLD = 8;
        const AT_RISK_THRESHOLD = 5;

        // Per-member analytics
        const memberAnalytics = workspace.members.map((member) => {
            const memberTasks = allTasks.filter((t) => t.assigneeId === member.userId);
            const totalTasks = memberTasks.length;
            const activeTasks = memberTasks.filter((t) => t.status !== "DONE");
            const completedTasks = memberTasks.filter((t) => t.status === "DONE");
            const inProgressTasks = memberTasks.filter((t) => t.status === "IN_PROGRESS");
            const todoTasks = memberTasks.filter((t) => t.status === "TODO");
            const overdueTasks = memberTasks.filter(
                (t) => new Date(t.due_date) < now && t.status !== "DONE"
            );
            const highPriorityActive = memberTasks.filter(
                (t) => t.priority === "HIGH" && t.status !== "DONE"
            );

            // Calculate burnout score (0-100)
            // Factors: active task count, overdue ratio, high-priority ratio
            let burnoutScore = 0;

            // Active task load (max 40 points)
            burnoutScore += Math.min((activeTasks.length / OVERLOADED_THRESHOLD) * 40, 40);

            // Overdue ratio (max 30 points)
            if (activeTasks.length > 0) {
                burnoutScore += (overdueTasks.length / activeTasks.length) * 30;
            }

            // High priority pressure (max 20 points)
            if (activeTasks.length > 0) {
                burnoutScore += (highPriorityActive.length / activeTasks.length) * 20;
            }

            // No completed tasks penalty (10 points) - indicates stagnation
            if (totalTasks > 0 && completedTasks.length === 0) {
                burnoutScore += 10;
            }

            burnoutScore = Math.round(Math.min(burnoutScore, 100));

            // Risk level
            let riskLevel = "low";
            if (burnoutScore >= 75) riskLevel = "critical";
            else if (burnoutScore >= 55) riskLevel = "high";
            else if (burnoutScore >= 35) riskLevel = "medium";

            // Capacity status
            let capacityStatus = "available";
            if (activeTasks.length >= OVERLOADED_THRESHOLD) capacityStatus = "overloaded";
            else if (activeTasks.length >= AT_RISK_THRESHOLD) capacityStatus = "at_risk";

            return {
                userId: member.userId,
                name: member.user.name,
                email: member.user.email,
                image: member.user.image,
                role: member.role,
                totalTasks,
                activeTasks: activeTasks.length,
                completedTasks: completedTasks.length,
                inProgressTasks: inProgressTasks.length,
                todoTasks: todoTasks.length,
                overdueTasks: overdueTasks.length,
                highPriorityActive: highPriorityActive.length,
                burnoutScore,
                riskLevel,
                capacityStatus,
                tasksByStatus: {
                    TODO: todoTasks.length,
                    IN_PROGRESS: inProgressTasks.length,
                    DONE: completedTasks.length,
                },
                tasksByPriority: {
                    LOW: memberTasks.filter((t) => t.priority === "LOW" && t.status !== "DONE").length,
                    MEDIUM: memberTasks.filter((t) => t.priority === "MEDIUM" && t.status !== "DONE").length,
                    HIGH: highPriorityActive.length,
                },
            };
        });

        // Team-level summary
        const teamSummary = {
            totalMembers: workspace.members.length,
            totalTasks: allTasks.length,
            activeTasks: allTasks.filter((t) => t.status !== "DONE").length,
            completedTasks: allTasks.filter((t) => t.status === "DONE").length,
            overdueTasks: allTasks.filter(
                (t) => new Date(t.due_date) < now && t.status !== "DONE"
            ).length,
            overloadedCount: memberAnalytics.filter(
                (m) => m.capacityStatus === "overloaded"
            ).length,
            atRiskCount: memberAnalytics.filter(
                (m) => m.riskLevel === "high" || m.riskLevel === "critical"
            ).length,
            availableCount: memberAnalytics.filter(
                (m) => m.capacityStatus === "available"
            ).length,
            averageBurnoutScore: memberAnalytics.length > 0
                ? Math.round(
                    memberAnalytics.reduce((sum, m) => sum + m.burnoutScore, 0) /
                    memberAnalytics.length
                )
                : 0,
        };

        res.json({
            teamSummary,
            memberAnalytics,
        });
    } catch (error) {
        console.error("Analytics Error:", error);
        res.status(500).json({
            message: error?.message || "Failed to fetch workload analytics",
        });
    }
};
