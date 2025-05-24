import Image from "next/image";
import { StaticImageData } from "next/image";

export const MedalComponent = ({
  multipliyer,
  image,
}: {
  multipliyer: string;
  image: StaticImageData;
}) => {
  return (
    <li className="flex flex-col items-center justify-end">
      <div className="min-h-[75px] flex items-end">
        <Image src={image} alt={multipliyer} className="max-w-[60px]" />
      </div>
      <p>x{multipliyer}</p>
    </li>
  );
};
