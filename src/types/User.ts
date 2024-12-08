export interface UserModel {
  id: string;
  role: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  avatar: string;
  isOnline: boolean;
  gender: string;
  createdAt: Date;
}

export interface UserSelect {
  id: string;
  username: string;
}

export interface UserConversation {
  senderId: string;
  receiverId: string;
}

export interface Message {
  senderId: string;
  content: string;
}
