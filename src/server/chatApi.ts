const API_BASE: string | undefined = process.env.API_BASE;

export type SendChatResponse = {
  reply: string;
  session_id: string;
  title?: string;
};

async function handle<T = any>(r: Response): Promise<T> {
  if (!r.ok) {
    const body = await r.text().catch(() => "");
    throw new Error(`HTTP ${r.status}: ${body}`);
  }
  return r.json() as Promise<T>;
}

export async function sendChat(user_id: string, sessionId: string, message: string, title = "") {
  const r = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ user_id, session_id: sessionId, message, title }),
  });
  return handle<SendChatResponse>(r);
}
