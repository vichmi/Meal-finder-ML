import { Navigate } from "react-router";
import {useUser} from '../contexts/UserContext';
import type { ReactElement } from "react";

export const ProtectedRoute = ({children}: {children: ReactElement}) => {
    const {user, loading} = useUser();

    if(loading) return <p>Loading...</p>
    if(!user) {return <Navigate to='/login' replace />}

    return children;
};