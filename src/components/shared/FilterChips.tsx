/**
 * FilterChips Component
 *
 * Componente de filtros selecionáveis usando Paper Chips
 * Usado para filtrar usuários por role (Todos, Professores, Alunos)
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { spacing } from '../../theme/tokens';

export interface FilterOption {
  /**
   * Valor único do filtro
   */
  value: string;

  /**
   * Label exibido no chip
   */
  label: string;

  /**
   * Badge/contador opcional (ex: número de itens)
   */
  count?: number;
}

export interface FilterChipsProps {
  /**
   * Opções de filtro disponíveis
   */
  options: FilterOption[];

  /**
   * Valor atualmente selecionado
   */
  selected: string;

  /**
   * Função chamada ao selecionar um filtro
   */
  onSelect: (value: string) => void;

  /**
   * Se true, exibe contadores nos chips
   */
  showCount?: boolean;
}

/**
 * Componente FilterChips
 *
 * @example
 * <FilterChips
 *   options={[
 *     { value: 'all', label: 'Todos', count: 15 },
 *     { value: 'professor', label: 'Professores', count: 5 },
 *     { value: 'aluno', label: 'Alunos', count: 10 },
 *   ]}
 *   selected={filter}
 *   onSelect={setFilter}
 *   showCount
 * />
 */
export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selected,
  onSelect,
  showCount = false,
}) => {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = selected === option.value;
        const label = showCount && option.count !== undefined
          ? `${option.label} (${option.count})`
          : option.label;

        return (
          <Chip
            key={option.value}
            mode={isSelected ? 'flat' : 'outlined'}
            selected={isSelected}
            onPress={() => onSelect(option.value)}
            style={[styles.chip, { pointerEvents: 'auto' } as any]}
            compact
          >
            {label}
          </Chip>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  chip: {
    marginRight: 0, // gap já controla espaçamento
  },
});

export default FilterChips;
