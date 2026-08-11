import { useCallback, useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { Fraunces_600SemiBold } from '@expo-google-fonts/fraunces';
import { Archivo_400Regular, Archivo_500Medium, Archivo_600SemiBold } from '@expo-google-fonts/archivo';
import { JetBrainsMono_400Regular, JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono';
import { surface } from '@parakh/tokens';

import { QueryClientProvider } from '@tanstack/react-query';
import { DraftContext, emptyDraft, type Draft } from '@/lib/draft';
import { queryClient } from '@/lib/query-client';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Already hidden — harmless on fast refresh.
});

export default function RootLayout() {
  /**
   * Six weights, not six families. Loading the full families would add several
   * megabytes to the APK for faces the design never uses.
   */
  const [fontsLoaded, fontError] = useFonts({
    Fraunces_600SemiBold,
    Archivo_400Regular,
    Archivo_500Medium,
    Archivo_600SemiBold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
  });

  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setTimedOut(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const draftValue = useMemo(
    () => ({
      draft,
      update: (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })),
      reset: () => setDraft({ ...emptyDraft, stepTimings: [] }),
      recordStep: (seconds: number) =>
        setDraft((d) => ({ ...d, stepTimings: [...d.stepTimings, Math.round(seconds)] })),
    }),
    [draft],
  );

  const onReady = useCallback(() => {
    if (fontsLoaded || fontError || timedOut) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError, timedOut]);

  // Rendering before fonts resolve will fall back safely if fonts take longer than 2.5s
  if (!fontsLoaded && !fontError && !timedOut) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <DraftContext.Provider value={draftValue}>
          <View style={{ flex: 1, backgroundColor: surface.applicant }} onLayout={onReady}>
            <StatusBar style="dark" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: surface.applicant },
                animation: 'slide_from_right',
              }}
            />
          </View>
        </DraftContext.Provider>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
