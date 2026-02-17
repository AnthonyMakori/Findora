import sql from "@/app/api/utils/sql";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const result = await sql`
      SELECT * FROM ratings 
      ORDER BY visited_date DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    return Response.json({ ratings: result });
  } catch (error) {
    console.error("Error fetching ratings:", error);
    return Response.json({ error: "Failed to fetch ratings" }, { status: 500 });
  }
}
