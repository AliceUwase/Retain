import type { Request, Response } from 'express';
import { Category } from '../models/Category';
import { Expense } from '../models/Expense';
import type { CategoryNameInput } from '../schemas/categorySchemas';
import { HttpError } from '../utils/HttpError';

// the same case-insensitive comparison the unique index uses
const IGNORE_CASE = { locale: 'en', strength: 2 };

async function findCategoryOr404(id: string) {
  const category = await Category.findById(id);
  if (!category) throw new HttpError(404, 'Category not found.');
  return category;
}

// `exceptId` leaves out the category being renamed, so keeping its own name isn't a clash
async function assertNameFree(name: string, exceptId?: string) {
  const filter = exceptId ? { name, _id: { $ne: exceptId } } : { name };
  if (await Category.exists(filter).collation(IGNORE_CASE)) {
    throw new HttpError(409, `A category named "${name}" already exists.`);
  }
}

// GET /api/categories: Uncategorized first, then A to Z
export async function listCategories(_req: Request, res: Response) {
  const categories = await Category.find().sort({ isDefault: -1, name: 1 }).collation(IGNORE_CASE);
  res.json(categories);
}

// POST /api/categories (admin)
export async function createCategory(req: Request, res: Response) {
  const { name } = req.body as CategoryNameInput;
  await assertNameFree(name);
  const category = await Category.create({ name });
  res.status(201).json(category);
}

// PATCH /api/categories/:id (admin)
export async function renameCategory(req: Request<{ id: string }>, res: Response) {
  const { name } = req.body as CategoryNameInput;
  const category = await findCategoryOr404(req.params.id);
  // every "moved to Uncategorized" message relies on this name staying the same
  if (category.isDefault) throw new HttpError(400, `"${category.name}" can't be renamed.`);

  await assertNameFree(name, category.id);
  category.name = name;
  await category.save();
  res.json(category);
}

// DELETE /api/categories/:id (admin): its expenses move to Uncategorized instead of pointing at nothing
export async function deleteCategory(req: Request<{ id: string }>, res: Response) {
  const category = await findCategoryOr404(req.params.id);
  if (category.isDefault) throw new HttpError(400, `"${category.name}" can't be deleted.`);

  const fallback = await Category.findOne({ isDefault: true });
  if (!fallback) throw new Error('No default category exists; run the seed script.');

  // expenses move first: if the delete then failed, nothing would be left pointing at a missing category
  const moved = await Expense.updateMany({ categoryId: category._id }, { categoryId: fallback._id });
  await category.deleteOne();

  res.json({ movedExpenses: moved.modifiedCount });
}
