"use client";
/* Nextjs */
import Image from "next/image";
import { motion } from "framer-motion";

/* Shadcn */
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";

/* Dependencies */
import FotoEditComponent from "@/components/FotoEditComponent";
import { RingsLoader } from "@/components/shared/Loaders";

/* images */
import { placeholder } from "@/public/imgs";
import type { MedalType } from "@/types";
import { medalImages } from "@/utils/medalImages";
import { SocialsComponent } from "./SocialsComponent";
import { MedalComponent } from "./MedalComponent";
import { ProjectCard } from "./ProjectCard";

type Props = {
    isLoading: boolean;
    userData: any;
    refetch: any;
    isOwner: boolean;
};

export const PageBody = (props: Props) => {
    const { isLoading, userData, refetch, isOwner } = props;
    const {
        username: name,
        user_points: xp,
        dev_points: level,
        bio,
        socials: links,
        raises: projects,
        profile_img: profile_img,
    } = userData || {};
    return (
        <main className="flex flex-col items-center ">
            {isLoading ? (
                <div className="flex flex-col items-center py-10">
                    <RingsLoader className="stroke-black h-20  w-20" />
                </div>
            ) : (
                <motion.section
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center"
                >
                    <div className="md:max-w-[480px] flex flex-col items-center  px-5 py-5 w-full">
                        <h1 className="font-talk self-start text-4xl pb-5 lg:text-6xl">
                            Profile
                        </h1>
                        <div className="flex pb-8 lg:items-center lg:gap-5 relative ">
                            <div
                                className=" w-[225px] h-[225px] md:w-[328px] md:h-[328px] rounded-full border-2 border-black overflow-hidden  
              "
                            >
                                {profile_img ? (
                                    <img
                                        src={profile_img}
                                        alt="Profile"
                                        className=" 
                     w-full h-full object-cover "
                                    />
                                ) : (
                                    <Image
                                        src={placeholder}
                                        alt="Profile"
                                        className="rounded-full border-2 border-black 
                       w-full h-full object-cover"
                                    />
                                )}
                            </div>

                            {isOwner ? (
                                <FotoEditComponent
                                    image={null}
                                    userRefetch={refetch}
                                />
                            ) : null}
                        </div>
                        <div className="flex flex-col items-center w-full">
                            <Tabs
                                defaultValue="about"
                                className="flex flex-col items-center w-full"
                            >
                                <TabsList className="bg-white h-8 rounded-lg">
                                    <TabsTrigger
                                        value="about"
                                        className="h-full px-5 min-w-[100.58px]"
                                    >
                                        About
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="projects"
                                        className="h-full px-5"
                                    >
                                        Projects
                                    </TabsTrigger>
                                </TabsList>
                                <TabsContent
                                    value="about"
                                    className="flex flex-col items-center"
                                >
                                    <div className="flex items-center gap-5 pb-3 pt-3">
                                        <h2 className="font-talk text-xl">
                                            {name}{" "}
                                        </h2>
                                        <p className="bg-gradient-red-yellow px-5 rounded-3xl">
                                            level {level}
                                        </p>
                                    </div>
                                    <div className="pb-3">
                                        <p className="text-lg font-bold">
                                            {xp} XP
                                        </p>
                                    </div>
                                    <div className="pb-5 w-full">
                                        <h2 className="text-xs font-work text-gray-text">
                                            Bio
                                        </h2>
                                        <p className="text-sm font-work">
                                            {bio}
                                        </p>
                                    </div>
                                    <div className="pb-5">
                                        <ul className="flex gap-4 max-w-[400px] flex-wrap justify-center">
                                            {/* {medals
                      ? [...medals].map((medal, i) => (
                          <MedalComponent multipliyer={medal.multiplier} image={medalImages[medal.name as MedalType]} />
                        ))
                      : null} */}
                                            <MedalComponent
                                                multipliyer="3"
                                                image={
                                                    medalImages[
                                                        "bonding" as MedalType
                                                    ]
                                                }
                                            />
                                        </ul>
                                    </div>
                                    <div className="w-full">
                                        <h2 className="text-xs font-work text-gray-text pb-3">
                                            Links
                                        </h2>
                                        <ul className="flex items-center justify-between">
                                            {links
                                                ? links.map(
                                                      (
                                                          link: string,
                                                          i: number
                                                      ) => {
                                                          const socialType =
                                                              link.split(
                                                                  ":"
                                                              )[0];
                                                          const url =
                                                              link.replace(
                                                                  `${socialType}:`,
                                                                  ""
                                                              );
                                                          return (
                                                              <li
                                                                  key={`link_${i}`}
                                                              >
                                                                  <SocialsComponent
                                                                      type={
                                                                          socialType
                                                                      }
                                                                      url={url}
                                                                  />
                                                              </li>
                                                          );
                                                      }
                                                  )
                                                : null}
                                        </ul>
                                    </div>
                                </TabsContent>
                                <TabsContent
                                    value="projects"
                                    className="w-full flex flex-col items-center pb-20"
                                >
                                    <div className="w-full">
                                        <ul className="w-full bg-gray-50/70 rounded-xl">
                                            {projects && projects.length > 0 ? (
                                                [...projects].map(
                                                    (project, i) => (
                                                        <ProjectCard
                                                            key={`project_${i}`}
                                                            image={
                                                                project.img_url
                                                            }
                                                            name={
                                                                project.token_name
                                                            }
                                                            link={`/token/${project.token_mint_address}`}
                                                            /*                           image={project.img_url}
                            name={project.token_name}
                            link={`${project.link}`} */
                                                        />
                                                    )
                                                )
                                            ) : (
                                                <li className="flex items-center w-full  py-2 justify-between">
                                                    <a
                                                        href="/create-token"
                                                        className="w-full"
                                                    >
                                                        <Button
                                                            onClick={() =>
                                                                console.log(
                                                                    "Create a project"
                                                                )
                                                            }
                                                            className="w-full text-black"
                                                        >
                                                            Create a project +
                                                        </Button>
                                                    </a>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                    </div>
                </motion.section>
            )}
        </main>
    );
};
