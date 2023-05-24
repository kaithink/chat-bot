// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import { sendToGPT } from "../../gpt/client";
import * as jwt from "jsonwebtoken";

type Data =
  | string
  | {
      id: string;
      text: string;
      parentMessageId?: string;
      conversationId?: string;
    };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method !== "POST") {
    return res.status(405).send("Only POST requests allowed");
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).send("401");

  try {
    jwt.verify(token, process.env.TOKEN_SECRET as string);
  } catch (err) {
    console.log(err);
    return res.status(401).send("401");
  }

  const result = await sendToGPT(
    req.body.message,
    req.body.conversationId,
    req.body.parentMessageId
  )

  console.log(result);
  res.status(200).send({ id: result.id, text: result.text });
}
