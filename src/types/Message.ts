import { UserModel } from "./User";

export interface CreateMessage {
  conversationId: string | undefined;
  senderId: string;
  content: string;
}

export interface ConversationViewModel {
  id: string;
  createAt: Date;
  conversationParticipants: ConversationParticipants[];
  messages: Message[];
}

export interface ConversationParticipants {
  joinedAt: Date;
  user: UserModel;
}

export interface Message {
  id: string;
  content: string;
  sendAt: Date;
  sender: UserModel;
}
