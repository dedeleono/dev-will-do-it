import CardStack from "@/components/shared/cardStack";
import React from "react";
import { Button } from "@/components/ui/button";
import { FaLongArrowAltRight } from "react-icons/fa";
import Leaderboard from "@/components/Leaderboard";
import DynamicTables from "@/components/LatestTables";

import Search from "@/components/shared/searchBar";
import TokenCardsGrid from "@/components/TokenCardsGrid";

//Cards Dummy Data:

const cards = {
  name: "TrumpWifHat",
  ticker: "$THJ",
  dev: "invader999",
  level: "level 99",
  holders: "500",
  volume: "$250k",
  likes: "56",
  completion: "75%",
};

{
  /* @todo integrate actual data from DB */
}

export default function Home() {
  return (
    <main className="flex size-full flex-col md:px-16 px-6 font-talk">
      <div className="flex flex-row size-full items-center justify-between mt-10 mb-3">
        <h2 className="md:text-4xl text-lg flex md:flex-row flex-col">
          Top Dev <span className="flex">Leaderboard</span>
        </h2>
        <Button size={"lg"} className="bg-transparent hidden md:flex">
          Top Users <FaLongArrowAltRight className="ml-3" />
        </Button>
        <Button size={"sm"} className="bg-transparent flex md:hidden text-xs">
          Top Users <FaLongArrowAltRight className="ml-3" />
        </Button>
      </div>
      <div className="flex items-center rounded-md w-full font-montserrat my-6">
        {/* <SearchIcon className="size-5 text-gray-800 mx-3" />
        <Input
          type="text"
          placeholder="Search by symbol, name, token or contract address (CA)"
          style={searchStyle}
          className="flex-1 w-full font-talk leading-none text-xs placeholder-gray-200 focus:outline-none"
        /> */}
        <Search />
      </div>

      <div className="flex flex-col items-center size-full justify-center">
        <CardStack />
        <Leaderboard />
      </div>

      <DynamicTables />
      <TokenCardsGrid/>
    </main>
  );
}
