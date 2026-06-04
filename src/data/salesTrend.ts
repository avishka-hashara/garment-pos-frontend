import type { SalesPoint } from '@/types'

/** Weekly sales for the trailing 12 weeks (wholesale vs store + units). */
export const salesTrend: SalesPoint[] = [
  { label: 'Mar 16', wholesale: 38200, store: 5400, units: 2840 },
  { label: 'Mar 23', wholesale: 41800, store: 6100, units: 3120 },
  { label: 'Mar 30', wholesale: 36400, store: 4800, units: 2610 },
  { label: 'Apr 06', wholesale: 47900, store: 7200, units: 3580 },
  { label: 'Apr 13', wholesale: 52100, store: 6900, units: 3820 },
  { label: 'Apr 20', wholesale: 44600, store: 5600, units: 3140 },
  { label: 'Apr 27', wholesale: 58300, store: 8100, units: 4260 },
  { label: 'May 04', wholesale: 61200, store: 7400, units: 4410 },
  { label: 'May 11', wholesale: 54700, store: 6200, units: 3890 },
  { label: 'May 18', wholesale: 66800, store: 9100, units: 4880 },
  { label: 'May 25', wholesale: 72400, store: 8600, units: 5120 },
  { label: 'Jun 01', wholesale: 69500, store: 9400, units: 4960 },
]

/** Sales mix by product category for the current month. */
export const categoryMix = [
  { category: 'Outerwear', value: 41200 },
  { category: 'Trousers', value: 28600 },
  { category: 'Shirts', value: 16400 },
  { category: 'Knitwear', value: 22800 },
]
