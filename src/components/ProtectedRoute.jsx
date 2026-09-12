import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

function ProtectedRoute({ children }) {
    const [user, setUser] = useState(undefined);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (currentUser) => {
                setUser(currentUser);
            }
        );

        return () => unsubscribe();
    }, []);

    if (user === undefined) {
        return (
            <div className="page">
                Kontrol ediliyor...
            </div>
        );
    }

    if (!user) {
        return (
            <Navigate
                to="/doktor-giris"
                replace
            />
        );
    }

    return children;
}

export default ProtectedRoute;