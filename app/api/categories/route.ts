import { NextResponse } from "next/server";
import { listCategoriesWithSubcategories } from "@/lib/categoryService";

export async function GET() {
  const categories = await listCategoriesWithSubcategories();
  return NextResponse.json(categories);
}
