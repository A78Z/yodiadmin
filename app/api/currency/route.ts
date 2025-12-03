import { NextResponse } from "next/server";
import Currency from "@/lib/models/currency";
import { connectDB } from "@/lib/db/dbase";

await connectDB();

export async function POST(req: Request) {
  const { name, rate } = await req.json();

  try {
    const currency = await Currency.create({ name, rate });
    return NextResponse.json(currency, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la devise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la devise" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const currency = await Currency.findOne().select("_id name rate");
    return NextResponse.json(currency, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de la devise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la devise" },
      { status: 500 }
    );
  }
}
