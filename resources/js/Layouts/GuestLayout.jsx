import BlurText from '@/Components/UI/BlurText';
import Brand from '@/Components/UI/Brand';
import DotGrid from '@/Components/UI/DotGrid';
import FlashToaster from '@/Components/UI/FlashToaster';
import LocaleSwitcher from '@/Components/UI/LocaleSwitcher';
import { useTranslations } from '@/utils/i18n';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children, title, subtitle }) {
    useTranslations();

    return (
        <div className="flex min-h-screen bg-white dark:bg-zinc-950">
            <FlashToaster />

            {/* Left: dark showcase panel */}
            <div className="relative hidden w-1/2 overflow-hidden bg-zinc-950 lg:block">
                {/* Interactive dot grid background */}
                <div className="absolute inset-0">
                    <DotGrid
                        dotSize={5}
                        gap={15}
                        baseColor="#27272a"
                        activeColor="#e4e4e7"
                        proximity={120}
                        shockRadius={250}
                        shockStrength={5}
                        resistance={750}
                        returnDuration={1.5}
                    />
                </div>
                {/* Soften the grid behind the copy */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent" />

                <div className="relative flex h-full flex-col justify-between p-12">
                    <Link href="/" className="text-xl text-white">
                        <Brand />
                    </Link>

                    <div>
                        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white">
                            <BlurText
                                text="One ledger,"
                                delay={120}
                                animateBy="words"
                                direction="top"
                            />
                            <BlurText
                                text="every currency."
                                delay={120}
                                animateBy="words"
                                direction="top"
                                className="text-zinc-400"
                            />
                        </h1>
                        <p className="mt-4 max-w-sm animate-fade-up text-sm leading-relaxed text-zinc-400">
                            Submit payment requests in your local currency — the EUR
                            exchange rate is locked the moment you hit send.
                        </p>
                    </div>

                    <p className="text-xs text-zinc-600">
                        Buzzvel 2026 Dev Team Test
                    </p>
                </div>
            </div>

            {/* Right: form */}
            <div className="relative flex w-full items-center justify-center px-6 py-12 lg:w-1/2">
                <div className="absolute right-6 top-6">
                    <LocaleSwitcher />
                </div>
                <div className="w-full max-w-sm animate-fade-up">
                    <Link href="/" className="text-xl text-zinc-900 dark:text-zinc-100 lg:hidden">
                        <Brand />
                    </Link>

                    {title && (
                        <div className="mb-8 mt-6 lg:mt-0">
                            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                                {title}
                            </h2>
                            {subtitle && (
                                <p className="mt-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                                    {subtitle}
                                </p>
                            )}
                        </div>
                    )}

                    {children}
                </div>
            </div>
        </div>
    );
}
