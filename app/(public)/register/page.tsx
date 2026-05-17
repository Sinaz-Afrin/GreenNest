'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Spinner } from '@/components/ui/spinner';
import { Leaf } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = searchParams.get('role') as 'customer' | 'vendor' || 'customer';
  
  const { register, user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<'customer' | 'vendor'>(initialRole);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    businessName: '',
    address: '',
  });

  // Redirect if already logged in
  if (user) {
    const redirectPath = user.role === 'admin' ? '/admin/dashboard' : user.role === 'vendor' ? '/vendor/dashboard' : '/dashboard';
    router.push(redirectPath);
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role,
      businessName: role === 'vendor' ? formData.businessName : undefined,
      address: formData.address || undefined,
    });

    setIsLoading(false);

    if (result.success) {
      toast.success(result.message || 'Registration successful!');
      if (role === 'vendor') {
        router.push('/vendor/dashboard');
      } else {
        router.push('/dashboard');
      }
    } else {
      toast.error(result.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Leaf className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>Join GreenNest today</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="mb-6">
              <Tabs value={role} onValueChange={(v) => setRole(v as 'customer' | 'vendor')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="customer">Customer</TabsTrigger>
                  <TabsTrigger value="vendor">Vendor</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                <Input
                  id="name"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="At least 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  minLength={6}
                  required
                />
              </Field>
              {role === 'vendor' && (
                <Field>
                  <FieldLabel htmlFor="businessName">Business Name</FieldLabel>
                  <Input
                    id="businessName"
                    name="businessName"
                    placeholder="Your Garden Business"
                    value={formData.businessName}
                    onChange={handleChange}
                    required
                  />
                </Field>
              )}
              <Field>
                <FieldLabel htmlFor="address">Address (Optional)</FieldLabel>
                <Input
                  id="address"
                  name="address"
                  placeholder="123 Main Street, City"
                  value={formData.address}
                  onChange={handleChange}
                />
              </Field>
            </FieldGroup>

            {role === 'vendor' && (
              <div className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
                <p>Note: Vendor accounts require admin approval before you can start selling.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Spinner className="h-4 w-4" /> : 'Create Account'}
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Already have an account?{' '}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  );
}
