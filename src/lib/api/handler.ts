import { User } from "@prisma/client";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import getUserOrThrow from "lib/user/getUserOrThrow";
import { NextApiRequest, NextApiResponse } from "next";
import { Session } from "next-auth";
import { getSession } from "utils/session";

type ApiHandlerMethod = ({
  req,
  res,
  session,
  user,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
  session: Session;
  user: User;
}) => Promise<void>;

// This API Handler strongly inspired by
// Source: https://jasonwatmore.com/next-js-13-middleware-for-authentication-and-error-handling-on-api-routes

export function apiHandler(handler: {
  get?: ApiHandlerMethod;
  post?: ApiHandlerMethod;
  put?: ApiHandlerMethod;
  patch?: ApiHandlerMethod;
  delete?: ApiHandlerMethod;
}) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const method = req.method.toLowerCase();
    if (!handler[method])
      return res
        .status(405)
        .json({ error: `Method ${req.method} Not Allowed` });

    try {
      const session = await getSession(req, res);
      const user = await getUserOrThrow(session);

      await handler[method]({ req, res, session, user });
    } catch (err) {
      errorHandler(err, res);
    }
  };
}

function errorHandler(error: any, response: NextApiResponse) {
  if (typeof error === "string") {
    const is404 = error.toLowerCase().endsWith("not found");
    const statusCode = is404 ? 404 : 400;

    return response.status(statusCode).json({ message: error });
  }

  // does not fit with current error throwed
  // TODO: fix errors returned
  // by getSessionOrThrow or getUserOrThrow
  if (error.name === "UnauthorizedError") {
    // authentication error
    return response.status(401).json({ message: "You must be connected" });
  }

  const errorMessage =
    error.constructor.name === "PrismaClientKnownRequestError"
      ? handlePrismaError(error) // Handle Prisma specific errors
      : error.message;

  return response.status(400).json({ error: errorMessage });
}

function handlePrismaError({
  meta,
  code,
  message,
}: PrismaClientKnownRequestError) {
  switch (code) {
    case "P2002":
      return `Duplicate field value: ${meta.target}`;
    case "P2003":
      return `Foreign key constraint failed on the field: ${meta.field_name}`;
    case "P2014":
      return `Invalid ID: ${meta.target}`;
    case "P2003":
      return `Invalid input data: ${meta.target}`;

    // Details should not leak to client, be carreful with this
    default:
      return `Something went wrong: ${message}`;
  }
}
