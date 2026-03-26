import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
	ProductCreateSchema,
	ProductUpdateSchema,
} from "../lib/schemas/product";
import z from "zod";

const router = Router();

router.get("/", async (_req, res, next) => {
	try {
		const products = await prisma.product.findMany();
		return res.json(products);
	} catch (error) {
		next(error);
	}
});

router.post("/", async (req, res, next) => {
	try {
		const body = ProductCreateSchema.safeParse(req.body);
		if (!body.success) {
			return res
				.status(400)
				.json({ message: "Invalid body", errors: z.treeifyError(body.error) });
		}

		const created = await prisma.product.create({
			data: {
				...body.data,
			},
		});

		return res.status(201).json(created);
	} catch (error) {
		next(error);
	}
});

router.get("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const product = await prisma.product.findUnique({
			where: { id },
		});
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}
		return res.json(product);
	} catch (error) {
		next(error);
	}
});

router.put("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const body = ProductUpdateSchema.safeParse(req.body);
		if (!body.success) {
			return res
				.status(400)
				.json({ message: "Invalid body", errors: z.treeifyError(body.error) });
		}
		const updated = await prisma.product.update({
			where: { id },
			data: body.data,
		});
		return res.status(200).json(updated);
	} catch (error) {
		next(error);
	}
});

router.delete("/:id", async (req, res, next) => {
	try {
		const { id } = req.params;
		const product = await prisma.product.findUnique({
			where: { id },
		});
		if (!product) {
			return res.status(404).json({ message: "Product not found" });
		}
		const deleted = await prisma.product.delete({
			where: { id },
		});
		return res.status(200).json(deleted);
	} catch (error) {
		next(error);
	}
});

export default router;
