import { useEffect, useState } from "react";
import axios from "../libs/axios";

type Props = {
  itemName: string;
};

export default function TripleCheckbox({ itemName, initialState, onUpdate }: Props) {
  const [state, setState] = useState<0 | 1 | 2>(initialState);

  const cycleState = async () => {
    try {
      if(state == 0) {
        await axios.post('/addFridgeItem', {item: itemName}, {withCredentials: true});
        setState(1)
        onUpdate(1)
      } else if(state == 1) {
        await axios.delete('/addFridgeItem', {data:{item: itemName}, withCredentials: true});
        await axios.post('/addShoppinglistItem', {item: itemName}, {withCredentials: true});
        setState(2)
        onUpdate(2)
      }else if(state == 2) {
        await axios.delete('/addShoppinglistItem', {data:{item: itemName}, withCredentials: true});
        setState(0)
        onUpdate(0)
      }
    }catch(err) {
      console.error(err);
    }
  }

  return (
    <button
      onClick={cycleState}
      className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition cursor-pointer"
    >
      {state === 0 && (
        <span className="text-gray-400">•</span> // празно
      )}

      {state === 1 && (
        // fridge icon
        <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="48"
                height="48"
                fill="none"
                stroke="blue"
                stroke-width="1"
                stroke-linecap="round"
                stroke-linejoin="round"
                role="img"
                aria-label="Fridge icon"
              >
              <rect x="5" y="3" width="14" height="18" rx="2"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
              <rect x="15.5" y="6" width="1" height="2" rx=".5"/>
              <rect x="15.5" y="14" width="1" height="2" rx=".5"/>
              <line x1="8" y1="21" x2="8" y2="20"/>
              <line x1="16" y1="21" x2="16" y2="20"/>
            </svg>
      )}

      {state === 2 && (
        // shopping list icon
        <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="green"
                strokeWidth={1.8}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
                aria-hidden="true"
              >
                <path d="M3 5h2l1 12h12l1.5-8H6" />
                <circle cx="9" cy="19" r="1.5" />
                <circle cx="17" cy="19" r="1.5" />
              </svg>
      )}
    </button>
  );
}
