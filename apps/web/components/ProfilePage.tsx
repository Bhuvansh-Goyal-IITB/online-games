"use client";

import { updateUserDisplayName } from "@/lib";
import FormError from "@ui/components/form-error";
import { ProfileForm } from "@ui/components/profile-form";
import { ProfileType } from "@ui/schema";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { FC, useState } from "react";

interface ProfilePageProps {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
}

const ProfilePage: FC<ProfilePageProps> = ({ id, name, email, image }) => {
  const session = useSession();
  const [errorMessage, setErrorMessage] = useState(
    name ? undefined : "Please provide a Display Name"
  );
  const router = useRouter();

  const onSubmit = (data: ProfileType) => {
    setErrorMessage("");
    updateUserDisplayName(id, data.displayName)
      .then((user) => {
        router.push("/");
        session.update({ user });
      })
      .catch((err) => {
        if (err.message.includes("UNIQUE")) {
          if (err.message.includes("users.email")) {
            setErrorMessage("Email already registered");
          } else {
            setErrorMessage("Display name already registered");
          }
        } else {
          setErrorMessage("Something went wrong");
        }
      });
  };

  return (
    <ProfileForm
      defaultValues={{
        displayName: name,
        email,
        image,
      }}
      onSubmit={onSubmit}
    >
      <FormError errorMessage={errorMessage} />
    </ProfileForm>
  );
};

export default ProfilePage;
