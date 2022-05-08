import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../../utils/back';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { cid } = req.query;

    try {
        const category = await prisma.category.findFirst({
            where: { id: Number(cid) }
        });

        if (!category) {
            return res.status(400).send({ error: 'Categorie introuvable' });
        }
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: 'Une erreur est survenue lors de la suppression de la catégorie (category/remove->findCategory)' });
    }

    try {
        await prisma.category.delete({
            where: { id: Number(cid) }
        });

        return res.status(200).send({ success: 'La catégorie a été supprimée avec succès' });
    } catch (error) {
        console.error(error);
        return res.status(400).send({ error: 'Une erreur est survenue lors de la suppression de la catégorie (category/remove->deleteCategory)' });
    }
};