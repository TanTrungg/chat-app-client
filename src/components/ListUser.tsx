// import { userService } from "@/services/userService";
import { AuthData } from "@/types/Auth";
import { UserModel } from "@/types/User";
import * as signalR from "@microsoft/signalr";
// import { AxiosResponse } from "axios";
import React, { memo, useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

interface Props {
  darkMode: boolean;
  currentUser: AuthData | null;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectUser: React.Dispatch<React.SetStateAction<UserModel | undefined>>;
}

const ListUser = memo(
  ({ darkMode, currentUser, setDarkMode, setSelectUser }: Props) => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<UserModel[]>();

    // const getAllUser = async () => {
    //   try {
    //     const res: AxiosResponse = await userService.handleGetAllUser();
    //     const { status, data } = res;

    //     if (status === 200) {
    //       console.log("users", data);
    //       const filterUser = data.filter(
    //         (user: UserModel) => user.id !== currentUser?.id
    //       );
    //       setUsers(filterUser);
    //     } else {
    //       console.error("Login failed:", data);
    //     }
    //   } catch (error: any) {
    //     console.error("Error during login:", error.message);
    //   }
    // };

    const handleLogout = () => {
      localStorage.removeItem("auth");
      navigate("/login");
    };

    // useEffect(() => {
    //   getAllUser();
    // });

    useEffect(() => {
      //console.log("token", currentUser?.accessToken);
      // Khởi tạo kết nối SignalR
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://localhost:7134/list-user", {
          headers: { Authorization: `Bearer ${currentUser?.accessToken}` },
          transport: signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect()
        .build();

      // Kết nối đến server
      connection
        .start()
        .then(() => {
          //console.log("Connected to SignalR user-hub");

          connection.on("ReceiveUserList", (userList: UserModel[]) => {
            //console.log("signalR list-user", userList);
            const list = userList.filter(
              (user: UserModel) => user.id !== currentUser?.user.id
            );
            setUsers(list);
          });
        })
        .catch((error) => {
          console.error("Error connecting to SignalR hub: ", error);
        });

      // Cleanup: ngắt kết nối khi component bị unmount
      // Cleanup khi component unmount
      return () => {
        connection
          .stop()
          .then(() => console.log("SignalR connection stopped"))
          .catch((err) => console.error("Error stopping connection:", err));
      };
    }, [currentUser]);

    return (
      <div className="relative w-1/4 p-4 border-r border-gray-300">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Users</h2>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
        <div className="space-y-2">
          {users?.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-2 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer"
              onClick={() => setSelectUser(user)}
            >
              <img
                src={
                  user.avatar ||
                  `https://firebasestorage.googleapis.com/v0/b/chat-app-29e30.appspot.com/o/avatar%2F675cfb78-a020-46a4-a30e-b5a7a6f738f0?alt=media`
                }
                alt={user.fullName}
                className="w-10 h-10 rounded-full"
              />
              <span>{user.fullName}</span>
              <span
                className={`w-3 h-3 rounded-full ${
                  user.isOnline ? "bg-green-500" : "bg-gray-400"
                }`}
              ></span>
            </div>
          ))}
        </div>

        <div className="absolute bottom-0 left-0 w-full h-20 flex items-center justify-center">
          <button
            onClick={() => handleLogout()}
            className="text-white font-bold bg-red-500 p-2.5 rounded"
            aria-label="Logout"
          >
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }
);

export default ListUser;
