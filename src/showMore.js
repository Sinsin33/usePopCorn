import { useState } from "react";

export default function ShowText({ children }) {
  const [isExpand, setIsExpand] = useState(false);
  return (
    <div>
      <p>
        {isExpand
          ? children
          : children.split(" ").slice(0, 10).join(" ") + "..."}
      </p>
      <button
        style={{ display: "inline" }}
        onClick={() => {
          setIsExpand((prev) => !prev);
        }}
      >
        {isExpand ? "show less" : "show more"}
      </button>
    </div>
  );
}
