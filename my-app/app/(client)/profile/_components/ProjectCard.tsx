import Image from "next/image";
import Link from "next/link";
import { FaChevronRight } from "react-icons/fa";

export const ProjectCard = ({
    image,
    name,
    link,
    key,
}: {
    image: string;
    name: string;
    link: string;
    key: string;
}) => {
    return (
        <li
            key={key}
            className="w-full hover:bg-gray-500/70 hover:text-white rounded-lg transition-all duration-300"
        >
            <Link
                href={link}
                className="flex justify-between w-full items-center px-4 py-2"
            >
                <div className="flex items-center gap-3">
                    <img
                        src={image}
                        alt={name}
                        className="max-w-[30px] rounded-lg"
                    />
                    <p className="text-sm">{name}</p>
                </div>
                <FaChevronRight />
            </Link>
        </li>
    );
};
