import { Shield, ShieldCheck, ShieldAlert } from "lucide-react";

const roleConfig = {
    ADMIN: {
        label: "Admin",
        icon: ShieldAlert,
        bg: "bg-red-500/10 dark:bg-red-500/15",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-500/20",
        dot: "bg-red-500",
    },
    MANAGER: {
        label: "Manager",
        icon: ShieldCheck,
        bg: "bg-blue-500/10 dark:bg-blue-500/15",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-500/20",
        dot: "bg-blue-500",
    },
    MEMBER: {
        label: "Member",
        icon: Shield,
        bg: "bg-zinc-500/10 dark:bg-zinc-500/15",
        text: "text-zinc-600 dark:text-zinc-400",
        border: "border-zinc-200 dark:border-zinc-500/20",
        dot: "bg-zinc-500",
    },
};

export default function RoleBadge({ role, size = "sm" }) {
    const config = roleConfig[role] || roleConfig.MEMBER;
    const Icon = config.icon;

    if (size === "xs") {
        return (
            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${config.bg} ${config.text} border ${config.border}`}>
                <span className={`size-1.5 rounded-full ${config.dot}`} />
                {config.label}
            </span>
        );
    }

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${config.bg} ${config.text} border ${config.border}`}>
            <Icon className="size-3.5" />
            {config.label}
        </span>
    );
}
