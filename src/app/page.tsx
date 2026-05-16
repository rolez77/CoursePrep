"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  Brain, Upload, HelpCircle, BookOpen, Send,
  CheckCircle2, FileText, ArrowRight, ChevronDown,
} from "lucide-react"

const DEMO_MESSAGES = [
  {
    role: "user",
    content: "What topics should I focus on for the midterm?",
  },
  {
    role: "assistant",
    content:
      "Based on your CHEM 301 syllabus, the midterm covers Chapters 4–8. Professor Ramirez weighted nucleophilic substitution (SN1/SN2) at 35% and stereochemistry at 25%. Your lecture notes from Week 6 have the clearest breakdown of the mechanisms — start there.",
  },
  {
    role: "user",
    content: "Can you quiz me on SN2 reactions?",
  },
]

const QUIZ_QUESTION = {
  question: "Which factor most strongly favors an SN2 mechanism?",
  options: ["Tertiary substrate", "Polar protic solvent", "Strong nucleophile", "Weak base"],
  correct: "Strong nucleophile",
}

function MockChatDemo() {
  const [visibleMessages, setVisibleMessages] = useState(0)
  const [showQuiz, setShowQuiz] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  useEffect(() => {
    if (visibleMessages < DEMO_MESSAGES.length) {
      const delay = visibleMessages === 0 ? 600 : visibleMessages === 1 ? 1400 : 800
      const t = setTimeout(() => setVisibleMessages((v) => v + 1), delay)
      return () => clearTimeout(t)
    }
    if (visibleMessages === DEMO_MESSAGES.length && !showQuiz) {
      const t = setTimeout(() => setShowQuiz(true), 900)
      return () => clearTimeout(t)
    }
  }, [visibleMessages, showQuiz])

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden w-full max-w-md mx-auto lg:mx-0">
      {/* Course header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">CHEM 301 – Organic Chemistry</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <p className="text-white/75 text-xs">3 materials · syllabus uploaded</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat */}
      <div className="p-5 space-y-4 min-h-64">
        {DEMO_MESSAGES.slice(0, visibleMessages).map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}
          >
            <div
              className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-blue-600 text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {visibleMessages > 0 && visibleMessages < DEMO_MESSAGES.length && (
          <div className="flex justify-start animate-in fade-in duration-200">
            <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {showQuiz && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-semibold text-purple-700 uppercase tracking-wide">Quick Quiz</span>
            </div>
            <p className="text-sm font-medium text-gray-900 mb-3">{QUIZ_QUESTION.question}</p>
            <div className="space-y-2">
              {QUIZ_QUESTION.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSelected(opt)}
                  className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-all ${
                    selected === null
                      ? "border-gray-200 hover:border-purple-400 text-gray-700"
                      : selected === opt && opt === QUIZ_QUESTION.correct
                      ? "border-green-400 bg-green-50 text-green-800"
                      : selected === opt
                      ? "border-red-300 bg-red-50 text-red-700"
                      : opt === QUIZ_QUESTION.correct && selected !== null
                      ? "border-green-300 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-500"
                  }`}
                >
                  {selected !== null && opt === QUIZ_QUESTION.correct && (
                    <CheckCircle2 className="inline w-3.5 h-3.5 text-green-500 mr-1.5 -mt-0.5" />
                  )}
                  {opt}
                </button>
              ))}
            </div>
            {selected && (
              <p className="mt-3 text-xs text-gray-600 animate-in fade-in duration-200">
                {selected === QUIZ_QUESTION.correct
                  ? "Correct! SN2 needs a strong nucleophile to attack the electrophilic carbon directly."
                  : `Not quite. Strong nucleophile is correct — it's the key driver for backside attack in SN2.`}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 flex items-center gap-3 px-4 py-3">
        <input
          readOnly
          value=""
          placeholder="Ask anything about this course..."
          className="flex-1 text-sm text-gray-500 placeholder-gray-400 outline-none bg-transparent"
        />
        <button className="p-1.5 text-blue-600">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">

      {/* Nav */}
      <header className="sticky top-0 z-20 bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">CoursePrep</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm text-gray-600 dark:text-gray-300">
            <a href="#how-it-works" className="hover:text-gray-900 dark:hover:text-white transition-colors">How it works</a>
            <a href="#features" className="hover:text-gray-900 dark:hover:text-white transition-colors">Features</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Log in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              Trained on YOUR course materials
            </div>
            <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Study smarter.<br />
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Actually ace your exams.
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8 max-w-lg">
              Upload your syllabus and lecture notes. CoursePrep reads them so you can ask anything — and get answers that actually match what your professor is teaching.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-blue-600 text-white font-semibold px-6 py-3.5 rounded-xl hover:bg-blue-700 transition-colors text-base"
              >
                Start for free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <p className="text-sm text-gray-500">No credit card required</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl blur-xl opacity-60 -z-10" />
            <MockChatDemo />
          </div>
        </div>

        <div className="flex justify-center mt-16">
          <a href="#how-it-works" className="flex flex-col items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors text-sm">
            See how it works
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="bg-gray-50 py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Up and running in minutes</h2>
            <p className="text-gray-600 text-lg max-w-xl mx-auto">Three steps to turn your course materials into an AI tutor that knows your class inside out.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Upload,
                title: "Upload your materials",
                desc: "Drop in your syllabus, lecture notes, or any PDF. CoursePrep reads everything and builds context around your specific course.",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                step: "02",
                icon: Brain,
                title: "Ask your AI tutor",
                desc: "Ask anything — what's on the midterm, explain a concept, summarize a lecture. Answers come from your actual materials, not generic internet knowledge.",
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
              {
                step: "03",
                icon: HelpCircle,
                title: "Test yourself",
                desc: "Generate custom quizzes on any topic from your course. Get instant feedback with explanations grounded in your lecture notes.",
                color: "text-green-600",
                bg: "bg-green-50",
              },
            ].map(({ step, icon: Icon, title, desc, color, bg }) => (
              <div key={step} className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${color}`} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 tracking-widest">STEP {step}</span>
                </div>
                <h3 className="text-xl font-bold mb-3">{title}</h3>
                <p className="text-gray-600 leading-relaxed text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Everything you need to prepare</h2>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">Built specifically for exam prep — not just a generic chatbot with a course name slapped on it.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              icon: BookOpen,
              title: "Syllabus analysis",
              desc: "Upload your syllabus and instantly get a structured breakdown of exam weights, lecture topics, important dates, and your professor's focus areas.",
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              icon: Brain,
              title: "Course-specific AI",
              desc: "The AI only knows what's in your uploaded materials. No hallucinated textbook chapters, no wrong edition answers — just your actual course content.",
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
            {
              icon: HelpCircle,
              title: "Custom quiz generator",
              desc: "Pick a topic, choose how many questions, and get a quiz generated from your lecture notes. See your score and explanations after every attempt.",
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              icon: FileText,
              title: "Multiple document support",
              desc: "Add as many lecture PDFs as you need. CoursePrep indexes them all so you can ask cross-lecture questions like 'how does topic A connect to topic B?'",
              color: "text-orange-600",
              bg: "bg-orange-50",
            },
            {
              icon: Upload,
              title: "Instant processing",
              desc: "Upload a PDF and it's ready to query in seconds. No waiting, no configuration — just start asking questions.",
              color: "text-teal-600",
              bg: "bg-teal-50",
            },
            {
              icon: CheckCircle2,
              title: "Discover public courses",
              desc: "Browse study materials shared by other students at your university. Find courses that match yours and get a head start.",
              color: "text-pink-600",
              bg: "bg-pink-50",
            },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="rounded-2xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 py-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 leading-tight">
            Your course. Your tutor.<br />Your terms.
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Generic AI tutors don't know your specific syllabus. CoursePrep does — because you gave it yours.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg"
          >
            Get started for free
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-white/60 text-sm mt-4">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 py-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">CoursePrep</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900 transition-colors">Terms</Link>
            <Link href="/login" className="hover:text-gray-900 transition-colors">Log in</Link>
            <Link href="/signup" className="font-medium text-blue-600 hover:text-blue-700 transition-colors">Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
