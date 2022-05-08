import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../utils/back';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { cid } = req.query;

    let category;
    try {
        category = await prisma.category.findFirst({
            where: { id: Number(cid) }
        });

        if (!category) {
            return res.status(400).send({ error: 'Catégorie introuvable' });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: 'Une erreur est survenue lors de l\'édition de la catégorie (category/edit->findCategory)' });
    }

    const name = req.body?.name as string;
    if (!name) {
        return res.status(400).send({ error: 'Nom de la catégorie manquante' });
    } else if (name === category.name) {
        return res.status(400).send({ error: 'Le nom de la catégorie doit être différent du nom actuel' });
    }

    try {
        await prisma.category.update({
            where: { id: Number(cid) },
            data: { name }
        });

        return res.status(200).send({ success: 'Catégorie mise à jour avec succès' });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: 'Une erreur est survenue lors de l\'édition de la catégorie (category/edit->updateCategory)' });
    }
}