type TrendingCardProps = {
  trending: Array<{ coin: string; value: number }>;
};

export default function TrendingStrip(props: TrendingCardProps) {
  const { trending } = props;
  return (
    <section className="flex text-white items-center w-full bg-black py-2">
      <div className="flex text-white items-center w-full px-5">
        <h2 className="font-talk text-base text-center ">Trending:</h2>
        <div className="flex items-center justify-start gap-5 w-full px-5 overflow-hidden overflow-x-auto">
          {trending
            ? [...trending].map((coin, index) => (
                <TrendingCard
                  coin={coin.coin}
                  value={coin.value}
                  key={index}
                  rank={index}
                />
              ))
            : null}
        </div>
      </div>
    </section>
  );
}

const TrendingCard = ({
  coin,
  value,
  rank,
}: {
  coin: string;
  value: number;
  rank: number;
}) => {
  return (
    <div className="flex items-center gap-1">
      <p>#{rank + 1}</p>
      <p className="font-bold">{coin}</p>
      <p className="text-pink-text font-semibold">${value}</p>
    </div>
  );
};
