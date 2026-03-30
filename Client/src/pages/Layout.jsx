import { useState, useEffect } from 'react'
import Navbar from '../components/Navbar'
import Sidebar from '../components/Sidebar'
import { Outlet, useSearchParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { loadTheme } from '../features/themeSlice'
import { Loader2Icon } from 'lucide-react'
import { useUser, SignIn, SignUp, useAuth, useClerk, useOrganization, CreateOrganization } from '@clerk/clerk-react'
import { fetchWorkspaces } from '../features/workspaceSlice'

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const { loading, workspaces } = useSelector((state) => state.workspace)
    const dispatch = useDispatch()
    const { user, isLoaded } = useUser()
    const { getToken } = useAuth()
    const clerk = useClerk()
    const { organization } = useOrganization()
    const [searchParams] = useSearchParams()
    const [isSigningOut, setIsSigningOut] = useState(false)
    const [showCreateOrg, setShowCreateOrg] = useState(true)

    // Real ticket in URL (only present after our redirect flow completes)
    const clerkTicket = searchParams.get('__clerk_ticket')
    const hasInvitation = !!clerkTicket

    // Pending ticket (stripped from URL by main.jsx, stored in sessionStorage)
    const pendingTicket = sessionStorage.getItem('clerk_pending_ticket')

    // ========================================================================
    // INVITATION FLOW: Handle pending invitation ticket
    // ========================================================================
    // If there's a pending ticket in sessionStorage, it means main.jsx stripped
    // it from the URL to prevent ClerkProvider from auto-accepting it.
    // Now we need to:
    //   1. If a user is signed in → sign them out first
    //   2. Then redirect with the ticket so Clerk processes it with no session
    // ========================================================================
    useEffect(() => {
        if (!isLoaded) return
        if (!pendingTicket) return
        if (isSigningOut) return

        if (user) {
            // User is signed in — sign them out before processing invitation
            setIsSigningOut(true)
            clerk.signOut()
                .then(() => {
                    // Mark that we're ready — next page load will have ticket + no session
                    sessionStorage.setItem('clerk_invitation_ready', 'true')
                    window.location.replace(`/?__clerk_ticket=${encodeURIComponent(pendingTicket)}`)
                })
                .catch((err) => {
                    console.error('Sign-out failed during invitation flow:', err)
                    setIsSigningOut(false)
                })
        } else {
            // No user signed in — safe to redirect with ticket immediately
            sessionStorage.setItem('clerk_invitation_ready', 'true')
            window.location.replace(`/?__clerk_ticket=${encodeURIComponent(pendingTicket)}`)
        }
    }, [isLoaded, user, pendingTicket, isSigningOut])

    // Initial load of theme
    useEffect(() => {
        dispatch(loadTheme())
    }, [])

    // Initial load of workspaces (skip if handling invitation)
    useEffect(() => {
        if (isLoaded && user && workspaces.length == 0 && !hasInvitation && !pendingTicket) {
            dispatch(fetchWorkspaces({ getToken }))
        }
    }, [user, isLoaded])

    // When Clerk organization becomes active (after creation), wait for workspace to be created in DB
    useEffect(() => {
        let interval;
        if (organization && user && isLoaded && workspaces.length === 0) {
            setShowCreateOrg(false)

            // Initial fetch
            if (!loading) {
                dispatch(fetchWorkspaces({ getToken }))
            }

            // Poll every 3 seconds until webhook creates workspace in database
            interval = setInterval(() => {
                dispatch(fetchWorkspaces({ getToken }))
            }, 3000);
        }

        return () => {
            if (interval) clearInterval(interval);
        }
    }, [organization, user, isLoaded, workspaces.length])

    // Show loading while handling invitation (signing out or redirecting)
    if (isSigningOut || pendingTicket) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
                <span className="ml-3 text-zinc-600 dark:text-zinc-400">Preparing invitation sign-up...</span>
            </div>
        )
    }

    if (!isLoaded) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    if (!user) {
        // If there's an invitation ticket in the URL, show SignUp for the invited email
        if (hasInvitation) {
            return (
                <div className="flex justify-center items-center h-screen bg-zinc-50 dark:bg-zinc-950 flex-col space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-md font-medium text-sm">
                        Organization Invite! Please sign in or sign up to accept.
                    </div>
                    <SignUp
                        forceRedirectUrl={'/'}
                        signInForceRedirectUrl={'/'}
                        routing="hash"
                        signInUrl={`/?__clerk_ticket=${clerkTicket}#/sign-in`}
                    />
                </div>
            );
        }
        return (
            <div className="flex justify-center items-center h-screen bg-white dark:bg-zinc-950">
                <SignIn forceRedirectUrl={'/'} routing="hash" />
            </div>
        );
    }

    if (loading) return (
        <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
            <Loader2Icon className="size-7 text-blue-500 animate-spin" />
        </div>
    )

    if (user && workspaces.length == 0 && showCreateOrg) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <CreateOrganization />
            </div>
        )
    }

    // Still waiting for workspaces to load after org creation
    if (user && workspaces.length == 0 && !showCreateOrg) {
        return (
            <div className='flex items-center justify-center h-screen bg-white dark:bg-zinc-950'>
                <Loader2Icon className="size-7 text-blue-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="flex bg-white dark:bg-zinc-950 text-gray-900 dark:text-slate-100">
            <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="flex-1 flex flex-col h-screen">
                <Navbar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
                <div className="flex-1 h-full p-6 xl:p-10 xl:px-16 overflow-y-scroll">
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout


