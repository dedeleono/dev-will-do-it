import type { Metadata } from "next";
import { Work_Sans } from "next/font/google";
import "@/styles/globals.css";
import localFont from "next/font/local";
import classNames from "classnames";
import AppWalletProvider from "@/components/AppWalletProvider";
import TRPCProvider from "../_trpc/TRPCProvider";
import NavBar from "@/components/shared/NavBar";
import TrendingStrip from "@/components/shared/TrendingStrip";
import { Toaster } from "@/components/ui/toaster";

const work = Work_Sans({
    subsets: ["latin"],
    weight: ["300", "400", "500", "600", "700"],
    display: "swap",
    variable: "--font-work",
});

const talk = localFont({
    src: [
        {
            path: "../../assets/font/talk-comic/TalkComic.ttf",
            weight: "400",
            style: "normal",
        },
    ],
    variable: "--font-talk-comic",
});

export const metadata: Metadata = {
    title: "Dev Will Do It",
    description:
        "Create your own token, and let it trade with ease. No liquidity needed, reach your goal and keep on going.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${classNames(
                    work.className,
                    work.variable,
                    talk.variable
                )} font-talk`}
            >
                <AppWalletProvider>
                    <TRPCProvider>
                        <NavBar />
                        <TrendingStrip
                            trending={[
                                { coin: "BTC", value: 100 },
                                { coin: "ETH", value: 200 },
                                { coin: "DOGE", value: 300 },
                            ]}
                        />
                        {children}
                        <Toaster />
                    </TRPCProvider>
                </AppWalletProvider>
            </body>
        </html>
    );
}
