import { Stack } from "expo-router";

export default function RootLayout() {
  return <Stack>
    <Stack.Screen
            name="index"
            options={{ title: 'Liste des documents' }} // ⬅️ Ici tu changes le titre
          />
  </Stack>;
}
