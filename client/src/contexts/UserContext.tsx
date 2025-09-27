import React, {createContext, useContext, useState, useEffect} from 'react';
import axios from '../libs/axios';

interface User {
    id: string;
    username: string;
}

interface UserContextType {
    user: User | null;
    loading: boolean;
}

export const UserContext = createContext<UserContextType>({user: null, loading: true});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/auth/profile', {withCredentials: true})
        .then(res => {
            if(res.status == 200) {
                setUser(res.data);
            }
        })
        .catch(err => {
            setUser(null);
        })
        .finally(() => {setLoading(false)});
    }, []);

    return (
        <UserContext.Provider value={{user, setUser, loading}}>
            {children}
        </UserContext.Provider>
    );
};