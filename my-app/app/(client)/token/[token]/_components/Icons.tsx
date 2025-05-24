"use client"

import {
  IgIcon,
  TelegramIcon,
  TiktokIcon,
  TwitterIcon,
  WebIcon,
} from "@/components/shared/icons";

interface IconLinks {
    socials: any
}

export default function Icons({ socials }: IconLinks) {
  return (
    <div className="min-w-full w-full flex flex-row justify-between items-center my-5 px-1">
      <WebIcon
        onClick={() => window.open(`${socials[0].slice(8)}`, "_blank")}
        className="size-8 cursor-pointer"
      />
      <TelegramIcon
        onClick={() => window.open(`${socials[2].slice(9)}`, "_blank")}
        className="size-8 cursor-pointer"
      />
      <TwitterIcon
        onClick={() => window.open(`${socials[1].slice(8)}`, "_blank")}
        className="size-8 cursor-pointer"
      />
      <TiktokIcon
        onClick={() => window.open(`${socials[4].slice(7)}`, "_blank")}
        className="size-8 cursor-pointer"
      />
      <IgIcon
        onClick={() => window.open(`${socials[3].slice(10)}`, "_blank")}
        className="size-8 cursor-pointer"
      />
    </div>
  );
}
