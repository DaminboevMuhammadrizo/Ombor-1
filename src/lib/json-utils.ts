import { supabase } from './supabaseClient'

export async function readJsonFile(filename: string): Promise<any[]> {
    try {
        if (filename === 'moshinalar.json') {
            const { data, error } = await supabase
                .from('moshinalar')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }

        if (filename === 'zapchastlar.json') {
            const { data, error } = await supabase
                .from('zapchastlar')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }

        if (filename === 'servislar.json') {
            const { data, error } = await supabase
                .from('servislar')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }

        return [];
    } catch (error) {
        console.error('readJsonFile xatosi:', error);
        throw error;
    }
}

export async function writeJsonFile(filename: string, data: any): Promise<any> {
    try {
        if (filename === 'moshinalar.json') {
            const { data: newData, error } = await supabase
                .from('moshinalar')
                .insert([{ moshina_nomeri: data.moshina_nomeri }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') throw new Error('Bu moshina nomeri allaqachon mavjud');
                throw error;
            }
            return newData;
        }

        if (filename === 'zapchastlar.json') {
            const { data: newData, error } = await supabase
                .from('zapchastlar')
                .insert([{
                    nomi: data.nomi,
                    kod: data.kod,
                    soni: data.soni,
                    narxi: data.narxi,
                    kelgan_sanasi: data.kelgan_sanasi
                }])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') throw new Error('Bu zapchast kodi allaqachon mavjud');
                throw error;
            }
            return newData;
        }

        if (filename === 'servislar.json') {
            const { data: newData, error } = await supabase
                .from('servislar')
                .insert([{
                    moshina_nomeri: data.moshina_nomeri,
                    description: data.description,
                    usta_haqi: data.usta_haqi || 0,
                    sanasi: data.sanasi,
                    zapchast_soni: data.zapchast_soni || 0,
                    zapchast_kod: data.zapchast_kod
                }])
                .select()
                .single();

            if (error) throw error;
            return newData;
        }

        return data;
    } catch (error) {
        console.error('writeJsonFile xatosi:', error);
        throw error;
    }
}

// DELETE function - YANGILANDI
export async function deleteFromFile(filename: string, id: number): Promise<void> {
    try {
        let tableName = '';

        if (filename === 'moshinalar.json') tableName = 'moshinalar';
        if (filename === 'zapchastlar.json') tableName = 'zapchastlar';
        if (filename === 'servislar.json') tableName = 'servislar';

        if (tableName) {
            const { error } = await supabase
                .from(tableName)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Supabase delete xatosi:', error);
                throw error;
            }
        }
    } catch (error) {
        console.error('deleteFromFile xatosi:', error);
        throw error;
    }
}

// UPDATE function - YANGI QO'SHILDI
export async function updateInFile(filename: string, id: number, updates: any): Promise<any> {
    try {
        let tableName = '';

        if (filename === 'moshinalar.json') tableName = 'moshinalar';
        if (filename === 'zapchastlar.json') tableName = 'zapchastlar';
        if (filename === 'servislar.json') tableName = 'servislar';

        if (tableName) {
            const { data, error } = await supabase
                .from(tableName)
                .update(updates)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Supabase update xatosi:', error);
                throw error;
            }
            return data;
        }

        throw new Error('Table topilmadi');
    } catch (error) {
        console.error('updateInFile xatosi:', error);
        throw error;
    }
}
