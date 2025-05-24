"use client";
type FillBarProps = {
  percentage?: number;
  className?: string
};
export default function FillBar(props: FillBarProps) {
  return (
    <div className={"w-[200px] pl-6"}>
      <div
        className={`${
          props.className ? `${props.className}` : "w-[150px] h-[20px]"
        } border-[1px] border-r-4 border-black quadrilateral fill-gradient overflow-hidden`}
      >
        <div
          className="bg-white h-[20px]"
          style={{
            transform: `translateX(${getPerspectivePercent(
              props.percentage || 0
            )}%)`,
          }}
        />
      </div>
    </div>
  );
}

function getPerspectivePercent(percentage: number) {
  return (
    (2 * percentage) / 5 +
    (17 * Math.pow(percentage, 2)) / 1500 -
    Math.pow(percentage, 3) / 6250 +
    Math.pow(percentage, 4) / 937500
  );
}
