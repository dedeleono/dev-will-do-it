"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { placeholder } from "@/public/imgs";
import { trpc } from "@/app/_trpc/client";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { format } from "date-fns/format";
import { useImmer } from "use-immer";

import WalletMultiButtonStyled from "@/components/ui/walletBtn";
import { ArrowDownNarrowWide, Loader2Icon } from "lucide-react";
import Link from "next/link";

const ChatArea = (props: { latestChatTimestamp: number; mint: string }) => {
  const fetchUtils = trpc.useUtils();
  const [message, setMessage] = useState("");
  const [chats, setChats] = useImmer<
    Awaited<ReturnType<typeof fetchUtils.getMessages.fetch>>["messages"]
  >([]);
  const [cursor, setCursor] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const wallet = useAnchorWallet();

  const scrollToBottom = () => {
    scrollRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const getChats = useCallback(
    async (cursor: number) => {
      const newChats = await fetchUtils.getMessages.fetch({
        mint: props.mint,
        cursor,
      });
      if (newChats.messages.length === 0 || newChats.cursor === 0) return;
      setChats((draft) => {
        draft.push(...newChats.messages);
      });
      setCursor(newChats.cursor);
    },
    [fetchUtils, props.mint, setChats, setCursor]
  );

  useEffect(() => {
    getChats(cursor);
    // scrollToBottom();
    const interval = setInterval(() => getChats(cursor), 5000);
    return () => clearInterval(interval);
  }, [getChats, cursor]);

  // Send message mutation
  const { mutate: sendMessage } = trpc.sendMessage.useMutation();

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    if (!wallet?.publicKey) {
      console.error("User data is missing, cannot send message.");
      return;
    }
    setIsSending(true);
    sendMessage(
      {
        message,
        wallet: wallet.publicKey.toBase58(),
        token: props.mint,
        cursor,
      },
      {
        onSuccess: (data) => {
          setChats((draft) => {
            draft.push(...data.pendingMessages);
          });
          setCursor(data.cursor);
          scrollToBottom()
        },
        onSettled: () => {
          setMessage("");
          setIsSending(false);
        },
      }
    );
  };

  return (
    <div className="flex flex-col size-full max-h-[calc(100vh_-_20vh)]">
      <ScrollArea 
      ref={viewportRef}
      className=" px-4 py-2 space-y-4 min-h-[calc(100vh_-_30vh)] bg-[#06FCA0]/15 overflow-y-auto">
        <div className="relative flex flex-col gap-2">
          {chats?.map((chat, idx) => (
            <div key={idx} className="flex items-start space-x-2 p-1">
              <div className="pt-2">
                <Avatar className="my-1">
                  <AvatarImage
                    src={chat.users?.profile_img || placeholder.src}
                  />
                  <AvatarFallback>{chat.users?.username || "U"}</AvatarFallback>
                </Avatar>
              </div>
              <div
                className={`p-2 rounded-md ${
                  idx % 2 === 0
                    ? "bg-gray-200 dark:bg-gray-800"
                    : "bg-gray-300 dark:bg-gray-600"
                }`}
              >
                <div className="flex flex-row w-full gap-x-2 items-center">
                  <Link
                    href={`/profile/${
                      chat.users?.username || chat.users?.wallet
                    }`}
                  >
                    <span className="bg-foreground text-background rounded-md text-[0.65rem] tracking-wide py-1 px-2 underline underline-offset-2">
                      @{chat.users?.username || "Unknown"}
                    </span>
                  </Link>
                  <strong className="text-[0.6rem] text-gray-600 border-l-2 border-black/50 pl-1">
                    {format(new Date(chat.created_at as string), "Pp")}
                  </strong>
                </div>
                <p className="text-xs font-work mt-2">{chat.message}</p>
              </div>
            </div>
          ))}
        </div>
        <div ref={scrollRef} />
      </ScrollArea>
      <div className="flex items-center px-4 py-4 flex-row border-t border-black/10 justify-center">
        <Input
          className="flex-1 mr-2"
          placeholder="Type your message here..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSendMessage();
          }}
        />
        {wallet && (
          <div className="flex flex-row gap-x-2">
            <Button
              size={"sm"}
              onClick={handleSendMessage}
              disabled={isSending}
            >
              {isSending && <Loader2Icon className="animate-spin h-5 w-5" />}
              {!isSending && "Send"}
            </Button>

            <Button
              size={"icon"}
              className="max-h-9 bg-transparent"
              onClick={scrollToBottom}
            >
              <ArrowDownNarrowWide className="" />
            </Button>
          </div>
        )}
        {!wallet && (
          <WalletMultiButtonStyled className="bg-transparent max-w-fit items-center justify-center flex p-1" />
        )}
      </div>
    </div>
  );
};

export default ChatArea;
