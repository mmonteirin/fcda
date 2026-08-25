import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ucesipxemhrugmqwxtei.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjZXNpcHhlbWhydWdtcXd4dGVpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDM2MDA5MCwiZXhwIjoyMDk1OTM2MDkwfQ.wPvjH7dRC9mLJjPkjWQgVJcuel3KMEJ6Lg2lu2d4tAQ';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkEvento() {
  const eventoId = 'fd313266-2185-4f12-9bbc-cab1e94d317b';
  
  console.log(`Verificando evento ${eventoId}...`);
  
  const { data, error } = await supabase
    .from('eventos')
    .select('*')
    .eq('id', eventoId)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      console.log('❌ Evento não encontrado no banco de dados');
      
      // Criar o evento
      console.log('Criando evento...');
      const { data: newEvento, error: insertError } = await supabase
        .from('eventos')
        .insert({
          id: eventoId,
          nome: '2ª Etapa - 5ª Copa Cearense de Natação - Não Federados',
          data_texto: '29 de Agosto de 2026',
          data_inicio: '2026-08-29',
          data_fim: '2026-08-29',
          local: 'Cuca Mondubim',
          modalidade: 'Natação',
          ano: 2026,
          descricao: 'Segunda etapa da 5ª Copa Cearense de Natação para não federados, realizada no Cuca Mondubim.',
          status: 'inscricoes_abertas',
          link_inscricao: 'https://www.swimsystem.app/onboarding/8db472d3-cb28-4f0f-b9f3-c673c95ab0c6/athletes/sales/ow',
          imagem_url: null
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('Erro ao criar evento:', insertError);
      } else {
        console.log('✅ Evento criado com sucesso:', newEvento);
      }
    } else {
      console.error('Erro ao buscar evento:', error);
    }
  } else {
    console.log('✅ Evento encontrado:', data);
  }
}

checkEvento().catch(console.error);