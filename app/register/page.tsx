"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppStore } from '@/app/store/store';
import { authService } from '@/lib/services/api';
import { useToast } from '@/components/ui/toast-context';
import { Eye, EyeOff, Mail, Lock, User, Upload } from 'lucide-react';

const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-z][a-z0-9]*$/, 'Username must start with a letter and contain only lowercase letters and numbers'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  profile_image: z.any().optional(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { isAuthenticated, setAuth } = useAppStore();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  // Watch for file changes to create preview
  const profileImageValue = watch('profile_image');
  
  useEffect(() => {
    if (profileImageValue && profileImageValue[0]) {
      const file = profileImageValue[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [profileImageValue]);

  useEffect(() => {
    // If user is already authenticated, redirect to home
    if (isAuthenticated) {
      router.push('/home');
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      
      const formData = {
        username: data.username,
        email: data.email,
        password: data.password,
        profile_image: data.profile_image?.[0] || null,
      };
      
      const response = await authService.register(formData);
      
      addToast({
        title: 'Success',
        description: 'Account created successfully',
        variant: 'default',
      });
      
      // Login the user automatically
      try {
        const loginResponse = await authService.login({
          email: data.email,
          password: data.password,
        });
        
        // Store auth data in Zustand store
        setAuth(loginResponse.user, loginResponse.access_token);
        
        // Redirect to home page
        router.push('/home');
      } catch (loginError) {
        // If auto-login fails, redirect to login page
        router.push('/');
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      addToast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to register. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setValue('profile_image', e.dataTransfer.files);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-8 rounded-xl border bg-white p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Create an account</h1>
          <p className="mt-2 text-sm text-gray-600">Sign up to get started with our platform</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="space-y-4">
            {/* Profile Image Upload */}
            <div className="space-y-2">
              <Label htmlFor="profile_image" className="text-sm font-medium">
                Profile Image (Optional)
              </Label>
              <div 
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:bg-gray-50'}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {previewImage ? (
                  <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border">
                    <Image
                      src={previewImage}
                      alt="Profile preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                    <Upload className="h-6 w-6 text-gray-500" />
                  </div>
                )}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Drag and drop your image here, or
                  </p>
                  <label htmlFor="profile_image_input" className="mt-2 inline-block cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200">
                    Browse files
                    <Input
                      id="profile_image_input"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register('profile_image')}
                    />
                  </label>
                </div>
              </div>
            </div>
            
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                Username
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="username"
                  type="text"
                  placeholder="username"
                  className="pl-10"
                  {...register('username')}
                />
              </div>
              {errors.username && (
                <p className="text-sm text-red-500">{errors.username.message}</p>
              )}
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Email address
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            
            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10"
                  {...register('password')}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
          </div>
          
          <Button
            type="submit"
            className="w-full py-6 text-base font-medium"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </div>
            ) : (
              'Create account'
            )}
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-gray-500">Or continue with</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-12">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </Button>
            <Button variant="outline" className="h-12">
              <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" fill="#1877F2" />
              </svg>
              Facebook
            </Button>
          </div>
          
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link href="/" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
} 