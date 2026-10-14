import React, { Fragment, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { AntDesign, Feather } from "@expo/vector-icons";
import intresetService from "../Services/intresetService";

const Checkbox = ({ text, checkBoxSelected, setCheckBoxSelected }) => {
  const [isChecked, setIsChecked] = useState(false);

  const toggleCheckbox = (text) => {
    setCheckBoxSelected(checkBoxSelected);
  };

  return (
    <TouchableOpacity
      style={styles.checkboxContainer}
      onPress={() => setCheckBoxSelected(text)}
    >
      <View
        style={[styles.checkbox, checkBoxSelected === text && styles.checked]}
      />
      <Text allowFontScaling={false} style={styles.label}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const NonBinaryModelData = (props) => {
  const { orientation, setOrientation, storeSub, setOpenModel } = props;
  const [checkBoxSelected, setCheckBoxSelected] = useState("");

  useEffect(() => {
    setOrientation(checkBoxSelected);
  }, [checkBoxSelected]);

  let name = "non-binary";
  const [data, setData] = useState([]);

  const saveRecords = () => {
    storeSub(checkBoxSelected);
    setOpenModel(false);
  };

  const getData = () => {
    intresetService
      .GetSubGender(name)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <View
        style={{
          // flex: 1,
          justifyContent: "center",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/GenderNB.png")}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />

        <View style={{ width: "100%", height: "55%" }}>
          <View
            style={{
              // flex: 1,
              marginTop: 20,

              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "red",
              width: "100%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data.slice(0, Math.ceil(data.length / 2)).map((el, idx) => (
                    <Fragment key={idx}>
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    </Fragment>
                  ))}
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data
                    .slice(Math.ceil(data.length / 2))
                    .map((el) => (
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    ))}
              </View>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#338AFF", "#00EDB4"]}
          style={{
            width: "100%",
            height: 45,
            borderRadius: 10,
            alignSelf: "center",
            marginTop: 25,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0.6 }}
        >
          <TouchableOpacity
            onPress={saveRecords}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text allowFontScaling={false} style={styles.moretext}>
              Save
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </>
  );
};

const ManModelData = (props) => {
  const { orientation, setOrientation, storeSub, setOpenModel } = props;

  const [checkBoxSelected, setCheckBoxSelected] = useState("");

  useEffect(() => {
    setOrientation(checkBoxSelected);
  }, [checkBoxSelected]);

  let name = "male";
  const [data, setData] = useState([]);

  const getData = () => {
    intresetService
      .GetSubGender(name)
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.log(err));
  };

  const saveRecords = () => {
    storeSub(checkBoxSelected);
    setOpenModel(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <View
        style={{
          // flex: 1,
          justifyContent: "center",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/GenderMan.png")}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />

        <View style={{ width: "100%", height: "55%" }}>
          <View
            style={{
              // flex: 1,
              marginTop: 20,

              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "red",
              width: "100%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data
                    .slice(0, Math.ceil(data.length / 2))
                    .map((el) => (
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    ))}
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data
                    .slice(Math.ceil(data.length / 2))
                    .map((el) => (
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    ))}
              </View>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#338AFF", "#00EDB4"]}
          style={{
            width: "100%",
            height: 45,
            borderRadius: 10,
            alignSelf: "center",
            marginTop: 25,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0.6 }}
        >
          <TouchableOpacity
            onPress={saveRecords}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text allowFontScaling={false} style={styles.moretext}>
              Save
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </>
  );
};

const WomanBinaryModelData = (props) => {
  const { orientation, setOrientation, storeSub, setOpenModel } = props;
  const [checkBoxSelected, setCheckBoxSelected] = useState("");

  useEffect(() => {
    setOrientation(checkBoxSelected);
  }, [checkBoxSelected]);

  let name = "female";
  const [data, setData] = useState([]);
  const getData = () => {
    intresetService
      .GetSubGender(name)
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.log(err));
  };

  const saveRecords = () => {
    storeSub(checkBoxSelected);
    setOpenModel(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <View
        style={{
          // flex: 1,
          justifyContent: "center",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/GenderWomen.png")}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />

        <View style={{ width: "100%", height: "55%" }}>
          <View
            style={{
              // flex: 1,
              marginTop: 20,

              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "red",
              width: "100%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data
                    .slice(0, Math.ceil(data.length / 2))
                    .map((el) => (
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    ))}
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data
                    .slice(Math.ceil(data.length / 2))
                    .map((el) => (
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    ))}
              </View>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#338AFF", "#00EDB4"]}
          style={{
            width: "100%",
            height: 45,
            borderRadius: 10,
            alignSelf: "center",
            marginTop: 25,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0.6 }}
        >
          <TouchableOpacity
            onPress={saveRecords}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text allowFontScaling={false} style={styles.moretext}>
              Save
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </>
  );
};

//for the orentation

const NonBinaryModelDataO = (props) => {
  const { orientation, setOrientation, storeSub, setOpenModel } = props;
  const [checkBoxSelected, setCheckBoxSelected] = useState("");

  useEffect(() => {
    setOrientation(checkBoxSelected);
  }, [checkBoxSelected]);

  let name = "non-binary";
  const [data, setData] = useState([]);

  const saveRecords = () => {
    storeSub(checkBoxSelected);
    setOpenModel(false);
  };

  const getData = () => {
    intresetService
      .GetSubGender(name)
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <View
        style={{
          // flex: 1,
          justifyContent: "center",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/GenderNB.png")}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />

        <View style={{ width: "100%", height: "55%" }}>
          <View
            style={{
              // flex: 1,
              marginTop: 20,

              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "red",
              width: "100%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data
                    .slice(0, Math.ceil(data.length / 2))
                    .map((el) => (
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    ))}
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data
                    .slice(Math.ceil(data.length / 2))
                    .map((el) => (
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    ))}
              </View>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#338AFF", "#00EDB4"]}
          style={{
            width: "100%",
            height: 45,
            borderRadius: 10,
            alignSelf: "center",
            marginTop: 25,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0.6 }}
        >
          <TouchableOpacity
            onPress={saveRecords}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text allowFontScaling={false} style={styles.moretext}>
              Save
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </>
  );
};

const ManModelDataO = (props) => {
  const { orientation, setOrientation, storeSub, setOpenModel } = props;

  const [checkBoxSelected, setCheckBoxSelected] = useState("");

  useEffect(() => {
    setOrientation(checkBoxSelected);
  }, [checkBoxSelected]);


  let name = "male";
  const [data, setData] = useState([]);

  const getData = () => {
    intresetService
      .GetSubGender(name)
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.log(err));
  };

  const saveRecords = () => {
    storeSub(checkBoxSelected);
    setOpenModel(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <View
        style={{
          // flex: 1,
          justifyContent: "center",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/GenderMan.png")}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />

        <View style={{ width: "100%", height: "55%" }}>
          <View
            style={{
              // flex: 1,
              marginTop: 20,

              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "red",
              width: "100%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data
                    .slice(0, Math.ceil(data.length / 2))
                    .map((el) => (
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    ))}
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data
                    .slice(Math.ceil(data.length / 2))
                    .map((el) => (
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    ))}
              </View>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#338AFF", "#00EDB4"]}
          style={{
            width: "100%",
            height: 45,
            borderRadius: 10,
            alignSelf: "center",
            marginTop: 25,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0.6 }}
        >
          <TouchableOpacity
            onPress={saveRecords}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text allowFontScaling={false} style={styles.moretext}>
              Save
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </>
  );
};

const WomanBinaryModelDataO = (props) => {
  const { orientation, setOrientation, storeSub, setOpenModel } = props;
  const [checkBoxSelected, setCheckBoxSelected] = useState("");

  useEffect(() => {
    setOrientation(checkBoxSelected);
  }, [checkBoxSelected]);

  let name = "female";
  const [data, setData] = useState([]);
  const getData = () => {
    intresetService
      .GetSubGender(name)
      .then((res) => {
        setData(res);
      })
      .catch((err) => console.log(err));
  };

  const saveRecords = () => {
    storeSub(checkBoxSelected);
    setOpenModel(false);
  };

  useEffect(() => {
    getData();
  }, []);

  return (
    <>
      <View
        style={{
          // flex: 1,
          justifyContent: "center",
          width: "100%",
          alignItems: "center",
        }}
      >
        <Image
          source={require("../assets/GenderWomen.png")}
          style={{ width: 120, height: 120 }}
          resizeMode="contain"
        />

        <View style={{ width: "100%", height: "55%" }}>
          <View
            style={{
              // flex: 1,
              marginTop: 20,

              justifyContent: "center",
              alignItems: "center",
              // backgroundColor: "red",
              width: "100%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
              }}
            >
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data
                    .slice(0, Math.ceil(data.length / 2))
                    .map((el) => (
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    ))}
              </View>
              <View
                style={{
                  flex: 1,
                  justifyContent: "flex-start",
                  alignItems: "flex-start",
                }}
              >
                {data &&
                  data
                    .slice(Math.ceil(data.length / 2))
                    .map((el) => (
                      <Checkbox
                        text={el.name}
                        checkBoxSelected={checkBoxSelected}
                        setCheckBoxSelected={setCheckBoxSelected}
                      />
                    ))}
              </View>
            </View>
          </View>
        </View>

        <LinearGradient
          colors={["#338AFF", "#00EDB4"]}
          style={{
            width: "100%",
            height: 45,
            borderRadius: 10,
            alignSelf: "center",
            marginTop: 25,
          }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1.2, y: 0.6 }}
        >
          <TouchableOpacity
            onPress={saveRecords}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text allowFontScaling={false} style={styles.moretext}>
              Save
            </Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>
    </>
  );
};

const Romanticcomponent = ({
  name,
  selectSubO,
  select,
  setSelect,
  openModel,
  setOpenModel,
  selectSub,
  onChange,
  onBlur
}) => {
  const [orientation, setOrientation] = useState(null);



  const handleOptionSelect = (option) => {
    if (onChange) {
      onChange(option)
    }
    setSelect(option);
  };

  useEffect(() => {
    if (orientation) {
      setSelect(orientation);
    }
  }, []);


  return (
    <>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          paddingTop: 25,
        }}
      >
        <TouchableOpacity
          style={[styles.mainbox, select === "woman" && styles.selectedMainbox]}
          onPress={() => handleOptionSelect("woman")}
          onBlur={onBlur}
        >
          {select === "woman" && (
            <AntDesign
              name="checkcircle"
              size={16}
              color="#2E93F7"
              style={styles.checkIcon}
            />
          )}
          <View
            style={[
              styles.innerbox,
              select === "woman" && styles.selectedInnerbox,
            ]}
          >
            {select === "woman" ? (
              <LinearGradient
                colors={["#338AFF", "#00EDB4"]}
                style={styles.innerboxGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 0.6 }}
              >
                <Image
                  style={{ resizeMode: "cover", width: 36, height: 36 }}
                  source={require("../assets/woman.png")}
                />
              </LinearGradient>
            ) : (
              <Image
                style={{ resizeMode: "cover", width: 36, height: 36 }}
                source={require("../assets/woman.png")}
              />
            )}
          </View>
          <Text
            allowFontScaling={false}
            style={[
              styles.innertext,
              select === "woman" && styles.selectedInnertext,
            ]}
          >
            Woman
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.mainbox, select === "man" && styles.selectedMainbox]}
          onPress={() => handleOptionSelect("man")}
          onBlur={onBlur}
        >
          {select === "man" && (
            <AntDesign
              name="checkcircle"
              size={16}
              color="#2E93F7"
              style={styles.checkIcon}
            />
          )}
          <View
            style={[
              styles.innerbox,
              select === "man" && styles.selectedInnerbox,
            ]}
          >
            {select === "man" ? (
              <LinearGradient
                colors={["#338AFF", "#00EDB4"]}
                style={styles.innerboxGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 0.6 }}
              >
                <Image
                  style={{ resizeMode: "cover", width: 36, height: 36 }}
                  source={require("../assets/man.png")}
                />
              </LinearGradient>
            ) : (
              <Image
                style={{ resizeMode: "cover", width: 36, height: 36 }}
                source={require("../assets/man.png")}
              />
            )}
          </View>
          <Text
            allowFontScaling={false}
            style={[
              styles.innertext,
              select === "man" && styles.selectedInnertext,
            ]}
          >
            Man
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.mainbox,
            select === "non-binary" && styles.selectedMainbox,
          ]}
          onPress={() => handleOptionSelect("non-binary")}
          onBlur={onBlur}
        >
          {select === "non-binary" && (
            <AntDesign
              name="checkcircle"
              size={16}
              color="#2E93F7"
              style={styles.checkIcon}
            />
          )}
          <View
            style={[
              styles.innerbox,
              select === "non-binary" && styles.selectedInnerbox,
            ]}
          >
            {select === "non-binary" ? (
              <LinearGradient
                colors={["#338AFF", "#00EDB4"]}
                style={styles.innerboxGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1.2, y: 0.6 }}
              >
                <Image
                  source={require("../assets/binarry non.png")}
                  style={{ resizeMode: "cover", width: 36, height: 36 }}
                />
              </LinearGradient>
            ) : (
              <Image
                style={{ resizeMode: "cover", width: 36, height: 36 }}
                source={require("../assets/binarry non.png")}
              />
            )}
          </View>
          <Text
            allowFontScaling={false}
            style={[
              styles.innertext,
              select === "non-binary" && styles.selectedInnertext,
            ]}
          >
            Non Binary
          </Text>
        </TouchableOpacity>
      </View>

      {/* {showMore && ( */}


      <LinearGradient
        colors={["#338AFF", "#00EDB4"]}
        style={styles.morebutton}
        start={{ x: 0, y: 0 }}
        end={{ x: 1.2, y: 0.6 }}
      >
        <TouchableOpacity
          onPress={() => setOpenModel(true)}
          disabled={select === "" ? true : false}
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text allowFontScaling={false} style={styles.moretext}>
            More
          </Text>
        </TouchableOpacity>
      </LinearGradient>
      {/* )} */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={openModel}
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View
              style={{
                justifyContent: "flex-end",
                alignItems: "flex-end",
              }}
            >
              <TouchableOpacity onPress={() => setOpenModel(false)}>
                <Feather name="x" size={24} color="black" />
              </TouchableOpacity>
            </View>

            {name === "gender" && (
              <View>
                {select === "woman" && (
                  <WomanBinaryModelData
                    orientation={orientation}
                    setOrientation={setOrientation}
                    storeSub={selectSub}
                    setOpenModel={setOpenModel}
                  />
                )}
                {select === "man" && (
                  <ManModelData
                    orientation={orientation}
                    setOrientation={setOrientation}
                    storeSub={selectSub}
                    setOpenModel={setOpenModel}
                  />
                )}
                {select === "non-binary" && (
                  <NonBinaryModelData
                    orientation={orientation}
                    setOrientation={setOrientation}
                    storeSub={selectSub}
                    setOpenModel={setOpenModel}
                  />
                )}
              </View>
            )}

            {name === "orientation" && (
              <View>
                {select === "woman" && (
                  <WomanBinaryModelData
                    orientation={orientation}
                    setOrientation={setOrientation}
                    storeSub={selectSubO}
                    setOpenModel={setOpenModel}
                  />
                )}
                {select === "man" && (
                  <ManModelDataO
                    orientation={orientation}
                    setOrientation={setOrientation}
                    storeSub={selectSubO}
                    setOpenModel={setOpenModel}
                  />
                )}
                {select === "non-binary" && (
                  <NonBinaryModelDataO
                    orientation={orientation}
                    setOrientation={setOrientation}
                    storeSub={selectSubO}
                    setOpenModel={setOpenModel}
                  />
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
};

export default Romanticcomponent;

const styles = StyleSheet.create({
  morebutton: {
    width: "45%",
    height: 43,
    borderRadius: 10,
    alignSelf: "center",
    marginTop: 25,
  },
  mainbox: {
    width: "29%",
    height: 130,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#EAEAEA",
    paddingTop: 25,
    borderWidth: 1,
    borderColor: "transparent",
  },
  selectedMainbox: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#2E93F7",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  innerbox: {
    width: 45,
    height: 45,
    borderRadius: 30,
    backgroundColor: "#343434",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedInnerbox: {
    width: 45,
    height: 45,
    borderRadius: 30,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  innerboxGradient: {
    width: 45,
    height: 45,
    borderRadius: 30,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  innertext: {
    color: "#343434",
    fontSize: 16,
    justifyContent: "center",
    alignSelf: "center",
    fontFamily: "Roboto-Regular",
    fontWeight: "800",
    paddingTop: 18,
  },
  selectedInnertext: {
    color: "#2E93F7",
  },
  checkIcon: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  moretext: {
    fontSize: 18,
    fontWeight: "bold",
    fontFamily: "Inter-Regular",
    color: "#fff",
  },

  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 0,
    elevation: 5,
    width: "90%",
    height: 500,
    borderRadius: 6,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "black",
    borderRadius: 100,
    marginRight: 10,
  },
  checked: {
    backgroundColor: "#338AFF",
  },
  label: {
    fontSize: 18,
  },
});
