"use client";
import { cn } from "@/utils/common";
import { Input } from "@/components/ui/input";
/* react-hook-form */
import {
    SubmitHandler,
    useForm,
    useController,
    UseControllerProps,
    useFormContext,
    FormProvider,
} from "react-hook-form";

export const FormInput = ({
    label,
    fieldName,
    placeholder,
    rules,
    type,
}: {
    label: string;
    fieldName: string;
    placeholder: string;
    type?: "number";
    rules?: UseControllerProps["rules"];
}) => {
    const {
        register,
        formState: { errors },
    } = useFormContext();
    // {
    //     name: fieldName,
    //     rules,
    // }
    return (
        <div className=" pb-5">
            <label className="font-semibold text-base">{label}</label>
            <Input
                placeholder={placeholder}
                className={cn(
                    "placeholder:font-talk placeholder:text-black/15 border-2 rounded-lg w-full",
                    errors[fieldName] ? "border-red-500" : "border-black"
                )}
                type={type}
                {...register(fieldName, {
                    ...rules,
                })}
                onFocus={(e) => e.target.select()}
            />
            <label className="text-red-500 text-xs py-2">
                {errors[fieldName]?.message?.toString() || ""}
            </label>
        </div>
    );
};
