// allows other components to know whether or not the webapp user is logged in or not
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const useUser = () => {
    const [user, setUser] = useState(null); // if the user is logged in, the user state will be a user object instead of null
    const [isLoading, setIsLoading] = useState(true); // function is still processing

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(getAuth(), user => {
            setUser(user);
            setIsLoading(false);
        });

        return unsubscribe;
    }, []); 

    return { user, isLoading };

}

export default useUser;