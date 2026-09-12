import { useEffect, useState } from "react";
import { ref, onValue, remove } from "firebase/database";
import { database } from "../firebase";

function Prescriptions() {
    const [receteler, setReceteler] = useState([]);

    useEffect(() => {
        const recetelerRef = ref(database, "receteler");

        const unsubscribe = onValue(recetelerRef, (snapshot) => {
            const data = snapshot.val();

            if (data) {
                const receteListesi = Object.entries(data).map(
                    ([id, recete]) => ({
                        id,
                        ...recete
                    })
                );

                setReceteler(receteListesi);
            } else {
                setReceteler([]);
            }
        });

        return () => unsubscribe();
    }, []);

    const receteSil = async (id) => {
        const onay = window.confirm(
            "Bu reçeteyi silmek istediğinize emin misiniz?"
        );

        if (!onay) return;

        try {
            await remove(ref(database, `receteler/${id}`));
            alert("Reçete başarıyla silindi.");
        } catch (error) {
            console.error("Reçete silme hatası:", error);
            alert("Reçete silinirken bir hata oluştu.");
        }
    };

    return (
        <div className="page">
            <div className="table-container">

                <h2>Reçeteler</h2>

                {receteler.length === 0 ? (
                    <p>Henüz kayıtlı reçete bulunmuyor.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Hasta</th>
                                <th>İlaç</th>
                                <th>Kullanım</th>
                                <th>Doktor</th>
                                <th>Branş</th>
                                <th>Doktor Notu</th>
                                <th>İşlem</th>
                            </tr>
                        </thead>

                        <tbody>
                            {receteler.map((recete) => (
                                <tr key={recete.id}>
                                    <td>{recete.hastaAdi}</td>
                                    <td>{recete.ilac}</td>
                                    <td>{recete.kullanim}</td>
                                    <td>{recete.doktor}</td>
                                    <td>{recete.doktorBrans || "-"}</td>
                                    <td>{recete.doktorNotu || "-"}</td>

                                    <td>
                                        <button
                                            className="delete-button"
                                            onClick={() => receteSil(recete.id)}
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

export default Prescriptions;