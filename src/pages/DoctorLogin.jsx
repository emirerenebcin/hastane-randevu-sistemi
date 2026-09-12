import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function DoctorLogin() {
    const [email, setEmail] = useState("");
    const [sifre, setSifre] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        try {
            setLoading(true);

            await signInWithEmailAndPassword(auth, email, sifre);

            alert("Doktor girişi başarılı.");

            navigate("/recete-olustur");
        } catch (error) {
            console.error("Giriş hatası:", error);

            alert("E-posta veya şifre hatalı.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="form-container">

                <h2>Doktor Girişi</h2>

                <p className="form-description">
                    Doktor hesabınızla giriş yapınız.
                </p>

                <form onSubmit={handleSubmit}>

                    <input
                        type="email"
                        placeholder="E-posta"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />

                    <input
                        type="password"
                        placeholder="Şifre"
                        value={sifre}
                        onChange={(event) => setSifre(event.target.value)}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
                    </button>

                </form>

            </div>
        </div>
    );
}

export default DoctorLogin;