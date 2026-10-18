// Fills the database with demo data. It only resets the demo accounts' own expenses and budgets,
// so it's safe to run again at any time: other users and admin-made categories are left alone.
import { randomBytes } from 'node:crypto';
import mongoose, { type Types } from 'mongoose';
import { connectDB } from '../config/db';
import { required } from '../config/env';
import { Budget } from '../models/Budget';
import { Category } from '../models/Category';
import { Expense } from '../models/Expense';
import { User } from '../models/User';
import { hashPassword } from '../utils/password';
import {
  CATEGORY_NAMES,
  DEFAULT_CATEGORY,
  demoBudgets,
  demoExpenses,
  janeBudgets,
  janeExpenses,
  type SampleExpense,
} from './data';

const JANE_EMAIL = 'jane.sample@retain.app'; // sample user only, nobody logs in as her

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

// 'YYYY-MM-DD' for the day `n` days before today
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// 'YYYY-MM' for the month `n` months before this one
function monthsAgo(n: number): string {
  const now = new Date();
  const d = new Date(now.getFullYear(), now.getMonth() - n, 1);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

// adds missing default categories and returns every category's id by name
async function ensureCategories(): Promise<Map<string, Types.ObjectId>> {
  const ids = new Map<string, Types.ObjectId>();

  for (const name of CATEGORY_NAMES) {
    const isDefault = name === DEFAULT_CATEGORY;
    // same case-insensitive comparison as the unique index, so "food & drink" counts as existing
    let category = await Category.findOne({ name }).collation({ locale: 'en', strength: 2 });
    category ??= await Category.create({ name, isDefault });
    if (isDefault && !category.isDefault) {
      category.isDefault = true;
      await category.save();
    }
    ids.set(name, category._id);
  }
  return ids;
}

// creates the account, or updates the existing one with the same email (name, role and password)
async function upsertUser(name: string, email: string, role: 'user' | 'admin', password: string) {
  const passwordHash = await hashPassword(password);
  return User.findOneAndUpdate(
    { email: email.trim().toLowerCase() },
    { name, role, passwordHash },
    { upsert: true, returnDocument: 'after', runValidators: true },
  );
}

// replaces one user's expenses and budgets with fresh samples dated around today
async function resetSampleData(
  userId: Types.ObjectId,
  expenses: SampleExpense[],
  budgets: [number, number][],
  categoryIds: Map<string, Types.ObjectId>,
) {
  await Expense.deleteMany({ userId });
  await Budget.deleteMany({ userId });

  await Expense.insertMany(
    expenses.map(([title, amount, category, days, paymentMethod, notes]) => {
      const date = daysAgo(days);
      const addedAt = new Date(`${date}T18:30:00`); // "added" on the day it was spent, at 6:30 PM
      return { userId, title, amount, categoryId: categoryIds.get(category), date, paymentMethod, notes, createdAt: addedAt, updatedAt: addedAt };
    }),
    { timestamps: false }, // keeps the createdAt above instead of "now"
  );

  await Budget.insertMany(budgets.map(([monthsBack, amount]) => ({ userId, month: monthsAgo(monthsBack), amount })));
}

async function seed() {
  // read first, so a missing setting stops the script before anything is written
  const admin = { email: required('SEED_ADMIN_EMAIL'), password: required('SEED_ADMIN_PASSWORD') };
  const demo = { email: required('SEED_DEMO_EMAIL'), password: required('SEED_DEMO_PASSWORD') };

  await connectDB();

  const categoryIds = await ensureCategories();

  await upsertUser('Admin', admin.email, 'admin', admin.password);
  const demoUser = await upsertUser('Demo User', demo.email, 'user', demo.password);
  // a random password nobody knows, since Jane is only there as sample data
  const jane = await upsertUser('Jane Doe', JANE_EMAIL, 'user', randomBytes(24).toString('hex'));

  await resetSampleData(demoUser._id, demoExpenses, demoBudgets, categoryIds);
  await resetSampleData(jane._id, janeExpenses, janeBudgets, categoryIds);

  console.log(`
Seed complete:
  ${categoryIds.size} default categories checked
  ${demoExpenses.length + janeExpenses.length} sample expenses, ${demoBudgets.length + janeBudgets.length} budgets

Log in with:
  Demo user  ${demo.email}
  Admin      ${admin.email}
  (passwords are the ones in your .env)
`);
}

seed()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect()); // closes the connection so the script can exit
