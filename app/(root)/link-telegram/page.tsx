'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';

export default function LinkTelegramPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [linkStatus, setLinkStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const chatId = searchParams?.get('chatId') ?? null;

  const linkTelegramAccount = useCallback(async () => {
    if (!chatId) return;
    
    setLinkStatus('loading');
    
    try {
      const response = await fetch('/api/telegram/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ telegramChatId: chatId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to link account');
      }

      setLinkStatus('success');
      
      // Redirect to briefs library after 2 seconds
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (error) {
      setLinkStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Something went wrong');
    }
  }, [chatId, router]);

  useEffect(() => {
    // If not authenticated, don't do anything (they need to sign in first)
    if (status === 'loading') return;
    
    if (status === 'unauthenticated') {
      // Redirect to sign in with callback to this page
      const callbackUrl = `/link-telegram?chatId=${chatId}`;
      router.push(`/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}`);
      return;
    }

    // Auto-link if authenticated and we have a chatId
    if (session && chatId && linkStatus === 'idle') {
      linkTelegramAccount();
    }
  }, [session, status, chatId, linkStatus, router, linkTelegramAccount]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!chatId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-destructive" />
              Invalid Link
            </CardTitle>
            <CardDescription>
              This linking URL is invalid. Please use the /link command in the Telegram bot to get a fresh link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/')} className="w-full">
              Go to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          {linkStatus === 'loading' && (
            <>
              <CardTitle className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                Linking Account...
              </CardTitle>
              <CardDescription>
                Connecting your Telegram account to Lighted.
              </CardDescription>
            </>
          )}
          
          {linkStatus === 'success' && (
            <>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                Account Linked!
              </CardTitle>
              <CardDescription>
                Your Telegram account is now connected. All your briefs will appear in your library.
              </CardDescription>
            </>
          )}
          
          {linkStatus === 'error' && (
            <>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <XCircle className="h-5 w-5" />
                Linking Failed
              </CardTitle>
              <CardDescription>
                {errorMessage}
              </CardDescription>
            </>
          )}
          
          {linkStatus === 'idle' && status === 'authenticated' && (
            <>
              <CardTitle>Link Telegram Account</CardTitle>
              <CardDescription>
                Click below to connect your Telegram account to Lighted.
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent>
          {linkStatus === 'success' && (
            <p className="text-sm text-muted-foreground">
              Redirecting to your library...
            </p>
          )}
          
          {linkStatus === 'error' && (
            <div className="space-y-2">
              <Button onClick={linkTelegramAccount} className="w-full">
                Try Again
              </Button>
              <Button variant="outline" onClick={() => router.push('/')} className="w-full">
                Go to Library
              </Button>
            </div>
          )}
          
          {linkStatus === 'idle' && status === 'authenticated' && (
            <Button onClick={linkTelegramAccount} className="w-full">
              Link Account
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
