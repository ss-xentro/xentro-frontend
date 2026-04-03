import { GoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    setNonce(generateNonce());
    setMounted(true);
  }, []);

  const googleTheme = mounted && resolvedTheme === 'light' ? 'outline' : 'filled_black';

  return (
    <div className={`w-full flex justify-center ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
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
        useOneTap
        theme={googleTheme}
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
}
