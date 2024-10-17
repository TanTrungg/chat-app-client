import { UserModel } from "@/types/User";
import { useEffect, useRef, useState } from "react";
import { FiSearch, FiSend, FiPaperclip } from "react-icons/fi";
import * as signalR from "@microsoft/signalr";
import { AuthData } from "@/types/Auth";

interface Message {
  id: string; // assuming you have an id for each message
  text: string;
  sender: UserModel; // Use the type for the sender
  timestamp: string;
  status: string; // e.g., "sent", "received"
}

interface Props {
  currentUser: AuthData | null;
  selectUser: UserModel | undefined;
}

const Conversation = ({ selectUser, currentUser }: Props) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectUser === null && currentUser === null) {
      console.log("Chưa chọn user");
      return;
    }

    const connection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7134/chat-hub", {
        headers: { Authorization: `Bearer ${currentUser?.accessToken}` },
        transport: signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    connection.on("ReceiveChatHistory", (conversation) => {
      console.log("Conversation", conversation);
    });

    connection
      .start()
      .then(() => {
        console.log("Connected to SignalR chat-hub");

        // Check if connection is established before invoking
        if (connection.state === signalR.HubConnectionState.Connected) {
          if (currentUser && selectUser) {
            console.log("sender", currentUser.user.id);
            console.log("receiver", selectUser.id);

            connection
              .invoke("LoadChatHistory", currentUser.user.id, selectUser.id)
              .catch((err) =>
                console.error("Error invoking LoadChatHistory:", err)
              );
          }
        }
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
  }, [currentUser, selectUser]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
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

    const newMessage: Message = {
      id: new Date().getTime().toString(), // Simple ID generation
      text: inputMessage,
      sender: currentUser.user,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      status: "sent",
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]); // Correctly append the new message
    setInputMessage("");
    setError("");

    // Call your simulateMessageDelivery function here with newMessage.id or necessary params
  };

  return (
    <>
      {selectUser ? (
        <div className="flex-auto flex flex-col">
          <div className=" w-full mx-auto bg-white shadow-lg rounded-lg h-full flex flex-col">
            <div className="p-4 border-b bg-gray-100 flex items-center">
              <img
                src={
                  selectUser.avatar ||
                  "https://firebasestorage.googleapis.com/v0/b/chat-app-29e30.appspot.com/o/avatar%2F675cfb78-a020-46a4-a30e-b5a7a6f738f0?alt=media"
                }
                alt={selectUser.fullName}
                className="w-10 h-10 rounded-full mr-3"
              />
              <span className="font-bold">{selectUser.fullName}</span>
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
              className="flex-1 overflow-y-auto p-4"
              aria-live="polite"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender.id === currentUser?.user.id
                      ? "justify-end"
                      : "justify-start"
                  } mb-4`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender.id === currentUser?.user.id
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    <p>{message.text}</p>
                    <div className="text-xs mt-1 text-gray-500">
                      {message.timestamp} - {message.status}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                    Typing...
                  </div>
                </div>
              )}
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
                    setIsTyping(true);
                    setTimeout(() => setIsTyping(false), 1000);
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <label htmlFor="file-upload" className="cursor-pointer ml-2">
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
        <div>Choose a user</div>
      )}
    </>
  );
};

export default Conversation;
