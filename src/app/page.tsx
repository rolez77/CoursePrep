// src/app/page.tsx
"use client"

import { useState } from "react"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [uploadStatus, setUploadStatus] = useState<string>("")
  const [question, setQuestion] = useState<string>("")
  const [response, setResponse] = useState<string>("")

  async function handleUpload() {
    if (!file) return
    const formData = new FormData()
    formData.append("file", file)

    const res = await fetch("http://localhost:8000/upload", {
      method: "POST",
      body: formData,
    })
    const data = await res.json()
    setUploadStatus(data.message)
  }

  async function handleChat() {
    if (!question) return
    const res = await fetch(`http://localhost:8000/chat?question=${encodeURIComponent(question)}`, {
      method: "POST",
    })
    const data = await res.json()
    setResponse(data.response)
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-3xl font-semibold">CoursePrep</h1>

      {/* File upload */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <p className="font-medium">Upload course material</p>
        <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        <button onClick={handleUpload} className="bg-black text-white rounded-lg px-4 py-2">
          Upload
        </button>
        {uploadStatus && <p className="text-green-600 text-sm">{uploadStatus}</p>}
      </div>

      {/* Chat */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <p className="font-medium">Ask a question</p>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. What topics are on the exam?"
          className="border rounded-lg px-4 py-2"
        />
        <button onClick={handleChat} className="bg-black text-white rounded-lg px-4 py-2">
          Ask
        </button>
        {response && <p className="text-gray-700 text-sm">{response}</p>}
      </div>
    </main>
  )
}