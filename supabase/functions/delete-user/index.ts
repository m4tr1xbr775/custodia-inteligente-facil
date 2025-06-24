
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { contactId } = await req.json()

    if (!contactId) {
      return new Response(
        JSON.stringify({ success: false, error: 'Contact ID é obrigatório' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Iniciando processo de exclusão para contactId:', contactId)

    // Buscar o contato para obter o user_id
    const { data: contact, error: fetchError } = await supabaseClient
      .from('contacts')
      .select('user_id, profile')
      .eq('id', contactId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar contato:', fetchError)
      return new Response(
        JSON.stringify({ success: false, error: 'Contato não encontrado' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Contato encontrado:', contact)

    // Usar a função SQL para preparar a exclusão
    const { error: prepError } = await supabaseClient
      .rpc('handle_user_deletion_with_links', { contact_id: contactId })

    if (prepError) {
      console.error('Erro ao preparar exclusão:', prepError)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao preparar exclusão' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Excluir o contato da tabela contacts
    const { error: deleteContactError } = await supabaseClient
      .from('contacts')
      .delete()
      .eq('id', contactId)

    if (deleteContactError) {
      console.error('Erro ao excluir contato:', deleteContactError)
      return new Response(
        JSON.stringify({ success: false, error: 'Erro ao excluir contato' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Se o contato tem user_id, excluir também do Auth
    if (contact.user_id) {
      console.log('Excluindo usuário do Auth:', contact.user_id)
      
      const { error: authDeleteError } = await supabaseClient.auth.admin.deleteUser(
        contact.user_id
      )

      if (authDeleteError) {
        console.error('Erro ao excluir usuário do Auth:', authDeleteError)
        // Não falhar completamente se o usuário do Auth não puder ser excluído
        // pois o contato já foi removido
      }
    }

    console.log('Exclusão concluída com sucesso')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário excluído com sucesso do sistema e autenticação' 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Erro na edge function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Erro interno do servidor: ' + error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
