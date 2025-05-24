"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";

import * as React from "react";

import { cn } from "@/utils/common";
import { useMemo } from "react";

type TabsTriggerProps = React.ComponentPropsWithoutRef<
    typeof TabsPrimitive.Trigger
> & {
    activeBackgroundColor?: string;
};

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.List
        ref={ref}
        className={cn(
            "inline-flex h-12 items-center justify-center rounded-base border-2 border-black dark:border-darkBorder bg-main text-black overflow-hidden",
            className
        )}
        {...props}
    />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Trigger>,
    // React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
    TabsTriggerProps
>(({ className, activeBackgroundColor, ...props }, ref) => {
    const activeBg: { [key: string]: string } = {
        main: "data-[state=active]:bg-main data-[state=active]:text-black",
        pink: "data-[state=active]:bg-pink data-[state=active]:text-black",
        default:
            "data-[state=active]:bg-foreground data-[state=active]:text-background",
    };
    return (
        <TabsPrimitive.Trigger
            ref={ref}
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap border-2 border-transparent px-3 py-1.5 text-sm font-heading ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                "data-[state=active]:text-black",
                activeBg[activeBackgroundColor || "default"],
                className
            )}
            {...props}
        />
    );
});
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
    React.ElementRef<typeof TabsPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
    <TabsPrimitive.Content
        ref={ref}
        className={cn(
            "mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2",
            className
        )}
        {...props}
    />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
