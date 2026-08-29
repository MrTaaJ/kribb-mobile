import { useUserStore } from "@/store/user-store";
import { useUser } from "@clerk/expo";
import { useEffect } from "react";
import { useSupabase } from "./use-supabase";

export const useUserSync = () => {
  const { user } = useUser();
  const setIsAdmin = useUserStore((state) => state.setIsAdmin);
  const authSupabase = useSupabase(); // ← authenticated client

  useEffect(() => {
    if (!user) return;
    syncUser();
  }, [user]);

  const syncUser = async () => {
    const { data, error } = await authSupabase
      .from("users")
      .select("clerk_id, is_admin")
      .eq("clerk_id", user!.id)
      .single();

    //PGRST116 = no rows found, which means the user doesn't exist in the database yet

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching user from Supabase:", error);
      return;
    }

    if (data) {
      //User exists - just sync isAdmin to Zustand
      setIsAdmin(data.is_admin ?? false);
      return;
    }

    const { data: newUser, error: insertError } = await authSupabase
      .from("users")
      .insert({
        clerk_id: user!.id,
        email: user!.emailAddresses[0].emailAddress,
        first_name: user!.firstName,
        last_name: user!.lastName,
        avatar_url: user!.imageUrl,
      })
      .select("is_admin")
      .single();

    if (insertError) {
      console.error("Error inserting user into Supabase:", insertError);
      return;
    }

    setIsAdmin(newUser?.is_admin ?? false);
  };
};
