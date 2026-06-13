import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import Button from '@/Components/UI/Button';
import GuestLayout from '@/Layouts/GuestLayout';
import { __, useTranslations } from '@/utils/i18n';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    useTranslations();
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        country: 'BR',
        currency: 'BRL',
    });

    const countries = [
        { code: 'BR', currency: 'BRL', label: 'Brazil (BRL)' },
        { code: 'US', currency: 'USD', label: 'United States (USD)' },
        { code: 'PT', currency: 'EUR', label: 'Portugal (EUR)' },
        { code: 'JP', currency: 'JPY', label: 'Japan (JPY)' },
        { code: 'GB', currency: 'GBP', label: 'United Kingdom (GBP)' },
    ];

    const selectCountry = (code) => {
        const country = countries.find((c) => c.code === code);
        setData((prev) => ({
            ...prev,
            country: country.code,
            currency: country.currency,
        }));
    };

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout
            title={__('Create your account')}
            subtitle={__('Pick your country — requests are made in its currency.')}
        >
            <Head title={__('Create account')} />

            <form onSubmit={submit}>
                <div>
                    <InputLabel htmlFor="name" value={__('Name')} />

                    <TextInput
                        id="name"
                        name="name"
                        value={data.name}
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused={true}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                    />

                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="email" value={__('Email')} />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="password" value={__('Password')} />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="mt-4">
                    <InputLabel
                        htmlFor="password_confirmation"
                        value={__('Confirm Password')}
                    />

                    <TextInput
                        id="password_confirmation"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        className="mt-1 block w-full"
                        autoComplete="new-password"
                        onChange={(e) =>
                            setData('password_confirmation', e.target.value)
                        }
                        required
                    />

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="mt-4">
                    <InputLabel htmlFor="country" value={__('Country / Currency')} />

                    <select
                        id="country"
                        name="country"
                        value={data.country}
                        className="mt-1 block w-full rounded-md border-zinc-300 bg-white shadow-sm focus:border-zinc-500 focus:ring-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        onChange={(e) => selectCountry(e.target.value)}
                        required
                    >
                        {countries.map((c) => (
                            <option key={c.code} value={c.code}>
                                {c.label}
                            </option>
                        ))}
                    </select>

                    <InputError
                        message={errors.country || errors.currency}
                        className="mt-2"
                    />
                </div>

                <div className="mt-6 space-y-5">
                    <Button type="submit" className="w-full" disabled={processing}>
                        {__('Create account')}
                    </Button>

                    <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {__('Already registered?')}{' '}
                        <Link
                            href={route('login')}
                            className="font-medium text-zinc-900 underline-offset-4 hover:underline dark:text-zinc-100"
                        >
                            {__('Sign in')}
                        </Link>
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
