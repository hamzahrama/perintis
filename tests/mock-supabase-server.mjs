import http from "node:http";

const PORT = 4599;
const USER_ID = "test-user-auth-123";
const OTHER_USER_ID = "other-user-456";
const CONV_ID_1 = "11111111-1111-4111-8111-111111111111";
const CONV_ID_2 = "22222222-2222-4222-8222-222222222222";

let deleteFailNext = false;
const recordedDeletes = [];

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${PORT}`);
  const path = url.pathname;

  res.setHeader("content-type", "application/json");

  if (path === "/auth/v1/user" && req.method === "GET") {
    const auth = req.headers.authorization || "";
    if (auth.includes("test-access-token")) {
      res.end(JSON.stringify({ id: USER_ID, email: "test@example.com" }));
    } else if (auth.includes("other-access-token")) {
      res.end(JSON.stringify({ id: OTHER_USER_ID, email: "other@example.com" }));
    } else {
      res.statusCode = 401;
      res.end(JSON.stringify({ message: "no session" }));
    }
    return;
  }

  if (path === "/rest/v1/user_preferences" && req.method === "GET") {
    res.end(JSON.stringify([{ theme: "dark" }]));
    return;
  }

  if (path === "/rest/v1/assistant_conversations" && req.method === "GET") {
    const userId = url.searchParams.get("user_id")?.replace("eq.", "");
    if (userId === USER_ID) {
      res.end(
        JSON.stringify([
          { id: CONV_ID_1, user_id: USER_ID, title: "Test Conversation A", updated_at: new Date().toISOString() },
          { id: CONV_ID_2, user_id: USER_ID, title: "Test Conversation B", updated_at: new Date().toISOString() },
        ]),
      );
    } else {
      res.end(JSON.stringify([]));
    }
    return;
  }

  if (path === "/rest/v1/assistant_conversations" && req.method === "DELETE") {
    recordedDeletes.push({ id: url.searchParams.get("id"), user_id: url.searchParams.get("user_id") });
    if (deleteFailNext) {
      deleteFailNext = false;
      res.statusCode = 500;
      res.end(JSON.stringify({ message: "internal error" }));
      return;
    }
    res.statusCode = 204;
    res.end();
    return;
  }

  if (path === "/rest/v1/assistant_messages" && req.method === "GET") {
    const convId = url.searchParams.get("conversation_id")?.replace("eq.", "");
    const userId = url.searchParams.get("user_id")?.replace("eq.", "");
    if (userId === USER_ID && convId === CONV_ID_1) {
      res.end(
        JSON.stringify([
          { id: "msg-1", role: "user", content: "hello", created_at: new Date().toISOString() },
          { id: "msg-2", role: "assistant", content: "hi there", created_at: new Date().toISOString() },
        ]),
      );
    } else {
      res.end(JSON.stringify([]));
    }
    return;
  }

  if (path === "/__test/deleteFailNext" && req.method === "POST") {
    deleteFailNext = true;
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  if (path === "/__test/recordedDeletes" && req.method === "GET") {
    res.end(JSON.stringify(recordedDeletes));
    return;
  }

  if (path === "/__test/reset" && req.method === "POST") {
    recordedDeletes.length = 0;
    deleteFailNext = false;
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  res.statusCode = 404;
  res.end(JSON.stringify({ message: "not found" }));
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Mock Supabase listening on http://127.0.0.1:${PORT}`);
});