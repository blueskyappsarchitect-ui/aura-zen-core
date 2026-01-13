import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get today's date
    const today = new Date().toISOString().split('T')[0];

    // Check if today's record already exists
    const { data: existingRecord } = await supabase
      .from("global_oxygen")
      .select("id")
      .eq("date", today)
      .maybeSingle();

    if (existingRecord) {
      console.log(`Global oxygen record for ${today} already exists`);
      return new Response(
        JSON.stringify({ success: true, message: "Record already exists for today" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create new record for today with fresh counts
    const { data, error } = await supabase
      .from("global_oxygen")
      .insert({
        date: today,
        water_count: 0,
        target_count: 100,
        bonus_active_until: null,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating global oxygen record:", error);
      throw error;
    }

    console.log(`Created new global oxygen record for ${today}:`, data);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Created new global oxygen record for ${today}`,
        data 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Error in reset-global-oxygen:", error);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
