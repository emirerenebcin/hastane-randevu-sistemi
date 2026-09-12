import { useEffect, useState } from "react";
import { ref, push, get } from "firebase/database";
import { database, auth } from "../firebase";

function PrescriptionCreate() {
    const [doktor, setDoktor] = useState(null);

    const [formData, setFormData] = useState({
        hastaAdi: "",
        ilac: "",
        kullanim: "",
        doktorNotu: ""
    });

    useEffect(() => {
        const doktorBilgisiniGetir = async () => {
            const user = auth.currentUser;

            if (!user) {
                return;
            }

            try {
                const doktorRef = ref(
                    database,
                    `doktorlar/${user.uid}`
                );

                const snapshot = await get(doktorRef);

                if (snapshot.exists()) {
                    setDoktor(snapshot.val());
                } else {
                    console.log("Doktor bilgisi bulunamadı.");
                }
            } catch (error) {
                console.error(
                    "Doktor bilgisi alınamadı:",
                    error
                );
            }
        };

        doktorBilgisiniGetir();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!doktor) {
            alert("Doktor bilgisi bulunamadı.");
            return;
        }

        try {
            const recetelerRef = ref(
                database,
                "receteler"
            );

            await push(recetelerRef, {
                hastaAdi: formData.hastaAdi,
                ilac: formData.ilac,
                kullanim: formData.kullanim,
                doktorNotu: formData.doktorNotu,

                doktorId: auth.currentUser.uid,

                doktor:
                    `Dr. ${doktor.ad} ${doktor.soyad}`,

                doktorBrans: doktor.brans,

                olusturmaTarihi:
                    new Date().toISOString()
            });

            alert("Reçete başarıyla oluşturuldu.");

            setFormData({
                hastaAdi: "",
                ilac: "",
                kullanim: "",
                doktorNotu: ""
            });

        } catch (error) {
            console.error(
                "Reçete oluşturma hatası:",
                error
            );

            alert(
                "Reçete oluşturulurken bir hata oluştu."
            );
        }
    };

    return (
        <div className="page">
            <div className="form-container">

                <h2>Reçete Oluştur</h2>

                {doktor && (
                    <p className="form-description">
                        Doktor: Dr. {doktor.ad} {doktor.soyad}
                        {" - "}
                        {doktor.brans}
                    </p>
                )}

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="hastaAdi"
                        placeholder="Hasta Adı Soyadı"
                        value={formData.hastaAdi}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="ilac"
                        placeholder="İlaç Adı"
                        value={formData.ilac}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="kullanim"
                        placeholder="Kullanım Şekli"
                        value={formData.kullanim}
                        onChange={handleChange}
                        required
                    />

                    <textarea
                        name="doktorNotu"
                        placeholder="Doktor Notu"
                        rows="5"
                        value={formData.doktorNotu}
                        onChange={handleChange}
                    />

                    <button
                        type="submit"
                        disabled={!doktor}
                    >
                        Reçete Oluştur
                    </button>

                </form>

            </div>
        </div>
    );
}

export default PrescriptionCreate;