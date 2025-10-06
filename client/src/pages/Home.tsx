import { useEffect, useState } from "react";
import NavbarSecondary from "../components/NavbarSecondary";
import Hero from "../components/Hero";
import Carousel from "../components/Carousel";
import axios from '../libs/axios';

const categories = ["Нови", "Топ предложения", "Десерти"];

export default function Home() {
  const [recRecipe, setRecRecipe] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    axios.get('/recommendations')
      .then((res: any) => {
        if (res.status === 200) {
          setRecRecipe(res.data);
        }
      })
      .catch(() => {
        // ignore errors; keep heroRecipe as fallback
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-dvh">
      {/* <NavbarSecondary /> */}
      {loading ? <h1>Loading..</h1> : <main className="bg-[var(--bg)] text-[var(--fg)]">
        <Hero recipe={recRecipe} />
        {categories.map((cat, index) => (
          <Carousel key={index} title={cat} />
        ))}
      </main>}
    </div>
  );
}