import { Input } from "@/components/ui/input";

const searchStyle: React.CSSProperties = {
  borderWidth: "1.5pt",
  border: "double 3px transparent",
  borderRadius: "6px",
  backgroundImage:
    "linear-gradient(white, white), linear-gradient(to right, pink, red, orange, yellow)",
  backgroundOrigin: "border-box",
  backgroundClip: "padding-box, border-box",
};

export default function Search() {
  return (
    // Apply the background color to this div
    <div className="flex w-full items-center rounded-lg" style={searchStyle}>
      <div className="md:max-w-[5%] min-h-[45px] bg-[#02DDE1] rounded-l-sm flex items-center justify-center">
        <SearchIcon className="mx-3" />
      </div>
      <Input
        type="search"
        placeholder="Search by symbol, name, token or contract address (CA)"
        className="size-full border-none bg-white min-h-[45px] font-talk leading-none text-xs placeholder-gray-200"
      />
    </div>
  );
}

function SearchIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="25"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
