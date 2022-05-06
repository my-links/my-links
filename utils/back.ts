import { NextApiRequest, NextApiResponse } from 'next';
import nextConnect, { NextHandler } from 'next-connect';

import { Session } from 'next-auth';
import { getSession } from 'next-auth/react';

const apiRoute = nextConnect({
    onError: (error: Error, req: NextApiRequest, res: NextApiResponse) => res.status(501).json({ error: `Une erreur est survenue! ${error.message}` }),
    onNoMatch: (req: NextApiRequest, res: NextApiResponse) => res.status(405).json({ error: `La méthode '${req.method}' n'est pas autorisée` })
});

apiRoute.use(async (req: NextApiRequest, res: NextApiResponse, next: NextHandler) => {
    const session: Session = await getSession({ req });
    if (!session) {
        return res.status(403).json({ error: 'Vous devez être connecté' });
    } else {
        next();
    }
});

export { apiRoute };