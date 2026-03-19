import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useI18n } from "@/hooks/use-i18n";
import { menuItems } from '@/components/FeturesPage/icons';
import { useFeatures } from '@/src/providers/FeaturesProvider';

export default function Customization() {
    const { t } = useI18n();
    const { activeFeatures, toggleFeature } = useFeatures();

    const arrowBack = () => {
        if (activeFeatures.length !== 3) {
            Alert.alert(t("error"), t("Youmustselect3features"));
            return;
        }
        router.back();
    };

    return (
        <View style={styles.screenContainer}>
            <Text style={styles.headerTitle}>{t("customization")}</Text>

            <Ionicons
                name="arrow-back"
                size={24}
                color="#111"
                style={styles.backButton}
                onPress={arrowBack}
            />

            <ScrollView
                style={styles.scrollContainer}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
            >
                {menuItems
                    .filter((item: any) => item.id !== '7')
                    .map((item: any, index: number) => {
                        const isActive = activeFeatures.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[
                                    styles.item,
                                    isActive && styles.activeItem,
                                    (index + 1) % 3 !== 0 && { marginRight: '3.5%' }
                                ]}
                                activeOpacity={0.7}
                                onPress={() => toggleFeature(item.id)}
                            >
                                <View
                                    style={[
                                        styles.iconContainer,
                                        { backgroundColor: isActive ? '#566CB2' : item.color }
                                    ]}
                                >
                                    <Ionicons
                                        name={item.iconName}
                                        size={26}
                                        color="white"
                                    />
                                </View>

                                <View style={styles.textContainer}>
                                    <Text style={styles.itemTitle}>{t(item.titleKey)}</Text>
                                    {item.subtitleKey && (
                                        <Text style={styles.itemSubtitle}>{t(item.subtitleKey)}</Text>
                                    )}
                                </View>
                                
                            </TouchableOpacity>
                        );
                    })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        paddingTop: 60,
        paddingHorizontal: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111',
        marginLeft: 40,
        marginBottom: 40,
        textAlign: 'left',
    },
    backButton: {
        position: 'absolute',
        top: 65,
        left: 20,
        zIndex: 10,
    },
    scrollContainer: {
        flex: 1,
    },
    scrollContentContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingBottom: 20,
    },
    item: {
        width: '31%',
        alignItems: 'center',
        backgroundColor: 'white',
        paddingVertical: 16,
        paddingHorizontal: 6,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: 'transparent',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    activeItem: {
        borderColor: '#566CB2',
        backgroundColor: '#EEF1FF',
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    textContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    itemTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#111',
        textAlign: 'center',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
    },
});