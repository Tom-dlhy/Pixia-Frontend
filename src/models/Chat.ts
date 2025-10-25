import { BaseEntity, ID, Timestamp, hydrateByIds } from "./GlobalType"
import type { Attachment } from "./Attachment"

export type Role = "user" | "assistant" | "system"
export type MessageStatus = "sent" | "pending" | "error"

export interface ChatMessage extends BaseEntity {
  conversationId: ID
  role: Role
  content: string
  createdAt: Timestamp
  editedAt?: Timestamp
  attachments?: Attachment[]
  status?: MessageStatus
  parentId?: ID
}

export interface ConversationRecord extends BaseEntity {
  title?: string
  typeCourse: "exercice" | "cours" | "evaluation" | "basic" | "none"
  messageIds?: ID[] // optional: allows empty or initializing conversations
}


export interface ConversationHydrated extends Omit<ConversationRecord, "messageIds"> {
  messages: ChatMessage[]
}

export type MessageMap = Record<ID, ChatMessage>

export function isBotMessage(message: ChatMessage): boolean {
  return message.role === "assistant"
}

export function isUserMessage(message: ChatMessage): boolean {
  return message.role === "user"
}

export function getLastMessage(conversation: ConversationHydrated): ChatMessage | undefined {
  return conversation.messages.at(-1)
}

export function serializeConversation(conversation: ConversationRecord): string {
  return JSON.stringify(conversation)
}

export function deserializeConversation(json: string): ConversationRecord {
  return JSON.parse(json)
}
