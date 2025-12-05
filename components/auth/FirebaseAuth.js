/* import { useEffect, useState } from 'react'
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth'

import {
    getAuth,
    GoogleAuthProvider,
    EmailAuthProvider
} from "firebase/auth";

import { setUserCookie } from '@/lib/firebase/userCookies'
import { mapUserData } from '@/lib/firebase/mapUserData'
import { initFirebase } from '@/lib/firebase/initFirebase'

// Initialize Firebase BEFORE calling getAuth()
initFirebase();
const auth = getAuth();

const firebaseAuthConfig = {
    signInFlow: 'popup',
    signInOptions: [
        {
            provider: EmailAuthProvider.PROVIDER_ID,
            requireDisplayName: true,
        },
        GoogleAuthProvider.PROVIDER_ID,
    ],
    signInSuccessUrl: '/',
    credentialHelper: 'none',
    callbacks: {
        signInSuccessWithAuthResult: async ({ user }) => {
            const userData = mapUserData(user);
            await setUserCookie(userData);
        },
    },
};

const FirebaseAuth = () => {
    const [renderAuth, setRenderAuth] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setRenderAuth(true);
        }
    }, []);

    return (
        <div>
            {renderAuth ? (
                <StyledFirebaseAuth
                    uiConfig={firebaseAuthConfig}
                    firebaseAuth={auth}
                />
            ) : null}
        </div>
    );
};

export default FirebaseAuth; */
