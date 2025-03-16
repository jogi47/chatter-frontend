"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/app/store/store';
import { authService } from '@/lib/services/api';
import { useToast } from '@/components/ui/toast-context';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, setAuth } = useAppStore();
  const [showPassword, setShowPassword] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setIsSubmitting(true);
      const response = await authService.login(data);
      
      // Store auth data in Zustand store
      setAuth(response.user, response.access_token);
      
      addToast({
        title: 'Success',
        description: 'You have successfully logged in',
        variant: 'default',
      });
      
      // Redirect to home page
      router.push('/home');
    } catch (error: any) {
      console.error('Login error:', error);
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to login. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto flex min-h-screen items-center justify-center px-4 py-8">
        <div className="w-full max-w-[400px] overflow-hidden rounded-2xl bg-gray-800/50 backdrop-blur-xl">
          <div className="relative p-8">
            {/* Decorative elements */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gray-800/20" />
            <div className="absolute -left-32 -top-32 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl" />
            <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
            
            {/* Content */}
            <div className="relative space-y-8">
              {/* Header */}
              <div className="space-y-2 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-900/50">
                  <Lock className="h-10 w-10 text-blue-400" />
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white">Welcome back</h1>
                <p className="text-gray-400">Sign in to your account to continue</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Email field */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-200">
                    Email address
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="border-gray-700 bg-gray-800/50 pl-10 text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-400">{errors.email.message}</p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-200">
                      Password
                    </Label>
                    <Link 
                      href="/forgot-password"
                      className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="border-gray-700 bg-gray-800/50 pl-10 pr-10 text-gray-100 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                      {...register('password')}
                    />
                    <button 
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-300 transition-colors"
                      onClick={togglePasswordVisibility}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-400">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-500 py-6 text-base font-medium text-white transition-colors hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:bg-blue-500/50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing in...
                    </div>
                  ) : (
                    'Sign in'
                  )}
                </Button>

                {/* Register link */}
                <div className="text-center text-sm">
                  <span className="text-gray-400">Don't have an account?</span>{' '}
                  <Link 
                    href="/register" 
                    className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Create an account
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 