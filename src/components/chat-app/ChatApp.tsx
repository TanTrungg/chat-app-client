import { AuthData } from "@/types/Auth";
import { UserModel } from "@/types/User";
import * as signalR from "@microsoft/signalr";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import iconUser from "@/assets/User_icon_2.svg.png";
import Loading from "../loading/Loading";
import { ConversationViewModel, CreateMessage, Message } from "@/types/Message";
import { MdDeleteForever } from "react-icons/md";
import { showSuccessAlert } from "@/toastify/toastify";

const ChatApp = () => {
  const navigate = useNavigate();

  const [userLogin, setUserLogin] = useState<AuthData | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [listUsers, setListUsers] = useState<UserModel[]>([]);
  const [conversation, setConversation] =
    useState<ConversationViewModel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [, setError] = useState<string>("");
  const [newMessageNoti, setNewMessageNoti] = useState<string[]>([]);

  const [isLoading, setLoading] = useState<boolean>(true);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const conversationRef = useRef<ConversationViewModel | null>(null);

  const logout = () => {
    localStorage.removeItem("auth");
    navigate("/login");
  };

  const handleSelectUser = (user: UserModel) => {
    console.log("user", user);
    setSelectedUser(user);
    setMessages([]);
    conversationRef.current = null;

    connectionRef.current
      ?.invoke("LoadChatHistory", userLogin?.account.id, user.id)
      .catch((err) => {
        console.error("Error loading chat history:", err);
        setLoading(false);
      });
  };

  const handleSendMessage = () => {
    if (!inputMessage.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      const message: CreateMessage = {
        conversationId: conversation?.id,
        senderId: userLogin?.account.id,
        receiverId: selectedUser?.id,
        content: inputMessage,
      };

      connectionRef.current
        .invoke("SendMessage", message)
        .catch((err) => console.error("Error sending message:", err));
      setInputMessage("");
      setError("");
    } else {
      setError("SignalR connection is not established.");
    }
  };

  const handleDeleteMessage = (messageId: string, conversationId: string) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      connectionRef.current
        .invoke("DeleteMessage", messageId, conversationId)
        .catch((err) => console.error("Error deleting message: ", err));
    } else {
      setError("SignalR connection is not established.");
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const authUser = getUserLogin();
    if (!authUser) {
      navigate("/login");
      return;
    }
    setUserLogin(authUser);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://plum-village.azurewebsites.net/conversation", {
        headers: {
          Authorization: `Bearer ${authUser.accessToken}`,
        },
        transport: signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    connection.on("ReceiveUserList", (users: UserModel[]) => {
      setListUsers(users.filter((user) => user.id !== authUser.account.id));
      setLoading(false);
    });

    connection.on("ReceiveChatHistory", (data: ConversationViewModel) => {
      const currentConversation = conversationRef.current;
      console.log("old", currentConversation);
      console.log("new", data);

      if (currentConversation === null || currentConversation.id === data.id) {
        conversationRef.current = data;
        setConversation(data);
        setMessages(data.messages);
        setLoading(false);
      }
    });

    connection.on("ReceiveMessage", (data: ConversationViewModel) => {
      const currentConversation = conversationRef.current;
      console.log("LoadFirst", currentConversation?.id);

      // Kiểm tra nếu là cuộc trò chuyện hiện tại
      console.log("LoadSecond", data.id);

      if (data.id === currentConversation?.id) {
        setConversation(data);
        setMessages(data.messages);
      } else {
        console.log("Tin nhắn không thuộc cuộc trò chuyện hiện tại.");
        // Thêm notification cho user khác
        const sender = data.messages[data.messages.length - 1]?.sender;
        showSuccessAlert(
          `Bạn có tin nhắn mới từ ${sender.firstName} ${sender.lastName}`
        );
        if (sender.id && !newMessageNoti.includes(sender.id)) {
          setNewMessageNoti((prevNoti) => [...prevNoti, sender.id]);
        }
      }
    });

    connection.on("UnReads", (senderIds: string[]) => {
      console.log("unread", senderIds);
      setNewMessageNoti((prevNoti) => {
        // Lấy danh sách các senderId chưa có trong prevNoti
        const newNoti = senderIds.filter(
          (senderId) => !prevNoti.includes(senderId)
        );
        // Kết hợp các senderId mới vào danh sách cũ
        return [...prevNoti, ...newNoti];
      });
    });

    connection.start().catch((error) => {
      console.error("SignalR connection error: ", error);
      setLoading(false);
    });

    return () => {
      connectionRef.current
        ?.stop()
        .catch((error) => console.error("Error stopping connection: ", error));
      connectionRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <div className="w-1/4 p-4 border-r bg-white shadow-md">
        <div className="flex items-center justify-between mb-4">
          <img
            src={userLogin?.account.avatar || iconUser}
            alt={userLogin?.account.lastName}
            className="w-12 h-12 rounded-full border-2 border-purple-500"
          />
          <div className="flex flex-col ml-2">
            <p className="text-sm font-semibold truncate">
              {userLogin?.account.firstName} {userLogin?.account.lastName}
            </p>
            <button
              onClick={logout}
              className="text-red-500 hover:underline text-xs mt-1"
            >
              Logout
            </button>
          </div>
        </div>

        <hr className="mb-4" />

        <div className="overflow-auto h-[calc(100%-120px)] space-y-3">
          {isLoading ? (
            <Loading />
          ) : (
            [...listUsers]
              .sort((a, b) => {
                // Đưa user có trong newMessageNoti lên đầu
                const aNoti = newMessageNoti.includes(a.id) ? 1 : 0;
                const bNoti = newMessageNoti.includes(b.id) ? 1 : 0;
                return bNoti - aNoti;
              })
              .map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    newMessageNoti.includes(user.id)
                      ? "border border-blue-500 bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() => {
                    handleSelectUser(user);
                    setNewMessageNoti((prevNoti) =>
                      prevNoti.filter((notiId) => notiId !== user.id)
                    );
                  }}
                >
                  <img
                    src={user.avatar || iconUser}
                    alt={user.email}
                    className="w-10 h-10 rounded-full border border-gray-300 shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="text-sm font-semibold truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <span
                      className={`text-xs ${
                        user.isOnline ? "text-green-500" : "text-gray-400"
                      }`}
                    >
                      {user.isOnline ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col bg-white shadow-lg rounded-l-lg">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center p-4 border-b bg-gray-100 shadow-md">
              <img
                src={selectedUser.avatar || iconUser}
                alt={selectedUser.lastName}
                className="w-12 h-12 rounded-full mr-3"
              />
              <p className="font-semibold text-lg">
                {selectedUser.firstName} {selectedUser.lastName}
              </p>
            </div>

            {/* Messages List */}
            <div
              ref={chatContainerRef}
              className="flex-1 p-6 overflow-y-auto bg-gray-50 space-y-8"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start ${
                    message.sender.id === userLogin?.account.id
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  {/* Avatar (Hiển thị cho tin nhắn từ người nhận) */}
                  {message.sender.id !== userLogin?.account.id && (
                    <div className="flex flex-col items-center mr-4">
                      <img
                        src={message.sender.avatar || iconUser}
                        alt={message.sender.lastName}
                        className="w-12 h-12 rounded-full border border-gray-300 shadow-md"
                      />
                      <span className="text-xs text-gray-500 mt-2">
                        {message.sender.firstName}
                      </span>
                    </div>
                  )}

                  {/* Message Content */}
                  <div className="relative max-w-xl">
                    <div
                      className={`px-6 py-4 rounded-2xl shadow-md ${
                        message.sender.id === userLogin?.account.id
                          ? "bg-gradient-to-r from-blue-400 to-blue-600 text-white"
                          : "bg-white text-gray-800 border border-gray-200"
                      }`}
                    >
                      <p className="break-words text-sm leading-relaxed">
                        {message.content}
                      </p>
                      {message.sender.id === userLogin?.account.id &&
                        message.isRead && (
                          <span className="block mt-1 text-xs text-right opacity-75 italic">
                            Đã đọc
                          </span>
                        )}
                    </div>

                    {/* Timestamp */}
                    <div
                      className={`text-xs mt-2 ${
                        message.sender.id === userLogin?.account.id
                          ? "text-gray-400 text-right"
                          : "text-gray-500"
                      }`}
                    >
                      {formatDate(message.sendAt)}
                    </div>

                    {/* Delete Button (Chỉ hiển thị cho tin nhắn người gửi) */}
                    {message.sender.id === userLogin?.account.id && (
                      <MdDeleteForever
                        className="absolute top-2 right-2 text-red-500 opacity-60 hover:opacity-100 hover:scale-110 cursor-pointer transition-all duration-200"
                        onClick={() =>
                          handleDeleteMessage(message.id, conversation!.id)
                        }
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Input Section */}
            <div className="p-4 border-t bg-white flex items-center">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-3 border rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200"
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="ml-2 bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 transition-all duration-200"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-500 text-lg">
              Select a user to start chatting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatApp;

const getUserLogin = (): AuthData | null => {
  const authString = localStorage.getItem("auth");
  if (authString) {
    try {
      return JSON.parse(authString);
    } catch (error) {
      console.error("Error parsing auth data:", error);
    }
  }
  return null;
};

const formatDate = (date: Date) => {
  const formatDate = new Date(date);
  const day = String(formatDate.getDate()).padStart(2, "0");
  const month = String(formatDate.getMonth() + 1).padStart(2, "0");
  const year = formatDate.getFullYear();
  const hours = String(formatDate.getHours()).padStart(2, "0");
  const minutes = String(formatDate.getMinutes()).padStart(2, "0");
  // const seconds = String(date.getSeconds()).padStart(2, "0");
  // return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  return `${hours}:${minutes} | ${day}-${month}-${year} `;
};
