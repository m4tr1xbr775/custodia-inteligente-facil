
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type PrisonUnit = Tables<"prison_units"> & {
  regions: Tables<"regions">;
};

export const usePrisonUnits = () => {
  return useQuery({
    queryKey: ["prison_units"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prison_units")
        .select(`
          *,
          regions (*)
        `)
        .order("name");
      
      if (error) throw error;
      return data as PrisonUnit[];
    },
  });
};
