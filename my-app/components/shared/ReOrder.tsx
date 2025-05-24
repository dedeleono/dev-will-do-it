import { Reorder, LayoutGroup } from "framer-motion";
import { FC, ReactNode, useEffect, useState, cloneElement } from "react";

interface AnimatedListItemProps {
  id: string | number; // Ensure children have an `id` prop for unique identification
  children: ReactNode
}

interface AnimatedListProps {
  children: React.ReactElement<AnimatedListItemProps>[];
}

const AnimatedList: FC<AnimatedListProps> = ({ children }) => {
  // const [items, setItems] = useState(children);

  const [items, setItems] = useState(() =>
    children.map((child) => cloneElement(child))
  );

  useEffect(() => {
    // Update items when children change
    setItems(children.map((child) => cloneElement(child)));
  }, [children]);

  return (
    <LayoutGroup>
      <Reorder.Group
        axis="y"
        values={items}
        onReorder={setItems}
        className="size-full"
      >
        {items.map((item) => (
          <Reorder.Item key={item.props.id} value={item} className="">
            {item}
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </LayoutGroup>
  );
};

export default AnimatedList;