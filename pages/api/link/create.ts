import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../utils/back';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const name = req.body?.name as string;
    const url = req.body?.url as string;
    const favorite = Boolean(req.body?.favorite) || false;
    const categoryId = Number(req.body?.categoryId);

    if (!name) {
        return res.status(400).send({ error: 'Nom du lien manquant' });
    }

    if (!url) {
        return res.status(400).send({ error: 'URL du lien manquant' });
    }

    if (!categoryId) {
        return res.status(400).send({ error: 'Catégorie du lien manquante' });
    }

    try {
        const link = await prisma.link.findFirst({
            where: { name, categoryId }
        });

        if (link) {
            return res.status(400).send({ error: 'Un lien avec ce nom existe déjà dans cette catégorie' });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: 'Une erreur est survenue lors de la création du lien (link/create->findLink)' });
    }

    try {
        const category = await prisma.category.findFirst({
            where: { id: categoryId }
        });

        if (!category) {
            return res.status(400).send({ error: 'Cette catégorie n\'existe pas' });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: 'Une erreur est survenue lors de la création du lien (link/create->findCategory)' });
    }

    try {
        await prisma.link.create({
            data: {
                name,
                url,
                categoryId,
                favorite
            }
        });
        return res.status(200).send({ success: 'Lien créé avec succès' });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: 'Une erreur est survenue lors de la création du lien (link/create->createLink)' });
    }
}