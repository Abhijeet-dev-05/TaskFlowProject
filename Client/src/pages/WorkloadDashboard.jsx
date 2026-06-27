import { useState, useEffect, useCallback } from "react";
import {
    BarChart3,
    Users,
    AlertTriangle,
    Shield,
    Loader2,
    RefreshCw,
    TrendingUp,
    Activity,
} from "lucide-react";
import { useSelector } from "react-redux";
import { useAuth } from "@clerk/clerk-react";
import api from "../configs/api";
import WorkloadChart from "../components/WorkloadChart";
import BurnoutRiskCard from "../components/BurnoutRiskCard";
import WorkloadHeatmap from "../components/WorkloadHeatmap";


const WorkloadDashboard = () => {
    const { getToken } = useAuth();
    const currentWorkspace = useSelector(
        (state) => state?.workspace?.currentWorkspace || null
    );

    const [analyticsData, setAnalyticsData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAnalytics = useCallback(async () => {
        if (!currentWorkspace?.id) return;

        try {
            setIsLoading(true);
            setError(null);
            const token = await getToken();
            const { data } = await api.get(
                `/api/analytics/workload/${currentWorkspace.id}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAnalyticsData(data);
        } catch (err) {
            setError(err?.response?.data?.message || "Failed to fetch analytics");
        } finally {
            setIsLoading(false);
        }
    }, [currentWorkspace?.id, getToken]);


    useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    const summary = analyticsData?.teamSummary;
    const members = analyticsData?.memberAnalytics || [];

    const summaryCards = [
        {
            title: "Team Members",
            value: summary?.totalMembers || 0,
            subtitle: "in workspace",
            icon: Users,
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500",
        },
        {
            title: "At Risk",
            value: summary?.atRiskCount || 0,
            subtitle: "burnout warning",
            icon: AlertTriangle,
            iconBg: "bg-red-500/10",
            iconColor: "text-red-500",
            highlight: (summary?.atRiskCount || 0) > 0,
        },
        {
            title: "Overloaded",
            value: summary?.overloadedCount || 0,
            subtitle: "8+ active tasks",
            icon: Shield,
            iconBg: "bg-orange-500/10",
            iconColor: "text-orange-500",
            highlight: (summary?.overloadedCount || 0) > 0,
        },
        {
            title: "Available",
            value: summary?.availableCount || 0,
            subtitle: "have bandwidth",
            icon: Activity,
            iconBg: "bg-emerald-500/10",
            iconColor: "text-emerald-500",
        },
    ];

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <Loader2 className="size-7 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                <AlertTriangle className="size-10 text-red-500" />
                <p className="text-zinc-600 dark:text-zinc-400">{error}</p>
                <button
                    onClick={fetchAnalytics}
                    className="px-4 py-2 text-sm rounded bg-blue-500 text-white hover:bg-blue-600 transition"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20">
                            <BarChart3 className="size-5 text-white" />
                        </div>
                        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
                            Workload & Burnout Dashboard
                        </h1>
                    </div>
                    <p className="text-gray-500 dark:text-zinc-400 text-sm ml-12">
                        Monitor team health, prevent burnout, and balance workloads
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchAnalytics}
                        className="flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition"
                    >
                        <RefreshCw className="size-3.5" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card, i) => (
                    <div
                        key={i}
                        className={`not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border rounded-xl p-5 transition-all duration-300 hover:shadow-md ${card.highlight
                                ? "border-red-300 dark:border-red-500/30 ring-1 ring-red-200 dark:ring-red-500/10"
                                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                            }`}
                        style={{ animation: `fadeSlideIn 0.4s ease-out ${i * 0.1}s both` }}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                                    {card.title}
                                </p>
                                <p className="text-2xl font-bold text-zinc-800 dark:text-white">
                                    {card.value}
                                </p>
                                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                                    {card.subtitle}
                                </p>
                            </div>
                            <div className={`p-3 rounded-xl ${card.iconBg}`}>
                                <card.icon className={`size-5 ${card.iconColor}`} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Avg Burnout Score Banner */}
            {summary && (
                <div className="relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 not-dark:bg-white dark:bg-gradient-to-r dark:from-zinc-800/70 dark:to-zinc-900/50 p-5">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative size-14">
                                <svg viewBox="0 0 56 56" className="-rotate-90 size-14">
                                    <circle cx="28" cy="28" r="22" fill="none" strokeWidth="5" className="stroke-zinc-200 dark:stroke-zinc-700" />
                                    <circle
                                        cx="28" cy="28" r="22" fill="none" strokeWidth="5" strokeLinecap="round"
                                        className={
                                            summary.averageBurnoutScore >= 55
                                                ? "stroke-red-500"
                                                : summary.averageBurnoutScore >= 35
                                                    ? "stroke-amber-500"
                                                    : "stroke-emerald-500"
                                        }
                                        strokeDasharray={2 * Math.PI * 22}
                                        strokeDashoffset={2 * Math.PI * 22 - (summary.averageBurnoutScore / 100) * 2 * Math.PI * 22}
                                        style={{ transition: "stroke-dashoffset 1s ease-out" }}
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-zinc-800 dark:text-white">
                                    {summary.averageBurnoutScore}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-zinc-800 dark:text-white">
                                    Team Average Burnout Score
                                </p>
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    {summary.averageBurnoutScore < 35
                                        ? "🟢 Team is in a healthy state"
                                        : summary.averageBurnoutScore < 55
                                            ? "🟡 Some team members may need attention"
                                            : "🔴 Immediate workload rebalancing recommended"}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-6 text-center">
                            <div>
                                <p className="text-lg font-bold text-zinc-800 dark:text-white">{summary.totalTasks}</p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Total Tasks</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-blue-500">{summary.activeTasks}</p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Active</p>
                            </div>
                            <div>
                                <p className={`text-lg font-bold ${summary.overdueTasks > 0 ? "text-red-500" : "text-zinc-800 dark:text-white"}`}>
                                    {summary.overdueTasks}
                                </p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Overdue</p>
                            </div>
                            <div>
                                <p className="text-lg font-bold text-emerald-500">{summary.completedTasks}</p>
                                <p className="text-[10px] text-zinc-500 dark:text-zinc-400">Completed</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Workload Distribution Chart */}
                <div className="not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">
                        Task Distribution by Member
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                        Stacked by status: To Do, In Progress, Done
                    </p>
                    <WorkloadChart memberAnalytics={members} />
                </div>

                {/* Workload Heatmap */}
                <div className="not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6">
                    <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-1">
                        Workload Heatmap
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                        Tile size = active tasks, color = burnout risk
                    </p>
                    <WorkloadHeatmap memberAnalytics={members} />
                </div>
            </div>


            {/* Member Cards */}
            <div>
                <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-4">
                    Individual Member Analysis
                </h2>
                {members.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="size-12 mx-auto mb-4 text-zinc-300 dark:text-zinc-600" />
                        <p className="text-zinc-500 dark:text-zinc-400">
                            No team members found in this workspace
                        </p>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
                        {members
                            .sort((a, b) => b.burnoutScore - a.burnoutScore)
                            .map((member, i) => (
                                <div
                                    key={member.userId}
                                    style={{ animation: `fadeSlideIn 0.4s ease-out ${i * 0.08}s both` }}
                                >
                                    <BurnoutRiskCard member={member} />
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Inline Animation Keyframes */}
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(12px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default WorkloadDashboard;
