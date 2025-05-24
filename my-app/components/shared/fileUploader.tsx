"use client";
import { useState, useRef } from "react";
import { cn } from "@/utils/common";

export default function FileUploader(props: {
  name: string;
  setValue: (
    name: any,
    value: FileList | null,
    options: {
      shouldValidate: boolean;
      shouldDirty: boolean;
      shouldTouch: boolean;
    }
  ) => void;
  value: FileList | null;
  error?: string;
}) {
  const { setValue, name, value, error } = props;
  const [isDragged, setIsDragged] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageExists = value?.length == 1 && value[0];

  return (
    <div className="flex flex-col items-center">
      <div
        className={cn(
          "group/fileInput rounded-full font-talk text-sm",
          "w-48 h-48 border-2 flex flex-col items-center justify-center overflow-hidden ",
          imageExists ? "border-solid" : "border-dashed",
          isDragged
            ? "text-primary-text/60 border-blue-500"
            : imageExists
            ? "border-primary"
            : "border-gray-500",
          error ? "border-2 border-red-500" : ""
        )}
        onClick={() => {
          fileInputRef.current?.click();
        }}
        onDragEnter={() => {
          setIsDragged(true);
        }}
        onDragLeave={() => {
          setIsDragged(false);
        }}
        onDragOver={(e) => {
          setIsDragged(true);
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer.files.length == 1)
            setValue(name, e.dataTransfer.files, {
              shouldValidate: true,
              shouldDirty: true,
              shouldTouch: true,
            });
        }}
      >
        {imageExists ? (
          <img
            src={URL.createObjectURL(value[0])}
            className="h-full w-full object-cover"
            alt="img to upload"
          />
        ) : (
          <>
            <div className="opacity-60 font-bold px-4 text-center whitespace-pre-wrap cursor-pointer">
              Drag and drop your image to upload
              {"\n"}
              <span className="font-work text-xs">
                or click/tap here works too
              </span>
            </div>
          </>
        )}
        <input
          className="hidden"
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={(e) =>
            setValue(
              "image",
              e.target.files && e.target.files.length == 1
                ? e.target.files
                : null,
              { shouldValidate: true, shouldDirty: true, shouldTouch: true }
            )
          }
        />
      </div>
      {error ? <div className="text-red-500 text-sm pt-2">{error}</div> : null}
    </div>
  );
}

function FileIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}
