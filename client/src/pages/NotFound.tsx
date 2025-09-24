import Container from "../components/Container";
import { Link } from "react-router";

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="mb-6 text-[var(--muted-fg)]">Page not found.</p>
      <Link to="/" className="inline-block rounded px-4 py-2 bg-[var(--primary)] text-white">Go home</Link>
    </Container>
  );
}
