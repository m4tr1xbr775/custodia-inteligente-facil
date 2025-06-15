
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Audience = Tables<"audiences"> & {
  regions: Tables<"regions">;
  prison_units: Tables<"prison_units">;
  magistrates?: Tables<"magistrates">;
  prosecutors?: Tables<"prosecutors">;
  defenders?: Tables<"defenders">;
  police_officers?: Tables<"police_officers">;
};

export const useAudiences = () => {
  return useQuery({
    queryKey: ["audiences"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("audiences")
        .select(`
          *,
          regions (*),
          prison_units (*),
          magistrates (*),
          prosecutors (*),
          defenders (*),
          police_officers (*)
        `)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true });
      
      if (error) throw error;
      return data as Audience[];
    },
  });
};
