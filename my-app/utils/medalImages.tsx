/* Type */
import { MedalType } from "@/types";
/* Images */
import BCF from "@/public/imgs/medals/BCF.png";
import k100 from "@/public/imgs/medals/100K.png";
import k250 from "@/public/imgs/medals/250K.png";
import k500 from "@/public/imgs/medals/500K.png";
import m1 from "@/public/imgs/medals/1M.png";
import m10 from "@/public/imgs/medals/10M.png";
import m50 from "@/public/imgs/medals/50M.png";
import m100 from "@/public/imgs/medals/100M.png";
import m250 from "@/public/imgs/medals/250M.png";
import m500 from "@/public/imgs/medals/500M.png";
import b1 from "@/public/imgs/medals/1B.png";

import { StaticImageData } from "next/image";

export const medalImages: { [key in MedalType]: StaticImageData } = {
    bonding: BCF,
    "100k": k100,
    "250k": k250,
    "500k": k500,
    "1M": m1,
    "10M": m10,
    "50M": m50,
    "100M": m100,
    "250M": m250,
    "500M": m500,
    "1B": b1,
};
