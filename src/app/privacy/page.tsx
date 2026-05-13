import Link from "next/link"
import { Brain } from "lucide-react"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">CoursePrep</span>
            </Link>
            <Link href="/login" className="text-sm font-medium text-blue-600 hover:text-blue-700">
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-400">Last updated: May 13, 2026</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              CoursePrep (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates courseprep.xyz. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data. By using CoursePrep, you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-3">We collect the following categories of information:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><span className="font-medium text-gray-800">Account information:</span> Your email address, full name, and university name when you create an account.</li>
              <li><span className="font-medium text-gray-800">Uploaded materials:</span> PDF files you upload to your courses. These are stored in our cloud storage and processed to extract text for AI features.</li>
              <li><span className="font-medium text-gray-800">AI interactions:</span> Questions you submit to the AI tutor and quizzes you generate. These are used to retrieve relevant content from your materials and generate responses.</li>
              <li><span className="font-medium text-gray-800">Course data:</span> Course names, descriptions, and visibility settings you configure.</li>
              <li><span className="font-medium text-gray-800">Payment information:</span> If you upgrade to Pro, payment is processed by Stripe. We store only your Stripe customer ID — we never see or store your card number.</li>
              <li><span className="font-medium text-gray-800">Usage data:</span> Standard server logs including IP addresses, browser type, and pages visited, used for security and performance monitoring.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>To provide and improve the CoursePrep service, including AI-powered study tools.</li>
              <li>To process your uploaded documents into searchable embeddings for the AI tutor and quiz features.</li>
              <li>To manage your account, subscription status, and plan limits.</li>
              <li>To communicate important service updates or changes to this policy.</li>
              <li>To detect and prevent fraud, abuse, or security incidents.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">4. Third-Party Services</h2>
            <p className="mb-3">CoursePrep relies on the following third-party providers to deliver its service. Each has its own privacy policy:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><span className="font-medium text-gray-800">Supabase</span> — database, authentication, and file storage. Your account data and uploaded files are stored on Supabase infrastructure.</li>
              <li><span className="font-medium text-gray-800">OpenAI</span> — generates vector embeddings from your document text to enable semantic search. Text chunks from your documents are sent to OpenAI&apos;s API for this purpose.</li>
              <li><span className="font-medium text-gray-800">Anthropic</span> — powers the AI tutor, quiz generation, and course summary features. Relevant excerpts from your documents and your questions are sent to Anthropic&apos;s Claude API.</li>
              <li><span className="font-medium text-gray-800">Stripe</span> — handles all payment processing for Pro subscriptions. Stripe&apos;s privacy policy governs how they handle your payment information.</li>
            </ul>
            <p className="mt-3">We do not sell your personal data to any third party.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">5. Public Courses</h2>
            <p>
              If you set a course to &quot;public,&quot; its name, description, university, and course summary become visible to all CoursePrep users via the Discover feature. The underlying documents you uploaded remain private and are never shared publicly. You can make a course private again at any time from your Courses page.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">6. Data Retention</h2>
            <p>
              We retain your data for as long as your account is active. If you delete your account, we will delete your profile, courses, and uploaded documents within 30 days. Stripe may retain payment records as required by law or their own policies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">7. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Export your data in a portable format.</li>
            </ul>
            <p className="mt-3">To exercise any of these rights, contact us at the email below.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">8. Security</h2>
            <p>
              We use industry-standard security measures including encrypted connections (HTTPS), secure authentication tokens, and access controls. However, no system is completely secure — use a strong, unique password and keep it private.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
            <p>
              CoursePrep is intended for users who are 13 years of age or older. We do not knowingly collect data from children under 13. If you believe a child has provided us personal data, please contact us and we will delete it.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will post the revised version here with an updated date. Continued use of CoursePrep after changes constitutes your acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">11. Contact</h2>
            <p>
              Questions or requests regarding this Privacy Policy can be sent to{" "}
              <a href="mailto:support@courseprep.xyz" className="text-blue-600 hover:text-blue-700">
                support@courseprep.xyz
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-8 flex items-center gap-4 text-sm text-gray-400">
          <Link href="/terms" className="hover:text-gray-600">Terms of Service</Link>
          <span>·</span>
          <Link href="/" className="hover:text-gray-600">Back to CoursePrep</Link>
        </div>
      </main>
    </div>
  )
}
