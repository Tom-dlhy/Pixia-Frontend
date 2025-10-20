import { createServerFn } from "@tanstack/react-start"
import z from "zod"
import { sendChat } from "./chatApi"

const ChatMessageSchema = z.object({
  user_id: z.string().min(1),
  message: z.string().min(1),
  sessionId: z.string().min(1).optional(),
  files: z
    .array(
      z.object({
        name: z.string(),
        type: z.string().optional(),
        size: z.number().optional(),
        data: z.string(), // base64
      })
    )
    .optional(),
})

export const sendChatMessage = createServerFn({ method: "POST" })
  .inputValidator(ChatMessageSchema)
  .handler(async ({ data }) => {
    const { user_id, message, sessionId, files = [] } = data

    const formData = new FormData()
    formData.append("user_id", user_id)
    formData.append("message", message)
    if (sessionId) formData.append("session_id", sessionId)

    for (const f of files) {
      const buffer = Buffer.from(f.data, "base64")
      const blob = new Blob([buffer], { type: f.type ?? "application/octet-stream" })
      formData.append("files", blob, f.name)
    }

    const res = await sendChat(formData)

    return {
      reply: res.answer,
      session_id: res.session_id,
      agent: res.agent ?? null,
      title: res.redirect_id ?? null,
    }
  })
