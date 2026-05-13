import Link from "next/link"
import { Brain } from "lucide-react"

export default function TermsOfService() {
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-400">Last updated: May 13, 2026</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 space-y-8 text-sm text-gray-600 leading-relaxed">

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>
              By creating an account or using CoursePrep (&quot;the Service&quot;), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. These terms form a binding agreement between you and CoursePrep (operated at courseprep.xyz).
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">2. Eligibility</h2>
            <p>
              You must be at least 13 years old to use CoursePrep. By using the Service, you represent that you meet this requirement. If you are under 18, you represent that a parent or legal guardian has reviewed and agreed to these terms on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">3. Your Account</h2>
            <p className="mb-3">
              You are responsible for maintaining the confidentiality of your password and for all activity under your account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Provide accurate information when registering.</li>
              <li>Keep your login credentials secure and not share them.</li>
              <li>Notify us immediately if you suspect unauthorized access.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p className="mb-3">CoursePrep is designed for personal educational use. You agree not to:</p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li>Upload content you do not have the right to use (e.g., copyrighted materials you are not permitted to share).</li>
              <li>Use the Service to engage in academic dishonesty, such as submitting AI-generated work as your own where prohibited by your institution.</li>
              <li>Attempt to reverse-engineer, scrape, or extract data from the Service through automated means.</li>
              <li>Use the Service to harass, spam, or harm others.</li>
              <li>Attempt to circumvent plan limits, security measures, or access controls.</li>
              <li>Upload illegal, harmful, or offensive content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">5. Your Content</h2>
            <p>
              You retain ownership of all files and materials you upload to CoursePrep. By uploading content, you grant us a limited, non-exclusive license to store, process, and use that content solely to provide the Service — for example, generating embeddings and AI responses from your documents.
            </p>
            <p className="mt-3">
              You are responsible for ensuring you have the right to upload any content you add to the Service. We do not claim ownership over your materials.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">6. Public Courses</h2>
            <p>
              When you set a course to public, its name, description, university, and AI-generated summary become visible to all CoursePrep users. By making a course public, you represent that you have the right to share that information. You can revert a course to private at any time. We are not responsible for how other users interact with publicly shared course information.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">7. Subscription and Billing</h2>
            <p className="mb-3">
              CoursePrep offers a free tier and a Pro subscription at $5/month, billed monthly through Stripe.
            </p>
            <ul className="list-disc list-inside space-y-2 pl-2">
              <li><span className="font-medium text-gray-800">Billing:</span> Your card will be charged at the start of each billing cycle.</li>
              <li><span className="font-medium text-gray-800">Cancellation:</span> You may cancel your Pro subscription at any time via the billing portal in your profile settings. Your Pro access continues through the end of the current billing period.</li>
              <li><span className="font-medium text-gray-800">Refunds:</span> We do not offer refunds for partial billing periods. If you believe you were charged in error, contact us within 7 days.</li>
              <li><span className="font-medium text-gray-800">Price changes:</span> We will give at least 30 days&apos; notice before changing subscription pricing.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">8. AI Features Disclaimer</h2>
            <p>
              CoursePrep&apos;s AI features — including the AI tutor, quiz generation, and course summaries — are powered by third-party AI models (Anthropic Claude and OpenAI). AI-generated responses may be incomplete, inaccurate, or misleading. You should always verify important information independently and not rely solely on AI output for academic decisions.
            </p>
            <p className="mt-3">
              We are not responsible for errors or omissions in AI-generated content, or for any academic consequences resulting from its use.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">9. Intellectual Property</h2>
            <p>
              All CoursePrep software, design, branding, and content (excluding user-uploaded materials) is owned by CoursePrep and protected by applicable intellectual property laws. You may not copy, reproduce, or distribute any part of the Service without our written permission.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">10. Termination</h2>
            <p>
              We reserve the right to suspend or terminate your account at any time if you violate these terms, engage in abusive behavior, or for any other reason at our discretion. You may also delete your account at any time. Upon termination, your data will be deleted in accordance with our Privacy Policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">11. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, CoursePrep is provided &quot;as is&quot; without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the Service, including loss of data, academic outcomes, or service interruptions. Our total liability to you shall not exceed the amount you paid us in the 3 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">12. Changes to Terms</h2>
            <p>
              We may update these Terms of Service at any time. We will notify you of material changes by posting the new terms here with an updated date. Continued use of CoursePrep after changes take effect constitutes your acceptance of the revised terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">13. Governing Law</h2>
            <p>
              These terms are governed by the laws of the United States, without regard to conflict of law principles. Any disputes will be resolved in the appropriate courts.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-gray-900 mb-3">14. Contact</h2>
            <p>
              Questions about these Terms of Service can be sent to{" "}
              <a href="mailto:support@courseprep.xyz" className="text-blue-600 hover:text-blue-700">
                support@courseprep.xyz
              </a>.
            </p>
          </section>

        </div>

        <div className="mt-8 flex items-center gap-4 text-sm text-gray-400">
          <Link href="/privacy" className="hover:text-gray-600">Privacy Policy</Link>
          <span>·</span>
          <Link href="/" className="hover:text-gray-600">Back to CoursePrep</Link>
        </div>
      </main>
    </div>
  )
}
