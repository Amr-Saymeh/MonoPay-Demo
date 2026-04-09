import { MenuItem } from './types';

export const menuItems: MenuItem[] = [
  {
    id: '1',
    titleKey: 'myCards',
    subtitleKey: 'myCardsSubtitle',
    iconName: 'card-outline',
    color: '#FF5722',
    state: false,
    route: '/wallets'
  },
  {
    id: '2',
    titleKey: 'exchangeRates',
    subtitleKey: 'exchangeRatesSubtitle',
    iconName: 'trending-up-outline',
    color: '#2196F3',
    state: false,
    route: '/exchange'
  },
  {
    id: '3',
    titleKey: 'spendingInsights',
    subtitleKey: 'spendingInsightsSubtitle',
    iconName: 'bar-chart-outline',
    color: '#9C27B0',
    state: false,
    route: '/MainScreen_DailyPur'
  },
  {
    id: '4',
    titleKey: 'savingGoals',
    subtitleKey: undefined,
    iconName: 'wallet-outline',
    color: '#4CAF50',
    state: false,
    route: '/SavingGoals'
  },
  {
    id: '5',
    titleKey: 'transactions',
    subtitleKey: undefined,
    iconName: 'receipt-outline',
    color: '#00BCD4',
    state: false,
    route: '/transfer'
  },
  {
    id: '6',
    titleKey: 'settings',
    subtitleKey: 'settingsSubtitle',
    iconName: 'settings-outline',
    color: '#607D8B',
    state: false,
    route: '/settings'
  },
  {
    id: '7',
    titleKey: 'more',
    subtitleKey: undefined,
    iconName: 'ellipsis-horizontal',
    color: '#00BCD4',
    state: true,
    route: '/FeturesPage' // will be changed later maybe, but keep backward compatible
  },
];
