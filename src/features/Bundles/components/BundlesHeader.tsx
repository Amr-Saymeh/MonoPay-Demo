import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BundlesStyles as styles } from '../styles';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from '@/hooks/use-i18n';           

interface BundlesHeaderProps {
    onCreateNew: () => void;
    onBack: () => void;
}

export default function BundlesHeader({ onCreateNew, onBack }: BundlesHeaderProps) {
    const { t } = useI18n() as any;
    return (
        <View style={styles.headerContainer}>
            <View style={styles.headerRow}>
                <Ionicons 
                    name="arrow-back" 
                    size={28} 
                    color="#111" 
                    style={styles.backButton} 
                    onPress={onBack} 
                />
                <Text style={styles.headerTitle}>{t('myBundles')}</Text>
            </View>
            <Text style={styles.headerSubtitle}>
                {t('bundlesSubtitle')}
            </Text>
            
            <TouchableOpacity 
                style={styles.createButton} 
                onPress={onCreateNew}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={24} color="#FFFFFF" />
                <Text style={styles.createButtonText}>{t('createNewBundle')}</Text>
            </TouchableOpacity>
        </View>
    );
}
