import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import DoctorLogin from "./pages/DoctorLogin";
import PatientRegister from "./pages/PatientRegister";
import AppointmentCreate from "./pages/AppointmentCreate";
import Appointments from "./pages/Appointments";
import PrescriptionCreate from "./pages/PrescriptionCreate";
import Prescriptions from "./pages/Prescriptions";
import About from "./pages/About";

function App() {
    return (
        <>
            <Navbar />

            <Routes>
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/doktor-giris"
                    element={<DoctorLogin />}
                />

                <Route
                    path="/randevu-olustur"
                    element={<AppointmentCreate />}
                />

                <Route
                    path="/hakkimizda"
                    element={<About />}
                />

                <Route
                    path="/hasta-kayit"
                    element={
                        <ProtectedRoute>
                            <PatientRegister />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/randevular"
                    element={
                        <ProtectedRoute>
                            <Appointments />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/recete-olustur"
                    element={
                        <ProtectedRoute>
                            <PrescriptionCreate />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/receteler"
                    element={
                        <ProtectedRoute>
                            <Prescriptions />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </>
    );
}

export default App;