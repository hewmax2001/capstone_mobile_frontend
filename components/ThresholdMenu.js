import {Button, Modal, StyleSheet, Text, TextInput, View} from "react-native";
import React from "react";
import axios from "axios";
import {
    APP_ID,
    APP_TOKEN,
    BASE_URL,
    HUM_VAR,
    LIGHT_VAR,
    MAX_HUM, MAX_LIGHT, MAX_SOIL,
    MAX_TEMP,
    MIN_HUM, MIN_LIGHT, MIN_SOIL,
    MIN_TEMP, SOIL_VAR,
    TEMP_VAR
} from "../constants";
import * as SecureStore from "expo-secure-store";

export default class ThresholdMenu extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisibleFooter: false,
            modalVisible: false,
            selectVisible: true,
            minValue: "",
            maxValue: "",
            threshTitle: "",
            postfix: "",
            selectedVar: "",
            profile: {
                active: false,
            }
        };
        this.getUserProfile().then()
    }

    renderModal = () => {
        const {selectVisible, minValue, maxValue, threshTitle, postfix, profile} = this.state;
        if (selectVisible) {
            return (
                <View style={styles.modalView}>
                    <Text>Select Variable</Text>
                    <View style={styles.buttonContainer}>
                        <View style={styles.rowView}>
                            <View style={styles.buttonVariable}>
                                <Button title={"Temperature"} onPress={() => this.changeTemp()}></Button>
                            </View>
                            <View style={styles.buttonVariable}>
                                <Button title={"Humidity"} onPress={() => this.changeHum()}></Button>
                            </View>

                        </View>
                        <View style={styles.rowView}>
                            <View style={styles.buttonVariable}>
                                <Button title={"Soil Moisture"} onPress={() => this.changeSoil()}></Button>
                            </View>
                            <View style={styles.buttonVariable}>
                                <Button title={"Light Intensity"} onPress={() => this.changeLight()}></Button>
                            </View>
                        </View>
                        {profile.active ?
                        <Button title={"Disable Alerts"} onPress={() => this.toggleAlerts()}></Button>
                        :
                        <Button title={"Enable Alerts"} onPress={() => this.toggleAlerts()}></Button>}
                    </View>
                </View>
            );
        }
        return (
            <View style={styles.modalView}>
                <Text>{threshTitle}</Text>
                <Text>Minimum Threshold</Text>
                <View style={styles.rowView}>
                    <TextInput
                        style={styles.inputVariable}
                        value={minValue}
                        placeholder=""
                        keyboardType="numeric"
                        textAlign={'right'}
                        onChangeText={ value => {this.changeMin(value)}}
                    />
                    <Text>{postfix}</Text>
                </View>
                <Text>Maximum Threshold</Text>
                <View style={styles.rowView}>
                    <TextInput
                        style={styles.inputVariable}
                        value={maxValue}
                        placeholder=""
                        keyboardType="numeric"
                        textAlign={'right'}
                        onChangeText={ value => {this.changeMax(value)}}
                    />
                    <Text>{postfix}</Text>
                </View>
                <View style={styles.buttonVariable}>
                    <Button title="Set" onPress={() => {this.setThresholds().then(this.handleModal())}}/>
                </View>
                <View style={styles.buttonVariable}>
                    <Button title="Close" onPress={() => {
                        this.setState(() => ({selectVisible: true}))
                    }}/>
                </View>
            </View>
        );
    };

    toggleAlerts = async () => {
        const {profile} = this.state
        const status = !profile.active
        console.log("status = " + status)
        await axios.post(BASE_URL + 'set_alerts_status/', {
            expo_token: profile.expoUserToken,
            active: status
        }).then(response => {
            alert(response.data.message)
            this.getUserProfile()
        })
    }

    handleModal = () => {
        this.setState(() => ({modalVisible: !modalVisible, selectVisible: true}));
        const {modalVisible} = this.state;
    };

    changeTemp = () => {
        const {profile} = this.state;
        let minValue = (profile.minTemp) ? profile.minTemp.toString() : "";
        let maxValue = (profile.maxTemp) ? profile.maxTemp.toString() : "";

        this.setState(() => ({
            selectVisible: false,
            minValue: minValue,
            maxValue: maxValue,
            threshTitle: "Temperature",
            postfix: "°C",
            selectedVar: TEMP_VAR,
        }));
    }

    changeHum = () => {
        const {profile} = this.state;
        let minValue = (profile.minHumidity) ? profile.minHumidity.toString() : "";
        let maxValue = (profile.maxHumidity) ? profile.maxHumidity.toString() : "";

        this.setState(() => ({
            selectVisible: false,
            minValue: minValue,
            maxValue: maxValue,
            threshTitle: "Humidity",
            postfix: "%",
            selectedVar: HUM_VAR,
        }));
    }

    changeSoil = () => {
        const {profile} = this.state;
        let minValue = (profile.minSoil) ? profile.minSoil.toString() : "";
        let maxValue = (profile.maxSoil) ? profile.maxSoil.toString() : "";

        this.setState(() => ({
            selectVisible: false,
            minValue: minValue,
            maxValue: maxValue,
            threshTitle: "Soil Moisture",
            postfix: "%",
            selectedVar: SOIL_VAR,
        }));
    }

    changeLight = () => {
        const {profile} = this.state;
        let minValue = (profile.minLight) ? profile.minLight.toString() : "";
        let maxValue = (profile.maxLight) ? profile.maxLight.toString() : "";

        this.setState(() => ({
            selectVisible: false,
            minValue: minValue,
            maxValue: maxValue,
            threshTitle: "Light Intensity",
            postfix: "",
            selectedVar: LIGHT_VAR,
        }));
    }

    setThresholds = async () => {
        let {minValue, maxValue, selectedVar, profile} = this.state;
        if (!minValue)
            minValue = "None"
        if (!maxValue)
            maxValue = "None"

        let min = Number(minValue)
        let max = Number(maxValue)

        switch (selectedVar) {
            case TEMP_VAR:
                if (min < MIN_TEMP || min > MAX_TEMP) {
                    alert("Minimum value must be within 0 - 50")
                    return
                }
                else if (max < MIN_TEMP || max > MAX_TEMP) {
                    alert("Maximum value must be within 0 - 50")
                    return
                }
                break;
            case HUM_VAR:
                if (min < MIN_HUM || min > MAX_HUM) {
                    alert("Minimum value must be within 0 - 100")
                    return
                }
                else if (max < MIN_HUM || max > MAX_HUM) {
                    alert("Maximum value must be within 0 - 100")
                    return
                }
                break;
            case SOIL_VAR:
                if (min < MIN_SOIL || min > MAX_SOIL) {
                    alert("Minimum value must be within 0 - 100")
                    return
                }
                else if (max < MIN_SOIL || max > MAX_SOIL) {
                    alert("Maximum value must be within 0 - 100")
                    return
                }
                break;
            case LIGHT_VAR:
                if (min < MIN_LIGHT || min > MAX_LIGHT) {
                    alert("Minimum value must be within 0 - 2500")
                    return
                }
                else if (max < MIN_LIGHT || max > MAX_LIGHT) {
                    alert("Maximum value must be within 0 - 2500")
                    return
                }
                break;
            default:
                alert("Incorrect variable: " + selectedVar)
                break;
        }


        await axios.post(BASE_URL + 'set_' + selectedVar + '_alert/', {
            expo_token: profile.expoUserToken,
            min: minValue,
            max: maxValue,
        }).then(response => {
            alert(response.data.message)
        })

        await this.getUserProfile()
    }

    changeMin = (value) => {
        this.setState(() => ({minValue: value}));
    }

    changeMax = (value) => {
        this.setState(() => ({maxValue: value}));
    }

    setAlertProfile = (pf) => {
        this.setState(() => ({profile: pf}))
        console.log("New status = " + pf.active)
    }

    async getUserProfile() {
        let token = await SecureStore.getItemAsync('user_token')
        await axios.post(BASE_URL + 'get_alert_profile/', {
            expo_token: token,
        }).then((response) => {
            this.setAlertProfile(response.data)
        }).catch(error => console.log(error))

    }


    render() {
        return (
            <View>
                <Button title="Threshold Alert Settings" onPress={() => this.handleModal()}/>
                <Modal
                    visible={this.state.modalVisible}
                    transparent={true}
                    onRequestClose={() => {
                        this.setState(() => ({modalVisible: false}));
                    }}
                >
                    <Button title="Close Threshold Settings" onPress={() => {this.handleModal()}}/>
                    <View style={styles.popupContainer}>
                        {this.renderModal()}
                    </View>
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    popupContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: '#80808080',
        alignItems: 'center',
    },
    modalView: {
        display: "flex",
        flexDirection: "column",
        gap: 5,
        margin: 20,
        minWidth: '70%',
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
        borderStyle: "solid",
        borderColor: '#000',
        borderWidth: 2,
    },
    buttonContainer: {
        display: "flex",
        flexDirection: "column",
        gap: 5,
    },
    rowView: {
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-evenly",
        gap: 5,
    },
    buttonVariable: {
        width: "50%",
    },
    inputVariable: {
        flex: 1,
        marginLeft: 10,
        borderStyle: "solid",
        borderColor: '#000',
        borderWidth: 1,
    }
});