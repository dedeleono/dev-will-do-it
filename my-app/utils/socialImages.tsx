/* Type */
import { socialType } from "@/types/index";
/* Icons */
import { FaSquareXTwitter } from "react-icons/fa6";
import { FaTelegram } from "react-icons/fa";
import { FaGlobeAmericas } from "react-icons/fa";
import { FaTiktok } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";

export const socialImages: { [key in socialType]: JSX.Element } = {
  telegram: <FaTelegram />,
  website: <FaGlobeAmericas />,
  twitter: <FaSquareXTwitter />,
  tiktok: <FaTiktok />,
  instagram: <FaInstagram />,
};

export const socialRules: { [key in socialType]: RegExp } = {
  telegram: /^(https:\/\/)t\.me\/\S+$/,
  website:
    /^(https:\/\/)(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(?::[0-9]{1,5})?(?:\/)?$/i,
  twitter: /(https:\/\/)((x\.com)|(twitter\.com))\/\S+/,
  tiktok:
    /^(https:\/\/)(www\.)?tiktok\.com\/(@[a-zA-Z0-9_.]+|tag\/[a-zA-Z0-9_.]+)$/,
  instagram:
    /^(https:\/\/)(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(?::[0-9]{1,5})?(?:\/)?$/,
};
