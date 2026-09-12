import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";

function Home() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="page">
            <div className="hero">
                <h1>Ümraniye Eğitim ve Araştırma Hastanesi</h1>

                <p>
                    Hasta kayıt, randevu ve reçete işlemlerini kolayca yönetin.
                </p>

                <div className="hero-buttons">
                    {!user ? (
                        <>
                            <Link to="/randevu-olustur">
                                Randevu Oluştur
                            </Link>

                            <Link to="/doktor-giris">
                                Doktor Girişi
                            </Link>
                        </>
                    ) : (
                        <>
                            <Link to="/hasta-kayit">
                                Hasta Kayıt
                            </Link>

                            <Link to="/randevular">
                                Randevuları Gör
                            </Link>
                        </>
                    )}
                </div>
            </div>

            <div className="cards">
                <div className="card">
                    <h3>Hasta Kayıt</h3>
                    <p>
                        Doktorlar yeni hasta kayıtlarını oluşturabilir,
                        düzenleyebilir ve yönetebilir.
                    </p>
                </div>

                <div className="card">
                    <h3>Randevu Sistemi</h3>
                    <p>
                        Bölüm ve doktor seçerek kolayca hastane
                        randevusu oluşturabilirsiniz.
                    </p>
                </div>

                <div className="card">
                    <h3>Reçete Yönetimi</h3>
                    <p>
                        Doktorlar giriş yaptıktan sonra hastalara
                        reçete oluşturabilir ve reçeteleri görüntüleyebilir.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Home;