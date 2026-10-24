/* Painel admin: endereço do Supabase.
   Enquanto os dois campos estiverem vazios, o painel abre só em modo demonstração.
   A chave "publishable" pode ficar pública: quem protege os dados são as regras do banco
   (backend/supabase-painel-admin.sql). Nunca cole aqui a "secret" / "service_role" key. */
window.FT_ADMIN_CONFIG = {
  supabaseUrl: "https://mlyahqfoslwzbwjoxaas.supabase.co",
  supabaseAnonKey: "sb_publishable_VAVTupljhEVyXcpzL5Bj_w_9WB8JEH7"
};
