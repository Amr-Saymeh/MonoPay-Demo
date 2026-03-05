import { auth } from '@/src/firebaseConfig';

/**
 * Returns the current signed-in user's display name, or falls back to
 * the part of their email before the '@', or 'User' if nothing is available.
 */
export function getUserName(): string {
    const user = auth.currentUser;
    if (!user) return 'User';
    if (user.displayName) return user.displayName;
    if (user.email) return user.email.split('@')[0];
    return 'User';
}

/**
 * Returns the user's total balance as a formatted string.
 * Replace this placeholder with real Firestore/backend data as needed.
 */
export function getTotalBalance(): string {
    // TODO: fetch real balance from Firestore or your backend
    return '$5,111.50';
}
