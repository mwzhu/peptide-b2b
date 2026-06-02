import { ActivityIndicator, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BookOpen, Clock } from 'lucide-react-native';
import { color, radius } from '../../src/theme';
import { Badge, Card, Header, Screen, Text } from '../../src/components/ui';
import { titleCase } from '../../src/lib/format';
import { useEducation } from '../../src/lib/hooks';

export default function EducationArticle() {
  const params = useLocalSearchParams<{ id: string }>();
  const education = useEducation();
  const article = education.data?.find((a) => a.id === params.id);

  if (!education.data) {
    return (
      <Screen header={<Header showBack title="Article" />}>
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      </Screen>
    );
  }

  if (!article) {
    return (
      <Screen header={<Header showBack title="Article" />}>
        <Text tone="muted">Article not found.</Text>
      </Screen>
    );
  }

  return (
    <Screen header={<Header showBack title="" />}>
      <View
        style={{
          height: 150,
          borderRadius: radius['2xl'],
          backgroundColor: `hsl(${article.hue}, 38%, 85%)`,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <BookOpen size={40} color={`hsl(${article.hue}, 42%, 38%)`} />
      </View>

      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Badge label={titleCase(article.category)} tone="brand" />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Clock size={12} color={color.textMuted} />
            <Text variant="caption" tone="muted">
              {article.readMinutes} min read
            </Text>
          </View>
        </View>
        <Text variant="h1">{article.title}</Text>
      </View>

      <View style={{ gap: 14 }}>
        {article.body.map((para, i) => (
          <Text key={i} variant="body" tone="secondary">
            {para}
          </Text>
        ))}
      </View>

      <Card variant="tinted">
        <Text variant="bodySm" tone="secondary">
          Have a question about this? Message your care team from the Messages tab — they're
          glad to help.
        </Text>
      </Card>
    </Screen>
  );
}
