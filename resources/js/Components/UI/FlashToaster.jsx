import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function FlashToaster() {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 3500,
                style: {
                    background: '#18181b',
                    color: '#fafafa',
                    borderRadius: '6px',
                    border: '1px solid #3f3f46',
                    padding: '10px 16px',
                    fontSize: '14px',
                },
                success: { iconTheme: { primary: '#10b981', secondary: '#fafafa' } },
                error: { iconTheme: { primary: '#FF2D20', secondary: '#fafafa' } },
            }}
        />
    );
}
