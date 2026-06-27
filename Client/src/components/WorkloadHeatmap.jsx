export default function WorkloadHeatmap({ memberAnalytics }) {
    if (!memberAnalytics?.length) {
        return (
            <div className="flex items-center justify-center h-[300px] text-zinc-500 dark:text-zinc-400 text-sm">
                No heatmap data available
            </div>
        );
    }

    const tileClass = (score) => {
        if (score >= 55) return "bg-red-500/20 border-red-500/30";
        if (score >= 35) return "bg-amber-500/20 border-amber-500/30";
        return "bg-emerald-500/20 border-emerald-500/30";
    };

    return (
        <div className="grid grid-cols-2 gap-3">
            {memberAnalytics.map((member) => (
                <div key={member.userId || member.id || member.name} className={`rounded-3xl border p-4 ${tileClass(member.burnoutScore)}`}>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">{member.name || "Unknown"}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-3">Burnout risk score</p>
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-2xl font-bold text-zinc-900 dark:text-white">{member.burnoutScore ?? 0}</span>
                        <span className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-zinc-700 dark:text-zinc-200 bg-white/70 dark:bg-zinc-900/70">
                            {member.burnoutScore >= 55 ? "High" : member.burnoutScore >= 35 ? "Medium" : "Low"}
                        </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-3">{member.tasksByStatus?.IN_PROGRESS ?? 0} active tasks</p>
                </div>
            ))}
        </div>
    );
}
