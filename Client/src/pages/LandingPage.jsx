import { useState } from "react";
import { SignIn, SignUp } from "@clerk/clerk-react";
import {
    Sparkles,
    BarChart3,
    Users,
    ShieldCheck,
    CalendarDays,
    ArrowRight,
    CheckCircle2,
    Zap,
    Clock,
    Target,
    TrendingUp,
    MessageCircle,
    Layers,
    ChevronRight,
    X,
    Star,
    Github,
    Wand2,
    LayoutGrid,
    Network,
    FileText,
    Download,
} from "lucide-react";

const FEATURES = [
    {
        icon: LayoutGrid,
        title: "Task Management",
        description: "Organize tasks, assign owners, and keep every item on your backlog visible and prioritized.",
        color: "from-blue-500 to-cyan-600",
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500",
    },

    {
        icon: MessageCircle,
        title: "Team Collaboration",
        description: "Keep conversations, task updates, and project activity together in one shared workspace.",
        color: "from-emerald-500 to-teal-600",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-500",
    },
    {
        icon: BarChart3,
        title: "Workload Insights",
        description: "See team capacity, burnout risk, and workload balance in a single dashboard.",
        color: "from-orange-500 to-amber-600",
        iconBg: "bg-orange-500/10",
        iconColor: "text-orange-500",
    },
    {
        icon: FileText,
        title: "Project Analytics",
        description: "Track progress with charts, summaries, and performance metrics across every project.",
        color: "from-amber-500 to-yellow-600",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500",
    },
    {
        icon: CalendarDays,
        title: "Calendar Planning",
        description: "Schedule and review milestones in a calendar view so deadlines stay on track.",
        color: "from-cyan-500 to-blue-600",
        iconBg: "bg-cyan-500/10",
        iconColor: "text-cyan-500",
    },

    {
        icon: Users,
        title: "Workspace Access",
        description: "Invite teammates, manage roles, and collaborate securely across projects.",
        color: "from-violet-500 to-purple-600",
        iconBg: "bg-violet-500/10",
        iconColor: "text-violet-500",
    },
    {
        icon: Download,
        title: "Exports & Reports",
        description: "Export task lists, reports, and dashboards to share with stakeholders immediately.",
        color: "from-teal-500 to-emerald-600",
        iconBg: "bg-teal-500/10",
        iconColor: "text-teal-500",
    },
    {
        icon: Target,
        title: "Delivery Focus",
        description: "Keep planning, tracking, and execution aligned so teams ship projects on time.",
        color: "from-blue-500 to-violet-600",
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500",
    },
];

const STATS = [
    { value: "20+", label: "Team Tools" },
    { value: "100+", label: "Projects Supported" },
    { value: "< 2m", label: "Quick Setup" },
    { value: "Live", label: "Team Sync" },
];

const HOW_IT_WORKS = [
    { step: "01", title: "Create Your Workspace", description: "Invite your team and set up your first workspace in seconds." },
    { step: "02", title: "Plan Projects & Tasks", description: "Build projects, assign tasks, and connect dependencies clearly." },
    { step: "03", title: "Track Progress", description: "Use dashboards, analytics, and calendar views to stay on schedule." },
    { step: "04", title: "Deliver With Confidence", description: "Balance workload and keep stakeholders aligned until launch." },
];

export default function LandingPage() {
    const [showAuth, setShowAuth] = useState(false);
    const [authMode, setAuthMode] = useState("signin"); // "signin" | "signup"

    return (
        <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">
            {/* ===== NAVBAR ===== */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-violet-600">
                            <Zap className="size-4 text-white" />
                        </div>
                        <span className="text-lg font-bold tracking-tight">TaskFlow</span>
                        <span className="hidden sm:inline px-2 py-0.5 text-[10px] font-medium rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                            Team-Focused
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => { setAuthMode("signin"); setShowAuth(true); }}
                            className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition"
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => { setAuthMode("signup"); setShowAuth(true); }}
                            className="px-5 py-2 text-sm font-medium rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 hover:opacity-90 transition shadow-lg shadow-blue-500/20"
                        >
                            Get Started Free
                        </button>
                    </div>
                </div>
            </nav>

            {/* ===== AUTH MODAL ===== */}
            {showAuth && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowAuth(false); }}
                >
                    <div className="relative flex flex-col items-center my-auto">
                        <button
                            onClick={() => setShowAuth(false)}
                            className="self-end mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 transition text-sm text-zinc-300"
                        >
                            <X className="size-3.5" /> Close
                        </button>
                        <div className="transform scale-[0.85] origin-top">
                            {authMode === "signin" ? (
                                <SignIn forceRedirectUrl={"/"} routing="hash" />
                            ) : (
                                <SignUp forceRedirectUrl={"/"} routing="hash" />
                            )}
                        </div>
                        <div className="mt-1 text-center">
                            <button
                                onClick={() => setAuthMode(authMode === "signin" ? "signup" : "signin")}
                                className="text-sm text-zinc-400 hover:text-blue-400 transition"
                            >
                                {authMode === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== HERO ===== */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-blue-500/10 via-violet-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
                <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl" />

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }} />

                <div className="max-w-4xl mx-auto text-center relative">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 mb-8" style={{ animation: "fadeSlideDown 0.6s ease-out" }}>
                        <Sparkles className="size-3.5 text-amber-400" />
                        <span className="text-xs text-zinc-300">Designed for modern teams</span>
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6" style={{ animation: "fadeSlideDown 0.6s ease-out 0.1s both" }}>
                        Project Management
                        <br />
                        <span className="bg-gradient-to-r from-blue-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                            Built for modern teams
                        </span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed" style={{ animation: "fadeSlideDown 0.6s ease-out 0.2s both" }}>
                        TaskFlow helps teams organize projects, coordinate work, and deliver on time with intuitive planning and collaboration.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4" style={{ animation: "fadeSlideDown 0.6s ease-out 0.3s both" }}>
                        <button
                            onClick={() => { setAuthMode("signup"); setShowAuth(true); }}
                            className="group flex items-center gap-2 px-8 py-3.5 text-base font-medium rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 hover:opacity-90 transition-all shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40"
                        >
                            Get Started Free
                            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => { setAuthMode("signin"); setShowAuth(true); }}
                            className="flex items-center gap-2 px-8 py-3.5 text-base font-medium rounded-xl border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all text-zinc-300"
                        >
                            Sign In
                            <ChevronRight className="size-4" />
                        </button>
                    </div>

                    {/* Trust indicators */}
                    <div className="flex items-center justify-center gap-6 mt-12 flex-wrap" style={{ animation: "fadeSlideDown 0.6s ease-out 0.4s both" }}>
                        {STATS.map((s, i) => (
                            <div key={i} className="text-center">
                                <p className="text-2xl font-bold text-white">{s.value}</p>
                                <p className="text-[11px] text-zinc-500">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURES ===== */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-900/50 to-transparent pointer-events-none" />

                <div className="max-w-6xl mx-auto relative">
                    {/* Section Header */}
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium mb-4">
                            <Sparkles className="size-3" /> Features
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Everything You Need,{" "}
                            <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                                Built for teams
                            </span>
                        </h2>
                        <p className="text-zinc-400 max-w-xl mx-auto">
                            From smart task assignment to burnout prevention — every feature is designed to solve real problems teams face daily.
                        </p>
                    </div>

                    {/* Feature Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {FEATURES.map((feature, i) => (
                            <div
                                key={i}
                                className="group relative bg-zinc-900/70 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-zinc-900/50"
                                style={{ animation: `fadeSlideUp 0.5s ease-out ${i * 0.08}s both` }}
                            >
                                {/* Hover glow */}
                                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-[0.03] transition-opacity duration-300`} />

                                <div className={`inline-flex p-3 rounded-xl ${feature.iconBg} mb-4`}>
                                    <feature.icon className={`size-5 ${feature.iconColor}`} />
                                </div>

                                <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== HOW IT WORKS ===== */}
            <section className="py-24 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-4">
                            <TrendingUp className="size-3" /> How It Works
                        </div>
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            Simple to Start,{" "}
                            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                Powerful to Scale
                            </span>
                        </h2>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {HOW_IT_WORKS.map((item, i) => (
                            <div key={i} className="relative" style={{ animation: `fadeSlideUp 0.5s ease-out ${i * 0.1}s both` }}>
                                {/* Connector line */}
                                {i < HOW_IT_WORKS.length - 1 && (
                                    <div className="hidden lg:block absolute top-8 left-[calc(100%+0.25rem)] w-[calc(100%-2rem)] h-px bg-gradient-to-r from-zinc-700 to-zinc-800" />
                                )}

                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-zinc-800 border border-zinc-700 mb-4">
                                        <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                                            {item.step}
                                        </span>
                                    </div>
                                    <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                                    <p className="text-sm text-zinc-400">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== FEATURE HIGHLIGHT ===== */}
            <section className="py-24 px-6 relative">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/[0.02] to-transparent pointer-events-none" />

                <div className="max-w-5xl mx-auto">
                    <div className="relative rounded-3xl border border-zinc-800 bg-zinc-900/50 overflow-hidden p-1">
                        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

                        <div className="rounded-[1.25rem] bg-zinc-900/80 p-8 sm:p-12">
                            <div className="flex flex-col lg:flex-row items-center gap-10">
                                <div className="flex-1">
                                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium mb-4">
                                        <LayoutGrid className="size-3" /> Project Workflow
                                    </div>
                                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                                        8+ powerful features.{" "}
                                        <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                                            One Click Each.
                                        </span>
                                    </h2>
                                    <p className="text-zinc-400 mb-6 leading-relaxed">
                                        TaskFlow brings powerful project tools together: task creation, risk analytics,
                                        and collaboration. All seamlessly combined with workflow boards and easy reporting.
                                        Enterprise-grade capabilities, completely free.
                                    </p>

                                    <div className="space-y-3">
                                        {[
                                            "Flexible task boards for easy organization",
                                            "Real-time collaboration with role-based access",
                                            "Keep daily progress visible for everyone",
                                            "Predict deadline risks and keep your plan on track",
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-start gap-2.5">
                                                <CheckCircle2 className="size-4 text-violet-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-sm text-zinc-300">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Feature Visual */}
                                <div className="flex-shrink-0">
                                    <div className="relative w-56 h-56">
                                        {/* Orbit rings */}
                                        <div className="absolute inset-0 rounded-full border border-zinc-700/30 animate-[spin_20s_linear_infinite]" />
                                        <div className="absolute inset-4 rounded-full border border-zinc-700/20 animate-[spin_15s_linear_infinite_reverse]" />
                                        <div className="absolute inset-8 rounded-full border border-zinc-700/10 animate-[spin_10s_linear_infinite]" />

                                        {/* Center */}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-2xl shadow-violet-500/30">
                                                <LayoutGrid className="size-10 text-white" />
                                            </div>
                                        </div>

                                        {/* Floating icons */}
                                        <div className="absolute top-1 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg">
                                            <Sparkles className="size-3.5 text-amber-400" />
                                        </div>
                                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg">
                                            <BarChart3 className="size-3.5 text-blue-400" />
                                        </div>
                                        <div className="absolute left-1 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg">
                                            <ShieldCheck className="size-3.5 text-emerald-400" />
                                        </div>
                                        <div className="absolute right-1 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-zinc-800 border border-zinc-700 shadow-lg">
                                            <Target className="size-3.5 text-red-400" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ===== FINAL CTA ===== */}
            <section className="py-24 px-6 relative">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                        Ready to{" "}
                        <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
                            Transform
                        </span>{" "}
                        Your Workflow?
                    </h2>
                    <p className="text-zinc-400 mb-8 max-w-lg mx-auto">
                        Join TaskFlow and focus on delivery. Set up in 60 seconds — no credit card required.
                    </p>

                    <button
                        onClick={() => { setAuthMode("signup"); setShowAuth(true); }}
                        className="group inline-flex items-center gap-2 px-10 py-4 text-base font-medium rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 hover:opacity-90 transition-all shadow-2xl shadow-blue-500/25 hover:shadow-blue-500/40"
                    >
                        Get Started — It's Free
                        <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                    </button>

                    <div className="flex items-center justify-center gap-2 mt-6 text-sm text-zinc-500">
                        <CheckCircle2 className="size-4 text-emerald-500" />
                        Free forever • No credit card • Setup in 60s
                    </div>
                </div>
            </section>

            {/* ===== FOOTER ===== */}
            <footer className="border-t border-zinc-800/50 py-8 px-6">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-gradient-to-br from-blue-500 to-violet-600">
                            <Zap className="size-3 text-white" />
                        </div>
                        <span className="text-sm font-semibold">TaskFlow</span>
                        <span className="text-xs text-zinc-500">© 2026</span>
                    </div>
                    <p className="text-xs text-zinc-600">
                        Built with React • Prisma • Recharts
                    </p>
                </div>
            </footer>

            {/* ===== ANIMATIONS ===== */}
            <style>{`
                @keyframes fadeSlideDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeSlideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
