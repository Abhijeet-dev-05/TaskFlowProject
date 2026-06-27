import { useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { Download, FileText, FileSpreadsheet, ChevronDown, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "../configs/api";

export default function ExportButton({ projectId }) {
    const { getToken } = useAuth();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(null); // "pdf" | "csv" | null

    const handleExport = async (type) => {
        try {
            setLoading(type);
            setOpen(false);
            const token = await getToken();

            const response = await api.get(`/api/export/${projectId}/${type}`, {
                responseType: "blob",
                headers: { Authorization: `Bearer ${token}` },
            });

            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `project-report.${type}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success(`${type.toUpperCase()} downloaded!`);
        } catch (error) {
            toast.error(error?.response?.data?.message || "Export failed");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 px-3 py-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-all"
            >
                {loading ? (
                    <Loader2 className="size-4 animate-spin" />
                ) : (
                    <Download className="size-4" />
                )}
                Export
                <ChevronDown className="size-3" />
            </button>

            {open && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute right-0 top-full mt-1 z-50 w-48 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-xl dark:shadow-zinc-900/50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        <button
                            onClick={() => handleExport("pdf")}
                            disabled={!!loading}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        >
                            <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-500/15">
                                <FileText className="size-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium">Export PDF</p>
                                <p className="text-[10px] text-zinc-400">Full project report</p>
                            </div>
                        </button>
                        <div className="border-t border-zinc-100 dark:border-zinc-700/50" />
                        <button
                            onClick={() => handleExport("csv")}
                            disabled={!!loading}
                            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                        >
                            <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-500/15">
                                <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="text-left">
                                <p className="font-medium">Export CSV</p>
                                <p className="text-[10px] text-zinc-400">Spreadsheet data</p>
                            </div>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}
