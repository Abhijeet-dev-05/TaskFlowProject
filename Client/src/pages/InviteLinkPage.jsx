import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import api from "../configs/api";
import { ShieldCheckIcon, CalendarIcon, UsersIcon, AlertCircleIcon, ArrowRightIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import { fetchWorkspaces } from "../features/workspaceSlice";

export default function InviteLinkPage() {
    const { token } = useParams();
    const navigate = useNavigate();
    const { isSignedIn, isLoaded, getToken } = useAuth();
    const dispatch = useDispatch();

    const [inviteInfo, setInviteInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [joining, setJoining] = useState(false);

    useEffect(() => {
        const fetchInviteInfo = async () => {
            try {
                // Fetch info without auth first (public endpoint logic handled in controller)
                let headers = {};
                // If signed in, pass token so backend can check if already a member
                if (isSignedIn && isLoaded) {
                    const authToken = await getToken();
                    headers.Authorization = `Bearer ${authToken}`;
                }

                const { data } = await api.get(`/api/invite/project/${token}`, { headers });
                setInviteInfo(data);
            } catch (err) {
                setError(err.response?.data?.message || "Failed to load invite link");
            } finally {
                setLoading(false);
            }
        };

        if (isLoaded) {
            fetchInviteInfo();
        }
    }, [token, isLoaded, isSignedIn]);

    const handleJoin = async () => {
        if (!isSignedIn) {
            // Redirect to clerk sign-in, it will return here
            toast.error("Please sign in or create an account to join");
            return;
        }

        setJoining(true);
        toast.loading("Joining project...");

        try {
            const authToken = await getToken();
            const { data } = await api.post(
                `/api/invite/project/accept/${token}`,
                {},
                { headers: { Authorization: `Bearer ${authToken}` } }
            );

            toast.dismiss();
            toast.success("Successfully joined the project!");
            
            // Refresh redux state
            dispatch(fetchWorkspaces({ getToken }));
            
            // Redirect to project
            navigate(`/projectsDetail?id=${data.projectId}&tab=tasks`);
        } catch (err) {
            toast.dismiss();
            toast.error(err.response?.data?.message || "Failed to join project");
        } finally {
            setJoining(false);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4"></div>
                    <div className="h-4 w-32 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4 text-center">
                <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-red-200 dark:border-red-900/30 rounded-xl p-8 shadow-sm">
                    <AlertCircleIcon className="size-12 text-red-500 mx-auto mb-4" />
                    <h1 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                        Invalid or Expired Link
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                        {error}
                    </p>
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition">
                        Go Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-8 shadow-sm text-center">
                <div className="size-16 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                    <ShieldCheckIcon className="size-8" />
                </div>

                <h1 className="text-2xl font-medium text-zinc-900 dark:text-zinc-100 mb-1">
                    You've been invited
                </h1>
                <p className="text-zinc-600 dark:text-zinc-400 mb-8">
                    to join <span className="font-semibold text-zinc-900 dark:text-zinc-200">{inviteInfo.projectName}</span>
                </p>

                <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 mb-8 text-left space-y-3 bg-zinc-50 dark:bg-zinc-800/30">
                    <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <UsersIcon className="size-4 text-zinc-500" />
                        <span>Led by {inviteInfo.teamLead}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <UsersIcon className="size-4 text-zinc-500" />
                        <span>{inviteInfo.memberCount} current members</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-700 dark:text-zinc-300">
                        <CalendarIcon className="size-4 text-zinc-500" />
                        <span>Valid until {format(new Date(inviteInfo.expiresAt), "MMM dd, yyyy")}</span>
                    </div>
                </div>

                {inviteInfo.isMember ? (
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl mb-4">
                        You are already a member of this project.
                    </div>
                ) : (
                    <button
                        onClick={handleJoin}
                        disabled={joining}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-blue-600 transition disabled:opacity-70"
                    >
                        {joining ? "Joining..." : isSignedIn ? "Join Project" : "Sign in to Join"}
                        {!joining && <ArrowRightIcon className="size-4" />}
                    </button>
                )}

                {!isSignedIn && (
                    <p className="text-xs text-zinc-500 mt-4">
                        You need an account to join projects.
                    </p>
                )}
            </div>
        </div>
    );
}
