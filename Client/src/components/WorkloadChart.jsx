import { useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    Legend,
    CartesianGrid,
} from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-xl p-3 min-w-[180px]">
            <p className="text-sm font-medium text-zinc-900 dark:text-white mb-2">{label}</p>
            {payload.map((entry, index) => (
                <div key={index} className="flex items-center justify-between gap-4 text-xs mb-1">
                    <div className="flex items-center gap-1.5">
                        <div
                            className="w-2.5 h-2.5 rounded-sm"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-zinc-600 dark:text-zinc-400">{entry.name}</span>
                    </div>
                    <span className="font-medium text-zinc-800 dark:text-zinc-200">
                        {entry.value}
                    </span>
                </div>
            ))}
            <div className="border-t border-zinc-200 dark:border-zinc-700 mt-1.5 pt-1.5">
                <div className="flex justify-between text-xs">
                    <span className="text-zinc-500">Total</span>
                    <span className="font-semibold text-zinc-800 dark:text-white">
                        {payload.reduce((sum, p) => sum + p.value, 0)}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default function WorkloadChart({ memberAnalytics }) {
    const chartData = useMemo(() => {
        if (!memberAnalytics?.length) return [];

        return memberAnalytics.map((member) => ({
            name: member.name?.split(" ")[0] || "Unknown",
            fullName: member.name,
            "To Do": member.tasksByStatus?.TODO || 0,
            "In Progress": member.tasksByStatus?.IN_PROGRESS || 0,
            Done: member.tasksByStatus?.DONE || 0,
            burnoutScore: member.burnoutScore,
        }));
    }, [memberAnalytics]);

    if (!chartData.length) {
        return (
            <div className="flex items-center justify-center h-[300px] text-zinc-500 dark:text-zinc-400 text-sm">
                No workload data available
            </div>
        );
    }

    return (
        <div className="w-full">
            <ResponsiveContainer width="100%" height={320}>
                <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
                    barCategoryGap="25%"
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#27272a"
                        opacity={0.3}
                        vertical={false}
                    />
                    <XAxis
                        dataKey="name"
                        tick={{ fill: "#a1a1aa", fontSize: 12 }}
                        axisLine={{ stroke: "#3f3f46" }}
                        tickLine={false}
                    />
                    <YAxis
                        tick={{ fill: "#a1a1aa", fontSize: 12 }}
                        axisLine={{ stroke: "#3f3f46" }}
                        tickLine={false}
                        allowDecimals={false}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(139, 92, 246, 0.05)" }} />
                    <Legend
                        wrapperStyle={{ paddingTop: "12px", fontSize: "12px" }}
                        iconType="square"
                        iconSize={10}
                    />
                    <Bar
                        dataKey="To Do"
                        stackId="tasks"
                        fill="#f59e0b"
                        radius={[0, 0, 0, 0]}
                        animationDuration={800}
                        animationEasing="ease-out"
                    />
                    <Bar
                        dataKey="In Progress"
                        stackId="tasks"
                        fill="#3b82f6"
                        radius={[0, 0, 0, 0]}
                        animationDuration={800}
                        animationEasing="ease-out"
                    />
                    <Bar
                        dataKey="Done"
                        stackId="tasks"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        animationDuration={800}
                        animationEasing="ease-out"
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
