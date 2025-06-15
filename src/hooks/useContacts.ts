
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Contact = Tables<"contacts"> & {
  regions?: Tables<"regions">;
};

export const useContacts = () => {
  return useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select(`
          *,
          regions (*)
        `)
        .eq("active", true)
        .order("name");
      
      if (error) throw error;
      return data as Contact[];
    },
  });
};
