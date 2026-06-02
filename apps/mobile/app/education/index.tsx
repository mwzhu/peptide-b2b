import { ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { BookOpen, Clock } from 'lucide-react-native';
import { color, radius } from '../../src/theme';
import { Badge, Card, Header, Screen, Text } from '../../src/components/ui';
import { titleCase } from '../../src/lib/format';
import { useEducation } from '../../src/lib/hooks';

export default function EducationLibrary() {
  const router = useRouter();
  const education = useEducation();

  return (
    <Screen header={<Header showBack subtitle="Learn" title="Education library" />}>
      {!education.data ? (
        <View style={{ paddingTop: 100, alignItems: 'center' }}>
          <ActivityIndicator color={color.primary} />
        </View>
      ) : (
        education.data.map((article) => (
          <Card key={article.id} padded={false} onPress={() => router.push(`/education/${article.id}`)}>
            <View
              style={{
                height: 96,
                borderTopLeftRadius: radius['2xl'],
                borderTopRightRadius: radius['2xl'],
                backgroundColor: `hsl(${article.hue}, 38%, 86%)`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BookOpen size={30} color={`hsl(${article.hue}, 40%, 40%)`} />
            </View>
            <View style={{ padding: 16, gap: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Badge label={titleCase(article.category)} tone="brand" />
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} color={color.textMuted} />
                  <Text variant="caption" tone="muted">
                    {article.readMinutes} min read
                  </Text>
                </View>
              </View>
              <Text variant="h3">{article.title}</Text>
              <Text variant="bodySm" tone="muted">
                {article.excerpt}
              </Text>
            </View>
          </Card>
        ))
      )}
    </Screen>
  );
}
