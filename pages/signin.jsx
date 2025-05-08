import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function SignIn() {
  const router = useRouter();
  useEffect(() => {
    router.push('/network/welcome');
  }, []);
  return <div>Redirecting...</div>;
}
