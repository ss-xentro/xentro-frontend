import { GoogleLogin } from '@react-oauth/google';
import { useEffect, useState } from 'react';

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

  useEffect(() => {
    setNonce(generateNonce());
  }, []);

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
        theme="outline"
        size="large"
        width="100%"
        text="continue_with"
        shape="rectangular"
      />
    </div>
  );
}
