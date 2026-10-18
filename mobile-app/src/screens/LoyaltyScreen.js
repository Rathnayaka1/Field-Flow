import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { getLoyaltySummary } from '../services/api';

export default function LoyaltyScreen() {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ loyaltyPoints: 0, transactions: [] });
  const [error, setError] = useState('');

  const loadSummary = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getLoyaltySummary(token);
      setSummary(data?.data || data || { loyaltyPoints: 0, transactions: [] });
    } catch (err) {
      setError(err.message || 'Failed to load loyalty points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, [token]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#003D82" />
      </View>
    );
  }

  const currentPoints = Math.max(0, Number(summary?.loyaltyPoints || 0));
  const hasReward = currentPoints >= 10;
  const pointsNeeded = Math.max(0, 10 - currentPoints);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>Available Loyalty Points</Text>
        <Text style={styles.pointsValue}>{currentPoints}</Text>
        <View style={[styles.badgeContainer, hasReward ? styles.badgeSuccess : styles.badgePending]}>
          <Text style={[styles.badgeText, hasReward ? styles.badgeTextSuccess : styles.badgeTextPending]}>
            {hasReward
              ? '🎉 Eligible for Rs. 500 Discount!'
              : `⏳ ${pointsNeeded} more points to unlock Rs. 500 discount`}
          </Text>
        </View>
        <Text style={styles.pointsHint}>
          Points are added automatically after every completed service.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🎁 How Loyalty Rewards Work</Text>
        
        <View style={styles.ruleItem}>
          <View style={styles.ruleIconCircle}>
            <Text style={styles.ruleIcon}>🪙</Text>
          </View>
          <View style={styles.ruleContent}>
            <Text style={styles.ruleTitle}>Earn with Every Service</Text>
            <Text style={styles.ruleDesc}>Get 1 Loyalty Point for every Rs. 1,000 spent on completed vehicle maintenance.</Text>
          </View>
        </View>

        <View style={styles.ruleDivider} />

        <View style={styles.ruleItem}>
          <View style={styles.ruleIconCircle}>
            <Text style={styles.ruleIcon}>🏷️</Text>
          </View>
          <View style={styles.ruleContent}>
            <Text style={styles.ruleTitle}>Redeem for Bill Discounts</Text>
            <Text style={styles.ruleDesc}>Collect 10 points to unlock a Rs. 500 discount. The cashier will apply it directly to your bill during payment.</Text>
          </View>
        </View>
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {summary?.transactions?.length ? (
          summary.transactions.map((tx, index) => (
            <View key={`${tx?.createdAt || index}-${tx?.points || 0}-${tx?.type || 'tx'}`} style={styles.txRow}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.txType}>{tx?.type === 'earn' ? 'Added Points' : 'Redeemed Points'}</Text>
                <Text style={styles.txNote}>{tx?.note || 'No note'}</Text>
              </View>
              <View style={styles.txRight}>
                <Text style={[styles.txPoints, tx?.type === 'earn' ? styles.earn : styles.redeem]}>
                  {tx?.type === 'earn' ? '+' : '-'}{tx?.points ?? 0}
                </Text>
                <Text style={styles.txDate}>
                  {tx?.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}
                </Text>
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No loyalty transactions yet.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5'
  },
  content: {
    padding: 20,
    gap: 14,
    paddingBottom: 32
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },
  pointsCard: {
    backgroundColor: '#003D82',
    borderRadius: 16,
    padding: 22,
    alignItems: 'center',
    shadowColor: '#003D82',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4
  },
  pointsLabel: {
    color: '#BFDBFE',
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '500'
  },
  pointsValue: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '800'
  },
  badgeContainer: {
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20
  },
  badgeSuccess: {
    backgroundColor: 'rgba(34, 197, 94, 0.2)'
  },
  badgePending: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)'
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '600'
  },
  badgeTextSuccess: {
    color: '#86EFAC'
  },
  badgeTextPending: {
    color: '#E0E7FF'
  },
  pointsHint: {
    color: '#93C5FD',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 12
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2
  },
  sectionTitle: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12
  },
  ruleIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  ruleIcon: {
    fontSize: 18
  },
  ruleContent: {
    flex: 1
  },
  ruleTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 2
  },
  ruleDesc: {
    fontSize: 12.5,
    color: '#64748B',
    lineHeight: 18
  },
  ruleDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12
  },
  error: {
    color: '#DC2626',
    fontWeight: '600',
    textAlign: 'center'
  },
  txRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingVertical: 12
  },
  txType: {
    color: '#111827',
    fontWeight: '600',
    fontSize: 14
  },
  txNote: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2
  },
  txRight: {
    alignItems: 'flex-end'
  },
  txPoints: {
    fontSize: 16,
    fontWeight: '700'
  },
  earn: {
    color: '#16A34A'
  },
  redeem: {
    color: '#DC2626'
  },
  txDate: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2
  },
  emptyText: {
    color: '#94A3B8',
    textAlign: 'center',
    paddingVertical: 12
  }
});