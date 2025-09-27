import { Navigate } from "react-router";
import {useUser} from '../contexts/UserContext';

export const ProtectedRoute = ({children}: {children: JSX.Element}) => {
    const {user, loading} = useUser();

    if(loading) return <p>Loading...</p>
    if(!user) {return <Navigate to='/login' replace />}

    return children;
};