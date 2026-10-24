/* Painel admin: endereço do Supabase.
   Enquanto os dois campos estiverem vazios, o painel abre só em modo demonstração.
   A "anon key" pode ficar pública: quem protege os dados são as regras do banco
   (backend/supabase-painel-admin.sql). Nunca cole aqui a "service_role" key. */
window.FT_ADMIN_CONFIG = {
  supabaseUrl: "",
  supabaseAnonKey: ""
};
