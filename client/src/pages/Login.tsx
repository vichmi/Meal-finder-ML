import Container from "../components/Container";
import axios from '../libs/axios'


export default function Login() {
return (
<div className="min-h-screen flex items-center justify-center bg-[var(--bg)] text-[var(--fg)]">
<Container className="max-w-md w-full space-y-8 border border-[var(--border)] rounded-2xl bg-[var(--card)] p-8 shadow-md">
<div className="flex justify-between items-center">
<h2 className="text-2xl font-bold text-[var(--brand)]">Login</h2>
</div>


<form className="mt-6 space-y-5" onSubmit={e => {
        e.preventDefault();
        axios.post('/auth/login', {
          username: (e.target as any).username.value,
          password: (e.target as any).password.value
        }, { withCredentials: true })
        .then(res => {
          console.log(res.data);
          localStorage.setItem('token', res.data.token);
          window.location.href = '/';
          return res.data;
        })
        .catch(err => {
          console.error(err);
          alert(err.response?.data?.message || 'An error occurred');
        })
      }}>
<div>
<label htmlFor="username" className="block text-sm font-medium">Username</label>
<input
  type="username"
  id="username"
  className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
  placeholder="Username"
  autoFocus
  />
</div>


<div>
<label htmlFor="password" className="block text-sm font-medium">Password</label>
<input
type="password"
id="password"
className="mt-1 w-full rounded-lg border border-[var(--border)] bg-[var(--bg)] px-3 py-2 text-[var(--fg)] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--secondary)]"
placeholder="••••••••"
/>
</div>


<button
type="submit"
className="w-full rounded-lg bg-[var(--brand)] cursor-pointer px-4 py-2 font-semibold text-white hover:opacity-90"
>
Sign in
</button>
</form>


<p className="text-sm text-[var(--muted-fg)] text-center">
Don’t have an account? <a href="/signup" className="text-[var(--brand)] hover:underline">Sign up</a>
</p>
</Container>
</div>
);
}