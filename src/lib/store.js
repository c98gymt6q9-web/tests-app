import { supabase } from "./supabaseClient.js";

// Простая замена window.storage (get/set) поверх одной таблицы kv_store
// в Supabase. Один ряд = один ключ, значение хранится как jsonb-строка,
// так что вся остальная логика приложения (App.jsx) не меняется —
// меняется только то, откуда берутся и куда пишутся данные.

export async function getKV(key) {
  const { data, error } = await supabase
    .from("kv_store")
    .select("value")
    .eq("key", key)
    .maybeSingle();
  if (error) {
    console.error(`Ошибка чтения ключа "${key}"`, error);
    return null;
  }
  return data ? data.value : null;
}

export async function setKV(key, value) {
  const { error } = await supabase
    .from("kv_store")
    .upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) {
    console.error(`Ошибка записи ключа "${key}"`, error);
    throw error;
  }
}
