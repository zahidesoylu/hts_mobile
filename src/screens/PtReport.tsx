import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, Button, StyleSheet } from 'react-native';

// Rapor tipi tanımlanıyor
interface Report {
    id: string;
    name: string;
    date: string;
    content: string;
}

const PtReport = () => {
    const [reports, setReports] = useState<Report[]>([
        { id: '1', name: 'Geçmiş Rapor 1', date: '01.03.2025', content: 'Raporda yer alan içerik...'},
        { id: '2', name: 'Geçmiş Rapor 2', date: '28.02.2025', content: 'Başka bir rapor içeriği...'}
    ]);
        
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [reportTitle, setReportTitle] = useState('');
    const [reportContent, setReportContent] = useState('');

    const saveReport = () => {
        const newReport: Report = {
            id: Math.random().toString(),
            name: reportTitle,  // title yerine name kullanıyoruz
            date: new Date().toLocaleDateString(),
            content: reportContent
        };
        setReports([...reports, newReport]);
        setReportTitle('');
        setReportContent('');
    };

    const handleReportPress = (item: Report) => {
        setSelectedReport(item);
    };

    const navigateToNewReport = () => {
        setSelectedReport(null);  // Clear the selected report to navigate to new report
    };

    const downloadReport = () => {
        console.log('Download Report');
    };

    const shareReport = () => {
        console.log('Share Report');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Raporlar</Text>

            {/* Bugünün Raporunu Doldur */}
            <TouchableOpacity style={styles.newReportButton} onPress={navigateToNewReport}>
                <Text style={styles.buttonText}>Bugünün Raporunu Doldur</Text>
            </TouchableOpacity>

            {/* Geçmiş Raporlar Listesi */}
            <Text style={styles.subHeader}>Geçmiş Raporlar</Text>
            <FlatList
                data={reports}
                renderItem={({ item }: { item: Report }) => (
                    <TouchableOpacity
                        style={styles.reportItem}
                        onPress={() => handleReportPress(item)}
                    >
                        <Text style={styles.reportTitle}>{item.name}</Text> {/* title yerine name kullanıldı */}
                        <Text style={styles.reportDate}>{item.date}</Text>
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => item.id}
            />

            {/* Eğer seçilen rapor varsa, detayları göster */}
            {selectedReport && (
                <View style={styles.reportDetailContainer}>
                    <Text style={styles.reportTitle}>{selectedReport.name}</Text> {/* title yerine name kullanıldı */}
                    <Text style={styles.reportDate}>{selectedReport.date}</Text>

                    <ScrollView style={styles.reportContent}>
                        <Text>{selectedReport.content}</Text>
                    </ScrollView>

                    <View style={styles.buttonsContainer}>
                        <Button title="İndir" onPress={downloadReport} />
                        <Button title="Paylaş" onPress={shareReport} />
                    </View>
                </View>
            )}

            {/* Eğer yeni rapor ekleniyorsa, formu göster */}
            {!selectedReport && (
                <View style={styles.newReportForm}>
                    <Text style={styles.headerText}>Bugünün Raporunu Doldur</Text>

                    {/* Rapor Başlık */}
                    <TextInput
                        style={styles.inputField}
                        placeholder="Rapor Başlığı"
                        value={reportTitle}
                        onChangeText={setReportTitle}
                    />

                    {/* Rapor İçeriği */}
                    <TextInput
                        style={[styles.inputField, styles.textArea]}
                        placeholder="Rapor İçeriği"
                        value={reportContent}
                        onChangeText={setReportContent}
                        multiline
                    />

                    {/* Tarih */}
                    <Text style={styles.dateLabel}>Tarih: {new Date().toLocaleDateString()}</Text>

                    {/* Kaydet Butonu */}
                    <TouchableOpacity style={styles.saveButton} onPress={saveReport}>
                        <Text style={styles.buttonText}>Kaydet</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: "#fff",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    subHeader: {
        fontSize: 18,
        fontWeight: "bold",
        marginTop: 20,
    },
    newReportButton: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
    },
    buttonText: {
        color: "#fff",
        fontSize: 16,
        textAlign: "center",
    },
    reportItem: {
        padding: 15,
        backgroundColor: "#f9f9f9",
        marginVertical: 5,
        borderRadius: 8,
        elevation: 3,
    },
    reportTitle: {
        fontSize: 18,
        fontWeight: "bold",
    },
    reportDate: {
        fontSize: 14,
        color: "#777",
    },
    newReportForm: {
        marginTop: 30,
    },
    inputField: {
        borderWidth: 1,
        borderColor: "#ccc",
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        marginBottom: 20,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    saveButton: {
        backgroundColor: "#4CAF50",
        padding: 15,
        borderRadius: 8,
    },
    dateLabel: {
        fontSize: 14,
        color: "#777",
        marginBottom: 20,
    },
    reportContent: {
        marginTop: 20,
    },
    reportDetailContainer: {
        marginTop: 20,
        padding: 20,
        backgroundColor: "#f0f0f0",
        borderRadius: 8,
        elevation: 3,
    },
    buttonsContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 20,
    },
});

export default PtReport;
