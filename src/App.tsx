//import { authService } from "./services/authService";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Verify from "./pages/verify/Verify";
import ChatApp from "./components/chat-app/ChatApp";

//import { AxiosResponse } from "axios";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat-app" element={<ChatApp />} />
        <Route path="/verify-account/:token" element={<Verify />} />
      </Routes>
    </>
  );
}

export default App;
