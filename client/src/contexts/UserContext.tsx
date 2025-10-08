import React, {createContext, useContext, useState, useEffect} from 'react';
import axios from '../libs/axios';

interface User {
    id: string;
    username: string;
    img: string;
    bookmarkedRecipes: string[];
    createdRecipes: string[];
    fridge: string[];
    shoppingList: string[];
    profileImage: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
}

export const UserContext = createContext<UserContextType>({user: null, loading: true, setUser: () => {}});

export const useUser = () => useContext(UserContext);

export const UserProvider = ({children}: {children: React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/auth/profile', {withCredentials: true})
        .then((res:any) => {
            if(res.status == 200) {
                setUser(res.data);
            }
        })
        .catch((err:any) => {
            if(err.response && err.response.status === 401) {
                setUser(null);
                return
            }
        })
        .finally(() => {setLoading(false)});
    }, []);

    return (
        <UserContext.Provider value={{user, setUser, loading}}>
            {children}
        </UserContext.Provider>
    );
};