import { ShieldAlert, Activity, Users } from "lucide-react";

export default function BurnoutRiskCard({ member }) {
    const burnoutScore = member?.burnoutScore ?? 0;
    const riskLabel = burnoutScore >= 55 ? "High risk" : burnoutScore >= 35 ? "Needs attention" : "Healthy";
    const riskColor = burnoutScore >= 55 ? "text-red-500 bg-red-500/10 border-red-500/20" : burnoutScore >= 35 ? "text-amber-500 bg-amber-500/10 border-amber-500/20" : "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";

    return (
        <div className={`rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 ${riskColor}`}>
            <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">{member?.name || "Unknown member"}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{member?.role || "Team member"}</p>
                </div>
                <div className="rounded-2xl p-3 bg-white/10">
                    <ShieldAlert className="size-5" />
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs text-zinc-500">Burnout Score</p>
                    <p className="text-xl font-semibold text-zinc-900 dark:text-white">{burnoutScore}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-3">
                    <p className="text-xs text-zinc-500">Active Tasks</p>
                    <p className="text-xl font-semibold text-zinc-900 dark:text-white">{member?.activeTasks ?? 0}</p>
                </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
                <Activity className="size-4" />
                <span className="font-medium">{riskLabel}</span>
            </div>

            <div className="mt-4 rounded-2xl bg-white/10 p-3 text-xs text-zinc-500">
                <p>{member?.summary || "Track workload, task balance, and stress signals."}</p>
            </div>
        </div>
    );
}
