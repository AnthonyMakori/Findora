import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const body = await request.json();
    const { businessId, businessName, rating, review } = body;

    // Validate input
    if (!businessId || !businessName) {
      return Response.json(
        { error: "Business ID and name are required" },
        { status: 400 },
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return Response.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 },
      );
    }

    // Check if user has already rated this business
    const existingRating = await sql`
      SELECT id FROM ratings 
      WHERE business_id = ${businessId}
      LIMIT 1
    `;

    let result;
    if (existingRating.length > 0) {
      // Update existing rating
      result = await sql`
        UPDATE ratings 
        SET user_rating = ${rating},
            user_review = ${review || null},
            updated_at = CURRENT_TIMESTAMP
        WHERE business_id = ${businessId}
        RETURNING *
      `;
    } else {
      // Create new rating
      result = await sql`
        INSERT INTO ratings (business_id, business_name, user_rating, user_review)
        VALUES (${businessId}, ${businessName}, ${rating}, ${review || null})
        RETURNING *
      `;
    }

    return Response.json({
      success: true,
      rating: result[0],
    });
  } catch (error) {
    console.error("Error saving rating:", error);
    return Response.json({ error: "Failed to save rating" }, { status: 500 });
  }
}
