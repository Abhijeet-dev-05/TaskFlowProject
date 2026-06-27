import { format } from "date-fns";
import { Plus, Save, Link2, Github, Copy, Clock, Share2, UsersIcon } from "lucide-react";
import { useEffect, useState } from "react";
import AddProjectMember from "./AddProjectMember";
import { useDispatch } from "react-redux";
import { useAuth, useUser } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import api from "../configs/api";
import { fetchWorkspaces } from "../features/workspaceSlice";

export default function ProjectSettings({ project }) {
    const dispatch = useDispatch();
    const { getToken } = useAuth();
    const { user } = useUser();

    const [formData, setFormData] = useState({
        name: "New Website Launch",
        description: "Initial launch for new web platform.",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "2025-09-10",
        end_date: "2025-10-15",
        progress: 30,
    });

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    // Invite link states
    const [inviteLink, setInviteLink] = useState("");
    const [inviteUses, setInviteUses] = useState(10);
    const [inviteExpiry, setInviteExpiry] = useState(7);
    const [isGeneratingInvite, setIsGeneratingInvite] = useState(false);

    useEffect(() => {
        if (project) {
            setFormData({
                ...project,
            });
        }
    }, [project]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setIsSubmitting(true);
            toast.loading("Saving...");

            const token = await getToken();
            const { data } = await api.put("/api/projects", formData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            setIsDialogOpen(false);
            dispatch(fetchWorkspaces({ getToken }));

            toast.dismiss();
            toast.success(data.message);
        } catch (error) {
            toast.dismiss();
            toast.error(error?.response?.data?.message || error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGenerateInvite = async () => {
        try {
            setIsGeneratingInvite(true);
            toast.loading("Generating link...");
            
            const token = await getToken();
            const { data } = await api.post(
                `/api/invite/project/${project.id}`,
                { maxUses: inviteUses, expiresInDays: inviteExpiry },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            setInviteLink(data.inviteUrl);
            toast.dismiss();
            toast.success("Invite link generated!");
        } catch (error) {
            toast.dismiss();
            toast.error(error?.response?.data?.message || "Failed to generate link");
        } finally {
            setIsGeneratingInvite(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(inviteLink);
        toast.success("Copied to clipboard!");
    };

    const isProjectLead = project?.team_lead === user?.id;

    const inputClasses = "w-full px-3 py-2 rounded mt-2 border text-sm dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-300";
    const cardClasses = "rounded-xl border p-6 not-dark:bg-white dark:bg-gradient-to-br dark:from-zinc-800/70 dark:to-zinc-900/50 border-zinc-300 dark:border-zinc-800 shadow-sm";
    const labelClasses = "text-sm font-medium text-zinc-700 dark:text-zinc-400";

    return (
        <div className="grid lg:grid-cols-2 gap-8 pb-10">
            {/* Left Column: Details & Integrations */}
            <div className="space-y-6">
                {/* Project Details */}
                <div className={cardClasses}>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-5 flex items-center gap-2">
                        Project Settings
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className={labelClasses}>Project Name</label>
                            <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClasses} required />
                        </div>

                        <div className="space-y-2">
                            <label className={labelClasses}>Description</label>
                            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className={inputClasses + " h-24 resize-none"} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className={labelClasses}>Status</label>
                                <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className={inputClasses} >
                                    <option value="PLANNING">Planning</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className={labelClasses}>Priority</label>
                                <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className={inputClasses} >
                                    <option value="LOW">Low</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="HIGH">High</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className={labelClasses}>Start Date</label>
                                <input type="date" value={formData.start_date ? format(new Date(formData.start_date), "yyyy-MM-dd") : ""} onChange={(e) => setFormData({ ...formData, start_date: e.target.value ? new Date(e.target.value) : null })} className={inputClasses} />
                            </div>
                            <div className="space-y-2">
                                <label className={labelClasses}>End Date</label>
                                <input type="date" value={formData.end_date ? format(new Date(formData.end_date), "yyyy-MM-dd") : ""} onChange={(e) => setFormData({ ...formData, end_date: e.target.value ? new Date(e.target.value) : null })} className={inputClasses} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <label className={labelClasses}>Progress</label>
                                <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{formData.progress}%</span>
                            </div>
                            <input type="range" min="0" max="100" step="5" value={formData.progress} onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })} className="w-full accent-blue-600 dark:accent-blue-500" />
                        </div>



                        <div className="pt-2">
                            <button type="submit" disabled={isSubmitting} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-sm" >
                                <Save className="size-4" /> {isSubmitting ? "Saving..." : "Save All Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: Members & External Links */}
            <div className="space-y-6">
                
                {/* Invite Links */}
                <div className={cardClasses}>
                    <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-1 flex items-center gap-2">
                        <Link2 className="size-5 text-blue-500" /> Shareable Invite Links
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-5">
                        Generate a secure link to let teammates join this project instantly.
                    </p>
                    
                    {!isProjectLead ? (
                        <div className="bg-zinc-100 dark:bg-zinc-800/50 p-4 rounded-lg text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 border-dashed">
                            Only the project lead can generate invite links.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Max Uses</label>
                                    <select value={inviteUses} onChange={(e) => setInviteUses(Number(e.target.value))} className={inputClasses + " mt-1"} >
                                        <option value={1}>1 use</option>
                                        <option value={5}>5 uses</option>
                                        <option value={10}>10 uses</option>
                                        <option value={50}>50 uses</option>
                                        <option value={100}>100 uses</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">Expires In</label>
                                    <select value={inviteExpiry} onChange={(e) => setInviteExpiry(Number(e.target.value))} className={inputClasses + " mt-1"} >
                                        <option value={1}>1 day</option>
                                        <option value={3}>3 days</option>
                                        <option value={7}>7 days</option>
                                        <option value={30}>30 days</option>
                                    </select>
                                </div>
                            </div>
                            
                            {inviteLink ? (
                                <div className="space-y-2 origin-top animate-in fade-in slide-in-from-top-2 duration-300">
                                    <label className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Share2 className="size-3"/> Link Ready</label>
                                    <div className="flex items-center gap-2">
                                        <input readOnly value={inviteLink} className={`${inputClasses} mt-0 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800/50`} />
                                        <button onClick={copyToClipboard} className="p-2.5 rounded border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition" title="Copy to clipboard">
                                            <Copy className="size-4 text-zinc-600 dark:text-zinc-300" />
                                        </button>
                                    </div>
                                    <div className="flex gap-4 text-xs text-zinc-500 mt-2">
                                        <span className="flex items-center gap-1"><Clock className="size-3"/> Expires in {inviteExpiry} days</span>
                                        <span className="flex items-center gap-1"><UsersIcon className="size-3"/> Valid for {inviteUses} uses</span>
                                    </div>
                                    <button onClick={() => setInviteLink("")} className="text-xs text-blue-600 hover:underline mt-2">Generate a different link</button>
                                </div>
                            ) : (
                                <button 
                                    onClick={handleGenerateInvite} 
                                    disabled={isGeneratingInvite}
                                    className="w-full flex justify-center items-center gap-2 p-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
                                >
                                    <Link2 className="size-4" /> {isGeneratingInvite ? "Generating..." : "Generate Link"}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Team Members */}
                <div className={cardClasses}>
                    <div className="flex items-center justify-between gap-4 mb-5">
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            Team Members <span className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">{project.members.length}</span>
                        </h2>
                        {isProjectLead && (
                            <>
                                <button type="button" onClick={() => setIsDialogOpen(true)} className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition shadow-sm" >
                                    <Plus className="size-4 text-zinc-900 dark:text-zinc-200" />
                                </button>
                                <AddProjectMember isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen} />
                            </>
                        )}
                    </div>

                    {/* Member List */}
                    {project.members.length > 0 ? (
                        <div className="space-y-2 mt-2 max-h-64 overflow-y-auto pr-2 no-scrollbar">
                            {project.members.map((member, index) => (
                                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-100 dark:border-zinc-800 text-sm" >
                                    <div className="flex items-center gap-3">
                                        <div className="size-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-semibold text-xs border border-blue-200 dark:border-blue-800/50">
                                            {member?.user?.email?.charAt(0).toUpperCase() || "?"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-zinc-900 dark:text-zinc-200">{member?.user?.name || "Unknown User"}</p>
                                            <p className="text-xs text-zinc-500">{member?.user?.email}</p>
                                        </div>
                                    </div>
                                    {project.team_lead === member.user.id && (
                                        <span className="px-2 py-1 text-[10px] uppercase font-bold tracking-wider rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800/50">
                                            Lead
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-6 text-sm text-zinc-500 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                            No team members yet
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
