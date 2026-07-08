import { loginCommandCenter } from "./actions";

type LoginFormProps = {
  error?: string;
};

export default function LoginForm({ error }: LoginFormProps) {
  return (
    <main className="cc-login">
      <section className="cc-login-card" aria-labelledby="command-center-login">
        <div className="cc-login-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21c-5 0-8-3.6-8-8.2C4 7 9 3.4 19 3c.6 8.6-2 18-7 18Z"
              stroke="currentColor"
              strokeWidth={1.7}
            />
            <path
              d="M12 21c.4-6 2.4-10.4 6-13.5"
              stroke="currentColor"
              strokeLinecap="round"
              strokeWidth={1.5}
            />
          </svg>
        </div>

        <p className="cc-login-kicker">Restricted Super Admin Access</p>
        <h1 id="command-center-login">Poshane Command Center</h1>
        <p className="cc-login-copy">
          Sign in with the authorised super admin credentials to access the
          KSLSA Five Crore Sapling Programme operations console.
        </p>

        {error === "invalid" && (
          <p className="cc-login-error" role="alert">
            Invalid email or password. Please check the super admin credentials
            and try again.
          </p>
        )}

        <form action={loginCommandCenter} className="cc-login-form">
          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              autoComplete="username"
              defaultValue="ml@feedbacknfc.com"
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>

          <button type="submit">Enter Command Center</button>
        </form>
      </section>
    </main>
  );
}
