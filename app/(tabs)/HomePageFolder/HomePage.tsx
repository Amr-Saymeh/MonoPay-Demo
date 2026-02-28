
import { ScrollView } from 'react-native';
import HomeHeader from './HomeHeader';
import QuickActions from './QuickActions';
import TotalBalance from './TotalBalance';
import Advertisement from './ADVERTISEMENT';

export default function HomePage() {
return (
    <ScrollView>
    <HomeHeader />
    <TotalBalance />
    <QuickActions />
    <Advertisement />
</ScrollView>
);
}