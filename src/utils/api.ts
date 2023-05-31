import { NextApiRequest } from "next";

export function checkMethodAllowedOrThrow(
  req: NextApiRequest,
  methods: Array<RequestInit["method"]>
) {
  const isMethodAllowed = methods.includes(req.method.toLowerCase());
  if (!isMethodAllowed) {
    throw new Error(`Method ${req.method} not allowed`);
  }
  return isMethodAllowed;
}
