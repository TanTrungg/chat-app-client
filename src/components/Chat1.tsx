import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { Message, UserConversation } from "../types/User";

interface Props {
  user: UserConversation | null;
}

const Chat1 = ({ user }: Props) => {
  const [connection] = useState<signalR.HubConnection | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3NWNmYjc4LWEwMjAtNDZhNC1hMzBlLWI1YTdhNmY3MzhmMCIsInJvbGUiOiJVc2VyIiwic3RhdHVzIjoiQWN0aXZlIiwibmJmIjoxNzI3NzU1MTE3LCJleHAiOjE3Mjc4NDE1MTcsImlhdCI6MTcyNzc1NTExN30.y7EUX0NM3E-P344CtIYaNmPYwzYD-OMl5XHBV1O0x-Q";

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl("https://localhost:7134/chat-hub", {
        headers: { Authorization: `Bearer ${token}` },
        transport: signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .build();

    // Kết nối khi component được mount
    newConnection
      .start()
      .then(() => {
        console.log("Connected to SignalR hub");

        // Lắng nghe các sự kiện sau khi kết nối thành công
        newConnection.on(
          "ReceiveMessage",
          (senderId: string, content: string) => {
            console.log(
              "Received message from:",
              senderId,
              "Content:",
              content
            );
            setMessages((prevMessages) => [
              ...prevMessages,
              { senderId, content },
            ]);
          }
        );

        // Tải lịch sử tin nhắn
        if (user) {
          newConnection
            .invoke("LoadMessages", user.senderId, user.receiverId)
            .then((chatHistory: Message[]) => {
              setMessages(chatHistory);
            })
            .catch((error) => console.error("Error loading messages:", error));
        }
      })
      .catch((error) => {
        console.error("Error connecting to SignalR hub: ", error);
      });

    // Lắng nghe sự kiện ngắt kết nối
    newConnection.onclose(async () => {
      console.log("Disconnected from SignalR hub");
      // Thực hiện các hành động cần thiết sau khi ngắt kết nối
      try {
        await newConnection.start(); // Thử kết nối lại
        console.log("Reconnecting to SignalR hub");
      } catch (error) {
        console.error("Reconnection failed:", error);
      }
    });

    // Dọn dẹp khi component bị unmount
    return () => {
      newConnection.stop();
    };
  }, [user]);

  // Hàm gửi tin nhắn
  const sendMessage = async () => {
    if (connection?.state === signalR.HubConnectionState.Connected) {
      try {
        const messageModel = {
          senderId: user!.senderId,
          receiverId: user!.receiverId,
          content: message,
        };
        console.log("Sending message:", messageModel);
        await connection.invoke("SendMessage", messageModel);

        setMessage("");
      } catch (error) {
        console.error("Sending message failed: ", error);
      }
    } else {
      console.error("No connection to server.");
    }
  };

  return (
    <div>
      <div>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>
              {msg.senderId === user!.senderId ? "Bạn" : "Đối phương"}:{" "}
            </strong>
            {msg.content}
          </div>
        ))}
      </div>
      <div>
        <input value={message} onChange={(e) => setMessage(e.target.value)} />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chat1;
