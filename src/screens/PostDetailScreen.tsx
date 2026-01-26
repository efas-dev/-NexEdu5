/**
 * PostDetailScreen
 *
 * Tela de detalhes do post com layout moderno e hierarquia tipográfica
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Divider } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { PostsStackParamList } from '../navigation/AppNavigator';
import { ScreenLayout } from '../components/layouts/ScreenLayout';
import { Card } from '../components/ui/Card';
import { useTheme } from '../hooks/useTheme';
import { spacing } from '../theme/tokens';

type Props = NativeStackScreenProps<PostsStackParamList, 'PostDetail'>;

export default function PostDetailScreen({ route }: Props) {
  const { post } = route.params;
  const theme = useTheme();

  // Formata a data de criação
  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Data não disponível';
    try {
      const date = new Date(isoString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${day}/${month}/${year} - ${hours}:${minutes}`;
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <ScreenLayout scrollable={true} withPadding={true}>
      <Card mode="elevated" style={styles.card}>
        <Card.Content>
          {/* Título do post */}
          <Text variant="headlineMedium" style={styles.title}>
            {post.Title}
          </Text>

          <Divider style={styles.divider} />

          {/* Metadata: Autor e Data */}
          <View style={styles.metadataContainer}>
            {post.author?.name && (
              <View style={styles.metadataItem}>
                <Icon name="account" size={16} color={theme.colors.onSurfaceVariant} />
                <Text variant="bodySmall" style={[styles.metadataText, { color: theme.colors.onSurfaceVariant }]}>
                  {post.author.name}
                </Text>
              </View>
            )}

            <View style={styles.metadataItem}>
              <Icon name="clock-outline" size={16} color={theme.colors.onSurfaceVariant} />
              <Text variant="bodySmall" style={[styles.metadataText, { color: theme.colors.onSurfaceVariant }]}>
                {formatDate(post.createdAt)}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Conteúdo do post */}
          <Text variant="bodyLarge" style={styles.content}>
            {post.Content}
          </Text>
        </Card.Content>
      </Card>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  title: {
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  divider: {
    marginVertical: spacing.md,
  },
  metadataContainer: {
    flexDirection: 'column',
    gap: spacing.xs,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metadataText: {
    fontSize: 14,
  },
  content: {
    lineHeight: 24,
  },
});
