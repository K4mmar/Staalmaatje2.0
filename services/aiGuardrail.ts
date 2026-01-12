/**
 * AI GUARDRAIL SERVICE
 * Fungeert als beveiliging tussen de applicatie en de Gemini API.
 * Voorkomt loops, dubbele aanvragen en overschrijding van quota.
 */

const STORAGE_KEY = 'staalmaatje_ai_usage_v1';
const CACHE_KEY = 'staalmaatje_ai_cache_v1';

// Configuratie
const MIN_INTERVAL_MS = 3000; // Minimaal 3 seconden tussen calls
const MAX_DAILY_REQUESTS = 100; // Veiligheidslimiet voor development (zet hoger in productie)
const COOLDOWN_ON_ERROR_MS = 60000; // 1 minuut pauze na een API fout

interface UsageStats {
    date: string;
    count: number;
    lastRequestTimestamp: number;
    cooldownUntil: number;
}

interface CacheEntry {
    response: string;
    timestamp: number;
}

// Helper om vandaag als string te krijgen (YYYY-MM-DD)
const getTodayString = () => new Date().toISOString().split('T')[0];

const getUsage = (): UsageStats => {
    const raw = localStorage.getItem(STORAGE_KEY);
    const today = getTodayString();
    
    if (raw) {
        const stats: UsageStats = JSON.parse(raw);
        // Reset als het een nieuwe dag is
        if (stats.date !== today) {
            return { date: today, count: 0, lastRequestTimestamp: 0, cooldownUntil: 0 };
        }
        return stats;
    }
    
    return { date: today, count: 0, lastRequestTimestamp: 0, cooldownUntil: 0 };
};

const saveUsage = (stats: UsageStats) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
};

// Simple In-Memory + LocalStorage Cache
const getCache = (key: string): string | null => {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const cache: Record<string, CacheEntry> = JSON.parse(raw);
    const entry = cache[key];
    if (!entry) return null;

    // Cache geldig voor 24 uur
    if (Date.now() - entry.timestamp > 24 * 60 * 60 * 1000) {
        delete cache[key];
        localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
        return null;
    }
    return entry.response;
};

const setCache = (key: string, response: string) => {
    const raw = localStorage.getItem(CACHE_KEY);
    const cache: Record<string, CacheEntry> = raw ? JSON.parse(raw) : {};
    
    // Max 50 items in cache houden om opslag niet vol te laten lopen
    const keys = Object.keys(cache);
    if (keys.length > 50) {
        delete cache[keys[0]];
    }

    cache[key] = { response, timestamp: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
};

export const aiGuardrail = {
    /**
     * De hoofdpoortwachter. Voer alle AI calls hier doorheen.
     * @param identifier Een unieke string voor caching (bijv. de prompt)
     * @param apiCall De functie die daadwerkelijk de API aanroept
     */
    execute: async <T>(identifier: string, apiCall: () => Promise<T>): Promise<T> => {
        const stats = getUsage();
        const now = Date.now();

        // 1. Check Circuit Breaker (Cooldown)
        if (stats.cooldownUntil > now) {
            const waitSeconds = Math.ceil((stats.cooldownUntil - now) / 1000);
            throw new Error(`AI VEILIGHEID: Systeem is aan het afkoelen na een fout. Wacht ${waitSeconds} seconden.`);
        }

        // 2. Check Daglimiet (Lokaal slot)
        if (stats.count >= MAX_DAILY_REQUESTS) {
            throw new Error(`AI VEILIGHEID: Daglimiet van de App (${MAX_DAILY_REQUESTS}) bereikt om quota te beschermen. Probeer het morgen weer.`);
        }

        // 3. Check Cache (Bespaart API calls)
        const cached = getCache(identifier);
        if (cached) {
            console.log("🛡️ Guardrail: Antwoord uit cache gehaald (spaart quota).");
            return JSON.parse(cached) as T;
        }

        // 4. Rate Limiting (Wacht even als we te snel gaan)
        const timeSinceLast = now - stats.lastRequestTimestamp;
        if (timeSinceLast < MIN_INTERVAL_MS) {
            const waitTime = MIN_INTERVAL_MS - timeSinceLast;
            console.log(`🛡️ Guardrail: Te snel. Wachten ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        // 5. Voer uit
        try {
            console.log(`🛡️ Guardrail: API Call starten (Call #${stats.count + 1} vandaag)...`);
            const result = await apiCall();
            
            // Succes? Update stats
            saveUsage({
                ...stats,
                count: stats.count + 1,
                lastRequestTimestamp: Date.now()
            });

            // Sla op in cache
            if (result && typeof result === 'object') {
                 setCache(identifier, JSON.stringify(result));
            }

            return result;

        } catch (error: any) {
            const msg = error.toString().toLowerCase();
            
            // Als we een Quota error krijgen, trigger de cooldown
            if (msg.includes('429') || msg.includes('quota') || msg.includes('exhausted')) {
                console.error("🛡️ Guardrail: QUOTA HIT! Activeer cooldown.");
                saveUsage({
                    ...stats,
                    lastRequestTimestamp: Date.now(),
                    cooldownUntil: Date.now() + COOLDOWN_ON_ERROR_MS
                });
                throw new Error("QUOTA_LIMIT"); // Laat de UI dit afhandelen
            }

            throw error;
        }
    },

    /**
     * Reset de beveiliging handmatig (voor development)
     */
    reset: () => {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(CACHE_KEY);
        alert("Guardrail gereset. Tellers staan op 0.");
    }
};