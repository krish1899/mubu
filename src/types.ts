export interface ReplyInfo {
  id?: string;
  text?: string | null;
}

export interface Message {
  id?: string;
  sender: string;
  text?: string | null;
  image?: string | null;
  createdAt: number;
  replyTo?: ReplyInfo | null;
}
