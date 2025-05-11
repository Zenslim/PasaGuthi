
import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function withAuth(WrappedComponent) {
  return function ProtectedRoute(props) {
    const router = useRouter();

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const hasKey = localStorage.getItem('guthiKey');
        if (!hasKey) {
          router.replace('/signin');
        }
      }
    }, []);

    if (typeof window === 'undefined') return null;
    const hasKey = localStorage.getItem('guthiKey');
    if (!hasKey) return null;

    return <WrappedComponent {...props} />;
  };
}
