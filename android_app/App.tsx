import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet, ActivityIndicator } from "react-native";

/**
 * Replace this with the base URL of your deployed API. When running locally, you might use
 * something like "http://localhost:3000/api". On Vercel, this will be something like
 * "https://your-project.vercel.app/api". Do not include a trailing slash.
 */
// Base URL of your deployed API. The Express router is mounted at `/api/market`,
// so the mobile client will hit endpoints like `${API_BASE}/market/snapshot`.
const API_BASE = "https://new-markets-theta.vercel.app/api/market";

type SnapshotCategory = {
  key: string;
  label: string;
  score: number;
  weight: number;
  status: string;
  summary: string;
  signals: string[];
};

type MarketSnapshot = {
  decision: string;
  marketQualityScore: number;
  executionWindowScore: number;
  riskFlags: string[];
  categories: SnapshotCategory[];
  providerStatuses: { provider: string; status: string; message: string }[];
};

export default function App() {
  const [data, setData] = useState<MarketSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchSnapshot() {
    try {
      const res = await fetch(`${API_BASE}/market/snapshot`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      setData(json as MarketSnapshot);
      setError(null);
    } catch (err) {
      console.error(err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  // Poll the API every 3 seconds for updates
  useEffect(() => {
    fetchSnapshot();
    const interval = setInterval(fetchSnapshot, 3000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" />
        <Text>Loading market snapshot…</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.error}>Error: {error}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {data && (
          <>
            <Text style={styles.decision}>Decision: {data.decision}</Text>
            <Text style={styles.score}>Market Quality: {data.marketQualityScore}</Text>
            <Text style={styles.score}>Execution Window: {data.executionWindowScore}</Text>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Risk Flags</Text>
              {data.riskFlags.length > 0 ? (
                data.riskFlags.map((flag, idx) => (
                  <Text key={idx} style={styles.flag}>• {flag}</Text>
                ))
              ) : (
                <Text style={styles.flag}>No risk flags detected.</Text>
              )}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categories</Text>
              {data.categories.map((cat) => (
                <View key={cat.key} style={styles.category}>
                  <Text style={styles.categoryTitle}>{cat.label} — {cat.score} ({cat.status})</Text>
                  <Text style={styles.categorySummary}>{cat.summary}</Text>
                  {cat.signals.map((sig, idx) => (
                    <Text key={idx} style={styles.signal}>– {sig}</Text>
                  ))}
                </View>
              ))}
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Providers</Text>
              {data.providerStatuses.map((ps, idx) => (
                <Text key={idx} style={styles.provider}>[{ps.provider}] {ps.status} – {ps.message}</Text>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  decision: { fontSize: 24, fontWeight: "700", marginBottom: 8 },
  score: { fontSize: 18, marginBottom: 4 },
  section: { marginTop: 16 },
  sectionTitle: { fontSize: 20, fontWeight: "600", marginBottom: 4 },
  flag: { fontSize: 16, marginLeft: 8 },
  category: { marginBottom: 12, paddingBottom: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderColor: "#e5e7eb" },
  categoryTitle: { fontSize: 18, fontWeight: "600" },
  categorySummary: { fontSize: 16, marginVertical: 2, color: "#475569" },
  signal: { fontSize: 14, marginLeft: 12, color: "#334155" },
  provider: { fontSize: 14, color: "#475569", marginLeft: 8 },
  error: { fontSize: 18, color: "red" },
});
