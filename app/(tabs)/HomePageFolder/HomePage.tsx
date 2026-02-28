
import { ScrollView } from 'react-native';
import HomeHeader from './HomeHeader';
import QuickActions from './QuickActions';
import TotalBalance from './TotalBalance';

export default function HomePage() {
return (
    <ScrollView>
    <HomeHeader />
    <TotalBalance />
    <QuickActions />
</ScrollView>
);
}