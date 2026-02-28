import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto prose prose-neutral dark:prose-invert">
        <h1>Privacy Policy</h1>
        <p className="text-muted-foreground">Last Updated: February 2026</p>

        <section className="mt-8">
          <h2>1. Introduction</h2>
          <p>
            Welcome to Lighted ("we," "our," or "us"). This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our voice-to-exegesis service 
            via our website and Telegram bot integration.
          </p>
          <p>
            We are committed to protecting your personal information in accordance with the 
            Protection of Personal Information Act, 2013 (POPIA) of South Africa and other 
            applicable data protection laws.
          </p>
        </section>

        <section className="mt-8">
          <h2>2. Information We Collect</h2>
          
          <h3>2.1 Personal Information</h3>
          <p>We may collect the following personal information:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, and profile picture when you sign in with Google</li>
            <li><strong>Telegram Information:</strong> Your Telegram user ID and chat ID when you link your account</li>
            <li><strong>Voice Notes:</strong> Audio recordings you send via Telegram for transcription and exegesis generation</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our service</li>
          </ul>

          <h3>2.2 Automatically Collected Information</h3>
          <p>
            We automatically collect certain information when you access our service, including 
            device information, IP address, browser type, and access times.
          </p>
        </section>

        <section className="mt-8">
          <h2>3. How We Use Your Information</h2>
          <p>In accordance with POPIA, we process your personal information for the following lawful purposes:</p>
          <ul>
            <li>To provide and maintain our voice-to-exegesis service</li>
            <li>To transcribe your voice notes and generate exegesis briefs</li>
            <li>To create and manage your user account</li>
            <li>To communicate with you about your account and our services</li>
            <li>To improve and optimize our service</li>
            <li>To comply with legal obligations</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>4. Legal Basis for Processing (POPIA Compliance)</h2>
          <p>Under POPIA, we process your personal information based on:</p>
          <ul>
            <li><strong>Consent:</strong> You provide consent when you sign up and use our service</li>
            <li><strong>Contract:</strong> Processing is necessary to provide our services to you</li>
            <li><strong>Legitimate Interest:</strong> To improve our services and ensure security</li>
            <li><strong>Legal Obligation:</strong> To comply with applicable laws</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>5. Third-Party Services</h2>
          <p>We use the following third-party services to operate Lighted:</p>
          <ul>
            <li><strong>Google:</strong> For authentication (Google Sign-In)</li>
            <li><strong>Telegram:</strong> For voice note collection and bot communication</li>
            <li><strong>Groq:</strong> For audio transcription and AI-powered exegesis generation</li>
            <li><strong>Vercel:</strong> For hosting our application</li>
            <li><strong>Neon:</strong> For database storage</li>
          </ul>
          <p>
            These third parties have their own privacy policies and may process your data 
            in jurisdictions outside South Africa. We ensure appropriate safeguards are in 
            place for such transfers.
          </p>
        </section>

        <section className="mt-8">
          <h2>6. Data Retention</h2>
          <p>
            We retain your personal information only for as long as necessary to fulfill the 
            purposes for which it was collected, including to satisfy legal, accounting, or 
            reporting requirements.
          </p>
          <ul>
            <li><strong>Voice recordings:</strong> Temporarily processed and not stored after transcription</li>
            <li><strong>Exegesis briefs:</strong> Retained until you delete them or your account</li>
            <li><strong>Account information:</strong> Retained until account deletion</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>7. Your Rights Under POPIA</h2>
          <p>As a data subject under POPIA, you have the right to:</p>
          <ul>
            <li><strong>Access:</strong> Request confirmation of whether we hold your personal information and access to it</li>
            <li><strong>Correction:</strong> Request correction of inaccurate personal information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal information</li>
            <li><strong>Object:</strong> Object to the processing of your personal information</li>
            <li><strong>Data Portability:</strong> Request a copy of your information in a structured format</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent at any time where processing is based on consent</li>
            <li><strong>Lodge a Complaint:</strong> File a complaint with the Information Regulator</li>
          </ul>
          <p>
            To exercise these rights, please contact us at the details provided below.
          </p>
        </section>

        <section className="mt-8">
          <h2>8. Security</h2>
          <p>
            We implement appropriate technical and organisational measures to protect your 
            personal information against unauthorised access, alteration, disclosure, or 
            destruction. These measures include:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Secure authentication mechanisms</li>
            <li>Regular security assessments</li>
            <li>Access controls and monitoring</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2>9. Children's Privacy</h2>
          <p>
            Our service is not intended for individuals under the age of 18. We do not knowingly 
            collect personal information from children. If you believe we have inadvertently 
            collected such information, please contact us immediately.
          </p>
        </section>

        <section className="mt-8">
          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any 
            material changes by posting the new policy on this page and updating the "Last 
            Updated" date.
          </p>
        </section>

        <section className="mt-8">
          <h2>11. Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy or wish to exercise your rights, 
            please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> privacy@lighted.life</li>
            <li><strong>Website:</strong> https://lighted.life</li>
          </ul>
          <p>
            You also have the right to lodge a complaint with the Information Regulator 
            (South Africa) if you believe your rights have been infringed:
          </p>
          <ul>
            <li><strong>Website:</strong> https://inforegulator.org.za</li>
            <li><strong>Email:</strong> complaints.IR@justice.gov.za</li>
          </ul>
        </section>

        <div className="mt-12 pt-8 border-t">
          <Link href="/" className="text-primary hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
