"use client";
/* Nextjs */
import Image from "next/image";
/* trpc */
import { trpc } from "@/app/_trpc/client";
/* React */
import { useState } from "react";
import {
  SubmitHandler,
  useForm,
  useController,
  UseControllerProps,
  useFieldArray,
  FormProvider,
} from "react-hook-form";
/* Shadcn */
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
/* dependencies */
import FileUploader from "@/components/shared/fileUploader";
import { AiOutlineEdit } from "react-icons/ai";
import { cn } from "@/utils/common";
import { useWallet } from "@solana/wallet-adapter-react";
import { FormInput } from "@/components/shared/FormInput";
import { ErrorMessage } from "@hookform/error-message";
import bs58 from "bs58";
import { FaPlus } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import classNames from "classnames";
import { set } from "lodash";
/* Project Types */
import type { socialType } from "@/types/index";
import { socialRules } from "@/utils/socialImages";
import { RingsLoader } from "@/components/shared/Loaders";

type Social = {
  social_type: string;
  social_link: string;
};

export type FotoEditProps = NewFotoEditComponent & {
  userRefetch?: () => void;
};

type NewFotoEditComponent = {
  image?: FileList | null;
  username?: string | null;
  bio?: string | null;
  socials?: Social[] | null;
};

export default function FotoEditComponent(props: FotoEditProps) {
  const [twitter, setTwitter] = useState(false);
  const [website, setWebsite] = useState(false);
  const [tiktok, setTiktok] = useState(false);
  const [instagram, setInstagram] = useState(false);
  const [telegram, setTelegram] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const wallet = useWallet();

  const { mutate: updateUser } = trpc.updateUser.useMutation();
  const utils = trpc.useUtils();

  const methods = useForm<NewFotoEditComponent>({
    defaultValues: {
      image: null,
      username: "",
      bio: "",
      socials: [],
    },
    mode: "onBlur",
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = methods;

  console.log({ errors });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socials",
  });

  const checkUsernameExists = async (username: string) => {
    if (!username) return false;
    const exists = await utils.checkUserExists.fetch({ username });
    return exists;
  };

  register("image", {
    validate: {
      lessThan4MB: (fileList) => {
        if (!fileList || fileList.length !== 1) return true;
        return (
          (fileList[0]?.size || 4000000) / 1024 / 1024 <= 4.5 ||
          "File size must be less than 4MB"
        );
      },
      imageFormat: (fileList) => {
        if (!fileList || fileList.length !== 1) return true;
        // validate that image format is any image format using regex
        return (
          /^image\/(jpeg|png|gif|webp|bmp|svg\+xml)$/i.test(
            fileList[0]?.type || ""
          ) || "File must be an image"
        );
      },
    },
  });

  const onSubmit: SubmitHandler<NewFotoEditComponent> = async (data) => {
    setUpdating(true);
    const signatureTime = Math.floor(new Date().getTime() / 1000);
    if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
      return;
    }
    const socials = data.socials?.map(
      (social) => `${social.social_type}:${social.social_link}`
    );
    const edits = {
      newUserName: data.username || undefined,
      newImage: data.image ? "" : undefined,
      newSocials: socials || undefined,
      newBio: data.bio || undefined,
      dateAndTime: signatureTime,
    };
    const walletPk = wallet.publicKey;

    const file = data.image?.[0];
    if (!file || !file.type.includes("image")) {
      const signature = await wallet
        .signMessage(
          new TextEncoder().encode(
            JSON.stringify({
              message: "I acknowledge that I want to edit my user with",
              edits,
            })
          )
        )
        .catch(() => {
          setUpdating(false);
          return null;
        });
      if (!signature) {
        setUpdating(false);
        return;
      }
      updateUser(
        {
          wallet: walletPk.toBase58(),
          signatureTime,
          updateSignature: bs58.encode(signature),
          image: null,
          imageFormat: "jpg",
          username: data.username,
          bio: data.bio,
          socials: socials,
        },
        {
          onSuccess: () => {
            props.userRefetch?.();
            setIsDialogOpen(false);
            setUpdating(false);
          },
        }
      );

      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = async (e) => {
      if (!wallet.connected || !wallet.publicKey || !wallet.signMessage) {
        return;
      }
      const base64 = reader.result?.toString();

      const base64Regex = base64?.replace(/^data:image\/\w+;base64,/, "");
      const fileType = file.type.split("/")[1];
      edits.newImage = "new." + fileType;
      const signature = await wallet
        .signMessage(
          new TextEncoder().encode(
            JSON.stringify({
              message: "I acknowledge that I want to edit my user with",
              edits,
            })
          )
        )
        .catch(() => {
          setUpdating(false);
          return null;
        });
      if (!signature) {
        setUpdating(false);
        return;
      }

      updateUser(
        {
          wallet: walletPk.toBase58(),
          signatureTime,
          updateSignature: bs58.encode(signature),
          image: base64Regex,
          imageFormat: fileType,
          username: data.username,
          bio: data.bio,
          socials: socials,
        },
        {
          onSuccess: () => {
            props.userRefetch?.();
            setIsDialogOpen(false);
            setUpdating(false);
          },
        }
      );
    };
  };
  const addbadge = (social: string) => {
    if (social === "twitter") {
      setTwitter(false);
    }
    if (social === "website") {
      setWebsite(false);
    }
    if (social === "tiktok") {
      setTiktok(false);
    }
    if (social === "instagram") {
      setInstagram(false);
    }
    if (social === "telegram") {
      setTelegram(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger className="absolute right-0 bottom-5">
        <Button
          className="border-2 border-black rounded-xl  px-2 bg-white h-8 "
          onClick={() => setIsDialogOpen(true)}
        >
          <AiOutlineEdit className="text-base font-bold" />
        </Button>
      </DialogTrigger>
      <DialogContent className="px-0 w-full">
        <div className="flex flex-col items-center overflow-auto max-h-[80vh] w-full px-5">
          <DialogHeader className="self-start pb-5">
            <DialogTitle>Change Image</DialogTitle>
            <DialogDescription>
              Change your profile image by uploading a new one
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full">
              <div className="flex justify-center flex-col w-full pb-5">
                <div className="flex justify-center w-full">
                  <FileUploader
                    name="image"
                    setValue={setValue}
                    value={watch("image") || null}
                    error={errors.image?.message}
                  />
                </div>
              </div>
              <FormInput
                label="Name (optional)"
                placeholder="pepe_xyz"
                fieldName="username"
                rules={{
                  validate: {
                    checkUnique: async (value) => {
                      if (value.length == 0 || !value) return true;
                      if (value.length < 4)
                        return "Username under 4 characters";
                      const exists = await checkUsernameExists(value);
                      return !exists || "Username already exists";
                    },
                  },
                }}
              />
              <div className="pb-5 w-full">
                <label className="font-semibold text-base">Bio</label>
                <Textarea
                  className="placeholder:font-talk placeholder:text-black/15 border-2 border-black"
                  {...register("bio", {
                    validate: {
                      minLength: (val) =>
                        (val && (val.length === 0 || val.length > 15)) ||
                        "Invalid Length",
                    },
                  })}
                  placeholder="As a dev I will ..."
                />
                {errors && (
                  <label className="text-red-500 text-xs py-2">
                    {errors.bio?.message}
                  </label>
                )}
              </div>
              <div className="w-full flex flex-col items-center ">
                <label className="font-semibold text-base pr-5  self-start">
                  Socials
                </label>
                <div className="flex gap-1  w-full flex-wrap">
                  <Badge
                    onClick={() => {
                      setTwitter(true);
                      append({ social_type: "twitter", social_link: "" });
                    }}
                    className={classNames("max-h-10", twitter ? "hidden" : "")}
                  >
                    <label className="pr-1">Twitter</label>
                    <FaPlus className="max-w-[20px]" />
                  </Badge>
                  <Badge
                    onClick={() => {
                      setWebsite(true);
                      append({ social_type: "website", social_link: "" });
                    }}
                    className={classNames("max-h-10", website ? "hidden" : "")}
                  >
                    <label className="pr-1">Website</label>
                    <FaPlus className="max-w-[20px]" />
                  </Badge>
                  <Badge
                    onClick={() => {
                      setTiktok(true);
                      append({ social_type: "tiktok", social_link: "" });
                    }}
                    className={classNames("max-h-10", tiktok ? "hidden" : "")}
                  >
                    <label className="pr-1">Tiktok</label>
                    <FaPlus className="max-w-[20px]" />
                  </Badge>
                  <Badge
                    onClick={() => {
                      setInstagram(true);
                      append({ social_type: "instagram", social_link: "" });
                    }}
                    className={classNames(
                      "max-h-10",
                      instagram ? "hidden" : ""
                    )}
                  >
                    <label className="pr-1">Instagram</label>
                    <FaPlus className="max-w-[20px]" />
                  </Badge>
                  <Badge
                    onClick={() => {
                      setTelegram(true);
                      append({ social_type: "telegram", social_link: "" });
                    }}
                    className={classNames("max-h-10", telegram ? "hidden" : "")}
                  >
                    <label className="pr-1">Telegram</label>
                    <FaPlus className="max-w-[20px]" />
                  </Badge>
                </div>
              </div>
              <div className="w-full pt-5 pb-5">
                {fields
                  ? fields.map((field, i) => {
                      return (
                        <div
                          key={`social_${i}`}
                          className="flex gap-2 items-center"
                        >
                          <label className="basis-20 capitalize">
                            {field.social_type}
                          </label>
                          <div className="flex-1">
                            <FormInput
                              label="Link"
                              placeholder="github.com/pepe_xyz"
                              fieldName={`socials[${i}].social_link`}
                              rules={{
                                minLength: 5,
                                pattern: {
                                  value:
                                    socialRules[
                                      field.social_type as socialType
                                    ],
                                  message: `Invalid ${field.social_type} link`,
                                },
                              }}
                            />
                          </div>
                          <Button
                            type="button"
                            onClick={() => {
                              addbadge(field.social_type);
                              remove(i);
                            }}
                            className="max-h-7 bg-[#F52718] text-white px-1 py-0"
                          >
                            <IoClose />
                          </Button>
                        </div>
                      );
                    })
                  : null}
              </div>
              <DialogFooter className=" flex justify-end">
                <Button
                  type="submit"
                  className={classNames(errors ? "disabled" : "block")}
                  disabled={
                    updating ||
                    !!errors.username ||
                    !!errors.bio ||
                    !!errors.image ||
                    !!errors.socials ||
                    !(
                      (watch("username")?.length || 0) > 4 ||
                      (watch("bio")?.length || 0) > 15 ||
                      (watch("socials")?.length || 0) > 0 ||
                      (watch("image")?.length || 0) > 0
                    )
                  }
                >
                  {updating ? <RingsLoader className="stroke-black" /> : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </div>
      </DialogContent>
    </Dialog>
  );
}
