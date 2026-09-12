import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "../firebase";

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert("Çıkış yapıldı.");
            navigate("/");
        } catch (error) {
            console.error("Çıkış hatası:", error);
        }
    };

    return (
        <nav className="navbar">
            <div className="logo">
                Ümraniye Eğitim ve Araştırma Hastanesi
            </div>

            <div className="nav-links">
                <Link to="/">Ana Sayfa</Link>

                {!user && (
                    <Link to="/doktor-giris">
                        Doktor Girişi
                    </Link>
                )}

                <Link to="/randevu-olustur">
                    Randevu Oluştur
                </Link>

                {user && (
                    <>
                        <Link to="/hasta-kayit">
                            Hasta Kayıt
                        </Link>

                        <Link to="/randevular">
                            Randevular
                        </Link>

                        <Link to="/recete-olustur">
                            Reçete Oluştur
                        </Link>

                        <Link to="/receteler">
                            Reçeteler
                        </Link>

                        <button
                            className="logout-button"
                            onClick={handleLogout}
                        >
                            Çıkış Yap
                        </button>
                    </>
                )}

                <Link to="/hakkimizda">
                    Hakkımızda
                </Link>
            </div>
        </nav>
    );
}

export default Navbar;