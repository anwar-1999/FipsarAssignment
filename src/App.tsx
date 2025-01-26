import './App.css'
import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";
import Login from "./components/Login";
import AdminDashboard from './components/AdminDashboard';
import ViewerDashboard from './components/ViewerDashboard';

function App() {

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/viewer" element={<ViewerDashboard />} />
      </Routes>
    </Router>
  )
}

export default App
