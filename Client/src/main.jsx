import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { store } from './app/store.js'
import { Provider } from 'react-redux'
import { ClerkProvider } from '@clerk/clerk-react'

// ============================================================================
// CRITICAL FIX: Invitation Ticket Interception
// ============================================================================
// Problem: When ClerkProvider mounts and sees __clerk_ticket in the URL + an
// active session (HttpOnly cookies), it auto-accepts the invitation for the
// WRONG (currently logged-in) user. JS cannot clear HttpOnly cookies.
//
// Solution: Strip __clerk_ticket from the URL BEFORE ClerkProvider mounts.
// Store it in sessionStorage. After the app mounts rnd signs out the existing
// user via Clerk API, we redirect back with the ticket so Clerk processes it
// with a clean (no-session) state.
// ============================================================================

const urlParams = new URLSearchParams(window.location.search)
const ticket = urlParams.get('__clerk_ticket')

if (ticket && !sessionStorage.getItem('clerk_invitation_ready')) {
    // First encounter with this ticket — hide it from ClerkProvider
    sessionStorage.setItem('clerk_pending_ticket', ticket)

    // Remove __clerk_ticket from URL so ClerkProvider doesn't auto-process it
    urlParams.delete('__clerk_ticket')
    const cleanUrl =
        window.location.pathname +
        (urlParams.toString() ? '?' + urlParams.toString() : '') +
        window.location.hash
    window.history.replaceState({}, '', cleanUrl)
}

if (ticket && sessionStorage.getItem('clerk_invitation_ready')) {
    // Returning after successful sign-out — clean up flags and let Clerk handle ticket
    sessionStorage.removeItem('clerk_invitation_ready')
    sessionStorage.removeItem('clerk_pending_ticket')
}

createRoot(document.getElementById('root')).render(
    <BrowserRouter>
        <ClerkProvider
            publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
            signUpUrl={'/'}
            signInUrl={'/'}
            signUpForceRedirectUrl={'/'}
            signInForceRedirectUrl={'/'}
            afterSignOutUrl={'/'}
        >
            <Provider store={store}>
                <App />
            </Provider>
        </ClerkProvider>

    </BrowserRouter>,
)