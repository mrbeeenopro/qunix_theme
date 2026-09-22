import { useEffect } from 'react';

export default function ConfigurationPage() {
  useEffect(() => {
    if (window.location.pathname !== '/admin/qunix-settings') {
      window.location.replace('/admin/qunix-settings');
    }
  }, []);

  return null;
}
