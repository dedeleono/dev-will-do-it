"use client"

import { useToast } from "@/components/ui/use-toast";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

import { ClipboardIcon } from "@/components/shared/icons";
import { ToastAction } from "@/components/ui/toast";

interface ClipboardLink {
    link: string
}

export default function CopyToClipboard({link}: ClipboardLink) {

    const { toast } = useToast();

    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text).then(
        () => {
          console.log("Text copied to clipboard");
          toast({
            variant: "success",
            description: "Text copied to clipboard",
            draggable: true
            // action: <ToastAction altText="Close">Close</ToastAction>,
          });
        },
        (err) => {
          console.error("Failed to copy text: ", err);
        }
      );
    };

  return (
    <div className="min-w-full w-full border-2 border-foreground rounded-md my-8">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild className="w-full flex flex-row items-center">
            <span className=" w-full p-2 flex justify-between">
              <span className="flex flex-row text-nowrap text-xs">
                Ref Link: <span className="pl-2">{link}</span>
              </span>{" "}
              <Button
                size={"icon"}
                onClick={() => copyToClipboard(link)}
                className="bg-background w-8 h-8"
              >
                <ClipboardIcon className="w-5 h-5" />
              </Button>
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to copy</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}
