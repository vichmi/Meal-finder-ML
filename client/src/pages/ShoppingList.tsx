import { useEffect, useState } from "react";
import axios from "../libs/axios";
import commonPantry from "../constants/commonPantry";

type LidlItem = {
  name: string;
  price: string;
  img: string;
};

export default function ShoppingList() {
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [lidlitems, setLidlItems] = useState<LidlItem[]>([]);

  // Fetch shopping list
  useEffect(() => {
    axios
      .get("/userItems", { withCredentials: true })
      .then((res) => {
        setShoppingList(res.data.shoppingList || []);
      })
      .catch((err) => {
        console.error("Failed to fetch shopping list:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch Lidl products
  useEffect(() => {
    if(shoppingList.length == 0) {
      setLidlItems([]);
      return;}
    axios.get("/getLidl", { withCredentials: true }).then((res) => {
      setLidlItems(res.data || []);
    });
  }, [shoppingList]);

  // Pantry suggestions
  useEffect(() => {
    if (input.length > 0) {
      const filtered = commonPantry.filter((item) =>
        item.toLowerCase().startsWith(input.toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const addItem = async (name: string) => {
    if (!name.trim()) return;

    try {
      await axios.post(
        "/addShoppinglistItem",
        { item: name },
        { withCredentials: true }
      );
      setShoppingList((prev) => [...prev, name]);
      setInput("");
      setSuggestions([]);
    } catch (err) {
      console.error("Failed to add item:", err);
    }
  };

  const removeItem = async (name: string) => {
    try {
      await axios.delete("/addShoppinglistItem", {
        data: { item: name },
        withCredentials: true,
      });
      setShoppingList((prev) => prev.filter((i) => i !== name));
    } catch (err) {
      console.error("Failed to remove item:", err);
    }
  };

  if (loading) {
    return <div className="p-4">Loading shopping list...</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-6 p-6">
      {/* Left side: Shopping list + input */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Your Shopping List</h2>

        <div className="relative mb-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addItem(input);
            }}
            placeholder="Add item..."
            className="w-full p-2 border rounded-lg"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 bg-[var(--bg)] text-[var(--fg)] border rounded-lg mt-1 w-full shadow-md max-h-40 overflow-y-auto">
              {suggestions.map((s, idx) => (
                <li
                  key={idx}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer bg-[var(--bg)] text-[var(--fg)]"
                  onClick={() => addItem(s)}
                >
                  {s}
                </li>
              ))}
            </ul>
          )}
        </div>

        <ul className="space-y-2">
          {shoppingList.map((item, index) => (
            <li
              key={index}
              className="p-3 border rounded-lg bg-[var(--bg)] text-[var(--fg)] shadow-sm flex justify-between items-center"
            >
              <span>{item}</span>
              <button
                onClick={() => removeItem(item)}
                className="ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2 className="text-xl font-semibold mb-4">Lidl PromotionsMatches</h2>
        <div className="grid grid-cols-2 gap-4">
          {lidlitems.map((product, index) => (
            <div
              key={index}
              className="border rounded-lg bg-[var(--bg)] text-[var(--fg)] shadow p-3 flex flex-col items-center"
            >
              <img
                src={product.img}
                alt={product.name}
                className="w-32 h-32 object-contain mb-2"
              />
              <span className="font-medium text-center">{product.name}</span>
              <span className="text-green-600 font-semibold mt-1">
                {product.price} лв.
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
