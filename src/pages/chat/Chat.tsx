import Conversation from "@/components/Conversation";
import ListUser from "@/components/ListUser";
import { AuthData } from "@/types/Auth";
import { UserModel } from "@/types/User";
import { useState } from "react";

const getAuthData = (): AuthData | null => {
  const authDataString = localStorage.getItem("auth");

  if (authDataString) {
    try {
      const authData: AuthData = JSON.parse(authDataString);
      return authData; // Return parsed AuthData
    } catch (error) {
      console.error("Failed to parse auth data:", error);
      return null; // Return null in case of parsing error
    }
  }

  return null; // Return null if no auth data is found
};

const Chat = () => {
  const currentUser: AuthData | null = getAuthData();
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [selectUser, setSelectUser] = useState<UserModel>();

  return (
    <div
      className={`flex h-screen ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100"
      }`}
    >
      <ListUser
        darkMode={darkMode}
        currentUser={currentUser}
        setDarkMode={setDarkMode}
        setSelectUser={setSelectUser}
      />
      <Conversation selectUser={selectUser} currentUser={currentUser} />
    </div>
  );
};

export default Chat;
