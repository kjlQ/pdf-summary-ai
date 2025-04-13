import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import FormData from "form-data";

const OPENAI_URL = "https://api.openai.com/v1";

let fileHistory: { fileName: string; summary: string }[] = [];

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const formData = new FormData();
    formData.append("file", buffer, file.name);
    formData.append("purpose", "assistants");

    const uploadRes = await axios.post(`${OPENAI_URL}/files`, formData, {
      headers: {
        ...formData.getHeaders(),
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    });

    const fileId = uploadRes.data.id;

    const headers = {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
      "OpenAI-Beta": "assistants=v2",
    };

    const assistantRes = await axios.post(
      `${OPENAI_URL}/assistants`,
      {
        name: "File Summarizer",
        instructions: "You are a helpful assistant that summarizes uploaded files.",
        model: "gpt-4-1106-preview",
        tools: [{ type: "file_search" }],
      },
      { headers }
    );

    const assistantId = assistantRes.data.id;

    const threadRes = await axios.post(`${OPENAI_URL}/threads`, {}, { headers });
    const threadId = threadRes.data.id;

    await axios.post(
      `${OPENAI_URL}/threads/${threadId}/messages`,
      {
        role: "user",
        content: "Briefly summarize provided file. Don't ask for additional information - just summarize",
        attachments: [
          {
            file_id: fileId,
            tools: [{ type: "file_search" }],
          },
        ],
      },
      { headers }
    );

    const runRes = await axios.post(
      `${OPENAI_URL}/threads/${threadId}/runs`,
      { assistant_id: assistantId },
      { headers }
    );

    const runId = runRes.data.id;

    let runStatus = "queued";
    let attempts = 0;
    const maxAttempts = 10;

    while ((runStatus === "queued" || runStatus === "in_progress") && attempts < maxAttempts) {
      attempts++;
      await new Promise((res) => setTimeout(res, 2000));
      const statusRes = await axios.get(`${OPENAI_URL}/threads/${threadId}/runs/${runId}`, { headers });
      runStatus = statusRes.data.status;
    }

    if (attempts >= maxAttempts) {
      throw new Error("Run took too long to complete");
    }

    const messagesRes = await axios.get(`${OPENAI_URL}/threads/${threadId}/messages`, { headers });
    const assistantMessages = messagesRes.data.data.filter((msg: any) => msg.role === "assistant");

    await axios.delete(`${OPENAI_URL}/assistants/${assistantId}`, { headers });

    let summary = "No summary was generated.";
    if (assistantMessages.length > 0) {
      summary = assistantMessages[0].content[0].text.value;
    }

    fileHistory.push({ fileName: file.name, summary });

    if (fileHistory.length > 5) {
      fileHistory.shift();
    }

    return NextResponse.json({ fileId, summary, fileHistory });
  } catch (error: any) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
