import { BaseEntity, ID, Timestamp, hydrateByIds } from "./GlobalType"
import type { Attachment } from "./Attachment"

// Note: userId should be obtained from session when needed, not globally

// ----------------------------------------------
// Enum-like types
// ----------------------------------------------
export type Role = "user" | "assistant" | "system"
export type MessageStatus = "sent" | "pending" | "error"


// ----------------------------------------------
// Chat message models
// ----------------------------------------------
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

// ----------------------------------------------
// Canonical storage format (lightweight, for DB or API)
// ----------------------------------------------
export interface ConversationRecord extends BaseEntity {
  title?: string
  typeCourse: "exercice" | "cours" | "evaluation" | "basic" | "none"
  messageIds?: ID[] // optional: allows empty or initializing conversations
}

// ----------------------------------------------
// Hydrated version (used in UI or state management)
// ----------------------------------------------
export interface ConversationHydrated extends Omit<ConversationRecord, "messageIds"> {
  messages: ChatMessage[]
}

// ----------------------------------------------
// Utility types and transformation helpers
// ----------------------------------------------
export type MessageMap = Record<ID, ChatMessage>

/**
 * Rebuild a hydrated conversation from its canonical record and message map.
 */
export function hydrateConversation(
  record: ConversationRecord,
  messagesById: MessageMap
): ConversationHydrated {
  const messages = hydrateByIds(record.messageIds ?? [], messagesById)

  return { ...record, messages }
}

/**
 * Convert a hydrated conversation back into its canonical form (for storage).
 */
export function dehydrateConversation(conversation: ConversationHydrated): ConversationRecord {
  return {
    ...conversation,
    messageIds: conversation.messages.map((m) => m.id),
  }
}

// ----------------------------------------------
// Domain helpers
// ----------------------------------------------

/**
 * Returns true if the message was sent by the bot.
 */
export function isBotMessage(message: ChatMessage): boolean {
  return message.role === "assistant"
}

/**
 * Returns true if the message was sent by the user.
 */
export function isUserMessage(message: ChatMessage): boolean {
  return message.role === "user"
}

/**
 * Returns the last message of a hydrated conversation (if any).
 */
export function getLastMessage(conversation: ConversationHydrated): ChatMessage | undefined {
  return conversation.messages.at(-1)
}

/**
 * Serialize a conversation record for local storage or network transport.
 */
export function serializeConversation(conversation: ConversationRecord): string {
  return JSON.stringify(conversation)
}

/**
 * Deserialize a conversation record from JSON.
 */
export function deserializeConversation(json: string): ConversationRecord {
  return JSON.parse(json)
}
