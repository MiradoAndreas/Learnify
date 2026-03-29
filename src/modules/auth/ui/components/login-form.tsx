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
import { useState } from "react";


const loginSchema = z.object({
  email: z.email("Please enter a valid email adress"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
interface LoginProps {
  onSuccess: () => void;
  onSwitch: () => void;
}
export function LoginForm({ onSuccess, onSwitch }: LoginProps) {
  const router = useRouter();
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  const [isSocialPending, setIsSocialPending] = useState(false);

  const onSubmit = async (values: LoginFormValues) => {
    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
        callbackURL: "/",
      },
      {
        onSuccess: () => {
          router.push("/");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
    // todos : remove this thing when the router.push is enough
    onSuccess();
  };

  const isPending = form.formState.isSubmitting;

  const onSocial = async (provider: "github" | "google" | "linkedin") => {
    toast.loading(`Redirecting to ${provider}`)
    setIsSocialPending(true);
    await authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
      },
      {
        // todos: add is pending here when the user wait
        onSuccess: () => {
          setIsSocialPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      }
    );
    onSuccess();
  };

  return (
    <>
      <Card className="shadow-none  border-none py-0 gap-4 -mx-6 ">
        <CardHeader className="text-center gap-0">
          <CardTitle className="text-lg font-bold text-black/80">
            Sign in to <span className="text-[#ffa041]">Learnify</span>🙌
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Welcome back! Please sign in to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="flex flex-col gap-2">
                  {/* //todo: add the last used later  */}
                  <Button
                    variant="outline"
                    className="w-full"
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
                    <span className="text-xs text-muted-foreground">
                      Continue with Goggle
                    </span>
                  </Button>
                  <div className="flex gap-x-1 w-full">
                    <Button
                      variant="outline"
                      className="w-1/2"
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
                      className="w-1/2"
                      type="button"
                      size="sm"
                      disabled={isPending}
                    >
                      <Image
                        alt="Github"
                        src="/logos/linkedin.svg"
                        width={15}
                        height={15}

                      />
                    </Button>
                  </div>
                </div>
                <div className="relative">
                  <Separator />
                  <span className="absolute -top-2.5 z-10 bg-background left-[50%] text-xs text-muted-foreground">
                    or
                  </span>
                </div>
                <div className="grid gap-3.5">
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
                  <Button
                    variant="bgrey"
                    type="submit"
                    size="sm"
                    className="mt-2 w-full"
                    disabled={isPending}
                  >
                    {isPending && <Spinner className="mr-2 w-4 h-4" />} Login{" "}
                    <Image
                      alt="play"
                      src="/logos/play3.svg"
                      className="mt-0.5"
                      width={7}
                      height={7}
                    />
                  </Button>
                </div>

                <div className="text-center relative border-t-3 -mx-6 p-3  -mb-7 pb-9  rounded-b-xl  text-xs text-muted-foreground ">
                  Don't have an account?{" "}
                  <span
                    className="hover:underline cursor-pointer hover:underline-offset-4 font-bold text-primary/90"
                    onClick={onSwitch}
                  >
                    Sign up
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
