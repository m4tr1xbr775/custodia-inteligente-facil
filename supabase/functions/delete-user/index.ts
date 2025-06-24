
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { contactId } = await req.json()

    console.log('Iniciando processo de exclusão para contactId:', contactId)

    // Primeiro, buscar o user_id associado ao contato
    const { data: contact, error: contactError } = await supabaseAdmin
      .from('contacts')
      .select('user_id, name, email')
      .eq('id', contactId)
      .single()

    if (contactError) {
      console.error('Erro ao buscar contato:', contactError)
      throw new Error(`Erro ao buscar contato: ${contactError.message}`)
    }

    if (!contact) {
      throw new Error('Contato não encontrado')
    }

    console.log('Contato encontrado:', contact)

    // Excluir o usuário do auth.users se existir user_id
    if (contact.user_id) {
      console.log('Excluindo usuário do auth.users:', contact.user_id)
      
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(
        contact.user_id
      )

      if (authDeleteError) {
        console.error('Erro ao excluir usuário do auth:', authDeleteError)
        throw new Error(`Erro ao excluir usuário do sistema de autenticação: ${authDeleteError.message}`)
      }

      console.log('Usuário excluído do auth.users com sucesso')
    }

    // Excluir o contato (as notificações serão excluídas automaticamente devido ao CASCADE)
    const { error: deleteError } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', contactId)

    if (deleteError) {
      console.error('Erro ao excluir contato:', deleteError)
      throw new Error(`Erro ao excluir contato: ${deleteError.message}`)
    }

    console.log('Contato excluído com sucesso')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Usuário ${contact.name} excluído com sucesso do sistema e da autenticação.`
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Erro na edge function delete-user:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erro interno do servidor'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
