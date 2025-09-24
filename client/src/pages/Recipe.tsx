import { useParams } from "react-router";
import Container from "../components/Container";

export default function Recipe() {
  const { id } = useParams();
  return (
    <Container className="py-20">
      <h1 className="text-2xl font-bold mb-4">Recipe</h1>
      <p className="text-sm text-[var(--muted-fg)]">Recipe id: {id}</p>
    </Container>
  );
}
