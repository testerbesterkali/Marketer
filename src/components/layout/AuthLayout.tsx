import React from 'react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen w-full flex bg-[#F8F9FB]">
            {/* Left Side - Form */}
            <div className="flex-1 flex flex-col justify-center px-12 lg:px-24">
                <div className="max-w-md w-full mx-auto space-y-8">
                    <div>
                        <div className="h-10 w-10 bg-indigo-600 rounded-lg flex items-center justify-center mb-8">
                            <span className="text-white font-bold text-xl">B</span>
                        </div>
                        <h2 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h2>
                        <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
                    </div>
                    {children}
                </div>
            </div>

            {/* Right Side - Visual/Marketing */}
            <div className="hidden lg:flex flex-1 bg-indigo-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 to-indigo-800 opacity-90" />
                <div className="relative z-10 flex flex-col items-center justify-center text-white px-12 text-center space-y-8">
                    <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                        <div className="w-64 h-48 bg-white/20 rounded-xl" />
                    </div>
                    <div className="max-w-md">
                        <h3 className="text-4xl font-bold mb-4">Transform your brand with AI.</h3>
                        <p className="text-lg text-indigo-100">
                            BrandForge AI turns your website URL into a complete content strategy in minutes.
                        </p>
                    </div>
                </div>

                {/* Subtle decorative circles */}
                <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/5 rounded-full blur-3xl" />
            </div>
        </div>
    );
};
