"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";
import { Separator } from "@/components/ui/separator";

const RegisterSchema = z
  .object({
    name: z.string().min(2, "Name is required"),
    email: z.email("Please enter a valid email adress"),
    password: z.string().min(1, "Password is required"),
    confirmPassword: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof RegisterSchema>;

interface RegisterFormProps {
  onSuccess: () => void;
  onSwitch: () => void;
}

export function RegisterForm({ onSuccess, onSwitch }: RegisterFormProps) {
  const router = useRouter();
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const isPending = form.formState.isSubmitting;

  const onSubmit = async (values: RegisterFormValues) => {
    await authClient.signUp.email(
      {
        name: values.name,
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        // todos: add isPending here when the user wait
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
    onSuccess();
  };

  const onSocial = async (provider: "github" | "google" | "linkedin") => {
    await authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
      },
      {
        // todos: add isPending here when the user wait
        onSuccess: () => {},
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
    onSuccess();
  };

  return (
    <>
      <Card className="shadow-none border-none py-0 gap-4 -mx-6">
        <CardHeader className="text-center gap-0">
          <CardTitle className="text-lg font-bold text-black/80">
            Create your <span className="text-[#ffa041]">account</span>🫡
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Welcome, please fill the details to continue
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                {/* OAuth */}
                <div className="flex gap-1 w-full">
                  <Button
                    variant="outline"
                    className="w-1/3"
                    size="sm"
                    type="button"
                    disabled={isPending}
                    onClick={() => onSocial("google")}
                  >
                    <Image
                      alt="Google"
                      src="/logos/google.svg"
                      width={15}
                      height={15}
                    />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-1/3"
                    type="button"
                    size="sm"
                    disabled={isPending}
                    onClick={() => onSocial("github")}
                  >
                    <Image
                      alt="Github"
                      src="/logos/github.svg"
                      width={15}
                      height={15}
                    />
                  </Button>
                  <Button
                    variant="outline"
                    className="w-1/3"
                    type="button"
                    size="sm"
                    disabled={isPending}
                  >
                    <Image
                      alt="Linkedin"
                      src="/logos/linkedin.svg"
                      width={15}
                      height={15}
                    />
                  </Button>
                </div>

                {/* Separator */}
                <div className="relative">
                  <Separator />
                  <span className="absolute -top-2.5 z-10 bg-background left-[50%] text-xs text-muted-foreground">
                    or
                  </span>
                </div>

                {/* Form */}
                <div className="grid gap-3.5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-gray-800 font-semibold">
                          Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="text-xs md:text-xs h-7.5"
                            placeholder="Enter your name"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-gray-800 font-semibold">
                          Email address
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            className="text-xs md:text-xs h-7.5"
                            placeholder="Enter your email address"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-gray-800 font-semibold">
                          Password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="text-xs md:text-xs h-7.5"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-gray-800 font-semibold">
                          Confirm password
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            className="text-xs md:text-xs h-7.5"
                            placeholder="Confirm your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />

                  <Button
                    variant="bgrey"
                    type="submit"
                    size="sm"
                    className="mt-2 w-full"
                    disabled={isPending}
                  >
                    {isPending && <Spinner className="mr-2 w-4 h-4" />} Continue
                    <Image
                      alt="play"
                      src="/logos/play3.svg"
                      className="mt-0.5"
                      width={7}
                      height={7}
                    />
                  </Button>
                </div>

                {/* Footer */}
                <div className="text-center relative border-t-3 -mx-6 p-3 -mb-7 pb-9 rounded-b-xl text-xs text-muted-foreground">
                  Already have an account?{" "}
                  <span
                    className="hover:underline cursor-pointer hover:underline-offset-4 font-bold text-primary/90"
                    onClick={onSwitch}
                  >
                    Login
                  </span>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
}
