import React from 'react';
import { ScrollView } from 'react-native';
import HomeHeader from './components/HomeHeader';
import TotalBalance from './components/TotalBalance';
import QuickActions from './components/QuickActions';
import Advertisement from './components/Advertisement';
import Customization from './components/Customization';

export function HomeFeature() {
    return (
        <ScrollView>
            <HomeHeader />
            <TotalBalance />
            <QuickActions />
            <Advertisement />
        </ScrollView>
    );
}

export { Customization as CustomizationFeature };
