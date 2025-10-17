import { createServerFn } from '@tanstack/react-start';
import z from "zod";
import { sendChat } from "./chatApi";

// -------------------------
// 🔹 Validation des entrées
// -------------------------
const ChatMessageSchema = z.object({
  user_id: z.string(),
  chatId: z.string().nullable(),
  message: z.string(),
  title: z.string().optional(),
});

// -------------------------
// 🔹 Server Function principale
// -------------------------
export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator(ChatMessageSchema)
  .handler(async ({ data }) => {
    const { user_id, chatId, message, title } = data;
    const res = await sendChat(user_id, chatId ?? "", message, title ?? "");

    return {
      reply: res.reply,
      session_id: res.session_id,
      title: res.title ?? null,
    };
  });

