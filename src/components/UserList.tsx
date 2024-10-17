import { useEffect, useState } from "react";
import { UserModel } from "../types/User";

interface Props {
  onSelectUser: (id: string, username: string) => void;
}

const UserList = ({ onSelectUser }: Props) => {
  const [listUser, setListUser] = useState<UserModel[]>([]);

  useEffect(() => {
    fetch("https://localhost:7134/api/users")
      .then((response) => response.json())
      .then((data) => setListUser(data))
      .catch((error) => console.error("Error fetching users:", error));
  }, []);

  return (
    <div>
      <h1>Chọn người để chat</h1>
      <ul>
        {listUser?.map((user) => (
          <li key={user.id}>
            <button onClick={() => onSelectUser(user.id, user.email)}>
              {user.email}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserList;
