export interface UserModel {
  id: string;
  email: string;
  phoneNumber: string;
  fullName: string;
  avatar: string;
  isOnline: boolean;
  lastOnline: Date;
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
