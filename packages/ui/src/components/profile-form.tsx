"use client";

import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@repo/ui/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProfileSchema, ProfileType } from "@ui/schema";
import { FC, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/ui/card";
import { Input } from "@repo/ui/components/ui/input";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import FormError from "./form-error";

interface ProfileFormProps {
  defaultValues: {
    id: string;
    email: string;
    image: string | null;
    displayName: string | null;
  };
  onSubmitAction: (
    id: string,
    displayName: string
  ) => Promise<{ error: string }>;
}

export const ProfileForm: FC<ProfileFormProps> = ({
  defaultValues,
  onSubmitAction,
}) => {
  const [errorMessage, setErrorMessage] = useState<string>();
  const [edit, setEdit] = useState(defaultValues.displayName ? false : true);

  const form = useForm<ProfileType>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      displayName: defaultValues.displayName ?? undefined,
    },
  });

  useEffect(() => {
    if (!defaultValues.displayName) {
      form.setFocus("displayName");
    }
  }, []);

  return (
    <Card className="min-w-[320px]">
      <CardHeader>
        <CardTitle className="text-xl">Profile</CardTitle>
        <CardDescription>Edit your profile</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((data) => {
              setErrorMessage("");
              onSubmitAction(defaultValues.id, data.displayName)
                .then((message) => {
                  if (message) {
                    setErrorMessage(message.error);
                  }
                })
                .catch((_err) => {
                  setErrorMessage("Something went wrong");
                });
            })}
          >
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input readOnly id="email" defaultValue={defaultValues.email} />
              </div>
              <div className="grid gap-2">
                <FormField
                  name="displayName"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input
                          readOnly={!edit}
                          placeholder="eg: Vishy"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormError errorMessage={errorMessage} />
              <div>
                {edit ? (
                  <div className="flex gap-2">
                    <Button
                      disabled={form.formState.isSubmitting}
                      type="submit"
                    >
                      Submit
                    </Button>
                    <Button
                      disabled={form.formState.isSubmitting}
                      variant="destructive"
                      onClick={() => {
                        form.resetField("displayName", {
                          defaultValue: defaultValues.displayName ?? "",
                        });
                        setEdit(false);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    disabled={form.formState.isSubmitting}
                    onClick={() => setEdit(true)}
                  >
                    Edit
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
