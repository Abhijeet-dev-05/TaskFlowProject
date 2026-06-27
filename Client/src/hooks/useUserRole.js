import { useMemo } from "react";
import { useUser } from "@clerk/clerk-react";

/**
 * Returns the current user's role for a specific project.
 * Falls back to checking if user is team_lead (= ADMIN).
 */
export default function useUserRole(project) {
    const { user } = useUser();

    const role = useMemo(() => {
        if (!project || !user) return "MEMBER";

        // Team lead is always ADMIN
        if (project.team_lead === user.id) return "ADMIN";

        // Check ProjectMember role
        const member = project.members?.find((m) => m.user?.id === user.id || m.userId === user.id);
        if (member?.role) return member.role;

        // Fallback: if user is a member but no role set, they're MEMBER
        if (member) return "MEMBER";

        return "MEMBER";
    }, [project, user]);

    const isAdmin = role === "ADMIN";
    const isManager = role === "MANAGER";
    const isMember = role === "MEMBER";
    const canCreateTask = isAdmin || isManager;
    const canDeleteTask = isAdmin;
    const canAssignTask = isAdmin || isManager;
    const canUpdateAnyTask = isAdmin || isManager;
    const canUpdateOwnTask = true;
    const canAccessSettings = isAdmin;

    return {
        role,
        isAdmin,
        isManager,
        isMember,
        canCreateTask,
        canDeleteTask,
        canAssignTask,
        canUpdateAnyTask,
        canUpdateOwnTask,
        canAccessSettings,
        userId: user?.id,
    };
}
