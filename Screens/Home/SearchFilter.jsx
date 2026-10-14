import { Feather, Ionicons } from '@expo/vector-icons';
import userService from '../../Services/userService';
import { useAuth } from '../../Context/AuthContext';
import {
    StyleSheet,
    Text,
    View,
    SafeAreaView,
    ImageBackground,
    TouchableOpacity,
    ScrollView,
    FlatList,
    Dimensions,
    Modal,
    KeyboardAvoidingView,
    TextInput,
    ActivityIndicator,
    Image,
    TouchableWithoutFeedback
} from "react-native";
import React, { useState, useEffect } from "react";
import { AntDesign, FontAwesome5 } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entypo } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import Loader from '../../Component/Loader';
import intresetService from '../../Services/intresetService';
import InterestItem from '../../Component/InterestItem';
import Romanticcomponent from '../../Component/Romanticcomponent';
import Checkbox from 'expo-checkbox';
import CustomeDropDown from '../../Component/CustomeDropDown';

const dropdownItems = [
    "Within 15 mi (25 km)",
    "Within 30 mi (50 km)",
    "Within 50 mi (100 km)",
    "Within 120 mi (200 km)",
    "Within 200 mi (320 km)",
];
const communicateData = [
    { label: "Single", value: "single" },
    { label: "Marriage", value: "marriage" },
    { label: "Divorce", value: "divorce" },
    { label: "I'd rather not say", value: "prefer_not_to_say" },
];

const SearchFilter = () => {

    const { user } = useAuth();

    const [loading, setLoading] = useState(false);
    const navigation = useNavigation();
    const [isLoading, setIsLoading] = useState(false);
    const [intresets, setIntresets] = useState([]);
    const [selectedIntresets, setSelectedIntresets] = useState([]);
    const [user_info, setUser_info] = useState(null);
    const [numToShow, setNumToShow] = useState(20);
    const [error, setShowError] = useState(false);
    const [selectGender, setSelectGender] = useState("");
    const [subGender, setSubGender] = useState("");
    const [subOrientation, setSubOrientation] = useState("");
    const [openModelOne, setOpenModelOne] = useState(false);
    const [openModelTwo, setOpenModelTwo] = useState(false);
    const [selectedUsertypeInterests, setSelectedUsertypeInterests] = useState([]);
    const [selectedBusinessInterests, setSelectedBusinessInterests] = useState([]);
    const [ageFrom, setAgeFrom] = useState("");
    const [ageTo, setAgeTo] = useState("");
    const [isSelectingFrom, setIsSelectingFrom] = useState(true);
    const [showAgeModal, setShowAgeModal] = useState(false);
    const [currentField, setCurrentField] = useState("from");

    const [selectedRadius, setSelectedRadius] = useState(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [isDatingChecked, setDatingChecked] = useState(false);
    const [isBusinessChecked, setBusinessChecked] = useState(false);
    const [maritalStatus, setMaritalStatus] = useState("");

    const ageOptions = Array.from({ length: 83 }, (_, i) => (i + 18).toString());

    const screenWidth = Dimensions.get("window").width;
    const itemWidth = 100;
    const numColumns = Math.floor(screenWidth / itemWidth);

    const goBack = () => {
        navigation.goBack();
        handleClearAll()
    };

    useEffect(() => {
        getData();
    }, []);

    useEffect(() => {
        generalIntreset();
    }, []);

    const getData = async () => {
        try {
            const value = await AsyncStorage.getItem("user_info");

            console.log("value", value);

            if (value !== null) {
                const new_val = JSON.parse(value);
                setUser_info(new_val);
            }
        } catch (e) {
            console.log("e", e);
        }
    };

    const loadMoreItems = () => {
        setNumToShow(numToShow + 10);
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
    };

    const generalIntreset = () => {
        console.log("hi");

        intresetService
            .getIntresets()
            .then((res) => {
                const data = res.interests;

                console.log("data", data[data.leng]);

                setIntresets(data);
                setIsLoading(false);
            })
            .catch((err) => {
                console.log("Error: ", err);
            });
    };

    const handleOtherInterestSelect = (interest, type) => {
        if (type === "business") {
            if (selectedBusinessInterests.includes(interest)) {
                setSelectedBusinessInterests(
                    selectedBusinessInterests.filter((item) => item !== interest)
                );
            } else {
                setSelectedBusinessInterests([...selectedBusinessInterests, interest]);
            }
        }
        if (type === "user_type") {
            if (selectedUsertypeInterests.includes(interest)) {
                setSelectedUsertypeInterests(
                    selectedUsertypeInterests.filter((item) => item !== interest)
                );
            } else {
                setSelectedUsertypeInterests([...selectedUsertypeInterests, interest]);
            }
        }

    };

    const handleSelectIntrest = (name) => {
        const condition = selectedIntresets?.includes(name);
        if (condition) {
            setSelectedIntresets(selectedIntresets?.filter((item) => item !== name));
        } else {
            setSelectedIntresets([...selectedIntresets, name]);
        }
    };


    const searchUsers = async () => {
        setLoading(true);
        let updatedRadius;
        let updated_age_from;
        let updated_age_to;
        if (selectedRadius) {
            const match = selectedRadius.match(/\((\d+)\s*km\)/);
            updatedRadius = parseInt(match[1], 10);
        }
        if (ageFrom && ageTo) {
            updated_age_from = parseInt(ageFrom)
            updated_age_to = parseInt(ageTo)
        }
        if (!selectedIntresets.length && !selectGender && !selectedBusinessInterests.length && !selectedUsertypeInterests.length && !subGender && !ageFrom && !ageTo && !selectedRadius && !isDatingChecked && !isBusinessChecked && !maritalStatus) {
            Toast.show({
                type: "error",
                text1: "Please select atleast one filter",
                autoHide: true,
                visibilityTime: 2000,
            });
            setLoading(false);
            return;
        }
        try {
            console.log("ali: ",{ userId: user?.user?._id, interests: selectedIntresets, gender: selectGender, businessInterests: selectedBusinessInterests, user_type: selectedUsertypeInterests, looking_for: subGender, age_from: updated_age_from, age_to: updated_age_to, radius: updatedRadius, isDatingChecked, isBusinessChecked, maritalStatus })
            await userService.getFilteredUsers({ userId: user?.user?._id, interests: selectedIntresets, gender: selectGender, businessInterests: selectedBusinessInterests, user_type: selectedUsertypeInterests, looking_for: subGender, age_from: updated_age_from, age_to: updated_age_to, radius: updatedRadius, isDatingChecked, isBusinessChecked, maritalStatus }).then((response) => {
                if (response?.filteredUsers?.length < 1) {
                    Toast.show({
                        type: "error",
                        text1: "No users found with this match!!!",
                        autoHide: true,
                    })
                    setLoading(false);
                    return;
                }

                navigation.navigate("SearchResults", { filteredUsers: response?.filteredUsers })
                setLoading(false);
            }).catch((err) => {
                console.error("err", err);
                Toast.show({
                    type: "error",
                    text1: err,
                    autoHide: true,
                })
                setLoading(false);
            })
        } catch (error) {
            console.error("Error fetching search results: ", error);
            setLoading(false);
        }
    };

    const handleClearAll = async () => {
        setSelectedIntresets([]);
        setSelectGender("");
        setSubGender("");
        setAgeFrom("");
        setAgeTo("");
        setSelectedRadius("");
        setSelectedBusinessInterests([]);
        setSelectedUsertypeInterests([]);
        setDatingChecked(false);
        setBusinessChecked(false);
        setLoading(false);
        setMaritalStatus("");
    }

    return (
        <View style={{ flex: 1, backgroundColor: "#fff" }}>
            <ScrollView style={{ flex: 1 }}>

                <View style={styles.container}>
                    <TouchableOpacity onPress={goBack}>
                        <Image
                            style={{
                                width: 35,
                                height: 35,
                                resizeMode: "contain",
                            }}
                            source={require("../../assets/btnbtn.png")}
                        />
                    </TouchableOpacity>
                    <View style={styles.filterContainer}>
                        <Text style={styles.title}>Interests</Text>

                        <FlatList
                            data={intresets.slice(0, numToShow)}
                            renderItem={({ item }) => (
                                <InterestItem
                                    interestName={item.name}
                                    handleSelectIntrest={handleSelectIntrest}
                                    selectedIntresets={selectedIntresets}
                                />
                            )}
                            keyExtractor={(item, index) => index.toString()}
                            numColumns={numColumns}
                            style={{ marginTop: 10 }}
                        />
                        <Text style={styles.title}>I am a</Text>
                        <Romanticcomponent
                            name="gender"
                            select={selectGender}
                            onBlur={""}
                            selectSub={setSubGender}
                            selectSubO={setSubOrientation}
                            setSelect={setSelectGender}
                            openModel={openModelOne}
                            setOpenModel={setOpenModelOne}
                            showMore={false}
                        />

                        <Text style={styles.title}>Looking For a</Text>
                        <Romanticcomponent
                            name="gender"
                            select={subGender}
                            onBlur={""}
                            selectSub={setSubGender}
                            selectSubO={setSubOrientation}
                            setSelect={setSubGender}
                            openModel={openModelTwo}
                            setOpenModel={setOpenModelTwo}
                            showMore={false}
                        />

                        <View
                            style={{
                                width: "100%",
                                position: "absolute",
                                justifyContent: "flex-end",
                                alignItems: "center",
                                gap: 15,
                                backgroundColor: "#fff",
                            }}
                        >
                            {intresets.length > numToShow && (
                                <TouchableOpacity
                                    onPress={loadMoreItems}
                                    style={{
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "#2F292429",
                                        width: "90%",
                                        height: 45,
                                        borderRadius: 8,
                                    }}
                                >
                                    <View style={{ flexDirection: "row", alignItems: "center" }}>
                                        <FontAwesome5 name="chevron-down" size={18} color="#2F2924" />
                                        <Text
                                            allowFontScaling={false}
                                            style={{
                                                fontSize: 15,
                                                fontWeight: "900",
                                                fontFamily: "Roboto-Regular",
                                                color: "#2F2924",
                                                paddingLeft: 10,
                                            }}
                                        >
                                            Show more interests
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>

                        <Text style={styles.title}>Business Interests</Text>
                        <View
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                justifyContent: "space-between",
                                marginTop: 10
                            }}
                        >
                            {[
                                "Networking",
                                "Mentorship",
                                "Collaboration",

                            ].map((interest) => (
                                <TouchableWithoutFeedback
                                    key={interest}
                                    onPress={() => handleOtherInterestSelect(interest, "business")}
                                >
                                    <View style={{ width: "32%", marginBottom: 20 }}>
                                        <LinearGradient
                                            colors={
                                                selectedBusinessInterests.includes(interest)
                                                    ? ["#338AFF", "#00EDB4"]
                                                    : ["#fff", "#fff"]
                                            }
                                            style={[
                                                styles.questionbox,
                                                selectedBusinessInterests.includes(interest)
                                                    ? { borderRadius: 10, borderColor: "#fff" }
                                                    : null,
                                            ]}
                                        >
                                            <Text
                                                allowFontScaling={false}
                                                style={{
                                                    color: selectedBusinessInterests.includes(interest)
                                                        ? "#fff"
                                                        : "#000000",
                                                    fontFamily: "Inter-Regular",
                                                    fontWeight: "400",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {interest}
                                            </Text>
                                        </LinearGradient>
                                        {selectedBusinessInterests.includes(interest) && (
                                            <View style={styles.checkcontainer}>
                                                <Feather name="check" size={15} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                </TouchableWithoutFeedback>
                            ))}
                        </View>

                        <Text style={styles.title}>User Types</Text>
                        <View
                            style={{
                                flexDirection: "row",
                                flexWrap: "wrap",
                                justifyContent: "flex-start",
                                marginTop: 10,
                                gap: 6
                            }}
                        >
                            {[
                                "Individual",
                                "Business",
                                "Organization",
                                "Group",
                                "Influencer"
                            ].map((interest) => (
                                <TouchableWithoutFeedback
                                    key={interest}
                                    onPress={() => handleOtherInterestSelect(interest, "user_type")}
                                >
                                    <View style={{ width: "32%", marginBottom: 20 }}>
                                        <LinearGradient
                                            colors={
                                                selectedUsertypeInterests.includes(interest)
                                                    ? ["#338AFF", "#00EDB4"]
                                                    : ["#fff", "#fff"]
                                            }
                                            style={[
                                                styles.questionbox,
                                                selectedUsertypeInterests.includes(interest)
                                                    ? { borderRadius: 10, borderColor: "#fff" }
                                                    : null,
                                            ]}
                                        >
                                            <Text
                                                allowFontScaling={false}
                                                style={{
                                                    color: selectedUsertypeInterests.includes(interest)
                                                        ? "#fff"
                                                        : "#000000",
                                                    fontFamily: "Inter-Regular",
                                                    fontWeight: "400",
                                                    fontSize: 12,
                                                }}
                                            >
                                                {interest}
                                            </Text>
                                        </LinearGradient>
                                        {selectedUsertypeInterests.includes(interest) && (
                                            <View style={styles.checkcontainer}>
                                                <Feather name="check" size={15} color="#fff" />
                                            </View>
                                        )}
                                    </View>
                                </TouchableWithoutFeedback>
                            ))}
                        </View>

                        <Text style={styles.title}>Age Range</Text>
                        <View style={styles.ageRangeContainer}>
                            <Text allowFontScaling={false} style={styles.ageButtonText}>
                                From
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsSelectingFrom(true);
                                    setShowAgeModal(true);
                                    setCurrentField("from")
                                }}
                                style={styles.ageButton}
                            >

                                <Text
                                    allowFontScaling={false}
                                    style={styles.ageButtonText}
                                >
                                    {ageFrom || "Select Age"}
                                </Text>
                            </TouchableOpacity>
                            <Text allowFontScaling={false} style={styles.ageButtonText}>
                                To
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setIsSelectingFrom(false);
                                    setShowAgeModal(true)
                                    setCurrentField("to")
                                }}
                                style={styles.ageButton}
                            >
                                <Text
                                    allowFontScaling={false}
                                    style={styles.ageButtonText}
                                >
                                    {ageTo || "Select Age"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <Modal visible={showAgeModal} transparent={true}>
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.modalTitle}>Select Age</Text>
                                    <ScrollView style={styles.scrollView}>
                                        {ageOptions.map((age) => (
                                            <TouchableOpacity
                                                key={age}
                                                onPress={async () => {
                                                    if (currentField === "from") {
                                                        setAgeFrom(age === ageFrom ? "" : age);
                                                    } else {
                                                        setAgeTo(age === ageTo ? "" : age);
                                                    }
                                                    setShowAgeModal(false);
                                                }}
                                                style={styles.ageOption}
                                            >
                                                <Text style={styles.ageOptionText}>{age}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                    <TouchableOpacity
                                        onPress={() => setShowAgeModal(false)}
                                        style={styles.closeButton}
                                    >
                                        <Text style={styles.closeButtonText}>Close</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Modal>

                        <Text style={styles.title}>Radius</Text>
                        <TouchableOpacity
                            style={styles.selectContainer}
                            onPress={toggleDropdown}
                        >
                            <Text allowFontScaling={false} style={styles.selectText}>
                                {selectedRadius || "Please Select"}
                            </Text>
                            <View style={styles.dropdownIcon}>
                                <AntDesign name="caretdown" size={18} color="#fff" />
                            </View>
                        </TouchableOpacity>
                        {showDropdown && (
                            <ScrollView style={styles.dropdownContainer}>
                                {dropdownItems.map((item) => (
                                    <TouchableOpacity
                                        key={item._id}
                                        style={styles.dropdownItem}
                                        onPress={() => {
                                            setSelectedRadius(item);
                                            setShowDropdown(false);
                                        }}
                                    >
                                        <Text allowFontScaling={false} style={styles.dropdownText}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        <View style={{
                            flexDirection: 'row',
                            marginTop: 20,
                            width: "auto"
                        }}>

                            <Checkbox
                                value={isDatingChecked}
                                onValueChange={setDatingChecked}
                                color={isDatingChecked ? 'blue' : undefined}
                            />
                            <Text style={{
                                fontSize: 15,
                                fontWeight: 'bold',
                                marginLeft: 10,
                            }}>Interested in Dating</Text>


                        </View>

                        <View style={{
                            flexDirection: 'row',
                            marginTop: 10,
                            width: "auto"
                        }}>
                            <Checkbox
                                value={isBusinessChecked}
                                onValueChange={setBusinessChecked}
                                color={isBusinessChecked ? 'blue' : undefined}
                            />
                            <Text style={{
                                fontSize: 15,
                                fontWeight: 'bold',
                                marginLeft: 10,
                            }}>Interested in Business</Text>
                        </View>

                        <Text style={styles.title}>Marital Status</Text>
                        <View style={{
                            marginTop: 10
                        }}>
                            <CustomeDropDown
                                value={maritalStatus}
                                onBlur={() => console.log("onBlur")}
                                onChange={(selectedValue) => setMaritalStatus(selectedValue)}
                                setValue={setMaritalStatus}
                                data={communicateData}
                            />
                        </View>

                    </View>
                </View>
            </ScrollView>
            <View
                style={{
                    width: "100%",
                    flexDirection: "row",
                    justifyContent: 'center'
                }}>


                <LinearGradient
                    colors={["#338AFF", "#00EDB4"]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1.2, y: 0.6 }}
                >
                    <TouchableOpacity
                        onPress={searchUsers}
                        disabled={loading}
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {loading ? (
                            <Loader />
                        ) : (
                            <Text
                                allowFontScaling={false}
                                style={{
                                    fontSize: 18,
                                    fontWeight: "bold",
                                    fontFamily: "Inter-Regular",
                                    color: "#fff",
                                }}
                            >
                                Save
                            </Text>
                        )}
                    </TouchableOpacity>
                </LinearGradient>
                <LinearGradient
                    colors={["gray", "white"]}
                    style={styles.button}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1.2, y: 0.6 }}
                >
                    <TouchableOpacity
                        onPress={handleClearAll}
                        style={{
                            flex: 1,
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >

                        <Text
                            allowFontScaling={false}
                            style={{
                                fontSize: 18,
                                fontWeight: "bold",
                                fontFamily: "Inter-Regular",
                                color: "#fff",
                            }}
                        >
                            Clear All
                        </Text>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </View >
    )
}
export default SearchFilter;

const styles = StyleSheet.create({
    container: {
        paddingTop: 50,
        padding: 20,
        flex: 1,
    },
    searchResultsContainer: {

    },
    searchContainer: {
        flexDirection: "row",
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 10,
        marginBottom: 10,
        paddingLeft: 10
    },
    searchIcon: {
        position: "relative",
        left: -35,
        top: 5,
    },
    title: {
        marginTop: 20,
        paddingTop: 10,
        fontSize: 18,
        fontWeight: "bold",
    },
    filterContainer: {
        flexDirection: "column",
    },
    interesttext: {
        color: "#000000",
        fontWeight: "300",
        fontSize: 24,
        fontFamily: "Inter-Regular",
        alignSelf: "center",
    },
    button: {
        margin: 10,
        marginTop: 10,
        height: 50,
        borderRadius: 10,
        width: "43%",
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    inputField: {
        width: "95%",
        height: 53,
        borderRadius: 5,
        backgroundColor: "#F6F6F6",
        marginBottom: 15,
        alignSelf: "center",
    },
    modalContent: {
        backgroundColor: "white",
        padding: 15,
        borderRadius: 10,
        elevation: 5,
        width: "85%",
        height: 230,
    },
    profileImage: {
        width: 45,
        height: 45,
        resizeMode: "contain",
        borderRadius: 25,
        marginRight: 10,
    },
    questionbox: {
        padding: 10,
        borderWidth: 1,
        borderColor: "#000000",
        backgroundColor: "#fff",
        alignItems: "center",
        borderRadius: 10,
    },
    checkcontainer: {
        position: "absolute",
        top: -8,
        right: -5,
        backgroundColor: "#338AFE",
        height: 20,
        width: 20,
        borderRadius: 15,
        alignItems: "center",
        justifyContent: "center",
    },
    nameText: {
        fontSize: 14,
        fontWeight: "bold",
        marginTop: 10
    },
    ageRangeContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 10
    },

    ageOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
        width: "100%",
    },
    ageOptionText: {
        fontSize: 16,

        textAlign: "center",
    },
    ageButtonText: {
        color: "#A7A7A8",
        fontSize: 16,
        alignSelf: "center",
    },
    ageButton: {
        width: "40%",
        height: 45,
        borderRadius: 5,
        backgroundColor: "#F6F6F6",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalContent: {
        width: "40%",
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 20,
        alignItems: "center",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 10,
    },
    scrollView: {
        maxHeight: 300,
        width: "100%",
    },
    closeButton: {
        marginTop: 20,
        backgroundColor: "#338AFF",
        paddingHorizontal: 25,
        padding: 4,
        borderRadius: 5,
    },
    closeButtonText: {
        color: "#fff",
        fontSize: 16,
    },
    selectContainer: {
        height: 45,
        borderRadius: 5,
        backgroundColor: "#EDF5F4",
        fontSize: 14,
        fontFamily: "Roboto-Regular",
        fontWeight: "600",
        color: "#7C7C7C",
        position: "relative",
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 25,
        marginBottom: 10,
        marginTop: 10
    },
    selectText: {
        flex: 1,
        fontSize: 16,
    },
    dropdownIcon: {
        position: "absolute",
        top: 0,
        right: 0,
        width: 40,
        height: "100%",
        backgroundColor: "#1895F0",
        zIndex: 1,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    dropdownContainer: {
        marginTop: 5,
        marginBottom: 10,
    },
    dropdownItem: {
        paddingVertical: 10,
        borderColor: "#ccc",
        borderWidth: 1,
        marginBottom: 1,
        marginHorizontal: 20,
        borderRadius: 5,
    },
    dropdownText: {
        fontSize: 16,
        paddingLeft: 25,
    },
})