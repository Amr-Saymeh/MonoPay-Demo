
import { ScrollView } from 'react-native';
import HomeHeader from '../components/HomePageFolder/HomeHeader';
import QuickActions from '../components/HomePageFolder/QuickActions';
import TotalBalance from '../components/HomePageFolder/TotalBalance';
import Advertisement from '../components/HomePageFolder/ADVERTISEMENT';

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