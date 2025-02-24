import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginScreen from '../../src/screens/LoginScreen'; // LoginScreen'in doğru yolda olduğundan emin olun
import DoctorMenu from '../../src/screens/DoctorMenu';   // Aynı şekilde diğer ekranlar için de kontrol edin
import PatientMenu from '../../src/screens/PatientMenu';

const App = () => {
  return (
    <Router>
      <Routes>
      <Route path="/" element={<LoginScreen />} />        <Route path="/doctor-menu" element={<DoctorMenu />} />
        <Route path="/patient-menu" element={<PatientMenu />} />
        {/* Diğer ekranlar */}
      </Routes>
    </Router>
  );
};

export default App;

