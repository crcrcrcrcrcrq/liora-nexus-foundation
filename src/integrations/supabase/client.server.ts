type AnyClient = any;
function createMockQuery() {
  const mock: any = {
    data: null, error: null,
    from: () => mock, select: () => mock, eq: () => mock,
    single: async () => ({ data: null, error: null }),
    maybeSingle: async () => ({ data: null, error: null }),
    insert: async () => ({ data: null, error: null }),
    update: async () => ({ data: null, error: null }),
    delete: async () => ({ data: null, error: null }),
    auth: {
      getUser: async () => ({ data: { user: { id: "1250521295" } }, error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
    },
  };
  return mock;
}
export const supabaseAdmin: AnyClient = new Proxy(createMockQuery(), {
  get(t,p){ if(p in t) return (t as any)[p]; return ()=>createMockQuery(); }
});
export const supabaseAnon = supabaseAdmin;
export const createSupabaseServerClient = () => supabaseAdmin;
export default supabaseAdmin;
