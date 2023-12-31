import {StyleSheet, View} from 'react-native';
import WebView from "react-native-webview";
import Constants from 'expo-constants';

import {useEffect, useState} from "react";
import {registerIndieID} from 'native-notify';
import * as SecureStore from 'expo-secure-store';
import axios from "axios";
import {APP_ID, APP_TOKEN, BASE_URL} from "./constants";
import ThresholdMenu from "./components/ThresholdMenu";

export default function App() {
    const [expoToken, setExpoToken] = useState()
    const [modalVisible, setModalVisible] = useState(false);
    const [alertProfile, setAlertProfile] = useState({})
    const handleModal = () => setModalVisible(() => !modalVisible);

    useEffect(() => {
        getUserProfile().then()
    }, []);

    async function getUserProfile() {
        let token = await SecureStore.getItemAsync('user_token')
        if (!token) {
            await axios.get(BASE_URL + 'create_alert_profile/', {}).then(async function (response) {
                let token = response.data.expoUserToken
                let subId = response.data.subscriptionToken
                setExpoToken(token)
                setAlertProfile(response.data)
                await SecureStore.setItemAsync('user_token', token)
                await registerIndieID(subId, APP_ID, APP_TOKEN)
            }).catch(error => alert(error))

        } else {
            await axios.post(BASE_URL + 'get_alert_profile/', {
                expo_token: token,
            }).then(async function (response) {
                let token = response.data.expoUserToken
                let subId = response.data.subscriptionToken
                setExpoToken(token)
                setAlertProfile(response.data)
                await registerIndieID(subId, APP_ID, APP_TOKEN).then()
                console.log("Token exists! " + token + " / " + subId)
            }).catch(error => console.log(error))
        }
    }

    return (
        <View
            style={styles.container}
        >
            <ThresholdMenu profile={alertProfile}/>
            <WebView
                style={styles.webContainer}
                source={{uri: 'https://capstone-react-frontend.vercel.app/'}}
            />
        </View>
    );
}


const styles = StyleSheet.create({
    container: {
        marginTop: Constants.statusBarHeight,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
    },
    popupContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#80808080',
        alignItems: 'center',
    },
    modalView: {
        margin: 20,
        minWidth: '50%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    webContainer: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    }
});


