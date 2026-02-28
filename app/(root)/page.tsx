'use client'

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Now available on Telegram
          </div>

          {/* Primary Headline */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            Sermon prep in <span className="text-blue-600">60 seconds</span>,
            <br className="hidden sm:block" />
            not 6 hours
          </h1>

          {/* Value Proposition */}
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Send a voice note on Telegram with your scripture or topic.
            Get back a complete exegesis brief with historical context, 
            Greek/Hebrew analysis, and sermon angles — instantly.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Button asChild size="lg" className="text-lg px-8 py-6 bg-blue-600 hover:bg-blue-700">
              <Link href="/sign-up">
                Start Free Trial
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 border-slate-300">
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
          </div>

          {/* Social Proof */}
          <p className="text-sm text-slate-500 pt-4">
            Join pastors saving 5+ hours every week on sermon research
          </p>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="px-6 py-16 bg-white">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-12">
            How it works
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">🎙️</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">1. Send a voice note</div>
              <p className="text-slate-600">
                Open Telegram and speak naturally: &ldquo;I&apos;m preaching on Romans 8:28 this Sunday&rdquo;
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">🤖</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">2. AI does the research</div>
              <p className="text-slate-600">
                Our AI analyzes the passage, pulls scholarly sources, and builds your brief
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">📋</span>
              </div>
              <div className="text-lg font-semibold text-slate-900">3. Receive your brief</div>
              <p className="text-slate-600">
                Get a detailed exegesis with context, word studies, and application points
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900 mb-4">
            Everything you need for sermon prep
          </h2>
          <p className="text-center text-slate-600 mb-12 max-w-2xl mx-auto">
            Stop juggling commentaries, lexicons, and browser tabs. Get it all in one brief.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl border bg-white">
              <h3 className="font-semibold text-lg mb-2 text-slate-900">Historical & Cultural Context</h3>
              <p className="text-slate-600 text-sm">
                Understand the world of the original audience — who wrote it, why, and what it meant to them.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-white">
              <h3 className="font-semibold text-lg mb-2 text-slate-900">Greek & Hebrew Word Studies</h3>
              <p className="text-slate-600 text-sm">
                Key terms analyzed with definitions, usage, and theological significance.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-white">
              <h3 className="font-semibold text-lg mb-2 text-slate-900">Cross-References & Themes</h3>
              <p className="text-slate-600 text-sm">
                See how your passage connects to the rest of Scripture with relevant parallels.
              </p>
            </div>
            <div className="p-6 rounded-xl border bg-white">
              <h3 className="font-semibold text-lg mb-2 text-slate-900">Sermon Angles & Applications</h3>
              <p className="text-slate-600 text-sm">
                Practical suggestions for how to preach and apply the text to your congregation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-20 bg-blue-600 text-white text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to transform your sermon prep?
          </h2>
          <p className="text-blue-100 text-lg">
            Join Lighted today and get your first exegesis brief in under a minute.
          </p>
          <Button asChild size="lg" className="text-lg px-8 py-6 bg-white text-blue-600 hover:bg-blue-50">
            <Link href="/sign-up">
              Get Started Free
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 px-6 bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-lg">Lighted</span>
            <span className="text-sm">© {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link 
              href="/privacy" 
              className="text-sm hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>
            <Link 
              href="/terms" 
              className="text-sm hover:text-white transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
