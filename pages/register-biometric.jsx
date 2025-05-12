
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function RegisterBiometric() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async () => {
    setError('');
    setMessage('');

    try {
      const publicKey = {
        challenge: new Uint8Array([/* random challenge */]),
        rp: {
          name: "Pasaguthi",
        },
        user: {
          id: new Uint8Array(16),
          name: "guthiUser",
          displayName: "Guthi User"
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        authenticatorSelection: {
          authenticatorAttachment: "platform",
          userVerification: "preferred"
        },
        timeout: 60000,
        attestation: "direct"
      };

      const credential = await navigator.credentials.create({ publicKey });

      if (credential) {
        setMessage("🎉 Biometric registration successful!");
        router.push('/dashboard');
      } else {
        setError("❌ Failed to register biometric credential.");
      }
    } catch (err) {
      console.error("Biometric registration error:", err);
      setError("⚠️ Registration was cancelled or failed.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white text-black p-6">
      <h1 className="text-2xl font-bold mb-4">🪪 Register Your Biometric</h1>
      <p className="mb-4 text-gray-700 text-center">
        This will allow you to sign in with fingerprint, face ID, or device PIN next time.
      </p>

      {error && <p className="text-sm text-red-700">{error}</p>}
      {message && <p className="text-sm text-green-700">{message}</p>}

      <button
        onClick={handleRegister}
        className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
      >
        🔒 Register Biometric
      </button>
    </div>
  );
}
