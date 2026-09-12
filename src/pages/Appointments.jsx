import { useEffect, useMemo, useState } from "react";
import {
    ref,
    onValue,
    remove
} from "firebase/database";
import { database } from "../firebase";

function Appointments() {
    const [randevular, setRandevular] = useState([]);

    const [filtreler, setFiltreler] = useState({
        bolum: "",
        doktor: "",
        tarih: "",
        durum: "gelecek"
    });

    useEffect(() => {
        const randevularRef = ref(database, "randevular");

        const unsubscribe = onValue(randevularRef, (snapshot) => {
            const data = snapshot.val();

            if (data) {
                const randevuListesi = Object.entries(data).map(
                    ([id, randevu]) => ({
                        id,
                        ...randevu
                    })
                );

                setRandevular(randevuListesi);
            } else {
                setRandevular([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const doktorKeyOlustur = (doktor) => {
        return doktor.replace(/[.#$[\]/]/g, "_");
    };

    const randevuSil = async (randevu) => {
        const onay = window.confirm(
            "Bu randevuyu silmek istediğinize emin misiniz?"
        );

        if (!onay) {
            return;
        }

        try {
            const randevuRef = ref(
                database,
                `randevular/${randevu.id}`
            );

            await remove(randevuRef);

            const doktorKey = doktorKeyOlustur(
                randevu.doktor
            );

            const slotRef = ref(
                database,
                `randevuSlotlari/${doktorKey}/${randevu.tarih}/${randevu.saat}`
            );

            await remove(slotRef);

            alert(
                "Randevu başarıyla silindi. Saat tekrar müsait hale getirildi."
            );

        } catch (error) {
            console.error(
                "Randevu silme hatası:",
                error
            );

            alert(
                "Randevu silinirken bir hata oluştu."
            );
        }
    };

    const handleFiltreChange = (event) => {
        const { name, value } = event.target;

        setFiltreler({
            ...filtreler,
            [name]: value
        });
    };

    const bugun = new Date()
        .toISOString()
        .split("T")[0];

    const bolumler = [
        ...new Set(
            randevular
                .map((randevu) => randevu.bolum)
                .filter(Boolean)
        )
    ];

    const doktorlar = [
        ...new Set(
            randevular
                .filter((randevu) => {
                    if (!filtreler.bolum) {
                        return true;
                    }

                    return (
                        randevu.bolum ===
                        filtreler.bolum
                    );
                })
                .map(
                    (randevu) => randevu.doktor
                )
                .filter(Boolean)
        )
    ];

    const filtrelenmisRandevular = useMemo(() => {
        return randevular
            .filter((randevu) => {
                if (
                    filtreler.bolum &&
                    randevu.bolum !== filtreler.bolum
                ) {
                    return false;
                }

                if (
                    filtreler.doktor &&
                    randevu.doktor !== filtreler.doktor
                ) {
                    return false;
                }

                if (
                    filtreler.tarih &&
                    randevu.tarih !== filtreler.tarih
                ) {
                    return false;
                }

                if (
                    filtreler.durum === "gelecek" &&
                    randevu.tarih < bugun
                ) {
                    return false;
                }

                if (
                    filtreler.durum === "gecmis" &&
                    randevu.tarih >= bugun
                ) {
                    return false;
                }

                return true;
            })
            .sort((a, b) => {
                const tarihA = new Date(
                    `${a.tarih}T${a.saat || "00:00"}`
                );

                const tarihB = new Date(
                    `${b.tarih}T${b.saat || "00:00"}`
                );

                if (
                    filtreler.durum === "gecmis"
                ) {
                    return tarihB - tarihA;
                }

                return tarihA - tarihB;
            });
    }, [
        randevular,
        filtreler,
        bugun
    ]);

    const filtreleriTemizle = () => {
        setFiltreler({
            bolum: "",
            doktor: "",
            tarih: "",
            durum: "gelecek"
        });
    };

    return (
        <div className="page">
            <div className="table-container">

                <h2>Randevular</h2>

                <div className="appointment-filters">

                    <select
                        name="durum"
                        value={filtreler.durum}
                        onChange={handleFiltreChange}
                    >
                        <option value="gelecek">
                            Gelecek Randevular
                        </option>

                        <option value="gecmis">
                            Geçmiş Randevular
                        </option>

                        <option value="hepsi">
                            Tüm Randevular
                        </option>
                    </select>

                    <select
                        name="bolum"
                        value={filtreler.bolum}
                        onChange={(event) => {
                            setFiltreler({
                                ...filtreler,
                                bolum: event.target.value,
                                doktor: ""
                            });
                        }}
                    >
                        <option value="">
                            Tüm Bölümler
                        </option>

                        {bolumler.map((bolum) => (
                            <option
                                key={bolum}
                                value={bolum}
                            >
                                {bolum}
                            </option>
                        ))}
                    </select>

                    <select
                        name="doktor"
                        value={filtreler.doktor}
                        onChange={handleFiltreChange}
                    >
                        <option value="">
                            Tüm Doktorlar
                        </option>

                        {doktorlar.map((doktor) => (
                            <option
                                key={doktor}
                                value={doktor}
                            >
                                {doktor}
                            </option>
                        ))}
                    </select>

                    <input
                        type="date"
                        name="tarih"
                        value={filtreler.tarih}
                        onChange={handleFiltreChange}
                    />

                    <button
                        type="button"
                        className="filter-clear-button"
                        onClick={filtreleriTemizle}
                    >
                        Filtreleri Temizle
                    </button>

                </div>

                <p className="appointment-count">
                    Toplam{" "}
                    {filtrelenmisRandevular.length}{" "}
                    randevu
                </p>

                {filtrelenmisRandevular.length === 0 ? (
                    <p>
                        Seçilen filtrelere uygun randevu bulunmuyor.
                    </p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Hasta</th>
                                <th>Bölüm</th>
                                <th>Doktor</th>
                                <th>Tarih</th>
                                <th>Saat</th>
                                <th>Durum</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>

                        <tbody>
                            {filtrelenmisRandevular.map(
                                (randevu) => {
                                    const gecmisMi =
                                        randevu.tarih < bugun;

                                    return (
                                        <tr key={randevu.id}>

                                            <td>
                                                {randevu.hastaAdi}
                                            </td>

                                            <td>
                                                {randevu.bolum}
                                            </td>

                                            <td>
                                                {randevu.doktor}
                                            </td>

                                            <td>
                                                {randevu.tarih}
                                            </td>

                                            <td>
                                                {randevu.saat}
                                            </td>

                                            <td>
                                                <span
                                                    className={
                                                        gecmisMi
                                                            ? "appointment-status past"
                                                            : "appointment-status upcoming"
                                                    }
                                                >
                                                    {gecmisMi
                                                        ? "Geçmiş"
                                                        : "Yaklaşan"}
                                                </span>
                                            </td>

                                            <td>
                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        randevuSil(randevu)
                                                    }
                                                >
                                                    Sil
                                                </button>
                                            </td>

                                        </tr>
                                    );
                                }
                            )}
                        </tbody>
                    </table>
                )}

            </div>
        </div>
    );
}

export default Appointments;