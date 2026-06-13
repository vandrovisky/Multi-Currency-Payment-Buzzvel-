import PageHeader from '@/Components/UI/PageHeader';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { __, useTranslations } from '@/utils/i18n';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    useTranslations();

    return (
        <AuthenticatedLayout header={<PageHeader title={__('Profile')} />}>
            <Head title={__('Profile')} />

            <div className="mx-auto max-w-3xl space-y-6 px-4 pb-16 sm:px-6 lg:px-8">
                <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
                    <UpdateProfileInformationForm
                        mustVerifyEmail={mustVerifyEmail}
                        status={status}
                        className="max-w-xl"
                    />
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
                    <UpdatePasswordForm className="max-w-xl" />
                </div>

                <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
                    <DeleteUserForm className="max-w-xl" />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
