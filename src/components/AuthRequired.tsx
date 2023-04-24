import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

export default function Auth({ children }) {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated: () =>
      router.push(
        `/signin?info=${encodeURI(
          "Vous devez être connecté pour accéder à cette page"
        )}`
      ),
  });

  if (status === "loading") {
    return (
      <div className="App" style={{ alignItems: "center" }}>
        <p style={{ height: "fit-content" }}>
          Chargement de la session en cours
        </p>
      </div>
    );
  }

  return children;
}
