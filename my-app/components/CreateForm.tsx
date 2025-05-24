"use client";
/* react & web3 */
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import * as anchor from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import {
    useAnchorWallet,
    AnchorWallet,
    useConnection,
} from "@solana/wallet-adapter-react";
import useTokenStore from "./store/useTokenStore";
import WalletMultiButtonStyled from "./ui/walletBtn";

/* Shadcn */
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import FileUploader from "./shared/fileUploader";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";

/* Dependencies */
import { MdOutlineInfo } from "react-icons/md";
import { FormInput } from "@/components/shared/FormInput";

/* trpc */
import { trpc } from "@/app/_trpc/client";

/* react-hook-form */
import {
    SubmitHandler,
    useForm,
    useController,
    UseControllerProps,
    useFormContext,
    FormProvider,
} from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import { cn } from "@/utils/common";

import {
    Step,
    type StepItem,
    Stepper,
    useStepper,
} from "@/components/shared/stepper";
import { StepperProviderRef } from "./shared/stepper/context";
// Solana Stuff
import { createToken } from "@/solana/scripts/createToken";
import { FEE_RECEIVER } from "@/solana/contracts/config";
import { getAssociatedTokenAddressSync, NATIVE_MINT } from "@solana/spl-token";
import { waitForTransaction } from "@/solana/waitForTransaction";

// Next Stuff
import Link from "next/link";
import { redirect } from "next/navigation";
import { marketCapValues } from "@/utils/marketcapValues";

/* type */
type CreateFormValues = {
    name: string;
    ticker: string;
    description: string;
    sellFee: number;
    image: FileList | null;
    website: string;
    twitter: string;
    telegram: string;
    instagram: string;
    tiktok: string;
    discord: string;
    marketCap: string;
    allocation: number;
    antiWhale: boolean;
    vestingBasis: number | null;
    vestingInterval: number | null;
    referralBonus: number;
};

const stepsObj = [
    { label: "Uploading Metadata & Image" },
    { label: "Deploying Token & Creating Curve" },
    { label: "Verifying Transaction" },
] satisfies StepItem[];

export default function CreateForm() {
    const router = useRouter();
    //Component State
    const [isAntiRugModalOpen, setIsAntiRugModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const stepperRef = useRef<any & StepperProviderRef>(null);
    const [activeStep, setActiveStep] = useState(0);
    const [stepperState, setStepperState] = useState<
        "loading" | "error" | undefined
    >("loading");
    const [walletConnected, setWalletConnected] = useState(false);
    const [tokenAddress, setTokenAddress] = useState<string | null>(null);

    //tokenStore
    const { connection } = useConnection();
    const wallet = useAnchorWallet();
    const initState = useTokenStore((state) => state.initState);
    const programTokenStore = useTokenStore((state) => state.program);
    const [initLoading, setInitLoading] = useState(false);

    //Form
    const {
        mutate: create,
        status: mailInfoStatus,
        data: callResult,
    } = trpc.uploadTokenImageAndMeta.useMutation();
    const { mutate: verifyTx } = trpc.verifyCreateCurve.useMutation();

    const methods = useForm<CreateFormValues>({
        defaultValues: {
            marketCap: "79k",
            antiWhale: false,
            vestingBasis: null,
            vestingInterval: null,
            referralBonus: 0,
        },
        reValidateMode: "onChange",
        mode: "onBlur",
    });

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = methods;

    const { hasCompletedAllSteps } = useStepper();

    const goToNextStep = () => {
        setActiveStep((prevStep) => {
            const newStep = prevStep + 1;
            if (stepperRef.current) {
                stepperRef.current.setStep(newStep);
                // stepperRef.current.nextStep();
            }
            return newStep;
        });
    };

    const resetSubmit = () => {
        setIsSubmitting(false);
        if (stepperRef.current) {
            stepperRef.current.resetSteps();
        }
        setStepperState("loading");
    };

    const onSubmit: SubmitHandler<CreateFormValues> = (formData) => {
        console.log("Active step: " + activeStep);
        setIsSubmitting(true);

        if (!programTokenStore) {
            setIsSubmitting(false);
            setStepperState("error");
            console.log("Program not initialized");
            return;
        }

        const file = formData.image?.[0];
        if (!file || !file.type.includes("image") || !wallet?.publicKey) {
            setIsSubmitting(false);
            setStepperState("error");
            console.log("Invalid file or wallet not connected");
            return;
        }

        const mktCapVal = marketCapValues[formData.marketCap];

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const base64 = reader.result?.toString();
            if (!base64) {
                setStepperState("error");
                setIsSubmitting(false);
                return;
            }
            const base64Regex = base64.replace(/^data:image\/\w+;base64,/, "");
            const fileType = file.type.split("/")[1];

            create(
                {
                    name: formData.name,
                    ticker: formData.ticker,
                    description: formData.description,
                    image: base64Regex,
                    imageFormat: fileType,
                    creator: wallet.publicKey.toBase58(),
                },
                {
                    onSuccess: async (data) => {
                        goToNextStep();
                        const { metadataURI, metadata } = data;
                        // @note prueba de devolver las ixs y el keypair
                        const { instructions, mintSigner } = await createToken(
                            metadata,
                            metadataURI,
                            wallet.publicKey.toBase58(),
                            connection.rpcEndpoint
                        );
                        try {
                            const curveTokenHolder =
                                getAssociatedTokenAddressSync(
                                    mintSigner.publicKey,
                                    wallet.publicKey
                                );
                            const createNecessaryAccounts =
                                await programTokenStore.methods
                                    .createCurveAccounts(mintSigner.publicKey)
                                    .accounts({
                                        reserveToken: NATIVE_MINT,
                                    })
                                    .instruction();
                            const txSignature = await programTokenStore.methods
                                .createCurve({
                                    a: mktCapVal.a,
                                    maxTxTokens: new anchor.BN(
                                        formData.antiWhale ? 20_000_000 : 0
                                    ).mul(new anchor.BN(LAMPORTS_PER_SOL)),
                                    // @note marketcap fill in SOL
                                    liquiditySupply: new anchor.BN(
                                        mktCapVal.maxRaise
                                    ).mul(new anchor.BN(LAMPORTS_PER_SOL)),
                                    sellFee: new anchor.BN(
                                        (formData.sellFee || 0) * 100
                                    ),
                                    referralBasis: new anchor.BN(
                                        (formData.referralBonus || 0) * 100
                                    ),
                                    vestingBasis: new anchor.BN(
                                        (formData.vestingBasis || 0) * 100
                                    ),
                                    vestingInterval: new anchor.BN(
                                        (formData.vestingInterval || 0) * 86400
                                    ), // seconds in a day
                                    vestingStart: new anchor.BN(0),
                                })
                                .accounts({
                                    curveToken: mintSigner.publicKey,
                                    feeReceiver: FEE_RECEIVER,
                                    reserveToken: NATIVE_MINT,
                                    signerCurveHolder: curveTokenHolder,
                                })
                                .preInstructions(instructions)
                                .postInstructions([createNecessaryAccounts])
                                .signers([mintSigner])
                                .rpc();

                            // wait for transaction
                            await waitForTransaction(connection, txSignature);
                            setTokenAddress(mintSigner.publicKey.toBase58());
                            // if still fails, ask user to retry this tx

                            goToNextStep();

                            const socials = [];
                            if (formData.website)
                                socials.push(`website:${formData.website}`);
                            if (formData.twitter)
                                socials.push(`twitter:${formData.twitter}`);
                            if (formData.telegram)
                                socials.push(`telegram:${formData.telegram}`);
                            if (formData.instagram)
                                socials.push(`instagram:${formData.instagram}`);
                            if (formData.tiktok)
                                socials.push(`tiktok:${formData.tiktok}`);

                            verifyTx(
                                {
                                    tx: txSignature as string,
                                    creator: wallet.publicKey.toBase58(),
                                    tokenAddress:
                                        mintSigner.publicKey.toBase58(),
                                    tokenMetadata: {
                                        name: formData.name,
                                        ticker: formData.ticker,
                                        imageURL: metadata.image,
                                        metadataURL: metadataURI,
                                    },
                                    socials,
                                },
                                {
                                    onSuccess: (verifiedData) => {
                                        console.log(
                                            "Transaction verified: " +
                                                verifiedData
                                        );
                                        if (stepperRef.current) {
                                            stepperRef.current.setStep(
                                                stepsObj.length
                                            );
                                        }
                                        setIsSubmitted(true);
                                        router.push(
                                            `/token/${mintSigner.publicKey.toBase58()}`
                                        );
                                        // setIsSubmitting(false)
                                        // nextStep();
                                    },
                                    onError: (error) => {
                                        console.log(
                                            "Verification failed: " +
                                                error.message
                                        );
                                        setStepperState("error");
                                    },
                                }
                            );
                        } catch (error) {
                            console.log(
                                "Transaction creation failed: " + error
                            );
                            setStepperState("error");
                            // setIsSubmitting(false);
                        }
                    },
                    onError: (error) => {
                        console.log(
                            "Image and metadata upload failed: " + error.message
                        );
                        setStepperState("error");
                        // setIsSubmitting(false);
                    },
                }
            );
        };
    };

    const isAntiRugActive =
        (watch("vestingBasis") || 0) > 0 && (watch("vestingInterval") || 0) > 0;

    const handleAntiRugSwitchChange = (currentAntiRugStatus: boolean) => {
        if (currentAntiRugStatus) {
            setValue("vestingBasis", 0);
            setValue("vestingInterval", 0);
        } else setIsAntiRugModalOpen(true);
    };

    const getAntiRugValues = () => {
        const vestingBasis = watch("vestingBasis");
        const vestingInterval = watch("vestingInterval");
        return (
            <div className="font-work font-semibold text-sm">
                <label>Give users: </label>
                <span>{vestingBasis}%</span>
                <br />
                <label>Every: </label>
                <span>{vestingInterval} days</span>
            </div>
        );
    };

    const currentMarketCap = watch("marketCap");

    register("image", {
        required: true,
        validate: {
            lessThan4MB: (fileList) => {
                if (!fileList || fileList.length !== 1) return false;
                return (
                    (fileList[0]?.size || 4000000) / 1024 / 1024 <= 4.5 ||
                    "File size must be less than 4MB"
                );
            },
            imageFormat: (fileList) => {
                if (!fileList || fileList.length !== 1) return false;
                // validate that image format is any image format using regex
                return (
                    /^image\/(jpeg|png|gif|webp|bmp|svg\+xml)$/i.test(
                        fileList[0]?.type || ""
                    ) || "File must be an image"
                );
            },
        },
    });

    useEffect(() => {
        async function initStore() {
            setInitLoading(true);
            await initState(wallet);
            setInitLoading(false);
        }
        if (wallet?.publicKey) {
            setWalletConnected(true);
            initStore();
        } else {
            setWalletConnected(false);
        }
    }, [wallet, initState]);

    const referralBonus = watch("referralBonus");
    const shownBonus =
        referralBonus > 0 ? (referralBonus * 0.1).toFixed(2) + "%" : "";

    console.log({ formErrors: errors });

    return (
        <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center"
        >
            <div className="flex flex-col items-center max-w-[525px] w-full px-5 py-10">
                <h2 className="text-3xl font-talk">Token Info</h2>
                <FormProvider {...methods}>
                    <form
                        className="w-full mt-4"
                        onSubmit={handleSubmit(onSubmit)}
                    >
                        <FormInput
                            label="Token Name"
                            placeholder="e.g. I love pokemon"
                            fieldName="name"
                            rules={{
                                required: "Name Required!",
                                minLength: {
                                    value: 4,
                                    message:
                                        "Give it a good name! At least 4 characters long",
                                },
                            }}
                        />
                        <FormInput
                            label="Ticker *"
                            placeholder="e.g $PEPE"
                            fieldName="ticker"
                            rules={{
                                required: "Ticker Required",
                                minLength: {
                                    value: 3,
                                    message:
                                        "Ticker must be atleast 3 characters long",
                                },
                                maxLength: {
                                    value: 7,
                                    message:
                                        "Ticker must NOT be more than 7 characters long",
                                },
                            }}
                        />

                        <div className="pb-5">
                            <label className="font-semibold text-base">
                                What will Dev (You) do?
                            </label>
                            <Textarea
                                className={cn(
                                    "placeholder:font-talk placeholder:text-black/15 border-2",
                                    errors.description
                                        ? "border-red-500"
                                        : "border-black"
                                )}
                                {...register("description", {
                                    minLength: {
                                        value: 15,
                                        message: "Minimum of 15 characters",
                                    },
                                })}
                                placeholder="As a dev I will ..."
                            />
                            <div className="text-sm text-red-500">
                                <ErrorMessage
                                    errors={errors}
                                    name="description"
                                />
                            </div>
                        </div>
                        <div className="flex flex-row size-full items-center justify-center mt-4 mb-8">
                            <FileUploader
                                name="image"
                                setValue={setValue}
                                value={watch("image")}
                                error={errors.image?.message}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <FormInput
                                label="Website"
                                placeholder="website URL"
                                fieldName="website"
                                rules={{
                                    required: true,
                                    minLength: 4,
                                    validate: {
                                        validateWebsite: (value) => {
                                            return (
                                                /^(https:\/\/)(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(?::[0-9]{1,5})?(?:\/)?$/i.test(
                                                    value
                                                ) || "Invalid Website"
                                            );
                                        },
                                    },
                                }}
                            />
                            <FormInput
                                label="Telegram"
                                placeholder="Telegram Link"
                                fieldName="telegram"
                                rules={{
                                    required: true,
                                    minLength: 4,
                                    validate: {
                                        validateTelegram: (value) => {
                                            return (
                                                /^(https:\/\/)t\.me\/\S+$/.test(
                                                    value
                                                ) || "Invalid Telegram Link"
                                            );
                                        },
                                    },
                                }}
                            />
                            <FormInput
                                label="X (Twitter)"
                                placeholder="X (Twitter) Link"
                                fieldName="twitter"
                                rules={{
                                    required: false,
                                    validate: {
                                        validateTwitter: (value) => {
                                            if (!value) return true;

                                            return /(https:\/\/)((x\.com)|(twitter\.com))\/\S+/.test(
                                                value
                                            );
                                        },
                                    },
                                }}
                            />
                            <FormInput
                                label="Instagram"
                                placeholder="Instagram Link"
                                fieldName="instagram"
                                rules={{
                                    required: false,
                                    validate: {
                                        validateInstagram: (value) => {
                                            if (!value) return true;
                                            return (
                                                /^(https:\/\/)(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(?::[0-9]{1,5})?(?:\/)?$/.test(
                                                    value
                                                ) || "Invalid Instagram Link"
                                            );
                                        },
                                    },
                                }}
                            />
                            <FormInput
                                label="TikTok"
                                placeholder="TikTok Link"
                                fieldName="tiktok"
                                rules={{
                                    required: false,
                                    validate: {
                                        validateTiktok: (value) => {
                                            if (!value) return true;
                                            return (
                                                /^(https:\/\/)(www\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(?::[0-9]{1,5})?(?:\/)?$/.test(
                                                    value
                                                ) || "Invalid TikTok Link"
                                            );
                                        },
                                    },
                                }}
                            />
                        </div>
                        <Accordion type="single" collapsible>
                            <AccordionItem value="item-1">
                                <AccordionTrigger className="max-w-[150px]">
                                    <label className="font-semibold no-underline">
                                        Advanced Options
                                    </label>
                                </AccordionTrigger>
                                <AccordionContent>
                                    <div className="mt-3">
                                        <label className="font-semibold text-base">
                                            Choose Your Marketcap ($79,000
                                            Default)
                                        </label>
                                        <fieldset>
                                            <ul className="flex py-3 gap-2 flex-row items-center justify-center flex-wrap">
                                                <RadioButton
                                                    label="$25 k"
                                                    value="25k"
                                                    currentValue={
                                                        currentMarketCap
                                                    }
                                                    onClick={(newMktCapVal) =>
                                                        setValue(
                                                            "marketCap",
                                                            newMktCapVal
                                                        )
                                                    }
                                                />
                                                <RadioButton
                                                    label="$50 k"
                                                    value="50k"
                                                    currentValue={
                                                        currentMarketCap
                                                    }
                                                    onClick={(newMktCapVal) =>
                                                        setValue(
                                                            "marketCap",
                                                            newMktCapVal
                                                        )
                                                    }
                                                />
                                                <RadioButton
                                                    label="$100 k"
                                                    value="100k"
                                                    currentValue={
                                                        currentMarketCap
                                                    }
                                                    onClick={(newMktCapVal) =>
                                                        setValue(
                                                            "marketCap",
                                                            newMktCapVal
                                                        )
                                                    }
                                                />
                                                <RadioButton
                                                    label="$250 k"
                                                    value="250k"
                                                    currentValue={
                                                        currentMarketCap
                                                    }
                                                    onClick={(newMktCapVal) =>
                                                        setValue(
                                                            "marketCap",
                                                            newMktCapVal
                                                        )
                                                    }
                                                />
                                                <RadioButton
                                                    label="$500 k"
                                                    value="500k"
                                                    currentValue={
                                                        currentMarketCap
                                                    }
                                                    onClick={(newMktCapVal) =>
                                                        setValue(
                                                            "marketCap",
                                                            newMktCapVal
                                                        )
                                                    }
                                                />
                                                <RadioButton
                                                    label="$1 M"
                                                    value="1M"
                                                    currentValue={
                                                        currentMarketCap
                                                    }
                                                    onClick={(newMktCapVal) =>
                                                        setValue(
                                                            "marketCap",
                                                            newMktCapVal
                                                        )
                                                    }
                                                />
                                            </ul>
                                        </fieldset>
                                        <FormInput
                                            label="Sell Fee Input"
                                            placeholder="0-10%"
                                            fieldName="sellFee"
                                            type="number"
                                            rules={{
                                                min: {
                                                    value: 0,
                                                    message: "Too low",
                                                },
                                                max: {
                                                    value: 10,
                                                    message: "Too High",
                                                },
                                            }}
                                        />
                                    </div>
                                    <div className="flex flex-row items-center justify-between mt-6 mb-3 w-1/2 gap-14">
                                        <div className="flex items-center space-x-2">
                                            <Switch
                                                id="anti-whale"
                                                checked={watch("antiWhale")}
                                                onCheckedChange={(v) =>
                                                    setValue("antiWhale", v)
                                                }
                                            />
                                            <Label
                                                htmlFor="anti-whale"
                                                className="text-nowrap"
                                            >
                                                Anti - Whale
                                            </Label>
                                            <TooltipInfo>
                                                Turns on the Anti-Whale feature
                                                which limits buys and sell to 2%
                                                of the total supply
                                            </TooltipInfo>
                                        </div>
                                        <div className="flex items-center space-x-2 justify-self-center">
                                            <Switch
                                                id="anti-rug-mode"
                                                checked={isAntiRugActive}
                                                onClick={() =>
                                                    handleAntiRugSwitchChange(
                                                        isAntiRugActive
                                                    )
                                                }
                                            />
                                            <Label
                                                htmlFor="anti-rug-mode"
                                                className="text-nowrap"
                                            >
                                                Anti - Rug
                                            </Label>
                                            <TooltipInfo>
                                                Set up the Antirug which forces
                                                buyers to be vested for:
                                            </TooltipInfo>
                                        </div>
                                    </div>
                                    {isAntiRugActive
                                        ? getAntiRugValues()
                                        : null}
                                    <div className="pt-5">
                                        <div className=" pb-5">
                                            <label className="font-semibold text-base">
                                                Referral Bonus (multiplier of
                                                0.1%) {shownBonus}
                                            </label>
                                            <Input
                                                placeholder={"1 - 5"}
                                                className={cn(
                                                    "placeholder:font-talk placeholder:text-black/15 border-2 rounded-lg w-full",
                                                    errors.referralBonus
                                                        ?.message
                                                        ? "border-red-500"
                                                        : "border-black"
                                                )}
                                                {...register("referralBonus", {
                                                    setValueAs: (v) =>
                                                        parseInt(v),
                                                    max: {
                                                        value: 5,
                                                        message: "too high",
                                                    },
                                                    min: {
                                                        value: 0,
                                                        message: "too low",
                                                    },
                                                })}
                                                type="number"
                                                onFocus={(e) =>
                                                    e.target.select()
                                                }
                                            />
                                            <label className="text-red-500 text-xs py-2">
                                                {errors.referralBonus?.message}
                                            </label>
                                        </div>
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        <ErrorMessage errors={errors} name="tiktok" />
                        <ErrorMessage errors={errors} name="instagram" />
                        <ErrorMessage errors={errors} name="twitter" />
                        <ErrorMessage errors={errors} name="telegram" />
                        <span className="text-xs font-bold">
                            Cost: 0.03 SOL
                        </span>
                        {wallet && (
                            <Button className="w-full text-black" type="submit">
                                Create Your Token +
                            </Button>
                        )}
                        {!wallet && (
                            <WalletMultiButtonStyled className="bg-transparent w-full block min-h-[3.8rem]" />
                        )}
                        <Dialog
                            open={isAntiRugModalOpen}
                            onOpenChange={(v) => setIsAntiRugModalOpen(v)}
                        >
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Anti Rug</DialogTitle>
                                    <DialogDescription>
                                        Set up the Antirug which forces buyers
                                        to be vested for:
                                    </DialogDescription>
                                </DialogHeader>
                                <FormInput
                                    label="Percent Per Interval (10 - 50)"
                                    placeholder="0-50%"
                                    fieldName="vestingBasis"
                                    rules={{
                                        min: 10,
                                        max: 50,
                                    }}
                                />
                                <FormInput
                                    label="Days to pass per claim (1-5 days)"
                                    placeholder="1 - 5"
                                    fieldName="vestingInterval"
                                    rules={{
                                        min: 1,
                                        max: 5,
                                    }}
                                />
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button
                                            type="button"
                                            variant="default"
                                            size="sm"
                                            className="text-base"
                                        >
                                            Done
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </form>
                </FormProvider>
            </div>
            {isSubmitting && (
                <Dialog
                    open={isSubmitting}
                    onOpenChange={(v) => setIsSubmitting(v)}
                >
                    <DialogContent
                        canClose={false}
                        className="font-work text-xs font-semibold md:w-full w-[95%] rounded-md"
                    >
                        <DialogTitle className="text-lg">
                            Creating your token
                        </DialogTitle>
                        <hr />

                        <Stepper
                            ref={stepperRef}
                            state={stepperState}
                            orientation="vertical"
                            size="md"
                            initialStep={0}
                            steps={stepsObj}
                            //   onClickStep={(step, setStep) => {
                            //     setStep(step);
                            //   }}

                            className="my-1"
                        >
                            {stepsObj.map((stepProps, index) => {
                                return (
                                    <Step key={stepProps.label} {...stepProps}>
                                        {stepperState === "error" &&
                                        activeStep === 0 ? (
                                            <div className="h-40 flex items-center justify-center my-4 border bg-secondary rounded-md">
                                                <h1 className="text-xl">
                                                    Step: {index}
                                                </h1>
                                            </div>
                                        ) : (
                                            <></>
                                        )}
                                    </Step>
                                );
                            })}
                        </Stepper>

                        <hr />
                        <DialogFooter>
                            {stepperState === "error" ? (
                                <Button
                                    size="lg"
                                    disabled={!hasCompletedAllSteps}
                                    className="text-base"
                                    onClick={resetSubmit}
                                >
                                    Close
                                </Button>
                            ) : (
                                // <Link href={`/token/${tokenAddress}`}>
                                <Button
                                    size="lg"
                                    disabled={!isSubmitted}
                                    className="text-base"
                                    onClick={() => {
                                        window.open(
                                            `/token/${tokenAddress}`,
                                            "_blank"
                                        );
                                        setIsSubmitting(false);
                                    }}
                                >
                                    Token Page
                                </Button>
                                // </Link>
                            )}
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </motion.section>
    );
}

const RadioButton = ({
    label,
    value,
    currentValue,
    onClick,
}: {
    label: string;
    value: string;
    currentValue: string;
    onClick: (value: string) => void;
}) => {
    return (
        <li className="py-2 cursor-pointer">
            <input
                type="radio"
                id={`button-value-${value}`}
                className="hidden peer"
                checked={currentValue === value}
                onChange={() => onClick(value)}
            />
            <label
                htmlFor={`button-value-${value}`}
                className="bg-white border-2 border-black text-black font-talk py-2 px-3 peer-checked:bg-black peer-checked:text-white rounded-lg text-sm hover:bg-slate-200 peer-checked:hover:bg-slate-700 w-[80px]"
            >
                {label}
            </label>
        </li>
    );
};

const TooltipInfo = ({ children }: { children: React.ReactNode }) => {
    return (
        <TooltipProvider>
            <Tooltip delayDuration={0}>
                <TooltipTrigger type="button">
                    <MdOutlineInfo className="text-black text-lg" />
                </TooltipTrigger>
                <TooltipContent>{children}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};
