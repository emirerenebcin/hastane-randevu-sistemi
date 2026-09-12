import { useEffect, useState } from "react";
import {
    ref,
    push,
    onValue,
    remove,
    update
} from "firebase/database";
import { database } from "../firebase";

function PatientRegister() {
    const [hastalar, setHastalar] = useState([]);

    const [formData, setFormData] = useState({
        ad: "",
        soyad: "",
        tc: "",
        telefon: "",
        email: ""
    });

    const [duzenlenenId, setDuzenlenenId] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const hastalarRef = ref(database, "hastalar");

        const unsubscribe = onValue(hastalarRef, (snapshot) => {
            const data = snapshot.val();

            if (data) {
                const hastaListesi = Object.entries(data).map(
                    ([id, hasta]) => ({
                        id,
                        ...hasta
                    })
                );

                setHastalar(hastaListesi);
            } else {
                setHastalar([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData({
            ...formData,
            [name]: value
        });
    };

    const formuTemizle = () => {
        setFormData({
            ad: "",
            soyad: "",
            tc: "",
            telefon: "",
            email: ""
        });

        setDuzenlenenId(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (formData.tc.length !== 11) {
            alert("T.C. Kimlik No 11 haneli olmalıdır.");
            return;
        }

        try {
            setLoading(true);

            if (duzenlenenId) {
                const hastaRef = ref(
                    database,
                    `hastalar/${duzenlenenId}`
                );

                await update(hastaRef, {
                    ad: formData.ad,
                    soyad: formData.soyad,
                    tc: formData.tc,
                    telefon: formData.telefon,
                    email: formData.email
                });

                alert("Hasta bilgileri güncellendi.");
            } else {
                const hastalarRef = ref(database, "hastalar");

                await push(hastalarRef, {
                    ad: formData.ad,
                    soyad: formData.soyad,
                    tc: formData.tc,
                    telefon: formData.telefon,
                    email: formData.email,
                    kayitTarihi: new Date().toISOString()
                });

                alert("Hasta başarıyla kaydedildi.");
            }

            formuTemizle();
        } catch (error) {
            console.error("Hasta kayıt/güncelleme hatası:", error);

            alert("İşlem sırasında bir hata oluştu.");
        } finally {
            setLoading(false);
        }
    };

    const hastaDuzenle = (hasta) => {
        setFormData({
            ad: hasta.ad || "",
            soyad: hasta.soyad || "",
            tc: hasta.tc || "",
            telefon: hasta.telefon || "",
            email: hasta.email || ""
        });

        setDuzenlenenId(hasta.id);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    const hastaSil = async (id) => {
        const onay = window.confirm(
            "Bu hastayı silmek istediğinize emin misiniz?"
        );

        if (!onay) {
            return;
        }

        try {
            const hastaRef = ref(
                database,
                `hastalar/${id}`
            );

            await remove(hastaRef);

            alert("Hasta başarıyla silindi.");

            if (duzenlenenId === id) {
                formuTemizle();
            }
        } catch (error) {
            console.error("Hasta silme hatası:", error);

            alert("Hasta silinirken bir hata oluştu.");
        }
    };

    return (
        <div className="page">

            <div className="form-container">
                <h2>
                    {duzenlenenId
                        ? "Hasta Düzenle"
                        : "Hasta Kayıt"}
                </h2>

                <p className="form-description">
                    {duzenlenenId
                        ? "Hasta bilgilerini düzenleyip güncelleyebilirsiniz."
                        : "Yeni hasta bilgilerini doldurarak sisteme kaydedebilirsiniz."}
                </p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="text"
                        name="ad"
                        placeholder="Ad"
                        value={formData.ad}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="soyad"
                        placeholder="Soyad"
                        value={formData.soyad}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="text"
                        name="tc"
                        placeholder="T.C. Kimlik No"
                        value={formData.tc}
                        onChange={handleChange}
                        maxLength="11"
                        inputMode="numeric"
                        required
                    />

                    <input
                        type="tel"
                        name="telefon"
                        placeholder="Telefon"
                        value={formData.telefon}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="email"
                        name="email"
                        placeholder="E-posta"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "İşleniyor..."
                            : duzenlenenId
                                ? "Güncelle"
                                : "Hasta Kaydet"}
                    </button>

                    {duzenlenenId && (
                        <button
                            type="button"
                            className="cancel-button"
                            onClick={formuTemizle}
                        >
                            İptal
                        </button>
                    )}
                </form>
            </div>

            <div
                className="table-container"
                style={{ marginTop: "30px" }}
            >
                <h2>Kayıtlı Hastalar</h2>

                {hastalar.length === 0 ? (
                    <p>Henüz kayıtlı hasta bulunmuyor.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Ad</th>
                                <th>Soyad</th>
                                <th>T.C.</th>
                                <th>Telefon</th>
                                <th>E-posta</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>

                        <tbody>
                            {hastalar.map((hasta) => (
                                <tr key={hasta.id}>
                                    <td>{hasta.ad}</td>
                                    <td>{hasta.soyad}</td>
                                    <td>{hasta.tc}</td>
                                    <td>{hasta.telefon}</td>
                                    <td>{hasta.email}</td>

                                    <td className="action-buttons">
                                        <button
                                            className="edit-button"
                                            onClick={() =>
                                                hastaDuzenle(hasta)
                                            }
                                        >
                                            Düzenle
                                        </button>

                                        <button
                                            className="delete-button"
                                            onClick={() =>
                                                hastaSil(hasta.id)
                                            }
                                        >
                                            Sil
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

        </div>
    );
}

export default PatientRegister;