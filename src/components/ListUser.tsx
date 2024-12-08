import { AuthData } from "@/types/Auth";
import { UserModel } from "@/types/User";
import * as signalR from "@microsoft/signalr";

import React, { memo, useEffect, useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { CiLogout } from "react-icons/ci";
import { useNavigate } from "react-router-dom";

import iconUser from "@/assets/User_icon_2.svg.png";

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

    const handleLogout = () => {
      localStorage.removeItem("auth");
      navigate("/login");
    };

    useEffect(() => {
      const connection = new signalR.HubConnectionBuilder()
        .withUrl("https://plum-village.azurewebsites.net/list-user", {
          headers: { Authorization: `Bearer ${currentUser?.accessToken}` },
          transport: signalR.HttpTransportType.LongPolling,
        })
        .withAutomaticReconnect()
        .build();

      // Kết nối đến server
      connection
        .start()
        .then(() => {
          connection.on("ReceiveUserList", (userList: UserModel[]) => {
            const list = userList.filter(
              (user: UserModel) => user.id !== currentUser?.account.id
            );
            setUsers(list);
          });
        })
        .catch((error) => {
          console.error("Error connecting to SignalR hub: ", error);
        });

      return () => {
        connection
          .stop()
          .then(() => console.log("SignalR connection stopped"))
          .catch((err) => console.error("Error stopping connection:", err));
      };
    }, [currentUser]);

    return (
      <div className="relative w-1/4 p-4 border-r border-gray-300 h-full">
        <div className="flex items-center justify-between sticky top-0 z-10 ">
          <img
            src={currentUser?.account.avatar || iconUser}
            alt={currentUser?.account.lastName}
            className="w-12 h-12 rounded-full border-2 border-purple-500"
          />
          <p className="text-sm font-bold truncate">
            {currentUser?.account.firstName} {currentUser?.account.lastName}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>

            <button
              onClick={() => handleLogout()}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              aria-label="Logout"
            >
              <CiLogout />
            </button>
          </div>
        </div>

        <hr className="w-full border-purple-800 my-2" />

        <div className="space-y-2 overflow-auto h-[calc(100%-80px)]">
          {users?.map((user) => (
            <div
              key={user.id}
              className="flex items-center space-x-3 p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded cursor-pointer"
              onClick={() => setSelectUser(user)}
            >
              <img
                src={user.avatar || iconUser}
                alt={user.lastName}
                className="w-10 h-10 rounded-full"
              />
              <span className="flex-1 truncate">
                {user?.firstName} {user?.lastName}
              </span>
              <span
                className={`w-3 h-3 rounded-full ${
                  user.isOnline ? "bg-green-500" : ""
                }`}
              ></span>
            </div>
          ))}
        </div>
      </div>
    );
  }
);

export default ListUser;
