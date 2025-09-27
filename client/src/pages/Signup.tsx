import Container from "../components/Container";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore: third-party JS helper without types
import axios from '../libs/axios'


export default function Signup() {
return (
  <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)]">
    <Container className="max-w-md w-full space-y-8 border border-[var(--border)] rounded-2xl bg-[var(--card)] p-8 shadow-md">
      <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-[var(--brand)]">Sign Up</h2>
      </div>


      <form className="mt-6 space-y-5" onSubmit={e => {
        e.preventDefault();
        axios.post('/auth/register', {
          username: (e.target as any).username.value,
          password: (e.target as any).password.value
        })
        .then(res => {
          console.log(res.data);
          if(res.status === 201) {
            window.location.href = '/login';
            return;
          }
        })
        .catch(err => {
          console.error(err);
          alert(err.response?.data?.message || 'An error occurred');
        })
      }}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Name</label>
          <input
          type="text"
          id="name"
          name="username"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
          placeholder="John Doe"
          />
          </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">Password</label>
          <input
          type="password"
          id="password"
          name="password"
          className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
          placeholder="••••••••"
          />
        </div>


        <button
          type="submit"
          className="w-full rounded-lg bg-[var(--brand)] px-4 py-2 font-semibold text-white hover:opacity-90"
          >
          Create account
        </button>
      </form>


      <p className="text-sm text-[var(--muted-fg)] text-center">
      Already have an account? <a href="/login" className="text-[var(--brand)] hover:underline">Log in</a>
      </p>
    </Container>
  </div>
  );
}