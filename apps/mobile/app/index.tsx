import { Redirect } from 'expo-router';

/** Entry point — the onboarding flow completes into the tab navigator. */
export default function Index() {
  return <Redirect href="/onboarding" />;
}
