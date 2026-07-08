import { logoutCommandCenter } from "./actions";

export default function LogoutButton() {
  return (
    <form action={logoutCommandCenter} className="cc-logout">
      <button type="submit">Sign out</button>
    </form>
  );
}
