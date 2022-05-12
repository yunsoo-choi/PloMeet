import React, { useEffect, useRef, useState, Component, Node } from 'react';
import 'react-native-gesture-handler';
import { StyleSheet, Text, View, TextInput, Button, Image, Alert, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, TouchableOpacity  } from "react-native";
import { useNavigation } from '@react-navigation/native';
import Geolocation from 'react-native-geolocation-service';
import NaverMapView, { Align, Circle, Marker, Path, Polygon, Polyline } from "../plogging/map";
import axios from 'axios';


const openMeeting2 = () => {
  const navigation = useNavigation();
  const [address, setAdress] = useState(''); //상세주소 검색

  const [location, setLocation] = useState({ latitude: 37.564362, longitude: 126.977011 });
  const [center, setCenter] = useState();

  const [titleValid, setTitleValid] = useState(false);
  const [nextDisable, setNextDisable] = useState(true);
  const titleChangeHandler = (text) => {
    if (text.trim().length === 0) {
      setTitleValid(false);
      setNextDisable(true);
    } else {
      setTitleValid(true);
      setNextDisable(false);
    }
  };

  // async function searchAddress(address) {
  //   console.log(address)
  //   try {
  //     const response = await new timeoutPromise( 
  //     fetch(`https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${address}`,
  //       {
  //         headers: {
  //           "Accept" : "application/json",
  //           "Content-Type" : "application/json",
  //           "X-NCP-APIGW-API-KEY-ID" : "ndh21004t3",
  //           "X-NCP-APIGW-API-KEY" : "9n2oMIaYszDviPmDNRZRPiCGcPIcbFqbiDsMarpY"
  //         },
  //         method : "GET"
  //       })
  //     );
  //     console.log(response)
  //     if (!response.ok) {
  //       throw new Error("실패");
  //     }
  //     const resData = await response.json();
  //     console.log(resData)
  //   } catch (err) {
  //     throw err;
  //   }
  //   return;
  // };

  async function searchAddress(address) {
    console.log(address)
    const response = await axios.get(
      'https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=' + address,
      {
        headers: {
          "X-NCP-APIGW-API-KEY-ID" : "ndh21004t3",
          "X-NCP-APIGW-API-KEY" : "9n2oMIaYszDviPmDNRZRPiCGcPIcbFqbiDsMarpY"
        },
      },
    ).then(res => {
      return res.data;
    })
    .then(data => {
      if(data.address.length > 1 ) {
        console.log("주소가 여러개");
      } else if (data.address.length === 0) {
        console.log("좌표가 없음");
      }
      return [data.addresses[0].x, data.addresses[0].y];
    });
    return response;
  };
  
  const locationHandler = (e) => { 
    // setCurrentLocation(e.latitude, e.longitude); 
    Alert.alert( 
      "", 
      "이곳으로 모임 장소를 변경할까요?", 
      [ 
        { text: '아니오'}, 
        { text: '네', onPress: () => { 
          setLocation(e);

          console.warn('onMapClick', JSON.stringify(e)); 
        }} 
      ], 
      { cancelable: false } 
    ); 
  };


  //화면에 렌더링되면 권한부터 살피자
  useEffect(() => {
    if (Platform.OS === 'ios') {
        Geolocation.requestAuthorization('whenInUse');
        getRealTimeLoc();
    }
    if (Platform.OS === 'android')
        if (requestLocationPermission())//권한 활용에 동의한 상태라면 처음 위치를 가져와서 지도 중심으로 잡는다. ios도 동일하게 해줘야한다
            getRealTimeLoc();           // 이거 안하면 사용자 입장에서 시작시 좌표 중심이 바로 바뀐다.
  }, []);

  //렌더링 시 실행해서 현재 위치 및 주요 state들 셋팅
  const getRealTimeLoc = () => {
    Geolocation.getCurrentPosition(
        (position) => {
            console.log(position);
            const { latitude, longitude } = position.coords;
            setLocation({
                ...location,
                latitude,
                longitude,
            });
            setCenter({
                ...center,
                latitude,
                longitude,
            });
        },
        (error) => {
            // See error code charts below.
            console.log(error.code, error.message);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    );
  };

  // const location = {latitude: lat, longitude: lng};
  const temp_location = {latitude: 37.565051, longitude: 126.978567};

    return (
      <View style={styles.container}>
        <Text style={styles.title}>장소명(명칭)</Text>
        <TextInput
          // value={this.state.myTextInput}
          style={styles.input}
          placeholder="모임 장소를 한줄로 설명해주세요."
          keyboardType='default'
          autoFocus
          maxLength={20}
          autoCapitalize='none'
          returnKeyType='next'
          onChangeText={(text) => titleChangeHandler(text)}
          // onChangeText={this.onChangeInput}
        />
        <Text style={[styles.title, {marginTop:40}]}>상세주소(도로명)</Text>

        <View style={styles.row}>
          <TextInput
            style={styles.input}
            placeholder="모임 장소의 상세 주소를 입력해주세요."
            keyboardType='default'
            maxLength={500}
            multiline={true}
            onChangeText={newAddress => setAdress(newAddress)}
            autoCapitalize='none'
          />
          <TouchableOpacity activeOpacity={0.8} style={styles.searchButton} onPress={() => searchAddress(address)}>
            <Text style={styles.text}>검색</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.imageBackground}>
        <NaverMapView
                  style={{width: '100%', height: '100%'}} 
                  showsMyLocationButton={true}
                  onMapClick={e => locationHandler(e)}
                  center={{ ...location, zoom: 16 }}>
                  <Marker coordinate={location} pinColor="green"/>
              </NaverMapView>
        </View>
        <Text style={[{marginLeft:30}, {marginRight:30}]}>현재 지오코더랑 리버스 지오코더가 권한문제로 동작을 안 해서 주소 연동이 안 되며, 실제 모임 위치는 좌표가 찍힌 곳으로 저장됩니다.</Text>
        

        <View style={{flex:1}}/>
        <TouchableOpacity activeOpacity={0.8} disabled={nextDisable} style={nextDisable? styles.disButton :styles.button} onPress={() => navigation.navigate('OpenMeeting3')}>
          <Text style={styles.text}>다음</Text>
        </TouchableOpacity>
      </View>
    );
};

async function requestLocationPermission() { // 승인 안했을때나 에러 났을때의 처리는 나중에..
  try {
      const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
              title: '위치 권한',
              message: '플로깅 중 위치정보 활용에 동의합니다.',
              buttonNeutral: '나중에',
              buttonNegative: '거부',
              buttonPositive: '승인',
          },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('You can use the location');
          return true;
      } else {
          console.log('Location permission denied');
          return false;
      }
  } catch (err) {
      console.warn(err);
      return false;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  inner: {
    flex: 1,
    justifyContent: "space-around"
  },
  input: {
    marginHorizontal: 30,
    fontSize: 15,
    borderBottomWidth: 1
  },
  title: {
    marginTop: 30,
    color: '#313333',
    marginLeft: 30,
    fontWeight: 'bold',
  },
  inputBox: {
    marginTop: 20,
    marginHorizontal: 30,
    fontSize: 15,
    borderWidth: 1,
    borderRadius: 10,
    textAlignVertical:'top',
    padding: 10,
    height: 150
  },
  button: {
    height: 55,
    backgroundColor: "#1BE58D",
    justifyContent: "center",
    alignItems: "center"
  },
  disButton: {
    height: 55,
    backgroundColor: "#aaaaaa",
    justifyContent: "center",
    alignItems: "center"
  },
  searchButton: {
    height: 40,
    backgroundColor: "#1BE58D",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
    marginLeft: -10,
    marginBottom: -8,
    marginRight:30
  },
  text: {
    fontSize: 18,
    color: "#fff"
  },
  imageBackground: {
    alignItems:'center',
    justifyContent:'center',
    height : 250,
    marginTop: 30,
    marginHorizontal: 30,
  },
  row:{
    flexDirection: 'row',
    alignItems: 'center',
  }
});

export default openMeeting2;