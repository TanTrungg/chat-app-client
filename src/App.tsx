//import { authService } from "./services/authService";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/login/Login";
import Chat from "./pages/chat/Chat";
import Verify from "./pages/verify/Verify";
import ChatApp from "./components/chat-app/ChatApp";

//import { AxiosResponse } from "axios";

function App() {
  // const [user, setUser] = useState<UserConversation | null>(null);
  // const [selectedUser, setSelecteUser] = useState<UserSelect>();
  // const [currentUserId, setCurrentId] = useState<string>(""); // người dùng hiện tại

  // const handleSelectUser = (id: string, username: string) => {
  //   console.log("Người sẽ trò chuyện", username);
  //   const user: UserConversation = {
  //     senderId: currentUserId,
  //     receiverId: id,
  //   };
  //   setSelecteUser({ id, username });
  //   setUser(user);
  // };

  // return (
  //   <>
  //     <div>
  //       <h1>
  //         <input type="text" onChange={(e) => setCurrentId(e.target.value)} />
  //       </h1>
  //     </div>
  //     <div>
  //       {selectedUser ? (
  //         <div>
  //           <h2>Đang trò chuyện với {selectedUser.username}</h2>
  //           <Chat user={user} />
  //         </div>
  //       ) : (
  //         <UserList onSelectUser={handleSelectUser} />
  //       )}
  //     </div>
  //   </>
  // );

  //---
  //const navigate = useNavigate();
  //const storedAuth = localStorage.getItem("auth");
  //useEffect(() => {
  // const loginWithStoredAuth = async () => {
  //   if (storedAuth) {
  //     try {
  //       const res: AxiosResponse = await authService.handleGetUserLogin(); // Chờ kết quả từ API
  //       const { status, data } = res;
  //       if (status === 200) {
  //         console.log("Get user successful:", data);
  //         navigate("/chat-app");
  //       } else {
  //         console.error("Get user failed:", data);
  //       }
  //     } catch (error: any) {
  //       console.error("Error during login:", error.message);
  //     }
  //   } else {
  //     navigate("/login");
  //   }
  // };
  //loginWithStoredAuth(); // Gọi hàm async bên trong useEffect
  //}, [storedAuth, navigate]); // Chỉ thực hiện lại khi storedAuth thay đổi

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
