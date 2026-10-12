import { render, screen } from "@testing-library/react";
import App from "./App";

test("opens on the signup page", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: /create your account/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /create account/i })).toBeInTheDocument();
});
