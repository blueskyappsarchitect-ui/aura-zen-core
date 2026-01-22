import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Verify authentication first
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create client with user's auth token to verify authentication
    const supabaseAuth = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    
    if (authError || !user) {
      console.error("Authentication failed:", authError?.message);
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized - Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Verify user is admin
    const { data: isAdmin } = await supabaseAuth.rpc('is_admin', { _user_id: user.id });
    
    if (!isAdmin) {
      console.error(`User ${user.id} attempted to call setup-test-account without admin privileges`);
      return new Response(
        JSON.stringify({ success: false, error: "Forbidden - Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Admin ${user.id} calling setup-test-account`);
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const testEmail = "tester@auraflow.com";
    const testPassword = "AuraTest2026!";

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existingUser = existingUsers?.users?.find(u => u.email === testEmail);
    
    let userId: string;
    
    if (existingUser) {
      userId = existingUser.id;
      console.log("Test user already exists:", userId);
    } else {
      // Create the test user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
      });

      if (createError) {
        throw new Error(`Failed to create user: ${createError.message}`);
      }
      
      userId = newUser.user.id;
      console.log("Created test user:", userId);
    }

    // Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from("user_profiles")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!existingProfile) {
      // Create user profile with partial vine growth
      const { error: profileError } = await supabaseAdmin
        .from("user_profiles")
        .insert({
          user_id: userId,
          aura_score: 250,
          daily_streak: 5,
          has_completed_onboarding: true,
          display_name: "Amazon Tester",
          vine_species: "ivy",
          badges: JSON.stringify(["first_bloom", "early_bird"]),
          last_watered_date: null, // Not watered today - shows "Thirsty" state
          streak_frozen: false,
          last_active_date: new Date().toISOString().split('T')[0],
        });

      if (profileError) {
        console.error("Profile insert error:", profileError);
      }
    } else {
      // Update existing profile
      const { error: updateError } = await supabaseAdmin
        .from("user_profiles")
        .update({
          aura_score: 250,
          daily_streak: 5,
          has_completed_onboarding: true,
          display_name: "Amazon Tester",
          vine_species: "ivy",
          badges: JSON.stringify(["first_bloom", "early_bird"]),
          last_watered_date: null,
          streak_frozen: false,
          last_active_date: new Date().toISOString().split('T')[0],
        })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Profile update error:", updateError);
      }
    }

    // Delete any existing tasks for this user (clean slate)
    await supabaseAdmin
      .from("tasks")
      .delete()
      .eq("user_id", userId);

    // Add 5 dummy tasks for today
    const today = new Date().toISOString().split('T')[0];
    const dummyTasks = [
      {
        user_id: userId,
        title: "Morning Meditation",
        category: "health",
        start_time: "08:00",
        duration: 30,
        task_date: today,
        energy_level: "low",
        subtasks: JSON.stringify([
          { id: "1a", text: "Find quiet space", completed: true },
          { id: "1b", text: "Set timer for 20 min", completed: true },
          { id: "1c", text: "Focus on breathing", completed: false },
        ]),
      },
      {
        user_id: userId,
        title: "Review App Features",
        category: "work",
        start_time: "09:30",
        duration: 45,
        task_date: today,
        energy_level: "high",
        subtasks: JSON.stringify([
          { id: "2a", text: "Check task timeline", completed: false },
          { id: "2b", text: "Test focus mode", completed: false },
          { id: "2c", text: "Explore Grove tab", completed: false },
        ]),
      },
      {
        user_id: userId,
        title: "Water the Vine",
        category: "personal",
        start_time: "11:00",
        duration: 15,
        task_date: today,
        energy_level: "medium",
        subtasks: JSON.stringify([
          { id: "3a", text: "Tap the water droplet", completed: false },
          { id: "3b", text: "Watch vine grow", completed: false },
        ]),
      },
      {
        user_id: userId,
        title: "Complete a Focus Session",
        category: "work",
        start_time: "13:00",
        duration: 60,
        task_date: today,
        energy_level: "high",
        subtasks: JSON.stringify([
          { id: "4a", text: "Click 'Start Focus'", completed: false },
          { id: "4b", text: "Complete all microsteps", completed: false },
          { id: "4c", text: "Earn Super Bloom!", completed: false },
        ]),
      },
      {
        user_id: userId,
        title: "Evening Reflection",
        category: "personal",
        start_time: "18:00",
        duration: 20,
        task_date: today,
        energy_level: "low",
        subtasks: JSON.stringify([
          { id: "5a", text: "Review completed tasks", completed: false },
          { id: "5b", text: "Celebrate progress", completed: false },
        ]),
      },
    ];

    const { error: tasksError } = await supabaseAdmin
      .from("tasks")
      .insert(dummyTasks);

    if (tasksError) {
      console.error("Tasks insert error:", tasksError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Test account setup complete",
        email: testEmail,
        userId: userId,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Setup error:", errorMessage);
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
