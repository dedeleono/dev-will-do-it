import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChatArea from "@/components/shared/chatArea";
import Txs from "@/components/Transactions";
import DataSetup from "./_components/DataSetup";
import RaiseDataStrip from "./_components/RaiseDataStrip";
import BuySellBox from "./_components/BuySellBox";
import TokenStats from "./_components/TokenStats";
import Icons from "./_components/Icons";
import CopyToClipboard from "./_components/CopyToClipboard";
import GraphHeaderLayout from "./_components/GraphHeaderSharedLayout";
import TokenInfo from "./_components/TokenInfo";
import TopTenHolders from "./_components/TopTenHolders";
import getUrl from "@/utils/urls";

export default async function TokenPage({
  params,
}: {
  params: { token: string };
}) {
  const token = params.token;

  let data;
  try {
    const response = await fetch(
      getUrl(
        `/api/trpc/getTokenInfo?batch=1&input=%7B%220%22%3A%22${token}%22%7D`
      ),
      {
        next: {
          revalidate: 15,
        },
      }
    );

    const jsonData = await response.json();
    data = jsonData[0].result.data;
  } catch (error) {
    console.error("Error fetching token data:", error);
  }

  const mint = data?.token_mint_address;

  const socials = data?.socials;

  const refLink = "https://devwilldoit.com/jeff450";

  return (
    <main className="size-full md:px-16 px-6 font-talk grid md:grid-cols-12 gap-3">
      <DataSetup
        tokenAddress={token}
        name={data?.token_name}
        symbol={data?.token_ticker}
        creatorWallet={data?.users?.wallet}
        creatorName={data?.users?.username}
        creatorAvatar={data?.users?.profile_img}
      />
      {/**First section */}
      <div className="size-full md:col-span-8 col-span-1 min-w-full flex flex-col mt-5 relative">
        <GraphHeaderLayout
          name={data?.token_name}
          symbol={data?.token_ticker}
          tokenAddress={data?.token_mint_address}
          creatorWallet={data?.users?.wallet}
          creatorName={data?.users?.username}
          creatorAvatar={data?.users?.profile_img}
          topDevTime={data?.top_dev_time}
        />
        <RaiseDataStrip tokenAddress={token} />
        <div className="min-w-full mt-16 md:flex hidden">
          <Tabs
            defaultValue={"chat"}
            className="min-w-full w-full flex flex-col"
            id="chatTabs"
          >
            <div className="min-w-full flex justify-center">
              <TabsList className="bg-background ">
                <TabsTrigger
                  value="chat"
                  className={`h-full text-foreground rounded-sm border-none`}
                >
                  Live Chat
                </TabsTrigger>
                <TabsTrigger
                  value={"txs"}
                  className={`h-full text-foreground rounded-sm border-none `}
                >
                  Transactions
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="chat" className="size-full relative">
              <div className="flex border-2 border-black/10 max-h-[calc(100vh_-_20vh)] rounded-md mt-3">
                <ChatArea latestChatTimestamp={0} mint={token} />
              </div>
            </TabsContent>
            <TabsContent value="txs" className="size-full relative">
              <Txs transactions={[]} ticker={data?.token_ticker} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/**Second section */}

      <div className="md:col-span-4 col-span-1 min-w-full mt-5 flex items-center flex-col min-h-full">
        <BuySellBox />
        <TokenInfo
          name={data?.token_name}
          ticker={data?.token_ticker}
          metadata_url={data?.metadata_url}
          img_url={data?.img_url}
        />
        <TokenStats />
        <CopyToClipboard link={refLink} />
        <TopTenHolders mintAddress={data?.token_mint_address} />
        <Icons socials={socials} />
        <div className="min-w-full mt-16 flex md:hidden pb-5">
          <Tabs
            defaultValue={"chat"}
            className="min-w-full w-full flex flex-col"
            id="chatTabs"
          >
            <div className="min-w-full flex justify-center">
              <TabsList className="bg-background ">
                <TabsTrigger
                  value="chat"
                  className={`h-full text-foreground rounded-sm border-none`}
                >
                  Live Chat
                </TabsTrigger>
                <TabsTrigger
                  value={"txs"}
                  className={`h-full text-foreground rounded-sm border-none `}
                >
                  Transactions
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="chat" className="size-full relative">
              <div className="flex rounded-md border-2 border-black">
                <ChatArea latestChatTimestamp={0} mint={token} />
              </div>
            </TabsContent>
            <TabsContent value="txs" className="size-full relative">
              <Txs transactions={[]} ticker={data?.token_ticker} />
            </TabsContent>
          </Tabs>
        </div>{" "}
      </div>
    </main>
  );
}
