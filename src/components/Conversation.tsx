import { UserModel } from "@/types/User";
import { useEffect, useRef, useState } from "react";
import { FiSearch, FiSend, FiPaperclip } from "react-icons/fi";
import { MdDeleteForever } from "react-icons/md";
import * as signalR from "@microsoft/signalr";
import { AuthData } from "@/types/Auth";
import { ConversationViewModel, CreateMessage, Message } from "@/types/Message";
import iconUser from "@/assets/User_icon_2.svg.png";
import Loading from "./loading/Loading";

interface Props {
  currentUser: AuthData | null;
  selectUser: UserModel | undefined;
}

const Conversation = ({ selectUser, currentUser }: Props) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(
    null
  );
  const [conversation, setConversation] = useState<ConversationViewModel>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  //const [isTyping, setIsTyping] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (!selectUser || !currentUser) {
      console.log("Chưa chọn user");
      setMessages([]); // Clear messages khi không có người dùng nào được chọn
      setConversation(undefined); // Clear conversation
      return;
    }
    setIsLoading(true);

    setMessages([]); // Clear messages trước khi tải conversation mới
    setConversation(undefined); // Clear conversation trong lúc chờ dữ liệu

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://plum-village.azurewebsites.net/chat-hub", {
        headers: { Authorization: `Bearer ${currentUser?.accessToken}` },
        transport: signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    newConnection.on(
      "ReceiveChatHistory",
      (conversation: ConversationViewModel) => {
        console.log("LoadFirst", conversation);
        setConversation(conversation);
        setMessages(conversation.messages);
        setIsLoading(false);
      }
    );

    newConnection.on(
      "ReceiveMessage",
      (conversation: ConversationViewModel) => {
        console.log("ReceiveMessage", conversation);
        setConversation(conversation);
        setMessages(conversation.messages);
      }
    );

    newConnection
      .start()
      .then(() => {
        console.log("Connected to SignalR chat-hub");
        setConnection(newConnection);

        if (currentUser && selectUser) {
          newConnection
            .invoke("LoadChatHistory", currentUser.account.id, selectUser.id)
            .catch((err) =>
              console.error("Error invoking LoadChatHistory:", err)
            );
        }
      })
      .catch((error) => {
        console.error("Error connecting to SignalR hub: ", error);
        setIsLoading(false);
      });

    return () => {
      setIsLoading(false);
      newConnection
        .stop()
        .then(() => console.log("SignalR connection stopped"))
        .catch((err) => console.error("Error stopping connection:", err));
    };
  }, [currentUser, selectUser]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!currentUser) {
      setError("You must be logged in to send a message.");
      return;
    }

    if (inputMessage.trim() === "") {
      setError("Message cannot be empty");
      return;
    }

    if (inputMessage.length > 500) {
      setError("Message exceeds 500 character limit");
      return;
    }

    if (connection?.state === signalR.HubConnectionState.Connected) {
      // const newMessage: Message = {
      //   id: new Date().getTime().toString(),
      //   text: inputMessage,
      //   sender: currentUser.user,
      //   timestamp: new Date().toLocaleTimeString([], {
      //     hour: "2-digit",
      //     minute: "2-digit",
      //   }),
      //   status: "sent",
      // };

      const message: CreateMessage = {
        conversationId: conversation?.id,
        senderId: currentUser.account.id,
        receiverId: selectUser?.id,
        content: inputMessage,
      };

      //setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputMessage("");
      setError("");

      // Invoke the SendMessage method on the SignalR hub
      connection
        .invoke("SendMessage", message)
        .catch((err) => console.error("Error sending message:", err));
    } else {
      setError("SignalR connection is not established.");
    }
  };

  const handleDeleteMessage = async (
    messageId: string,
    conversationId: string
  ) => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
      connection
        .invoke("DeleteMessage", messageId, conversationId)
        .catch((err) => console.error("Error sending message:", err));
    } else {
      setError("SignalR connection is not established.");
    }
  };

  return (
    <>
      {selectUser ? (
        isLoading ? (
          <Loading />
        ) : (
          <>
            {conversation ? (
              <div className="flex-auto flex flex-col">
                <div className=" w-full mx-auto bg-white shadow-lg rounded-lg h-full flex flex-col">
                  <div className="p-4 border-b bg-gray-100 flex items-center">
                    <img
                      src={selectUser.avatar || iconUser}
                      alt={selectUser.lastName}
                      className="w-10 h-10 rounded-full mr-3"
                    />
                    <span className="font-bold">
                      {selectUser.firstName} {selectUser.lastName}
                    </span>
                    <div className="ml-auto flex items-center">
                      <input
                        type="text"
                        placeholder="Search messages..."
                        className="p-2 rounded-full bg-white border focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <FiSearch className="text-gray-500 ml-2" />
                    </div>
                  </div>

                  <div
                    ref={chatContainerRef}
                    className="flex-1 overflow-y-auto px-4 py-12"
                    aria-live="polite"
                  >
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.sender.id === currentUser?.account.id
                            ? "justify-end"
                            : "justify-start"
                        } mb-4`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.sender.id === currentUser?.account.id
                              ? "bg-blue-500 text-white"
                              : "bg-gray-200 text-gray-800"
                          } relative group`}
                        >
                          <div className="flex">
                            <img
                              src={
                                message.sender.id === currentUser?.account.id
                                  ? message.sender.avatar || iconUser
                                  : selectUser.avatar || iconUser
                              }
                              alt={
                                message.sender.id === currentUser?.account.id
                                  ? message.sender.lastName
                                  : selectUser.lastName
                              }
                              className="w-7 h-7 rounded-full mr-3"
                            />
                            <span className="font-bold text-base">
                              {message.sender.id === currentUser?.account.id
                                ? message.sender.lastName
                                : selectUser.lastName}
                            </span>
                          </div>
                          <hr className="w-full border-purple-800 my-2"></hr>
                          <p>{message.content}</p>
                          <div className="text-xs mt-1 text-gray-500">
                            {formatDate(message.sendAt)}
                          </div>
                          {message.sender.id === currentUser?.account.id && (
                            <MdDeleteForever
                              className="absolute top-1 right-1 text-red-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 cursor-pointer"
                              onClick={() =>
                                handleDeleteMessage(
                                  message.id,
                                  conversation!.id
                                )
                              }
                            />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {error && (
                    <div
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative"
                      role="alert"
                    >
                      <span className="block sm:inline">{error}</span>
                    </div>
                  )}
                  <div className="p-4 border-t">
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Type a message..."
                        className="flex-1 p-2 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={inputMessage}
                        onChange={(e) => {
                          setInputMessage(e.target.value);
                        }}
                        onKeyPress={(e) =>
                          e.key === "Enter" && handleSendMessage()
                        }
                      />
                      <label
                        htmlFor="file-upload"
                        className="cursor-pointer ml-2"
                      >
                        <FiPaperclip className="text-gray-500" />
                      </label>
                      <input
                        id="file-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={() => {
                          /* handle file upload logic here */
                        }}
                      />
                      <button
                        onClick={handleSendMessage}
                        className="ml-2 bg-blue-500 text-white rounded-full p-2 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="Send message"
                      >
                        <FiSend />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div></div>
            )}
          </>
        )
      ) : (
        <div>Choose a user</div>
      )}
    </>
  );
};

export default Conversation;
