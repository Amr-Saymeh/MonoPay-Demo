import { ScrollView } from 'react-native';
import Card from '../../components/DailyPurchases/Card';
import DailyPurchasesForm from '../../components/DailyPurchases/form';
import PurchaseCard from '@/components/DailyPurchases/PurchaseCard';

export default function MainScreen_DailyPur() {
  return (
    <ScrollView>
      <Card
        spentAmount={142.50}
        currency="$"
        budgetPercent={65}
        label="SPENT TODAY"
        
      />
      
      <DailyPurchasesForm />
<PurchaseCard
/>
      <Card
      currency="NIS"
      spentAmount={45.00}
      label="Weekly Insights"
      
  image={{
    uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0jm9-nuN1--ge2nr4WxbGb23Svspvgf6r8QVx0ls0D6MRZ7wEuAkysJBysInqVnAP-MXdaBl0u4NT2q_l6K2lVizgWB4bevO7A6IhkUoylJ-0uoMhQ-8ZzmL0fEDZfd4Uiu-7_pz9JSeHjA0WAD532MC5ymWx3WvPGqU1eueKN0oWGUJFocj0yY4trDCXV7AnYYN6IMEMJ--0FuqsgI3ChOWK_Dr8Y6vMnFAFYNIGAiNnETz2d5h7mIllK-uI-BXmvYz84AfeRrLS"
  }}
/>

    </ScrollView>
  );
}