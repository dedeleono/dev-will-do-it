import type { socialType } from "@/types/index";
import { socialImages } from "@/utils/socialImages";

export const SocialsComponent = (props: { type: string; url: string }) => {
  return (
    <a
      href={props.url}
      rel="noreferrer"
      target="_href"
      className="text-4xl md:text-5xl"
    >
      {socialImages[props.type as socialType]}
    </a>
  );
};
