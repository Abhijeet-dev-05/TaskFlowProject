import { useState } from "react";
import { XIcon } from "lucide-react";
import { useSelector } from "react-redux";
import toast from 'react-hot-toast'
import { useAuth } from "@clerk/clerk-react";
import api from "../configs/api";
import { useDispatch } from "react-redux";
import { addProject } from "../features/workspaceSlice"

const CreateProjectDialog = ({ isDialogOpen, setIsDialogOpen }) => {

    const { getToken } = useAuth();
    const dispatch = useDispatch();

    const { currentWorkspace } = useSelector((state) => state.workspace);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        start_date: "",
        end_date: "",
        team_members: [],
        team_lead: "",
        progress: 0,
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (!formData.team_lead) {
                return toast.error("Please select a team lead");
            }

            setIsSubmitting(true);

            const { data } = await api.post(
                "/api/projects",
                {
                    workspaceId: currentWorkspace.id,
                    ...formData,
                },
                {
                    headers: {
                        Authorization: `Bearer ${await getToken()}`,
                    },
                }
            );

            dispatch(addProject(data.project));
            setIsDialogOpen(false);
        } catch (error) {
            toast.error(
                error?.response?.data?.message || error.message
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    const removeTeamMember = (email) => {
        setFormData((prev) => ({ ...prev, team_members: prev.team_members.filter(m => m !== email) }));
    };

    if (!isDialogOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 dark:bg-black/60 backdrop-blur flex items-center justify-center text-left z-50 p-4">
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl w-full max-w-lg text-zinc-900 dark:text-zinc-200">

                {/* Header */}
                <div className="flex items-start justify-between px-5 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                    <div>
                        <h2 className="text-base font-semibold leading-tight">Create New Project</h2>
                        {currentWorkspace && (
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                In workspace: <span className="text-blue-600 dark:text-blue-400">{currentWorkspace.name}</span>
                            </p>
                        )}
                    </div>
                    <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200" onClick={() => setIsDialogOpen(false)}>
                        <XIcon className="size-4" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-5 py-3 space-y-2.5">

                    {/* Project Name */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Project Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter project name" className="w-full px-3 py-1.5 rounded-md dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm" required />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe your project" rows={2} className="w-full px-3 py-1.5 rounded-md dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm resize-none" />
                    </div>

                    {/* Status & Priority */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-1.5 rounded-md dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm">
                                <option value="PLANNING">Planning</option>
                                <option value="ACTIVE">Active</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="ON_HOLD">On Hold</option>
                                <option value="CANCELLED">Cancelled</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="w-full px-3 py-1.5 rounded-md dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm">
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    {/* Dates */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Start Date</label>
                            <input type="date" value={formData.start_date} onChange={(e) => setFormData({ ...formData, start_date: e.target.value })} className="w-full px-3 py-1.5 rounded-md dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">End Date</label>
                            <input type="date" value={formData.end_date} onChange={(e) => setFormData({ ...formData, end_date: e.target.value })} min={formData.start_date && new Date(formData.start_date).toISOString().split('T')[0]} className="w-full px-3 py-1.5 rounded-md dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm" />
                        </div>
                    </div>

                    {/* Project Lead & Team Members */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Project Lead</label>
                            <select value={formData.team_lead} onChange={(e) => setFormData({ ...formData, team_lead: e.target.value, team_members: e.target.value ? [...new Set([...formData.team_members, e.target.value])] : formData.team_members })} className="w-full px-3 py-1.5 rounded-md dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm">
                                <option value="">No lead</option>
                                {currentWorkspace?.members?.map((member) => (
                                    <option key={member.user.email} value={member.user.email}>{member.user.email}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1">Team Members</label>
                            <select className="w-full px-3 py-1.5 rounded-md dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-200 text-sm"
                                onChange={(e) => {
                                    if (e.target.value && !formData.team_members.includes(e.target.value)) {
                                        setFormData((prev) => ({ ...prev, team_members: [...prev.team_members, e.target.value] }));
                                    }
                                }}
                            >
                                <option value="">Add team members</option>
                                {currentWorkspace?.members
                                    ?.filter((m) => !formData.team_members.includes(m.user?.email))
                                    .map((member) => (
                                        <option key={member.user.email} value={member.user.email}>{member.user.email}</option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* Selected Team Members Tags */}
                    {formData.team_members.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {formData.team_members.map((email) => (
                                <div key={email} className="flex items-center gap-1 bg-blue-100 dark:bg-blue-500/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full text-xs">
                                    {email}
                                    <button type="button" onClick={() => removeTeamMember(email)} className="hover:text-red-500 transition-colors">
                                        <XIcon className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex justify-end gap-2 pt-1.5 border-t border-zinc-100 dark:border-zinc-800">
                        <button type="button" onClick={() => setIsDialogOpen(false)} className="px-4 py-1.5 text-sm rounded-md border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                            Cancel
                        </button>
                        <button type="submit" disabled={isSubmitting || !currentWorkspace} className="px-4 py-1.5 text-sm rounded-md bg-gradient-to-br from-blue-500 to-blue-600 text-white hover:opacity-90 disabled:opacity-50 transition-opacity">
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateProjectDialog;