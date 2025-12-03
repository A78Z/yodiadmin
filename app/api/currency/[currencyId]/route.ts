import { NextResponse } from "next/server";
import Currency from "@/lib/models/currency";
import { connectDB } from "@/lib/db/dbase";

await connectDB();
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ currencyId: string }> }
) {
  try {
    const { currencyId } = await params;
    const data = await req.json();

    const currency = await Currency.findByIdAndUpdate(
      currencyId,
      { $set: data },
      { new: true, runValidators: true }
    );
    if (!currency) {
      return NextResponse.json(
        { error: "Devise non trouvée" },
        { status: 404 }
      );
    }
    return NextResponse.json(currency, { status: 200 });
  } catch (error) {
    console.error("Erreur lors de la récupération de la devise:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de la devise" },
      { status: 500 }
    );
  }
}
