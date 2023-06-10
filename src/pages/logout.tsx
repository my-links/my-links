import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";

import PATHS from "constants/paths";

export default function PageLogout() {
  const { status } = useSession();

  useEffect(() => {
    signOut({ callbackUrl: PATHS.LOGIN });
  }, [status]);

  return <></>;
}
