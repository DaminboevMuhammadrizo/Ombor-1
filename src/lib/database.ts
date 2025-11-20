import { supabase } from "./supabaseClient";

// INTERFACES
export interface Moshina {
  id: number;
  moshina_nomeri: string;
  created_at: string;
}

export interface Zapchast {
  id: number;
  nomi: string;
  kod: string;
  soni: number;
  narxi: number;
  kelgan_sanasi: string;
  created_at: string;
}

export interface Servis {
  id: number;
  moshina_nomeri: string;
  description: string;
  usta_haqi: number;
  sanasi: string;
  zapchast_soni: number;
  zapchast_kod: string;
  created_at: string;
}

// 📁 MOSHINALAR CRUD
export async function getMoshinalar(): Promise<Moshina[]> {
  const { data, error } = await supabase
    .from('moshinalar')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addMoshina(moshina_nomeri: string): Promise<Moshina> {
  const { data, error } = await supabase
    .from('moshinalar')
    .insert([{ moshina_nomeri }])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Bu moshina nomeri allaqachon mavjud');
    throw error;
  }
  return data;
}

export async function deleteMoshina(id: number): Promise<void> {
  const { error } = await supabase
    .from('moshinalar')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 📁 ZAPCHASTLAR CRUD
export async function getZapchastlar(): Promise<Zapchast[]> {
  const { data, error } = await supabase
    .from('zapchastlar')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addZapchast(zapchast: Omit<Zapchast, 'id' | 'created_at'>): Promise<Zapchast> {
  const { data, error } = await supabase
    .from('zapchastlar')
    .insert([zapchast])
    .select()
    .single();

  if (error) {
    if (error.code === '23505') throw new Error('Bu zapchast kodi allaqachon mavjud');
    throw error;
  }
  return data;
}

export async function updateZapchast(id: number, updates: Partial<Zapchast>): Promise<Zapchast> {
  const { data, error } = await supabase
    .from('zapchastlar')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteZapchast(id: number): Promise<void> {
  const { error } = await supabase
    .from('zapchastlar')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 📁 SERVISLAR CRUD
export async function getServislar(): Promise<Servis[]> {
  const { data, error } = await supabase
    .from('servislar')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function addServis(servis: Omit<Servis, 'id' | 'created_at'>): Promise<Servis> {
  const { data, error } = await supabase
    .from('servislar')
    .insert([servis])
    .select()
    .single();

  if (error) throw error;

  // Zapchast sonini yangilash
  if (servis.zapchast_kod && servis.zapchast_soni > 0) {
    await updateZapchastSoni(servis.zapchast_kod, -servis.zapchast_soni);
  }

  return data;
}

export async function deleteServis(id: number): Promise<void> {
  const { error } = await supabase
    .from('servislar')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// 🔧 YORDAMCHI FUNCTIONS
async function updateZapchastSoni(kod: string, soniOzgariishi: number): Promise<void> {
  // Zapchastni topish
  const { data: zapchast } = await supabase
    .from('zapchastlar')
    .select('soni')
    .eq('kod', kod)
    .single();

  if (zapchast) {
    const yangiSoni = Math.max(0, zapchast.soni + soniOzgariishi);

    await supabase
      .from('zapchastlar')
      .update({ soni: yangiSoni })
      .eq('kod', kod);
  }
}
