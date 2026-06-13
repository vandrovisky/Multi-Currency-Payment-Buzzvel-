import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import Modal from '@/Components/Modal';
import TextInput from '@/Components/TextInput';
import Button from '@/Components/UI/Button';
import { __ } from '@/utils/i18n';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);

        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                    {__('Delete Account')}
                </h2>

                <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                    {__('Once your account is deleted, all of its resources and data will be permanently deleted. Before deleting your account, please download any data or information that you wish to retain.')}
                </p>
            </header>

            <Button variant="danger" onClick={confirmUserDeletion}>
                {__('Delete Account')}
            </Button>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form
                    onSubmit={deleteUser}
                    className="bg-white p-6 dark:bg-zinc-900"
                >
                    <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
                        {__('Are you sure you want to delete your account?')}
                    </h2>

                    <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                        {__('Once your account is deleted, all of its resources and data will be permanently deleted. Please enter your password to confirm you would like to permanently delete your account.')}
                    </p>

                    <div className="mt-6">
                        <InputLabel
                            htmlFor="password"
                            value={__('Password')}
                            className="sr-only"
                        />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            className="mt-1 block w-3/4"
                            isFocused
                            placeholder={__('Password')}
                        />

                        <InputError
                            message={errors.password}
                            className="mt-2"
                        />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <Button variant="secondary" onClick={closeModal}>
                            {__('Cancel')}
                        </Button>

                        <Button variant="danger" disabled={processing}>
                            {__('Delete Account')}
                        </Button>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
