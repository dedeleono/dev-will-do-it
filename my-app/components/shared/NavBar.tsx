"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/utils/common";

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation";
import { Button } from "../ui/button";
import WalletMultiButtonStyled from "../ui/walletBtn";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";

import { FaTelegramPlane } from "react-icons/fa";
import { RiTwitterXFill } from "react-icons/ri";
import { MdPersonOutline } from "react-icons/md";
import { Logo } from "@/public/imgs";
import { IoIosMenu } from "react-icons/io";
import { TfiClose } from "react-icons/tfi";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export default function NavigationMenuDemo() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <React.Fragment>
            <NavigationMenu className="font-talk items-center py-3 w-full justify-center !rounded-none ">
                <div className="list-none flex-row items-center justify-center px-5 w-full hidden md:flex">
                    {/*m750:max-w-[300px] */}
                    <div className="flex flex-row flex-grow">
                        <NavigationMenuItem>
                            <NavigationMenuLink
                                className={navigationMenuTriggerStyle()}
                            >
                                <span className="text-xs cursor-pointer">
                                    How it works?
                                </span>
                            </NavigationMenuLink>
                        </NavigationMenuItem>

                        <NavigationMenuItem className="relative">
                            <NavigationMenuTrigger className="text-xs">
                                <span className="m750:hidden">Resources</span>
                            </NavigationMenuTrigger>
                            <NavigationMenuContent className="absolute left-0 mt-1">
                                <ul className="grid gap-3 p-6 grid-cols-1 w-[275px] bg-white shadow-lg rounded-md">
                                    <ListItem
                                        target="_blank"
                                        href=""
                                        title="Create a website"
                                    />
                                    <ListItem
                                        target="_blank"
                                        href=""
                                        title="Marketing"
                                    />
                                </ul>
                            </NavigationMenuContent>
                        </NavigationMenuItem>

                        <NavigationMenuItem>
                            <Button
                                size={"icon"}
                                className="mr-2 bg-transparent"
                            >
                                <FaTelegramPlane />
                            </Button>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Button
                                size={"icon"}
                                className="ml-2 bg-transparent"
                            >
                                <RiTwitterXFill />
                            </Button>
                        </NavigationMenuItem>
                    </div>
                    {/*Middle*/}
                    <div className="col-span-2 justify-self-center self-center">
                        <NavigationMenuItem className="w-full cursor-pointer">
                            <Link href="/" className="">
                                <Image
                                    alt="logo"
                                    src={Logo}
                                    width={80}
                                    height={80}
                                />
                            </Link>
                        </NavigationMenuItem>
                    </div>
                    {/*Middle*/}
                    <div className=" flex flex-row flex-grow justify-end">
                        <NavigationMenuItem>
                            <Link href="/create-token">
                                <Button
                                    size={"lg"}
                                    className="bg-transparent px-4"
                                >
                                    Create Token
                                </Button>
                            </Link>
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <WalletMultiButtonStyled className="bg-transparent px-0 mx-3" />
                        </NavigationMenuItem>
                        <NavigationMenuItem>
                            <Link href="/profile">
                                <Button
                                    size={"icon"}
                                    className="bg-transparent"
                                >
                                    <MdPersonOutline />
                                </Button>
                            </Link>
                        </NavigationMenuItem>
                    </div>
                </div>
                <div className="md:hidden flex">
                    <NavigationMenuList className="w-screen min-w-screen flex justify-between items-center px-3">
                        {/*m750:max-w-[300px] */}

                        {/*Middle*/}

                        <NavigationMenuItem className="min-w-1/2 cursor-pointer">
                            <Link href="/" className="">
                                <Image
                                    alt="logo"
                                    src={Logo}
                                    className="size-1/2"
                                />
                            </Link>
                        </NavigationMenuItem>

                        <div className="min-full flex md:hidden items-center gap-x-2">
                            <WalletMultiButtonStyled className="bg-transparent h-9 w-auto sm:flex hidden" />
                            <NavigationMenuItem className="w-full justify-between flex flex-row items-center ">
                                <Link href="/create-token">
                                    <Button
                                        size={"sm"}
                                        className="bg-transparent text-sm py-1"
                                    >
                                        Create Token +
                                    </Button>
                                </Link>
                            </NavigationMenuItem>
                            <NavigationMenuItem className="px-3">
                                <Button
                                    onClick={() => setIsOpen(true)}
                                    size={"icon"}
                                    className="bg-transparent"
                                >
                                    <IoIosMenu />
                                </Button>
                            </NavigationMenuItem>
                        </div>

                        {/*Middle*/}
                    </NavigationMenuList>
                </div>
            </NavigationMenu>

            {/* MOBILE */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ translateY: "100%" }}
                        animate={{ translateY: "0%" }}
                        exit={{ translateY: "100%" }}
                        transition={{ type: "tween", ease: "easeInOut" }}
                        className="fixed inset-0 z-[99] bg-background backdrop-blur-md lg:hidden flex flex-col w-full"
                    >
                        <div className="relative w-full flex items-center justify-between p-2 border-b-[1px]">
                            <Button
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="bg-background ml-2 flex"
                            >
                                <TfiClose className="text-md text-red-600 " />
                            </Button>

                            <Link href="/" className="flex w-auto mr-1">
                                <Image
                                    alt="logo"
                                    src={Logo}
                                    width={65}
                                    height={65}
                                />
                            </Link>
                        </div>

                        <div className="overflow-y-hidden w-full flex items-center flex-col justify-center ">
                            <NavigationMenu
                                id="mobile"
                                className="h-full min-h-[75vh] font-talk items-center justify-center w-full min-w-full !shadow-none border-none"
                            >
                                <NavigationMenuList className="flex w-full flex-col items-center h-full ">
                                    <div className="flex flex-col w-full">
                                        <NavigationMenuItem>
                                            <NavigationMenuLink>
                                                <span className="text-sm cursor-pointer">
                                                    How it works?
                                                </span>
                                            </NavigationMenuLink>
                                        </NavigationMenuItem>

                                        <NavigationMenuItem className="">
                                            <Accordion
                                                type="single"
                                                collapsible
                                                defaultValue="item-1"
                                            >
                                                <AccordionItem value="item-1">
                                                    <AccordionTrigger className="max-w-[150px]">
                                                        <label className="font-semibold !no-underline">
                                                            Resources
                                                        </label>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="bg-main rounded-md">
                                                        <ul className="p-1 w-auto flex flex-col rounded-md">
                                                            <ListItem
                                                                target="_blank"
                                                                href=""
                                                                title="Create a website"
                                                            />
                                                            <ListItem
                                                                target="_blank"
                                                                href=""
                                                                title="Marketing"
                                                            />
                                                        </ul>
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </NavigationMenuItem>

                                        <div className="flex flex-row w-full my-8 justify-between">
                                            <NavigationMenuItem>
                                                <Button
                                                    size={"icon"}
                                                    className=" bg-transparent"
                                                >
                                                    <FaTelegramPlane />
                                                </Button>
                                            </NavigationMenuItem>
                                            <NavigationMenuItem>
                                                <Button
                                                    size={"icon"}
                                                    className=" bg-transparent"
                                                >
                                                    <RiTwitterXFill />
                                                </Button>
                                            </NavigationMenuItem>
                                            <NavigationMenuItem className="">
                                                <Link href="/profile">
                                                    <Button
                                                        size={"icon"}
                                                        className=" bg-transparent"
                                                    >
                                                        <MdPersonOutline />
                                                    </Button>
                                                </Link>
                                            </NavigationMenuItem>
                                        </div>
                                    </div>

                                    <NavigationMenuItem className="">
                                        <WalletMultiButtonStyled className="bg-transparent" />
                                    </NavigationMenuItem>
                                </NavigationMenuList>
                            </NavigationMenu>
                        </div>

                        <div className="grow" />
                    </motion.div>
                )}
            </AnimatePresence>
        </React.Fragment>
    );
}

const ListItem = React.forwardRef<
    React.ElementRef<"a">,
    React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
    return (
        <li>
            <NavigationMenuLink asChild>
                <a
                    ref={ref}
                    className={cn(
                        "hover:bg-accent block select-none space-y-1 rounded-base border-2 border-transparent p-3 leading-none no-underline outline-none transition-colors hover:border-black",
                        className
                    )}
                    {...props}
                >
                    <div className="text-sm font-heading leading-none">
                        {title}
                    </div>
                    <p className="text-muted-foreground font-base line-clamp-2 text-xs leading-snug">
                        {children}
                    </p>
                </a>
            </NavigationMenuLink>
        </li>
    );
});
ListItem.displayName = "ListItem";
