export default defineNuxtPlugin(() => {
  const cookie = useCookie<"light" | "dark">("lumora_theme", {
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    default: () => "light",
  });

  document.documentElement.classList.toggle("dark", cookie.value === "dark");
});