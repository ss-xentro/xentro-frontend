import { GoogleLogin } from '@react-oauth/google';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';

interface GoogleLoginButtonProps {
  onSuccess: (idToken: string, nonce: string) => void;
  onError?: (error: string) => void;
  isLoading?: boolean;
}

function generateNonce(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, '0')).join('');
}

export function GoogleLoginButton({ onSuccess, onError, isLoading }: GoogleLoginButtonProps) {
  const [nonce, setNonce] = useState('');
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [btnWidth, setBtnWidth] = useState<number | undefined>(undefined);

  useEffect(() => {
    setNonce(generateNonce());
    setMounted(true);
  }, []);

  const measureWidth = useCallback(() => {
    if (containerRef.current) {
      setBtnWidth(containerRef.current.offsetWidth);
    }
  }, []);

  useEffect(() => {
    measureWidth();
    window.addEventListener('resize', measureWidth);
    return () => window.removeEventListener('resize', measureWidth);
  }, [measureWidth]);

  const googleTheme = mounted && resolvedTheme === 'light' ? 'outline' : 'filled_black';

  return (
    <div
      ref={containerRef}
      className={`w-full ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
    >
      {btnWidth && (
        <GoogleLogin
          nonce={nonce}
          onSuccess={(credentialResponse) => {
            if (credentialResponse.credential) {
              onSuccess(credentialResponse.credential, nonce);
            } else {
              onError?.('No credential returned from Google');
            }
          }}
          onError={() => {
            onError?.('Google Login Failed');
          }}
          theme={googleTheme}
          size="large"
          width={btnWidth}
          text="continue_with"
          shape="rectangular"
        />
      )}
    </div>
  );
}
