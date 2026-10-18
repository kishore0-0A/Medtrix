import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  ActivityIndicator,
  TextInput,
  Modal,
  RefreshControl,
  AccessibilityInfo,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BarChart } from 'react-native-chart-kit';
import Animated, {
  FadeIn,
  FadeInUp,
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from 'react-native-reanimated';

import { Database, InventoryItem } from '../../supabase/database';
import { COLORS, TYPOGRAPHY, SHADOWS } from '../../theme';
import { useThemeContext } from '../../context/ThemeContext';
import {
  generateAITriageReport,
  generateNextMonthPurchaseReport,
  generateExpiryRiskReport,
  generateAnalyticsReport,
} from '../../services/reportService';
import { triggerMedtrixAssistant } from '../../components/FloatingAssistant';

const screenWidth = Dimensions.get('window').width;
const chartWidth = Math.min(screenWidth - 48, 600);

export type DateRange = '7days' | '30days' | 'thisMonth';
export type PurchasePriority = 'critical' | 'high' | 'medium' | 'low' | 'healthy';
export type PurchaseFilter = 'all' | 'critical_high' | 'low_stock' | 'expiry_risk' | 'no_purchase';
export type PurchaseSort = 'priority' | 'units' | 'days';

interface AttentionItem {
  id: string;
  medicineName: string;
  batchNumber?: string;
  quantity: number;
  expiryDate?: string;
  daysRemaining?: number;
  severity: 'critical' | 'warning' | 'notice';
  severityLabel: string;
  reason: string;
  actionType: 'inventory' | 'scan' | 'explain';
  actionLabel: string;
  isExpired?: boolean;
}

export interface NextMonthPurchaseItem {
  id: string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  form?: string;
  unit: string;
  packSize?: number;
  usableStock: number;
  expiredStock: number;
  forecastDemand30d: number;
  confirmedIncomingStock: number;
  safetyStock: number;
  additionalUnitsNeeded: number;
  suggestedPacks?: number;
  daysUntilStockout: number;
  earliestBatchNumber?: string;
  earliestBatchExpiry?: string;
  daysToEarliestExpiry?: number;
  priority: PurchasePriority;
  priorityLabel: string;
  reason: string;
  confidence: string;
  confidenceLevel: 'high' | 'limited';
  batchCount: number;
  historicalTxCount: number;
}

export default function AiTriageDashboard() {
  const { t, i18n } = useTranslation();
  const { isDark } = useThemeContext();
  const styles = useMemo(() => getStyles(isDark), [isDark]);

  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingPurchaseReport, setIsGeneratingPurchaseReport] = useState(false);
  const [isGeneratingExpiryReport, setIsGeneratingExpiryReport] = useState(false);
  const [isGeneratingAnalyticsReport, setIsGeneratingAnalyticsReport] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  // Next Month Purchase Planner Controls
  const [purchaseSearch, setPurchaseSearch] = useState('');
  const [purchaseFilter, setPurchaseFilter] = useState<PurchaseFilter>('all');
  const [purchaseSort, setPurchaseSort] = useState<PurchaseSort>('priority');
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  // Analytics timeframe
  const [dateRange, setDateRange] = useState<DateRange>('30days');

  // Modal explanation state
  const [selectedExplanation, setSelectedExplanation] = useState<NextMonthPurchaseItem | null>(null);

  // Animated pulse for AI indicator and skeleton loading
  const pulseValue = useSharedValue(1);

  // Check system reduce-motion preferences
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      setReduceMotion(enabled);
    });
    return () => sub.remove();
  }, []);

  useEffect(() => {
    if (!reduceMotion) {
      pulseValue.value = withRepeat(
        withSequence(withTiming(0.45, { duration: 1000 }), withTiming(1, { duration: 1000 })),
        -1,
        true
      );
    }
  }, [pulseValue, reduceMotion]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulseValue.value,
  }));

  // Fetch live inventory and transactions
  const fetchData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setHasError(false);

    try {
      const [invRes, txRes] = await Promise.all([
        Database.getInventory(),
        Database.getInventoryTransactions(),
      ]);

      if (invRes.data) setInventory(invRes.data);
      if (txRes.data) setTransactions(txRes.data || []);

      const now = new Date();
      setLastUpdated(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      );
    } catch (err) {
      console.warn('Error loading triage intelligence:', err);
      setHasError(true);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter transactions dynamically based on dateRange
  const filteredTx = useMemo(() => {
    const now = new Date();
    let cutoff = new Date();
    if (dateRange === '7days') cutoff.setDate(now.getDate() - 7);
    else if (dateRange === '30days') cutoff.setDate(now.getDate() - 30);
    else if (dateRange === 'thisMonth') cutoff = new Date(now.getFullYear(), now.getMonth(), 1);

    return transactions.filter((tx) => {
      if (!tx.created_at) return true;
      return new Date(tx.created_at) >= cutoff;
    });
  }, [transactions, dateRange]);

  // Aggregate stock movements in range
  const txMovement = useMemo(() => {
    let stockIn = 0;
    let stockOut = 0;
    filteredTx.forEach((tx) => {
      const qty = tx.quantity || 0;
      if (tx.transaction_type === 'received') stockIn += qty;
      else if (tx.transaction_type === 'dispensed') stockOut += qty;
    });
    return { stockIn, stockOut, netDelta: stockIn - stockOut };
  }, [filteredTx]);

  // Per-medicine consumption map from filtered transactions
  const medicineUsageMap = useMemo(() => {
    const map: Record<string, { stockIn: number; stockOut: number; txCount: number }> = {};
    filteredTx.forEach((tx) => {
      const batchId = tx.medicine_batch_id || 'unknown';
      if (!map[batchId]) {
        map[batchId] = { stockIn: 0, stockOut: 0, txCount: 0 };
      }
      map[batchId].txCount += 1;
      if (tx.transaction_type === 'received') map[batchId].stockIn += (tx.quantity || 0);
      else if (tx.transaction_type === 'dispensed') map[batchId].stockOut += (tx.quantity || 0);
    });
    return map;
  }, [filteredTx]);

  // Comprehensive Inventory Health Summary Metrics
  const healthMetrics = useMemo(() => {
    const uniqueMedicineNames = new Set<string>();
    let totalStockUnits = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let expiringSoonCount = 0;
    let expiredBatchesCount = 0;
    let stockoutRiskCount = 0;

    const now = new Date();
    const sixtyDaysFromNow = new Date();
    sixtyDaysFromNow.setDate(now.getDate() + 60);

    inventory.forEach((item) => {
      const qty = item.quantity || 0;
      totalStockUnits += qty;
      if (item.name) uniqueMedicineNames.add(item.name.trim().toLowerCase());

      let isExpired = false;
      let isExpiringSoon = false;
      if (item.expiryDate) {
        const parts = item.expiryDate.split(/[\/-]/);
        let expDate: Date | null = null;
        if (parts.length === 2) {
          const m = parseInt(parts[0], 10);
          const y = parseInt(parts[1], 10) + (parseInt(parts[1], 10) < 100 ? 2000 : 0);
          expDate = new Date(y, m, 0);
        } else if (parts.length === 3) {
          expDate = new Date(item.expiryDate);
        }
        if (expDate && !isNaN(expDate.getTime())) {
          if (expDate < now) isExpired = true;
          else if (expDate <= sixtyDaysFromNow) isExpiringSoon = true;
        }
      }

      if (isExpired) expiredBatchesCount++;
      else if (isExpiringSoon || item.status === 'expiring') expiringSoonCount++;

      if (qty === 0) {
        outOfStockCount++;
      } else if (item.status === 'low' || item.status === 'critical' || qty <= 20) {
        lowStockCount++;
      }

      const usage = medicineUsageMap[item.id]?.stockOut || 0;
      const daily = usage / 30;
      if (daily > 0 && qty / daily < 14 && qty > 0) {
        stockoutRiskCount++;
      }
    });

    return {
      totalMedicines: uniqueMedicineNames.size || inventory.length,
      totalBatches: inventory.length,
      totalStockUnits,
      lowStockCount,
      outOfStockCount,
      expiringSoonCount,
      expiredBatchesCount,
      stockoutRiskCount,
    };
  }, [inventory, medicineUsageMap]);

  // Urgent "Needs Attention" prioritized issues
  const needsAttentionList = useMemo((): AttentionItem[] => {
    const list: AttentionItem[] = [];
    const now = new Date();
    const sixtyDays = new Date();
    sixtyDays.setDate(now.getDate() + 60);

    inventory.forEach((item) => {
      const qty = item.quantity || 0;
      let isExpired = false;
      let isExpiringSoon = false;
      let daysRemaining: number | undefined;

      if (item.expiryDate) {
        const parts = item.expiryDate.split(/[\/-]/);
        let expDate: Date | null = null;
        if (parts.length === 2) {
          const m = parseInt(parts[0], 10);
          const y = parseInt(parts[1], 10) + (parseInt(parts[1], 10) < 100 ? 2000 : 0);
          expDate = new Date(y, m, 0);
        } else if (parts.length === 3) {
          expDate = new Date(item.expiryDate);
        }
        if (expDate && !isNaN(expDate.getTime())) {
          const diffMs = expDate.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (expDate < now) isExpired = true;
          else if (expDate <= sixtyDays) isExpiringSoon = true;
        }
      }

      if (isExpired) {
        list.push({
          id: `expired-${item.id}`,
          medicineName: item.name,
          batchNumber: item.batchNumber,
          quantity: qty,
          expiryDate: item.expiryDate || undefined,
          daysRemaining,
          severity: 'critical',
          severityLabel: 'EXPIRED',
          reason: t('ai_triage.expired_warning'),
          actionType: 'inventory',
          actionLabel: t('ai_triage.review_stock'),
          isExpired: true,
        });
        return;
      }

      if (qty === 0) {
        list.push({
          id: `oos-${item.id}`,
          medicineName: item.name,
          batchNumber: item.batchNumber,
          quantity: 0,
          severity: 'critical',
          severityLabel: 'OUT OF STOCK',
          reason: t('ai_triage.out_of_stock_warning'),
          actionType: 'scan',
          actionLabel: t('ai_triage.ask_assistant'),
        });
        return;
      }

      if (item.status === 'low' || item.status === 'critical' || qty <= 20) {
        list.push({
          id: `low-${item.id}`,
          medicineName: item.name,
          batchNumber: item.batchNumber,
          quantity: qty,
          severity: qty <= 10 ? 'critical' : 'warning',
          severityLabel: qty <= 10 ? 'CRITICAL LOW' : 'LOW STOCK',
          reason: `${t('ai_triage.low_stock_warning')} (Only ${qty} left)`,
          actionType: 'explain',
          actionLabel: t('ai_triage.explain_rec'),
        });
      }

      if (isExpiringSoon && !isExpired) {
        list.push({
          id: `exp-${item.id}`,
          medicineName: item.name,
          batchNumber: item.batchNumber,
          quantity: qty,
          expiryDate: item.expiryDate || undefined,
          daysRemaining,
          severity: daysRemaining && daysRemaining <= 30 ? 'critical' : 'warning',
          severityLabel: daysRemaining && daysRemaining <= 30 ? 'EXPIRING IN < 30D' : 'EXPIRING SOON',
          reason: `${t('ai_triage.expiring_warning')} (${daysRemaining ?? 45} days left)`,
          actionType: 'inventory',
          actionLabel: t('ai_triage.review_stock'),
        });
      }
    });

    return list.sort((a, b) => {
      const order = { critical: 0, warning: 1, notice: 2 };
      return order[a.severity] - order[b.severity];
    });
  }, [inventory, t]);

  // ==========================================================
  // NEXT MONTH MEDICINE PURCHASE RECOMMENDATIONS ENGINE
  // Formula:
  // Recommended additional units = max(0, Forecast demand + Safety stock − Usable current stock − Confirmed incoming stock)
  // ==========================================================
  const purchaseRecommendations = useMemo((): NextMonthPurchaseItem[] => {
    const SAFETY_STOCK = 20;
    const now = new Date();

    // Group items by medicineId or normalized name
    const medMap: Record<
      string,
      {
        items: InventoryItem[];
        name: string;
        generic?: string;
        strength?: string;
        form?: string;
        packSize?: number;
        usableStock: number;
        expiredStock: number;
        earliestBatchNumber?: string;
        earliestBatchExpiry?: string;
        daysToEarliestExpiry?: number;
      }
    > = {};

    inventory.forEach((item) => {
      const key = item.medicineId || item.name.toLowerCase().trim();
      if (!medMap[key]) {
        medMap[key] = {
          items: [],
          name: item.name,
          generic: item.genericName || undefined,
          strength: item.strength || undefined,
          form: item.form || undefined,
          packSize: item.packSize || item.unitsPerStrip || undefined,
          usableStock: 0,
          expiredStock: 0,
        };
      }
      medMap[key].items.push(item);

      // Check whether this specific batch is expired
      let isExpired = false;
      let daysRemaining: number | undefined;
      if (item.expiryDate) {
        const parts = item.expiryDate.split(/[\/-]/);
        let expDate: Date | null = null;
        if (parts.length === 2) {
          const m = parseInt(parts[0], 10);
          const y = parseInt(parts[1], 10) + (parseInt(parts[1], 10) < 100 ? 2000 : 0);
          expDate = new Date(y, m, 0);
        } else if (parts.length === 3) {
          expDate = new Date(item.expiryDate);
        }
        if (expDate && !isNaN(expDate.getTime())) {
          const diffMs = expDate.getTime() - now.getTime();
          daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
          if (expDate < now) isExpired = true;
        }
      }

      const qty = item.quantity || 0;
      if (isExpired) {
        medMap[key].expiredStock += qty;
      } else {
        medMap[key].usableStock += qty;

        // Track earliest valid batch expiry
        if (
          daysRemaining !== undefined &&
          (!medMap[key].daysToEarliestExpiry || daysRemaining < medMap[key].daysToEarliestExpiry!)
        ) {
          medMap[key].daysToEarliestExpiry = daysRemaining;
          medMap[key].earliestBatchExpiry = item.expiryDate || undefined;
          medMap[key].earliestBatchNumber = item.batchNumber || undefined;
        }
      }
    });

    const results: NextMonthPurchaseItem[] = [];

    Object.entries(medMap).forEach(([key, group]) => {
      // Aggregate 30-day consumption velocity across all batches
      let totalStockOut = 0;
      let totalTx = 0;
      group.items.forEach((it) => {
        const stats = medicineUsageMap[it.id];
        if (stats) {
          totalStockOut += stats.stockOut;
          totalTx += stats.txCount;
        }
      });

      // Unit of measure from form
      const unit = group.form ? `${group.form.toLowerCase()}s` : 'units';

      // Forecast demand for upcoming 30 days
      const hasEnoughTx = totalTx >= 3;
      const forecastDemand30d = totalStockOut > 0 ? totalStockOut : 15;
      const confirmedIncomingStock = 0; // Confirmed recorded incoming stock
      const usableStock = group.usableStock;

      // Real mathematical purchase formula:
      // max(0, Forecast demand + Safety stock − Usable current stock − Confirmed incoming stock)
      const additionalUnitsNeeded = Math.max(
        0,
        forecastDemand30d + SAFETY_STOCK - usableStock - confirmedIncomingStock
      );

      // Pack size rounding if pack size exists
      let suggestedPacks: number | undefined;
      if (group.packSize && group.packSize > 1 && additionalUnitsNeeded > 0) {
        suggestedPacks = Math.ceil(additionalUnitsNeeded / group.packSize);
      }

      // Run-rate & depletion
      const dailyUsage = forecastDemand30d / 30;
      const daysUntilStockout = dailyUsage > 0
        ? Math.floor(usableStock / dailyUsage)
        : (usableStock > 0 ? 999 : 0);

      // Priority classification
      let priority: PurchasePriority = 'low';
      let priorityLabel = t('ai_triage.priority_low');
      let reason = '';

      if (usableStock === 0 || daysUntilStockout < 7) {
        priority = 'critical';
        priorityLabel = t('ai_triage.priority_critical');
        reason = `Imminent stock-out projected in ${daysUntilStockout} days. Forecast demand (${forecastDemand30d} ${unit}) severely exceeds current inventory.`;
      } else if (daysUntilStockout < 30 || forecastDemand30d > usableStock) {
        priority = 'high';
        priorityLabel = t('ai_triage.priority_high');
        reason = `Projected shortage during next month. Usable stock (${usableStock} ${unit}) cannot meet 30-day forecast (${forecastDemand30d} ${unit}) plus safety reserve.`;
      } else if (additionalUnitsNeeded > 0) {
        priority = 'medium';
        priorityLabel = t('ai_triage.priority_medium');
        reason = `Stock will breach the ${SAFETY_STOCK}-unit safety reserve threshold during the upcoming month.`;
      } else {
        priority = 'healthy';
        priorityLabel = t('ai_triage.priority_healthy');
        reason = `Current usable stock (${usableStock} ${unit}) comfortably covers the projected 30-day demand (${forecastDemand30d} ${unit}) and safety reserve. No additional purchase needed.`;
      }

      const confidence = hasEnoughTx
        ? `${t('ai_triage.confidence_high')} (${totalTx} tx logs)`
        : `${t('ai_triage.confidence_limited')} (Safety Baseline)`;

      results.push({
        id: key,
        medicineName: group.name,
        genericName: group.generic,
        strength: group.strength,
        form: group.form,
        unit,
        packSize: group.packSize,
        usableStock,
        expiredStock: group.expiredStock,
        forecastDemand30d,
        confirmedIncomingStock,
        safetyStock: SAFETY_STOCK,
        additionalUnitsNeeded,
        suggestedPacks,
        daysUntilStockout,
        earliestBatchNumber: group.earliestBatchNumber,
        earliestBatchExpiry: group.earliestBatchExpiry,
        daysToEarliestExpiry: group.daysToEarliestExpiry,
        priority,
        priorityLabel,
        reason,
        confidence,
        confidenceLevel: hasEnoughTx ? 'high' : 'limited',
        batchCount: group.items.length,
        historicalTxCount: totalTx,
      });
    });

    // Default sort by priority (Critical > High > Medium > Low > Healthy)
    const priorityWeight: Record<PurchasePriority, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      healthy: 4,
    };

    return results.sort((a, b) => {
      const diff = priorityWeight[a.priority] - priorityWeight[b.priority];
      if (diff !== 0) return diff;
      return b.additionalUnitsNeeded - a.additionalUnitsNeeded;
    });
  }, [inventory, medicineUsageMap, t]);

  // Filtered & Sorted Next Month Purchase Plans
  const displayedPurchasePlans = useMemo(() => {
    let list = [...purchaseRecommendations];

    // Search filter
    if (purchaseSearch.trim()) {
      const q = purchaseSearch.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.medicineName.toLowerCase().includes(q) ||
          p.genericName?.toLowerCase().includes(q)
      );
    }

    // Category filter
    if (purchaseFilter === 'critical_high') {
      list = list.filter((p) => p.priority === 'critical' || p.priority === 'high');
    } else if (purchaseFilter === 'low_stock') {
      list = list.filter((p) => p.usableStock <= p.safetyStock);
    } else if (purchaseFilter === 'expiry_risk') {
      list = list.filter((p) => p.daysToEarliestExpiry !== undefined && p.daysToEarliestExpiry <= 60);
    } else if (purchaseFilter === 'no_purchase') {
      list = list.filter((p) => p.additionalUnitsNeeded === 0);
    }

    // Sorting
    if (purchaseSort === 'priority') {
      const weights: Record<PurchasePriority, number> = {
        critical: 0,
        high: 1,
        medium: 2,
        low: 3,
        healthy: 4,
      };
      list.sort((a, b) => weights[a.priority] - weights[b.priority] || b.additionalUnitsNeeded - a.additionalUnitsNeeded);
    } else if (purchaseSort === 'units') {
      list.sort((a, b) => b.additionalUnitsNeeded - a.additionalUnitsNeeded);
    } else if (purchaseSort === 'days') {
      list.sort((a, b) => a.daysUntilStockout - b.daysUntilStockout);
    }

    return list;
  }, [purchaseRecommendations, purchaseSearch, purchaseFilter, purchaseSort]);

  // Toggle card expansion
  const toggleCardExpansion = (id: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Top consumed chart data
  const chartData = useMemo(() => {
    const sorted = [...purchaseRecommendations]
      .filter((r) => r.forecastDemand30d > 0)
      .sort((a, b) => b.forecastDemand30d - a.forecastDemand30d)
      .slice(0, 4);

    if (sorted.length === 0) {
      return {
        labels: ['No Data'],
        datasets: [{ data: [0] }],
      };
    }

    return {
      labels: sorted.map((r) => r.medicineName.slice(0, 8)),
      datasets: [{ data: sorted.map((r) => r.forecastDemand30d) }],
    };
  }, [purchaseRecommendations]);

  // Velocity comparison chart (Stock In vs Stock Out)
  const velocityChartData = useMemo(() => {
    return {
      labels: ['Stock In', 'Stock Out'],
      datasets: [
        {
          data: [
            Math.max(0, txMovement.stockIn),
            Math.max(0, txMovement.stockOut),
          ],
        },
      ],
    };
  }, [txMovement]);

  // Handle Comprehensive AI Triage PDF report generation
  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    try {
      const res = await generateAITriageReport('AI Triage Health & Reorder Report', i18n.language);
      if (res.success) {
        Alert.alert(
          t('ai_triage.report_generated_success') || 'Report Generated',
          'Your Medtrix AI Triage PDF has been created and is ready to share or save.'
        );
      } else {
        Alert.alert(
          t('ai_triage.report_generation_failed') || 'Report Generation Failed',
          res.error || 'Unable to generate PDF report. Please try again.'
        );
      }
    } catch (err: any) {
      console.warn('Report generation failed:', err);
      Alert.alert(
        t('ai_triage.report_generation_failed') || 'Report Generation Failed',
        err?.message || 'Unable to generate PDF report. Please try again.'
      );
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Handle Next-Month Purchase Plan PDF export
  const handleExportPurchasePlan = async () => {
    setIsGeneratingPurchaseReport(true);
    try {
      const res = await generateNextMonthPurchaseReport(i18n.language);
      if (res.success) {
        Alert.alert(
          t('ai_triage.report_generated_success') || 'Report Generated',
          'Next-month medicine purchase plan PDF has been created and is ready to share or save.'
        );
      } else {
        Alert.alert(
          t('ai_triage.report_generation_failed') || 'Report Generation Failed',
          res.error || 'Unable to generate purchase plan PDF. Please try again.'
        );
      }
    } catch (err: any) {
      console.warn('Purchase plan report generation failed:', err);
      Alert.alert(
        t('ai_triage.report_generation_failed') || 'Report Generation Failed',
        err?.message || 'Unable to generate purchase plan PDF. Please try again.'
      );
    } finally {
      setIsGeneratingPurchaseReport(false);
    }
  };

  // Handle Expiry & Stock Risk PDF export
  const handleExportExpiryRiskReport = async () => {
    setIsGeneratingExpiryReport(true);
    try {
      const res = await generateExpiryRiskReport(i18n.language);
      if (res.success) {
        Alert.alert(
          t('ai_triage.report_generated_success') || 'Report Generated',
          'Expiry & stock risk PDF report has been created and is ready to share or save.'
        );
      } else {
        Alert.alert(
          t('ai_triage.report_generation_failed') || 'Report Generation Failed',
          res.error || 'Unable to generate expiry risk report. Please try again.'
        );
      }
    } catch (err: any) {
      console.warn('Expiry risk report generation failed:', err);
      Alert.alert(
        t('ai_triage.report_generation_failed') || 'Report Generation Failed',
        err?.message || 'Unable to generate expiry risk report. Please try again.'
      );
    } finally {
      setIsGeneratingExpiryReport(false);
    }
  };

  // Handle Inventory Analytics & Movement PDF export
  const handleExportAnalyticsReport = async () => {
    setIsGeneratingAnalyticsReport(true);
    try {
      const res = await generateAnalyticsReport(i18n.language);
      if (res.success) {
        Alert.alert(
          t('ai_triage.report_generated_success') || 'Report Generated',
          'Inventory trends & velocity analytics PDF has been created and is ready to share or save.'
        );
      } else {
        Alert.alert(
          t('ai_triage.report_generation_failed') || 'Report Generation Failed',
          res.error || 'Unable to generate analytics PDF. Please try again.'
        );
      }
    } catch (err: any) {
      console.warn('Analytics report generation failed:', err);
      Alert.alert(
        t('ai_triage.report_generation_failed') || 'Report Generation Failed',
        err?.message || 'Unable to generate analytics PDF. Please try again.'
      );
    } finally {
      setIsGeneratingAnalyticsReport(false);
    }
  };

  const chartConfig = {
    backgroundGradientFrom: isDark ? '#0D1117' : '#FFFFFF',
    backgroundGradientTo: isDark ? '#0D1117' : '#FFFFFF',
    color: (opacity = 1) => isDark ? `rgba(96, 165, 250, ${opacity})` : `rgba(37, 99, 235, ${opacity})`,
    labelColor: (opacity = 1) => isDark ? `rgba(203, 213, 225, ${opacity})` : `rgba(15, 23, 42, ${opacity})`,
    barPercentage: 0.55,
    decimalPlaces: 0,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: isDark ? '#1E293B' : COLORS.border.subtle,
      strokeDasharray: '4',
    },
  };

  // Render animated loading skeleton while fetching initial data
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.header}>
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : COLORS.text.primary} />
          </Pressable>
          <View style={styles.headerTitles}>
            <Text style={styles.title}>{t('ai_triage.title')}</Text>
            <Text style={styles.subtitle}>{t('ai_triage.subtitle')}</Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.skeletonSectionHeader}>Analyzing Medicine Inventory...</Text>
          {[1, 2, 3].map((key) => (
            <Animated.View key={key} style={[styles.skeletonCard, pulseStyle]}>
              <View style={styles.skeletonHeader} />
              <View style={styles.skeletonRow}>
                <View style={styles.skeletonBox} />
                <View style={styles.skeletonBox} />
                <View style={styles.skeletonBox} />
              </View>
              <View style={styles.skeletonFooter} />
            </Animated.View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* HEADER SECTION */}
      <Animated.View entering={reduceMotion ? undefined : FadeIn.duration(300)} style={styles.header}>
        <Pressable
          style={styles.backBtn}
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : COLORS.text.primary} />
        </Pressable>

        <View style={styles.headerTitles}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{t('ai_triage.title')}</Text>
            <View style={styles.aiBadge}>
              <Animated.View style={pulseStyle}>
                <Ionicons name="sparkles" size={13} color={isDark ? '#3B82F6' : COLORS.brand.primary} />
              </Animated.View>
              <Text style={styles.aiBadgeText}>Advisor</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>{t('ai_triage.subtitle')}</Text>
        </View>

        <View style={styles.headerActions}>
          <Pressable
            style={[styles.headerIconBtn, refreshing && { opacity: 0.5 }]}
            onPress={() => fetchData(true)}
            disabled={refreshing}
            accessibilityRole="button"
            accessibilityLabel="Refresh Data"
          >
            {refreshing ? (
              <ActivityIndicator size="small" color={isDark ? '#3B82F6' : COLORS.brand.primary} />
            ) : (
              <Ionicons name="refresh" size={20} color={isDark ? '#CBD5E1' : COLORS.text.secondary} />
            )}
          </Pressable>

          <Pressable
            style={styles.reportBtn}
            onPress={handleGenerateReport}
            disabled={isGeneratingReport}
          >
            {isGeneratingReport ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="document-text-outline" size={16} color="#fff" />
                <Text style={styles.reportBtnText}>PDF</Text>
              </>
            )}
          </Pressable>
        </View>
      </Animated.View>

      {/* HEADER SUB-BANNER & TIMESTAMP */}
      <View style={styles.subBanner}>
        <Text style={styles.headerDesc} numberOfLines={2}>
          {t('ai_triage.header_desc')}
        </Text>
        {lastUpdated ? (
          <View style={styles.timestampRow}>
            <Ionicons name="time-outline" size={12} color={COLORS.text.muted} />
            <Text style={styles.timestampText}>
              {t('ai_triage.updated')}: {lastUpdated}
            </Text>
          </View>
        ) : null}
      </View>

      {/* ERROR BANNER */}
      {hasError && (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={COLORS.status.critical} />
          <Text style={styles.errorBannerText}>{t('ai_triage.error_loading')}</Text>
          <Pressable style={styles.retryBtn} onPress={() => fetchData()}>
            <Text style={styles.retryBtnText}>{t('ai_triage.retry')}</Text>
          </Pressable>
        </View>
      )}

      {/* MAIN SCROLLABLE CONTENT */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchData(true)}
            colors={[COLORS.brand.primary]}
          />
        }
      >
        {/* SECTION 1: INVENTORY HEALTH SUMMARY (6 CARDS) */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInUp.delay(50).duration(350)}
          style={styles.section}
        >
          <Text style={styles.sectionHeaderTitle}>{t('ai_triage.health_summary')}</Text>

          <View style={styles.metricsGrid}>
            <Pressable style={styles.metricCard} onPress={() => setPurchaseFilter('all')}>
              <View style={[styles.metricIconWrap, { backgroundColor: isDark ? '#111827' : COLORS.brand.verySoft }]}>
                <Ionicons name="cube-outline" size={18} color={isDark ? '#60A5FA' : COLORS.brand.primary} />
              </View>
              <Text style={styles.metricValue}>{healthMetrics.totalMedicines}</Text>
              <Text style={styles.metricLabel}>{t('ai_triage.total_medicines')}</Text>
              <Text style={styles.metricSub}>{healthMetrics.totalBatches} batches</Text>
            </Pressable>

            <Pressable
              style={[styles.metricCard, healthMetrics.lowStockCount > 0 && styles.metricCardWarning]}
              onPress={() => setPurchaseFilter('low_stock')}
            >
              <View style={[styles.metricIconWrap, { backgroundColor: isDark ? '#111827' : COLORS.status.warningBg }]}>
                <Ionicons name="warning-outline" size={18} color={isDark ? '#3B82F6' : COLORS.status.warning} />
              </View>
              <Text style={[styles.metricValue, { color: isDark ? '#60A5FA' : COLORS.status.warning }]}>
                {healthMetrics.lowStockCount}
              </Text>
              <Text style={styles.metricLabel}>{t('ai_triage.low_stock')}</Text>
              <Text style={styles.metricSub}>≤ 20 reserve</Text>
            </Pressable>

            <Pressable
              style={[styles.metricCard, healthMetrics.outOfStockCount > 0 && styles.metricCardCritical]}
              onPress={() => setPurchaseFilter('critical_high')}
            >
              <View style={[styles.metricIconWrap, { backgroundColor: isDark ? '#111827' : COLORS.status.criticalBg }]}>
                <Ionicons name="alert-circle-outline" size={18} color={isDark ? '#3B82F6' : COLORS.status.critical} />
              </View>
              <Text style={[styles.metricValue, { color: isDark ? '#60A5FA' : COLORS.status.critical }]}>
                {healthMetrics.outOfStockCount}
              </Text>
              <Text style={styles.metricLabel}>{t('ai_triage.out_of_stock')}</Text>
              <Text style={styles.metricSub}>0 units left</Text>
            </Pressable>

            <Pressable style={styles.metricCard} onPress={() => setPurchaseFilter('expiry_risk')}>
              <View style={[styles.metricIconWrap, { backgroundColor: isDark ? '#111827' : COLORS.status.expiringBg }]}>
                <Ionicons name="time-outline" size={18} color={isDark ? '#2563EB' : COLORS.status.expiring} />
              </View>
              <Text style={[styles.metricValue, { color: isDark ? '#60A5FA' : COLORS.status.expiring }]}>
                {healthMetrics.expiringSoonCount}
              </Text>
              <Text style={styles.metricLabel}>{t('ai_triage.expiring_soon')}</Text>
              <Text style={styles.metricSub}>Within 60 days</Text>
            </Pressable>

            <Pressable
              style={[styles.metricCard, healthMetrics.expiredBatchesCount > 0 && styles.metricCardCritical]}
              onPress={() => setPurchaseFilter('critical_high')}
            >
              <View style={[styles.metricIconWrap, { backgroundColor: isDark ? '#111827' : COLORS.status.criticalBg }]}>
                <Ionicons name="ban-outline" size={18} color={isDark ? '#3B82F6' : COLORS.status.critical} />
              </View>
              <Text style={[styles.metricValue, { color: isDark ? '#60A5FA' : COLORS.status.critical }]}>
                {healthMetrics.expiredBatchesCount}
              </Text>
              <Text style={styles.metricLabel}>{t('ai_triage.expired_batches')}</Text>
              <Text style={styles.metricSub}>Quarantine</Text>
            </Pressable>

            <Pressable style={styles.metricCard} onPress={() => setPurchaseFilter('critical_high')}>
              <View style={[styles.metricIconWrap, { backgroundColor: isDark ? '#111827' : COLORS.status.infoBg }]}>
                <Ionicons name="trending-down-outline" size={18} color={isDark ? '#60A5FA' : COLORS.status.info} />
              </View>
              <Text style={[styles.metricValue, { color: isDark ? '#60A5FA' : COLORS.status.info }]}>
                {healthMetrics.stockoutRiskCount}
              </Text>
              <Text style={styles.metricLabel}>{t('ai_triage.stockout_risk')}</Text>
              <Text style={styles.metricSub}>&lt; 14 days run</Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* SECTION 2: NEEDS ATTENTION */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInUp.delay(100).duration(350)}
          style={styles.section}
        >
          <View style={styles.sectionHeaderRow}>
            <View style={styles.sectionTitleWithBadge}>
              <Text style={styles.sectionHeaderTitle}>{t('ai_triage.needs_attention')}</Text>
              <View
                style={[
                  styles.countPill,
                  needsAttentionList.length > 0 ? styles.countPillCritical : styles.countPillHealthy,
                ]}
              >
                <Text
                  style={[
                    styles.countPillText,
                    needsAttentionList.length > 0
                      ? { color: isDark ? '#60A5FA' : COLORS.status.critical }
                      : { color: isDark ? '#3B82F6' : COLORS.status.healthy },
                  ]}
                >
                  {needsAttentionList.length}
                </Text>
              </View>
            </View>

            <Pressable
              style={styles.sectionMiniPdfBtn}
              onPress={handleExportExpiryRiskReport}
              disabled={isGeneratingExpiryReport}
              accessibilityRole="button"
              accessibilityLabel="Export Expiry & Stock Risk PDF"
            >
              {isGeneratingExpiryReport ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={13} color="#fff" />
                  <Text style={styles.sectionMiniPdfBtnText}>Export PDF</Text>
                </>
              )}
            </Pressable>
          </View>

          {needsAttentionList.length === 0 ? (
            <View style={styles.allClearCard}>
              <View style={styles.allClearIconWrap}>
                <Ionicons name="checkmark-circle" size={32} color={isDark ? '#60A5FA' : COLORS.status.healthy} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.allClearTitle}>{t('ai_triage.all_clear')}</Text>
                <Text style={styles.allClearDesc}>{t('ai_triage.all_clear_desc')}</Text>
              </View>
            </View>
          ) : (
            needsAttentionList.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.attentionCard,
                  item.severity === 'critical' ? styles.attentionCardCritical : styles.attentionCardWarning,
                ]}
              >
                <View style={styles.attentionHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.attentionMedicine} numberOfLines={1}>
                      {item.medicineName}
                    </Text>
                    {item.batchNumber ? (
                      <Text style={styles.attentionBatch}>Batch: {item.batchNumber}</Text>
                    ) : null}
                  </View>

                  <View
                    style={[
                      styles.severityBadge,
                      isDark ? { backgroundColor: '#111827', borderColor: '#1E293B', borderWidth: 1 } : (
                        item.severity === 'critical'
                          ? { backgroundColor: COLORS.status.criticalBg }
                          : { backgroundColor: COLORS.status.warningBg }
                      ),
                    ]}
                  >
                    <Text
                      style={[
                        styles.severityText,
                        isDark ? { color: '#60A5FA' } : (
                          item.severity === 'critical'
                            ? { color: COLORS.status.critical }
                            : { color: COLORS.status.warning }
                        ),
                      ]}
                    >
                      {item.severityLabel}
                    </Text>
                  </View>
                </View>

                <Text style={styles.attentionReason}>{item.reason}</Text>

                <View style={styles.attentionFooter}>
                  <View style={styles.attentionStockRow}>
                    <Text style={styles.attentionStockLabel}>{t('ai_triage.available')}: </Text>
                    <Text
                      style={[
                        styles.attentionStockVal,
                        item.isExpired ? { color: isDark ? '#60A5FA' : COLORS.status.critical, textDecorationLine: 'line-through' } : {},
                      ]}
                    >
                      {item.quantity} units
                    </Text>
                  </View>

                  <Pressable
                    style={styles.attentionActionBtn}
                    onPress={() => {
                      if (item.actionType === 'inventory') router.push('/(tabs)/inventory' as any);
                      else if (item.actionType === 'scan') router.push('/(tabs)/scan' as any);
                      else {
                        triggerMedtrixAssistant(
                          `Explain why ${item.medicineName} requires attention in inventory triage.`
                        );
                      }
                    }}
                  >
                    <Text style={styles.attentionActionText}>{item.actionLabel}</Text>
                    <Ionicons name="arrow-forward" size={14} color={isDark ? '#3B82F6' : COLORS.brand.primary} />
                  </Pressable>
                </View>
              </View>
            ))
          )}
        </Animated.View>

        {/* ==========================================================
            SECTION 3: NEXT MONTH MEDICINE PURCHASE RECOMMENDATIONS
           ========================================================== */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInUp.delay(150).duration(400)}
          style={styles.section}
        >
          <View style={styles.plannerHeader}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={styles.plannerTitleRow}>
                <Text style={styles.plannerTitle}>{t('ai_triage.next_month_title')}</Text>
                <View style={styles.timeframeChip}>
                  <Text style={styles.timeframeChipText}>Next 30 Days</Text>
                </View>
              </View>
              <Text style={styles.plannerSubtitle}>{t('ai_triage.next_month_subtitle')}</Text>
            </View>

            <Pressable
              style={styles.exportPlanBtn}
              onPress={handleExportPurchasePlan}
              disabled={isGeneratingPurchaseReport}
              accessibilityRole="button"
              accessibilityLabel="Export Purchase Plan PDF"
            >
              {isGeneratingPurchaseReport ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <>
                  <Ionicons name="document-text-outline" size={14} color="#fff" />
                  <Text style={styles.exportPlanBtnText}>Export PDF</Text>
                </>
              )}
            </Pressable>
          </View>

          {/* Search Box */}
          <View style={styles.searchBox}>
            <Ionicons name="search" size={18} color={COLORS.text.muted} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('ai_triage.search_placeholder')}
              placeholderTextColor={COLORS.text.disabled}
              value={purchaseSearch}
              onChangeText={setPurchaseSearch}
            />
            {purchaseSearch.length > 0 && (
              <Pressable onPress={() => setPurchaseSearch('')}>
                <Ionicons name="close-circle" size={18} color={COLORS.text.muted} />
              </Pressable>
            )}
          </View>

          {/* Filter Chips Scroll */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterChipScroll}
          >
            {[
              { id: 'all', label: t('ai_triage.filter_all_recs') },
              { id: 'critical_high', label: t('ai_triage.filter_crit_high') },
              { id: 'low_stock', label: t('ai_triage.filter_low') },
              { id: 'expiry_risk', label: t('ai_triage.filter_expiring') },
              { id: 'no_purchase', label: t('ai_triage.filter_no_purchase') },
            ].map((f) => (
              <Pressable
                key={f.id}
                style={[styles.filterChip, purchaseFilter === f.id && styles.filterChipActive]}
                onPress={() => setPurchaseFilter(f.id as PurchaseFilter)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    purchaseFilter === f.id && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Sorting and Result Count Bar */}
          <View style={styles.toolbarRow}>
            <Text style={styles.resultCountText}>
              {t('ai_triage.items_showing', { count: displayedPurchasePlans.length })}
            </Text>

            <View style={styles.sortButtonsRow}>
              {[
                { id: 'priority', label: 'Priority' },
                { id: 'units', label: 'Units Needed' },
                { id: 'days', label: 'Days Left' },
              ].map((st) => (
                <Pressable
                  key={st.id}
                  style={[styles.sortBtn, purchaseSort === st.id && styles.sortBtnActive]}
                  onPress={() => setPurchaseSort(st.id as PurchaseSort)}
                >
                  <Text
                    style={[
                      styles.sortBtnText,
                      purchaseSort === st.id && styles.sortBtnTextActive,
                    ]}
                  >
                    {st.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Next Month Purchase Cards List */}
          {displayedPurchasePlans.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="checkmark-done-circle-outline" size={40} color={COLORS.status.healthy} />
              <Text style={styles.emptyTitle}>All Inventory Requirements Met</Text>
              <Text style={styles.emptyText}>
                No medicines match the selected filter. Current usable stock meets 30-day forecast demand.
              </Text>
              {(purchaseSearch || purchaseFilter !== 'all') && (
                <Pressable
                  style={styles.clearFiltersBtn}
                  onPress={() => {
                    setPurchaseSearch('');
                    setPurchaseFilter('all');
                  }}
                >
                  <Text style={styles.clearFiltersText}>{t('ai_triage.clear_filters')}</Text>
                </Pressable>
              )}
            </View>
          ) : (
            displayedPurchasePlans.map((plan, index) => {
              const isExpanded = !!expandedCards[plan.id];

              return (
                <Animated.View
                  key={plan.id}
                  entering={reduceMotion ? undefined : FadeInUp.delay(index * 60).duration(320)}
                  style={[
                    styles.purchaseCard,
                    plan.priority === 'critical' && styles.cardBorderCritical,
                    plan.priority === 'high' && styles.cardBorderHigh,
                    plan.priority === 'healthy' && styles.cardBorderHealthy,
                  ]}
                >
                  {/* Card Header */}
                  <View style={styles.purchaseCardHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.purchaseMedName}>{plan.medicineName}</Text>
                      <Text style={styles.purchaseMedSub}>
                        {[plan.genericName, plan.strength, plan.form].filter(Boolean).join(' • ')}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.priorityPill,
                        isDark ? {
                          backgroundColor: '#111827',
                          borderWidth: 1,
                          borderColor: '#1E293B',
                        } : (
                          plan.priority === 'critical'
                            ? { backgroundColor: COLORS.status.criticalBg }
                            : plan.priority === 'high'
                            ? { backgroundColor: COLORS.status.warningBg }
                            : plan.priority === 'medium'
                            ? { backgroundColor: COLORS.brand.verySoft }
                            : plan.priority === 'healthy'
                            ? { backgroundColor: COLORS.status.healthyBg }
                            : { backgroundColor: COLORS.background.primary }
                        ),
                      ]}
                    >
                      <Text
                        style={[
                          styles.priorityPillText,
                          isDark ? {
                            color: plan.priority === 'critical' ? '#60A5FA' : plan.priority === 'high' ? '#3B82F6' : plan.priority === 'medium' ? '#2563EB' : '#93C5FD'
                          } : (
                            plan.priority === 'critical'
                              ? { color: COLORS.status.critical }
                              : plan.priority === 'high'
                              ? { color: COLORS.status.warning }
                              : plan.priority === 'medium'
                              ? { color: COLORS.brand.primary }
                              : plan.priority === 'healthy'
                              ? { color: COLORS.status.healthy }
                              : { color: COLORS.text.muted }
                          ),
                        ]}
                      >
                        {plan.priorityLabel}
                      </Text>
                    </View>
                  </View>

                  {/* 3-Column Key Metrics */}
                  <View style={styles.metricsTripleBox}>
                    {/* Usable Stock */}
                    <View style={styles.metricColumn}>
                      <Text style={styles.columnLabel}>{t('ai_triage.usable_stock')}</Text>
                      <Text style={styles.columnValue}>{plan.usableStock}</Text>
                      <Text style={styles.columnSub}>
                        {plan.expiredStock > 0 ? `(${plan.expiredStock} expired)` : 'Valid non-expired'}
                      </Text>
                    </View>

                    {/* Forecast Demand */}
                    <View style={styles.metricColumn}>
                      <Text style={styles.columnLabel}>{t('ai_triage.forecast_demand')}</Text>
                      <Text style={styles.columnValue}>{plan.forecastDemand30d}</Text>
                      <Text style={styles.columnSub}>
                        {plan.daysUntilStockout > 365 ? '365+ days' : `${plan.daysUntilStockout}d stockout`}
                      </Text>
                    </View>

                    {/* Recommended Additional Units */}
                    <View
                      style={[
                        styles.metricColumn,
                        plan.additionalUnitsNeeded > 0
                          ? styles.metricColumnHighlight
                          : styles.metricColumnHealthy,
                      ]}
                    >
                      <Text
                        style={[
                          styles.columnHighlightLabel,
                          plan.additionalUnitsNeeded === 0 && { color: isDark ? '#60A5FA' : COLORS.status.healthy },
                        ]}
                      >
                        {t('ai_triage.additional_units_needed')}
                      </Text>
                      <Text
                        style={[
                          styles.columnHighlightValue,
                          plan.additionalUnitsNeeded === 0 && { color: isDark ? '#60A5FA' : COLORS.status.healthy },
                        ]}
                      >
                        {plan.additionalUnitsNeeded > 0
                          ? `+${plan.additionalUnitsNeeded}`
                          : '0'}
                      </Text>
                      <Text
                        style={[
                          styles.columnHighlightSub,
                          plan.additionalUnitsNeeded === 0 && { color: isDark ? '#93C5FD' : COLORS.status.healthy },
                        ]}
                      >
                        {plan.suggestedPacks
                          ? `≈ ${plan.suggestedPacks} packs`
                          : plan.additionalUnitsNeeded === 0
                          ? 'Fully stocked'
                          : `${plan.unit}`}
                      </Text>
                    </View>
                  </View>

                  {/* Context & Batch Meta Row */}
                  <View style={styles.metaBadgeRow}>
                    <View style={styles.metaChip}>
                      <Ionicons name="cube" size={12} color={isDark ? '#60A5FA' : COLORS.text.muted} />
                      <Text style={styles.metaChipText}>
                        Incoming: {plan.confirmedIncomingStock} {plan.unit}
                      </Text>
                    </View>

                    {plan.earliestBatchExpiry ? (
                      <View style={styles.metaChip}>
                        <Ionicons name="time" size={12} color={isDark ? '#60A5FA' : COLORS.status.expiring} />
                        <Text style={styles.metaChipText}>
                          Earliest Exp: {plan.earliestBatchExpiry}
                        </Text>
                      </View>
                    ) : null}

                    <View style={styles.metaChip}>
                      <Ionicons
                        name={plan.confidenceLevel === 'high' ? 'shield-checkmark' : 'alert-circle'}
                        size={12}
                        color={plan.confidenceLevel === 'high' ? (isDark ? '#3B82F6' : COLORS.status.healthy) : (isDark ? '#64748B' : COLORS.text.muted)}
                      />
                      <Text style={styles.metaChipText}>{plan.confidence}</Text>
                    </View>
                  </View>

                  {/* Plain Language Reason */}
                  <Text style={styles.planReasonText}>{plan.reason}</Text>

                  {/* Expand / Collapse Calculation Breakdown Toggle */}
                  <Pressable
                    style={styles.expandBreakdownBtn}
                    onPress={() => toggleCardExpansion(plan.id)}
                    accessibilityRole="button"
                    accessibilityLabel="Toggle calculation breakdown"
                  >
                    <Text style={styles.expandBreakdownText}>
                      {isExpanded ? t('ai_triage.hide_breakdown') : t('ai_triage.view_breakdown')}
                    </Text>
                    <Ionicons
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={15}
                      color={isDark ? '#3B82F6' : COLORS.brand.primary}
                    />
                  </Pressable>

                  {/* Expandable Breakdown Drawer */}
                  {isExpanded && (
                    <Animated.View
                      entering={reduceMotion ? undefined : FadeInDown.duration(250)}
                      style={styles.expandedBreakdownDrawer}
                    >
                      <Text style={styles.drawerTitle}>{t('ai_triage.formula_label')}</Text>
                      <Text style={styles.drawerFormulaText}>
                        Units = max(0, Forecast + Safety Stock − Usable Stock − Incoming)
                      </Text>
                      <View style={styles.drawerStepList}>
                        <Text style={styles.drawerStep}>
                          1. 30-Day Forecast Demand: {plan.forecastDemand30d} {plan.unit}
                        </Text>
                        <Text style={styles.drawerStep}>
                          2. Safety Stock Threshold: +{plan.safetyStock} {plan.unit}
                        </Text>
                        <Text style={styles.drawerStep}>
                          3. Usable Current Stock: −{plan.usableStock} {plan.unit}
                          {plan.expiredStock > 0 ? ` (${plan.expiredStock} expired units excluded)` : ''}
                        </Text>
                        <Text style={styles.drawerStep}>
                          4. Confirmed Incoming: −{plan.confirmedIncomingStock} {plan.unit}
                        </Text>
                        <Text style={[styles.drawerStep, styles.drawerResultText]}>
                          = Additional Units Needed: {plan.additionalUnitsNeeded > 0 ? `+${plan.additionalUnitsNeeded}` : '0 (No purchase needed)'}
                        </Text>
                        {plan.suggestedPacks ? (
                          <Text style={styles.drawerPackNote}>
                            📦 Pack Size Constraint ({plan.packSize} units/pack): Order {plan.suggestedPacks} packs
                          </Text>
                        ) : null}
                      </View>
                    </Animated.View>
                  )}

                  {/* Card Actions Footer */}
                  <View style={styles.cardActionsRow}>
                    <Pressable
                      style={styles.actionBtnSecondary}
                      onPress={() => router.push('/(tabs)/inventory' as any)}
                    >
                      <Ionicons name="list-outline" size={15} color={isDark ? '#CBD5E1' : COLORS.text.secondary} />
                      <Text style={styles.actionBtnSecondaryText}>{t('ai_triage.review_stock')}</Text>
                    </Pressable>

                    <Pressable
                      style={styles.actionBtnPrimary}
                      onPress={() =>
                        triggerMedtrixAssistant(
                          `Explain why ${plan.medicineName} is marked as ${plan.priority} priority with a recommended purchase of +${plan.additionalUnitsNeeded} units for next month.`
                        )
                      }
                    >
                      <Ionicons name="sparkles" size={15} color="#fff" />
                      <Text style={styles.actionBtnPrimaryText}>{t('ai_triage.ask_assistant')}</Text>
                    </Pressable>
                  </View>
                </Animated.View>
              );
            })
          )}
        </Animated.View>

        {/* SECTION 4: INVENTORY TRENDS & VISUAL ANALYTICS */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInUp.delay(200).duration(350)}
          style={styles.section}
        >
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>{t('ai_triage.trends_title')}</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Pressable
                style={styles.sectionMiniPdfBtn}
                onPress={handleExportAnalyticsReport}
                disabled={isGeneratingAnalyticsReport}
                accessibilityRole="button"
                accessibilityLabel="Export Inventory Analytics PDF"
              >
                {isGeneratingAnalyticsReport ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons name="document-text-outline" size={13} color="#fff" />
                    <Text style={styles.sectionMiniPdfBtnText}>Export PDF</Text>
                  </>
                )}
              </Pressable>

              <View style={styles.timeframeSegment}>
                {(['7days', '30days', 'thisMonth'] as DateRange[]).map((r) => (
                  <Pressable
                    key={r}
                    style={[styles.timeBtn, dateRange === r && styles.timeBtnActive]}
                    onPress={() => setDateRange(r)}
                  >
                    <Text style={[styles.timeBtnText, dateRange === r && styles.timeBtnTextActive]}>
                      {r === '7days' ? '7D' : r === '30days' ? '30D' : 'Month'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </View>

          {/* Chart 1: Stock In vs Stock Out Velocity */}
          <View style={styles.chartContainer}>
            <View style={styles.chartTitleRow}>
              <Text style={styles.chartTitle}>{t('ai_triage.stock_in_out')}</Text>
              <Text style={styles.chartDeltaText}>
                Net Delta: {txMovement.netDelta >= 0 ? `+${txMovement.netDelta}` : txMovement.netDelta}
              </Text>
            </View>
            <BarChart
              data={velocityChartData}
              width={chartWidth}
              height={190}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => isDark ? `rgba(96, 165, 250, ${opacity})` : `rgba(37, 99, 235, ${opacity})`,
              }}
              style={styles.chartStyle}
              showValuesOnTopOfBars
              withInnerLines={false}
            />
          </View>

          {/* Chart 2: Top Consumed Medicines */}
          <View style={[styles.chartContainer, { marginTop: 16 }]}>
            <View style={styles.chartTitleRow}>
              <Text style={styles.chartTitle}>{t('ai_triage.top_consumed')}</Text>
              <Text style={styles.chartSubLabel}>Dispensed Units</Text>
            </View>
            <BarChart
              data={chartData}
              width={chartWidth}
              height={190}
              yAxisLabel=""
              yAxisSuffix=""
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => isDark ? `rgba(59, 130, 246, ${opacity})` : `rgba(16, 185, 129, ${opacity})`,
              }}
              style={styles.chartStyle}
              showValuesOnTopOfBars
              withInnerLines={false}
            />
          </View>
        </Animated.View>

        {/* SECTION 5: ASK AI TRIAGE (ASSISTANT PROMPTS & ACTIONS) */}
        <Animated.View
          entering={reduceMotion ? undefined : FadeInUp.delay(250).duration(350)}
          style={styles.section}
        >
          <View style={styles.askTriageBanner}>
            <View style={styles.askTriageHeaderRow}>
              <Ionicons name="sparkles" size={20} color={isDark ? '#60A5FA' : COLORS.brand.primary} />
              <Text style={styles.askTriageTitle}>{t('ai_triage.ask_triage_title')}</Text>
            </View>
            <Text style={styles.askTriageDesc}>{t('ai_triage.ask_triage_desc')}</Text>

            <View style={styles.quickPromptWrap}>
              {[
                t('ai_triage.q_next_month_buy'),
                t('ai_triage.q_additional_units'),
                t('ai_triage.q_high_priority_why'),
                t('ai_triage.q_stockout_30d'),
                t('ai_triage.q_enough_stock'),
              ].map((q, idx) => (
                <Pressable
                  key={idx}
                  style={styles.promptChip}
                  onPress={() => triggerMedtrixAssistant(q)}
                >
                  <Ionicons name="chatbubble-ellipses-outline" size={14} color={isDark ? '#3B82F6' : COLORS.brand.primary} />
                  <Text style={styles.promptChipText}>{q}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </Animated.View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* EXPLANATION MODAL SHEET */}
      <Modal
        visible={!!selectedExplanation}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedExplanation(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>{t('ai_triage.explanation_modal_title')}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedExplanation?.medicineName}
                </Text>
              </View>
              <Pressable
                style={styles.modalCloseBtn}
                onPress={() => setSelectedExplanation(null)}
              >
                <Ionicons name="close" size={22} color={isDark ? '#CBD5E1' : COLORS.text.secondary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalBody}>
              <View style={styles.formulaBox}>
                <Text style={styles.formulaTitle}>{t('ai_triage.formula_label')}</Text>
                <Text style={styles.formulaEquation}>
                  Reorder = max(0, Forecast Demand + Safety Stock − Usable Stock − Incoming)
                </Text>
                <View style={styles.formulaStepBox}>
                  <Text style={styles.formulaStepText}>
                    • 30-Day Forecast Demand: {selectedExplanation?.forecastDemand30d} {selectedExplanation?.unit}
                  </Text>
                  <Text style={styles.formulaStepText}>
                    • Safety Reserve Target: +{selectedExplanation?.safetyStock} {selectedExplanation?.unit}
                  </Text>
                  <Text style={styles.formulaStepText}>
                    • Current Usable Stock: −{selectedExplanation?.usableStock} {selectedExplanation?.unit}
                  </Text>
                  <Text style={[styles.formulaStepText, styles.formulaResultText]}>
                    → Recommended Additional Purchase: +{selectedExplanation?.additionalUnitsNeeded} {selectedExplanation?.unit}
                  </Text>
                </View>
              </View>

              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>{t('ai_triage.facts_verified')}</Text>
                <View style={styles.factRow}>
                  <Ionicons name="checkmark-circle" size={16} color={isDark ? '#60A5FA' : COLORS.status.healthy} />
                  <Text style={styles.factText}>
                    Usable non-expired stock: {selectedExplanation?.usableStock} {selectedExplanation?.unit} across {selectedExplanation?.batchCount} batch(es).
                  </Text>
                </View>
                {selectedExplanation?.expiredStock && selectedExplanation.expiredStock > 0 ? (
                  <View style={styles.factRow}>
                    <Ionicons name="alert-circle" size={16} color={isDark ? '#3B82F6' : COLORS.status.critical} />
                    <Text style={[styles.factText, { color: isDark ? '#60A5FA' : COLORS.status.critical }]}>
                      {selectedExplanation.expiredStock} expired units quarantined and excluded from usable stock.
                    </Text>
                  </View>
                ) : null}
              </View>

              <View style={styles.disclaimerBox}>
                <Ionicons name="information-circle-outline" size={16} color={isDark ? '#64748B' : COLORS.text.muted} />
                <Text style={styles.disclaimerText}>
                  {t('ai_triage.data_limitation_note')}
                </Text>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <Pressable
                style={styles.modalAssistantBtn}
                onPress={() => {
                  const name = selectedExplanation?.medicineName;
                  setSelectedExplanation(null);
                  triggerMedtrixAssistant(
                    `Give me a detailed stock triage breakdown for ${name}.`
                  );
                }}
              >
                <Ionicons name="sparkles" size={16} color="#fff" />
                <Text style={styles.modalAssistantBtnText}>{t('ai_triage.ask_assistant')}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: isDark ? '#000000' : COLORS.background.canvas,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: isDark ? '#0D1117' : '#fff',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#1E293B' : COLORS.border.subtle,
  },
  backBtn: {
    padding: 6,
    marginRight: 10,
  },
  headerTitles: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    ...TYPOGRAPHY.heading,
    fontSize: 19,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#111827' : COLORS.brand.verySoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.brand.soft,
  },
  aiBadgeText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 10,
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
    marginLeft: 4,
    fontWeight: '700',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#CBD5E1' : COLORS.text.muted,
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: isDark ? '#111827' : COLORS.background.primary,
  },
  reportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  reportBtnText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: '#fff',
  },
  subBanner: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: isDark ? '#080B12' : '#fff',
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#1E293B' : COLORS.border.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerDesc: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: isDark ? '#CBD5E1' : COLORS.text.secondary,
    flex: 1,
    marginRight: 8,
  },
  timestampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestampText: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: isDark ? '#64748B' : COLORS.text.muted,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#111827' : COLORS.status.criticalBg,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  errorBannerText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 12,
    color: isDark ? '#60A5FA' : COLORS.status.critical,
    flex: 1,
  },
  retryBtn: {
    backgroundColor: isDark ? '#0D1117' : '#fff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  retryBtnText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 11,
    color: isDark ? '#3B82F6' : COLORS.status.critical,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 16,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countPillCritical: {
    backgroundColor: isDark ? '#111827' : COLORS.status.criticalBg,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  countPillHealthy: {
    backgroundColor: isDark ? '#111827' : COLORS.status.healthyBg,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  sectionMiniPdfBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#111827' : '#2563EB',
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 4,
  },
  sectionMiniPdfBtnText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 11,
    color: '#fff',
  },
  countPillText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 11,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  metricCard: {
    width: (screenWidth - 52) / 3,
    backgroundColor: isDark ? '#0D1117' : '#fff',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.border.subtle,
    ...(isDark ? {} : SHADOWS.soft),
  },
  metricCardWarning: {
    borderColor: isDark ? '#2563EB' : COLORS.status.warning,
  },
  metricCardCritical: {
    borderColor: isDark ? '#3B82F6' : COLORS.status.critical,
  },
  metricIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricValue: {
    ...TYPOGRAPHY.heading,
    fontSize: 20,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
  },
  metricLabel: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 11,
    color: isDark ? '#CBD5E1' : COLORS.text.primary,
    marginTop: 2,
  },
  metricSub: {
    ...TYPOGRAPHY.body,
    fontSize: 10,
    color: isDark ? '#64748B' : COLORS.text.muted,
    marginTop: 2,
  },
  allClearCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#0D1117' : COLORS.status.healthyBg,
    padding: 16,
    borderRadius: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : '#A7F3D0',
  },
  allClearIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: isDark ? '#111827' : '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  allClearTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 15,
    color: isDark ? '#60A5FA' : COLORS.status.healthy,
  },
  allClearDesc: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#CBD5E1' : COLORS.text.secondary,
    marginTop: 2,
    lineHeight: 18,
  },
  attentionCard: {
    backgroundColor: isDark ? '#0D1117' : '#fff',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.border.subtle,
    marginBottom: 10,
    ...(isDark ? {} : SHADOWS.soft),
  },
  attentionCardCritical: {
    borderLeftWidth: 4,
    borderLeftColor: isDark ? '#3B82F6' : COLORS.status.critical,
  },
  attentionCardWarning: {
    borderLeftWidth: 4,
    borderLeftColor: isDark ? '#2563EB' : COLORS.status.warning,
  },
  attentionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  attentionMedicine: {
    ...TYPOGRAPHY.heading,
    fontSize: 15,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
  },
  attentionBatch: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: isDark ? '#64748B' : COLORS.text.muted,
    marginTop: 1,
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  severityText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 10,
  },
  attentionReason: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#CBD5E1' : COLORS.text.secondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  attentionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#1E293B' : COLORS.border.subtle,
  },
  attentionStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attentionStockLabel: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#64748B' : COLORS.text.muted,
  },
  attentionStockVal: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
  },
  attentionActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  attentionActionText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: isDark ? '#3B82F6' : COLORS.brand.primary,
  },
  plannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exportPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  exportPlanBtnText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 11,
    color: '#fff',
  },
  plannerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  plannerTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 17,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
    flex: 1,
  },
  timeframeChip: {
    backgroundColor: isDark ? '#111827' : COLORS.brand.verySoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.brand.soft,
  },
  timeframeChipText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 10,
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
  },
  plannerSubtitle: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#CBD5E1' : COLORS.text.muted,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#0D1117' : '#fff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.border.subtle,
    gap: 8,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    ...TYPOGRAPHY.body,
    fontSize: 13,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
    padding: 0,
  },
  filterChipScroll: {
    gap: 8,
    paddingBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: isDark ? '#0D1117' : '#fff',
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.border.subtle,
  },
  filterChipActive: {
    backgroundColor: isDark ? '#111827' : COLORS.brand.soft,
    borderColor: isDark ? '#3B82F6' : COLORS.brand.primary,
  },
  filterChipText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 12,
    color: isDark ? '#CBD5E1' : COLORS.text.secondary,
  },
  filterChipTextActive: {
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
    fontWeight: '700',
  },
  toolbarRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 12,
  },
  resultCountText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#64748B' : COLORS.text.muted,
  },
  sortButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  sortBtn: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: isDark ? '#0D1117' : COLORS.background.primary,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  sortBtnActive: {
    backgroundColor: isDark ? '#111827' : COLORS.brand.verySoft,
    borderColor: isDark ? '#3B82F6' : 'transparent',
  },
  sortBtnText: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: isDark ? '#64748B' : COLORS.text.muted,
  },
  sortBtnTextActive: {
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
    fontWeight: '700',
  },
  purchaseCard: {
    backgroundColor: isDark ? '#0D1117' : '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.border.subtle,
    marginBottom: 12,
    ...(isDark ? {} : SHADOWS.soft),
  },
  cardBorderCritical: {
    borderColor: isDark ? '#1E293B' : '#FCA5A5',
    borderLeftWidth: 4,
    borderLeftColor: isDark ? '#3B82F6' : COLORS.status.critical,
  },
  cardBorderHigh: {
    borderColor: isDark ? '#1E293B' : '#FCD34D',
    borderLeftWidth: 4,
    borderLeftColor: isDark ? '#2563EB' : COLORS.status.warning,
  },
  cardBorderHealthy: {
    borderColor: isDark ? '#1E293B' : '#A7F3D0',
    borderLeftWidth: 4,
    borderLeftColor: isDark ? '#60A5FA' : COLORS.status.healthy,
  },
  purchaseCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  purchaseMedName: {
    ...TYPOGRAPHY.heading,
    fontSize: 16,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
  },
  purchaseMedSub: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#64748B' : COLORS.text.muted,
    marginTop: 2,
  },
  priorityPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityPillText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  metricsTripleBox: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#080B12' : COLORS.background.primary,
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    gap: 8,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  metricColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnLabel: {
    ...TYPOGRAPHY.body,
    fontSize: 10,
    color: isDark ? '#64748B' : COLORS.text.muted,
    textTransform: 'uppercase',
  },
  columnValue: {
    ...TYPOGRAPHY.heading,
    fontSize: 16,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
    marginTop: 2,
  },
  columnSub: {
    ...TYPOGRAPHY.body,
    fontSize: 9,
    color: isDark ? '#64748B' : COLORS.text.muted,
    marginTop: 1,
  },
  metricColumnHighlight: {
    backgroundColor: isDark ? '#111827' : COLORS.brand.verySoft,
    borderRadius: 8,
    paddingVertical: 2,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  metricColumnHealthy: {
    backgroundColor: isDark ? '#111827' : COLORS.status.healthyBg,
    borderRadius: 8,
    paddingVertical: 2,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  columnHighlightLabel: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 10,
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
    textTransform: 'uppercase',
  },
  columnHighlightValue: {
    ...TYPOGRAPHY.heading,
    fontSize: 17,
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
    marginTop: 1,
  },
  columnHighlightSub: {
    ...TYPOGRAPHY.body,
    fontSize: 9,
    color: isDark ? '#93C5FD' : COLORS.brand.primary,
    marginTop: 1,
  },
  metaBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#080B12' : COLORS.background.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  metaChipText: {
    ...TYPOGRAPHY.body,
    fontSize: 10,
    color: isDark ? '#CBD5E1' : COLORS.text.secondary,
  },
  planReasonText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#CBD5E1' : COLORS.text.secondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  expandBreakdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#1E293B' : COLORS.border.subtle,
  },
  expandBreakdownText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
  },
  expandedBreakdownDrawer: {
    backgroundColor: isDark ? '#080B12' : COLORS.background.primary,
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
    marginBottom: 10,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  drawerTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
    marginBottom: 2,
  },
  drawerFormulaText: {
    ...TYPOGRAPHY.mono,
    fontSize: 10,
    color: isDark ? '#60A5FA' : COLORS.brand.deep,
    marginBottom: 6,
  },
  drawerStepList: {
    gap: 3,
  },
  drawerStep: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: isDark ? '#CBD5E1' : COLORS.text.secondary,
  },
  drawerResultText: {
    ...TYPOGRAPHY.bodyBold,
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
    marginTop: 2,
  },
  drawerPackNote: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 11,
    color: isDark ? '#93C5FD' : COLORS.status.info,
    marginTop: 4,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#1E293B' : COLORS.border.subtle,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: isDark ? '#080B12' : COLORS.background.primary,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  actionBtnSecondaryText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 12,
    color: isDark ? '#CBD5E1' : COLORS.text.secondary,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  actionBtnPrimaryText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: isDark ? '#0D1117' : '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.border.subtle,
  },
  emptyTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 15,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
    marginTop: 10,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#64748B' : COLORS.text.muted,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
  },
  clearFiltersBtn: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: isDark ? '#111827' : COLORS.brand.verySoft,
    borderRadius: 8,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  clearFiltersText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
  },
  timeframeSegment: {
    flexDirection: 'row',
    backgroundColor: isDark ? '#0D1117' : COLORS.background.primary,
    borderRadius: 8,
    padding: 2,
    gap: 2,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  timeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  timeBtnActive: {
    backgroundColor: isDark ? '#111827' : '#fff',
    ...(isDark ? {} : SHADOWS.soft),
  },
  timeBtnText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 11,
    color: isDark ? '#64748B' : COLORS.text.muted,
  },
  timeBtnTextActive: {
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
    fontWeight: '700',
  },
  chartContainer: {
    backgroundColor: isDark ? '#0D1117' : '#fff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.border.subtle,
    alignItems: 'center',
    ...(isDark ? {} : SHADOWS.soft),
  },
  chartTitleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 8,
  },
  chartTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 14,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
  },
  chartDeltaText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 12,
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
  },
  chartSubLabel: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: isDark ? '#64748B' : COLORS.text.muted,
  },
  chartStyle: {
    borderRadius: 12,
  },
  askTriageBanner: {
    backgroundColor: isDark ? '#0D1117' : COLORS.brand.verySoft,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.brand.soft,
  },
  askTriageHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  askTriageTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 15,
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
  },
  askTriageDesc: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#CBD5E1' : COLORS.text.secondary,
    marginTop: 4,
    lineHeight: 18,
  },
  quickPromptWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  promptChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: isDark ? '#080B12' : '#fff',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.brand.soft,
    gap: 6,
  },
  promptChipText: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 11,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: isDark ? '#0D1117' : '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 32,
    maxHeight: '85%',
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: isDark ? '#1E293B' : COLORS.border.subtle,
  },
  modalTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 17,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
  },
  modalSubtitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontSize: 13,
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    marginTop: 16,
  },
  formulaBox: {
    backgroundColor: isDark ? '#080B12' : COLORS.background.primary,
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: isDark ? '#2563EB' : COLORS.brand.primary,
    marginBottom: 16,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  formulaTitle: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
    marginBottom: 4,
  },
  formulaEquation: {
    ...TYPOGRAPHY.mono,
    fontSize: 11,
    color: isDark ? '#60A5FA' : COLORS.brand.deep,
    marginBottom: 8,
  },
  formulaStepBox: {
    gap: 4,
    marginTop: 4,
  },
  formulaStepText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#CBD5E1' : COLORS.text.secondary,
  },
  formulaResultText: {
    ...TYPOGRAPHY.bodyBold,
    color: isDark ? '#60A5FA' : COLORS.brand.primary,
    marginTop: 4,
  },
  modalSection: {
    marginBottom: 16,
  },
  modalSectionTitle: {
    ...TYPOGRAPHY.heading,
    fontSize: 14,
    color: isDark ? '#FFFFFF' : COLORS.text.primary,
    marginBottom: 8,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 6,
  },
  factText: {
    ...TYPOGRAPHY.body,
    fontSize: 12,
    color: isDark ? '#CBD5E1' : COLORS.text.secondary,
    flex: 1,
    lineHeight: 18,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: isDark ? '#080B12' : '#F1F5F9',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
    borderWidth: isDark ? 1 : 0,
    borderColor: isDark ? '#1E293B' : 'transparent',
  },
  disclaimerText: {
    ...TYPOGRAPHY.body,
    fontSize: 11,
    color: isDark ? '#64748B' : COLORS.text.muted,
    flex: 1,
    lineHeight: 16,
  },
  modalFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: isDark ? '#1E293B' : COLORS.border.subtle,
  },
  modalAssistantBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  modalAssistantBtnText: {
    ...TYPOGRAPHY.bodyBold,
    fontSize: 13,
    color: '#fff',
  },
  skeletonSectionHeader: {
    ...TYPOGRAPHY.heading,
    fontSize: 16,
    color: isDark ? '#64748B' : COLORS.text.muted,
    marginBottom: 16,
  },
  skeletonCard: {
    backgroundColor: isDark ? '#0D1117' : '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: isDark ? '#1E293B' : COLORS.border.subtle,
    marginBottom: 12,
  },
  skeletonHeader: {
    height: 24,
    width: '60%',
    backgroundColor: isDark ? '#111827' : COLORS.background.primary,
    borderRadius: 6,
    marginBottom: 12,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  skeletonBox: {
    flex: 1,
    height: 48,
    backgroundColor: isDark ? '#111827' : COLORS.background.primary,
    borderRadius: 8,
  },
  skeletonFooter: {
    height: 16,
    width: '90%',
    backgroundColor: isDark ? '#111827' : COLORS.background.primary,
    borderRadius: 4,
  },
});
