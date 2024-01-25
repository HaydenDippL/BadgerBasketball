import { useState, useEffect } from 'react'
import { ScrollView, Text, View, StyleSheet } from 'react-native'

import DateForm from './src/components/DateForm'
import Legend from './src/components/Legend'
import Schedule from './src/components/Schedule'

export default function App() {

    // The date state variable represents the date of the schedules
    // according to the US Chicago Central time
    const [date, setDate] = useState(new Date())

    // The preferences state variable represents the different buttons
    // the user can press to focus on just that sport, or many sport
    const [preferences, setPreferences] = useState({
        'Open Rec Basketball': false,
        'Open Rec Volleyball': false,
        'Open Rec Badminton / Pickleball': false,
        'Open Rec Futsal': false
    })

    return <>
        <ScrollView>
            <View style={styles.container}>
                <Text style={styles.title}>Welcome to UW Open Rec Roster</Text>
                <Text style={styles.text}>View the court schedules of the Bick and Bakke. Adjust the date to view the schedule of different days. Select activities you and your friends enjoy to focus only on those activities in the schedule. Click on an activity in the schedule to get more information about that activity.</Text>
                <Legend preferences={preferences} setPreferences={setPreferences}/>
                <Schedule gym='Bakke' preferences={preferences} date={date}/>
                <Schedule gym='Nick' preferences={preferences} date={date}/>
            </View>
        </ScrollView>
        <DateForm date={date} setDate={setDate}/>
    </>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    
    title: {
        fontSize: 50,
        textAlign: 'center',
        marginTop: 50,
        marginBottom: 20,
    },
    
    text: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 15
    }
})
