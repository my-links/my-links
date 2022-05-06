import { NextApiRequest, NextApiResponse } from 'next';

import { apiRoute } from '../../../../utils/back';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

apiRoute.delete(async (req: NextApiRequest, res: NextApiResponse) => {
    const { lid } = req.query;

    try {
        const link = await prisma.link.findFirst({
            where: { id: Number(lid) }
        });

        if (!link) {
            return res.status(400).send({ error: 'Lien introuvable' });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: 'Une erreur est survenue lors de la suppression du lien' });
    }

    try {
        await prisma.link.delete({
            where: { id: Number(lid) }
        });

        return res.status(200).send({ success: 'Le lien a été supprimé avec succès' });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: 'Une erreur est survenue lors de la suppression du lien' });
    }
});

export default apiRoute;