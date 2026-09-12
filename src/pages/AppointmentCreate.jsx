import { useEffect, useState } from "react";
import {
    ref,
    push,
    onValue,
    runTransaction,
    remove
} from "firebase/database";
import { database } from "../firebase";

function AppointmentCreate() {
    const [formData, setFormData] = useState({
        hastaAdi: "",
        bolum: "",
        doktor: "",
        tarih: "",
        saat: ""
    });

    const [doluSaatler, setDoluSaatler] = useState([]);
    const [loading, setLoading] = useState(false);

    const doktorlar = {
        Dahiliye: [
            "Dr. Ahmet Yılmaz",
            "Dr. Ayşe Demir"
        ],
        Kardiyoloji: [
            "Dr. Mehmet Kaya",
            "Dr. Selin Arslan"
        ],
        Ortopedi: [
            "Dr. Burak Şahin",
            "Dr. Ceren Aydın"
        ],
        "Göz Hastalıkları": [
            "Dr. Deniz Koç",
            "Dr. Ece Yıldız"
        ],
        "Kulak Burun Boğaz": [
            "Dr. Can Öz",
            "Dr. Elif Aksoy"
        ]
    };

    const saatler = [
        "09:00",
        "09:30",
        "10:00",
        "10:30",
        "11:00",
        "11:30",
        "12:00",
        "12:30",
        "13:00",
        "13:30",
        "14:00",
        "14:30",
        "15:00",
        "15:30",
        "16:00",
        "16:30",
        "17:00"
    ];

    const bugun = new Date().toISOString().split("T")[0];

    // Firebase key içinde "." kullanılamadığı için
    // doktor adını güvenli bir key haline getiriyoruz.
    const doktorKeyOlustur = (doktor) => {
        return doktor.replace(/[.#$[\]/]/g, "_");
    };

    useEffect(() => {
        if (!formData.doktor || !formData.tarih) {
            setDoluSaatler([]);
            return;
        }

        const doktorKey = doktorKeyOlustur(formData.doktor);

        const slotRef = ref(
            database,
            `randevuSlotlari/${doktorKey}/${formData.tarih}`
        );

        const unsubscribe = onValue(slotRef, (snapshot) => {
            const data = snapshot.val();

            if (!data) {
                setDoluSaatler([]);
                return;
            }

            const dolu = Object.keys(data).filter(
                (saat) => data[saat] === true
            );

            setDoluSaatler(dolu);

            if (dolu.includes(formData.saat)) {
                setFormData((onceki) => ({
                    ...onceki,
                    saat: ""
                }));
            }
        });

        return () => unsubscribe();

    }, [formData.doktor, formData.tarih]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((onceki) => ({
            ...onceki,
            [name]: value,

            ...(name === "bolum"
                ? {
                    doktor: "",
                    tarih: onceki.tarih,
                    saat: ""
                }
                : {}),

            ...(name === "doktor"
                ? {
                    saat: ""
                }
                : {}),

            ...(name === "tarih"
                ? {
                    saat: ""
                }
                : {})
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (formData.tarih < bugun) {
            alert(
                "Geçmiş bir tarih için randevu oluşturamazsınız."
            );
            return;
        }

        if (!saatler.includes(formData.saat)) {
            alert("Geçerli bir randevu saati seçiniz.");
            return;
        }

        const doktorKey = doktorKeyOlustur(formData.doktor);

        const slotRef = ref(
            database,
            `randevuSlotlari/${doktorKey}/${formData.tarih}/${formData.saat}`
        );

        try {
            setLoading(true);

            /*
              Aynı anda iki kişi aynı saati seçse bile
              transaction sayesinde sadece bir kişi
              slotu alabilir.
            */
            const transactionResult = await runTransaction(
                slotRef,
                (mevcutDeger) => {
                    if (mevcutDeger === true) {
                        return;
                    }

                    return true;
                }
            );

            if (!transactionResult.committed) {
                alert(
                    "Bu saat az önce başka bir kullanıcı tarafından alındı. Lütfen başka bir saat seçiniz."
                );

                setFormData((onceki) => ({
                    ...onceki,
                    saat: ""
                }));

                return;
            }

            try {
                const randevularRef = ref(
                    database,
                    "randevular"
                );

                await push(randevularRef, {
                    hastaAdi: formData.hastaAdi,
                    bolum: formData.bolum,
                    doktor: formData.doktor,
                    tarih: formData.tarih,
                    saat: formData.saat,
                    olusturmaTarihi: new Date().toISOString()
                });

            } catch (error) {
                /*
                  Randevu kaydı herhangi bir sebeple başarısız
                  olursa ayırdığımız slotu tekrar boşaltıyoruz.
                */
                await remove(slotRef);

                throw error;
            }

            alert("Randevu başarıyla oluşturuldu.");

            setFormData({
                hastaAdi: "",
                bolum: "",
                doktor: "",
                tarih: "",
                saat: ""
            });

        } catch (error) {
            console.error(
                "Randevu oluşturma hatası:",
                error
            );

            alert(
                "Randevu oluşturulurken bir hata oluştu."
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page">
            <div className="form-container">

                <h2>Randevu Oluştur</h2>

                <form onSubmit={handleSubmit}>

                    <input
                        type="text"
                        name="hastaAdi"
                        placeholder="Hasta Adı Soyadı"
                        value={formData.hastaAdi}
                        onChange={handleChange}
                        required
                    />

                    <select
                        name="bolum"
                        value={formData.bolum}
                        onChange={handleChange}
                        required
                    >
                        <option value="">
                            Bölüm Seçiniz
                        </option>

                        <option value="Dahiliye">
                            Dahiliye
                        </option>

                        <option value="Kardiyoloji">
                            Kardiyoloji
                        </option>

                        <option value="Ortopedi">
                            Ortopedi
                        </option>

                        <option value="Göz Hastalıkları">
                            Göz Hastalıkları
                        </option>

                        <option value="Kulak Burun Boğaz">
                            Kulak Burun Boğaz
                        </option>
                    </select>

                    <select
                        name="doktor"
                        value={formData.doktor}
                        onChange={handleChange}
                        disabled={!formData.bolum}
                        required
                    >
                        <option value="">
                            Doktor Seçiniz
                        </option>

                        {formData.bolum &&
                            doktorlar[formData.bolum]?.map(
                                (doktor) => (
                                    <option
                                        key={doktor}
                                        value={doktor}
                                    >
                                        {doktor}
                                    </option>
                                )
                            )}
                    </select>

                    <input
                        type="date"
                        name="tarih"
                        value={formData.tarih}
                        onChange={handleChange}
                        min={bugun}
                        required
                    />

                    <select
                        name="saat"
                        value={formData.saat}
                        onChange={handleChange}
                        disabled={
                            !formData.doktor ||
                            !formData.tarih
                        }
                        required
                    >
                        <option value="">
                            Saat Seçiniz
                        </option>

                        {saatler.map((saat) => {
                            const dolu =
                                doluSaatler.includes(saat);

                            return (
                                <option
                                    key={saat}
                                    value={saat}
                                    disabled={dolu}
                                >
                                    {dolu
                                        ? `${saat} - Dolu`
                                        : `${saat} - Müsait`}
                                </option>
                            );
                        })}
                    </select>

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Randevu Oluşturuluyor..."
                            : "Randevu Oluştur"}
                    </button>

                </form>

            </div>
        </div>
    );
}

export default AppointmentCreate;