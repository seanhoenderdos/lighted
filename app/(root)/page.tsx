'use client'

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
            Your sermon research assistant
          </h1>
          
          <p className="text-lg text-slate-600">
            Send a voice note on Telegram with your scripture or topic.
            Receive an exegesis brief with context, word studies, and outline suggestions — 
            all the research, so you can focus on crafting your message.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button asChild size="lg" className="bg-slate-900 hover:bg-slate-800">
              <Link href="/sign-up">
                Get Started — It&apos;s Free
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/sign-in">
                Sign In
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Simple How It Works */}
      <div className="px-6 py-12 border-t">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold text-center text-slate-900 mb-8">
            How it works
          </h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="text-slate-400 font-mono">01</div>
              <div>
                <div className="font-medium text-slate-900">Send a voice note</div>
                <p className="text-sm text-slate-600">Share your passage or topic via Telegram</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-slate-400 font-mono">02</div>
              <div>
                <div className="font-medium text-slate-900">We gather the research</div>
                <p className="text-sm text-slate-600">Historical context, Greek/Hebrew insights, cross-references</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="text-slate-400 font-mono">03</div>
              <div>
                <div className="font-medium text-slate-900">You craft your sermon</div>
                <p className="text-sm text-slate-600">Use the brief as a foundation — your voice, your message</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-6 px-6 border-t">
        <div className="max-w-2xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <span className="text-sm text-slate-500">
            © {new Date().getFullYear()} Lighted
          </span>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-sm text-slate-500 hover:text-slate-900">
              Privacy
            </Link>
            <Link href="/terms" className="text-sm text-slate-500 hover:text-slate-900">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default LandingPage;
