import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get("businessId");

    if (!businessId) {
      return Response.json(
        { error: "Business ID is required" },
        { status: 400 },
      );
    }

    const result = await sql`
      SELECT * FROM ratings 
      WHERE business_id = ${businessId}
      LIMIT 1
    `;

    if (result.length === 0) {
      return Response.json({ rating: null });
    }

    return Response.json({ rating: result[0] });
  } catch (error) {
    console.error("Error fetching rating:", error);
    return Response.json({ error: "Failed to fetch rating" }, { status: 500 });
  }
}
