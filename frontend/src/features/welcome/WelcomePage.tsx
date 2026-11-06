
import { Link } from "react-router-dom";

export default function WelcomePage() {
  return (
    <main>
      <h1>Mars Explorer</h1>
      <p>
        An evidence-to-expedition intelligence platform
        for exploring Mars.
      </p>

      <Link to="/explorer">
        Start Exploring
      </Link>
    </main>
  );
}
