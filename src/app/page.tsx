"use client"

import { useState } from "react"

interface Message {
  role: "user" | "assistant"
  content: string
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [question, setQuestion] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(false)

  async function handleUpload() {
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()
      setUploadStatus(data.message)
    } catch {
      setUploadStatus("Upload failed — is the backend running?")
    } finally {
      setUploading(false)
    }
  }

  async function handleChat() {
    if (!question.trim()) return
    const userMessage = question
    setQuestion("")
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setLoading(true)

    try {
      const res = await fetch(
        `http://localhost:8000/chat?question=${encodeURIComponent(userMessage)}`,
        { method: "POST" }
      )
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong — try again." }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleChat()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 max-w-2xl mx-auto">
      <h1 className="text-3xl font-semibold mb-8">CoursePrep</h1>

      {/* Upload section */}
      <div className="w-full border rounded-xl p-6 mb-6">
        <p className="font-medium mb-3">Upload course material</p>
        <div className="flex gap-3 items-center">
          <input
            type="file"
            accept=".pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="text-sm"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-40"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
        {uploadStatus && <p className="text-green-600 text-sm mt-2">{uploadStatus}</p>}
      </div>

      {/* Chat section */}
      <div className="w-full border rounded-xl p-6 flex flex-col gap-4">
        <p className="font-medium">Ask a question</p>

        {/* Message history */}
        <div className="flex flex-col gap-3 min-h-[200px] max-h-[400px] overflow-y-auto">
          {messages.length === 0 && (
            <p className="text-gray-400 text-sm">Upload a syllabus and ask anything about your course...</p>
          )}
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-lg px-4 py-3 text-sm max-w-[85%] whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-black text-white self-end"
                  : "bg-gray-100 text-gray-800 self-start"
              }`}
            >
              {msg.content}
            </div>
          ))}
          {loading && (
            <div className="bg-gray-100 text-gray-400 rounded-lg px-4 py-3 text-sm self-start">
              Thinking...
            </div>
          )}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. What topics are on the exam?"
            className="flex-1 border rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={handleChat}
            disabled={!question.trim() || loading}
            className="bg-black text-white rounded-lg px-4 py-2 text-sm disabled:opacity-40"
          >
            Ask
          </button>
        </div>
      </div>
    </main>
  )
}