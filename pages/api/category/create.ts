import { NextApiRequest, NextApiResponse } from 'next';

import { apiRoute } from '../../../utils/back';

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

apiRoute.post(async (req: NextApiRequest, res: NextApiResponse) => {
    const name = req.body?.name as string;

    if (!name) {
        return res.status(400).send({ error: 'Nom de catégorie manquant' });
    }

    try {
        const category = await prisma.category.findFirst({
            where: { name }
        });

        if (category) {
            return res.status(400).send({ error: 'Une catégorie avec ce nom existe déjà' });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: 'Une erreur est survenue lors de la création de la catégorie' });
    }

    try {
        await prisma.category.create({
            data: { name }
        });
        return res.status(200).send({ success: 'Catégorie créée avec succès' });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: 'Une erreur est survenue lors de la création de la catégorie' });
    }
});

export default apiRoute;