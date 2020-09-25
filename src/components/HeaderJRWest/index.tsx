/* eslint-disable global-require */
import { LinearGradient } from 'expo-linear-gradient';
import i18n from 'i18n-js';
import React, { useEffect, useState, memo, useCallback } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  Platform,
  PlatformIOSStatic,
  Image,
} from 'react-native';

import { HEADER_CONTENT_TRANSITION_DELAY } from '../../constants';
import { HeaderTransitionState } from '../../models/HeaderTransitionState';
import { CommonHeaderProps } from '../Header/common';
import katakanaToHiragana from '../../utils/kanaToHiragana';
import {
  isYamanoteLine,
  inboundStationForLoopLine,
  outboundStationForLoopLine,
  isOsakaLoopLine,
} from '../../utils/loopLine';
import getCurrentStationIndex from '../../utils/currentStationIndex';
import { getLineMark } from '../../lineMark';
import TransferLineMark from '../TransferLineMark';
import { LineType } from '../../models/StationAPI';
import getTranslatedText from '../../utils/translate';

const { isPad } = Platform as PlatformIOSStatic;

const HeaderJRWest: React.FC<CommonHeaderProps> = ({
  station,
  nextStation,
  boundStation,
  line,
  state,
  lineDirection,
  stations,
}: CommonHeaderProps) => {
  const [prevState, setPrevState] = useState<HeaderTransitionState>(
    i18n.locale === 'ja' ? 'CURRENT' : 'CURRENT_EN'
  );
  const [stateText, setStateText] = useState(
    getTranslatedText('nowStoppingAt')
  );
  const [stationText, setStationText] = useState(station.name);
  const [boundText, setBoundText] = useState('TrainLCD');
  const [stationNameFontSize, setStationNameFontSize] = useState<number>();
  const [boundStationNameFontSize, setBoundStationNameFontSize] = useState(32);

  const boundStationNameLineHeight =
    Platform.OS === 'android'
      ? boundStationNameFontSize + 8
      : boundStationNameFontSize;

  const [bottomFadeAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));

  const yamanoteLine = line ? isYamanoteLine(line.id) : undefined;
  const osakaLoopLine = line ? isOsakaLoopLine(line.id) : undefined;

  const adjustFontSize = useCallback((stationName: string): void => {
    if (isPad) {
      if (stationName.length >= 10) {
        setStationNameFontSize(48);
      } else if (stationName.length >= 7) {
        setStationNameFontSize(64);
      } else {
        setStationNameFontSize(72);
      }
      return;
    }

    if (stationName.length >= 10) {
      setStationNameFontSize(32);
    } else if (stationName.length >= 7) {
      setStationNameFontSize(48);
    } else {
      setStationNameFontSize(58);
    }
  }, []);
  const adjustBoundFontSize = useCallback((stationName: string): void => {
    if (isPad) {
      if (stationName.length >= 5) {
        setBoundStationNameFontSize(38);
      } else {
        setBoundStationNameFontSize(48);
      }
      return;
    }

    if (stationName.length >= 10) {
      setBoundStationNameFontSize(21);
    } else if (stationName.length >= 5) {
      setBoundStationNameFontSize(24);
    } else {
      setBoundStationNameFontSize(32);
    }
  }, []);

  useEffect(() => {
    if (boundStation) {
      adjustBoundFontSize(
        i18n.locale === 'ja' ? boundStation.name : boundStation.nameR
      );
    }

    if (!line || !boundStation) {
      setBoundText('TrainLCD');
    } else if (yamanoteLine || osakaLoopLine) {
      const currentIndex = getCurrentStationIndex(stations, station);
      setBoundText(
        lineDirection === 'INBOUND'
          ? inboundStationForLoopLine(stations, currentIndex, line).boundFor
          : outboundStationForLoopLine(stations, currentIndex, line).boundFor
      );
    } else {
      setBoundText(
        i18n.locale === 'ja' ? boundStation.name : boundStation.nameR
      );
    }

    const fadeIn = (): void => {
      Animated.timing(bottomFadeAnim, {
        toValue: 1,
        duration: HEADER_CONTENT_TRANSITION_DELAY,
        useNativeDriver: false,
      }).start();
      Animated.timing(rotateAnim, {
        toValue: 0,
        duration: HEADER_CONTENT_TRANSITION_DELAY,
        useNativeDriver: false,
      }).start();
    };

    const fadeOut = (): void => {
      Animated.timing(bottomFadeAnim, {
        toValue: 0,
        duration: HEADER_CONTENT_TRANSITION_DELAY,
        useNativeDriver: false,
      }).start();
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: HEADER_CONTENT_TRANSITION_DELAY,
        useNativeDriver: false,
      }).start();
    };

    switch (state) {
      case 'ARRIVING':
        if (nextStation) {
          fadeOut();
          setTimeout(() => {
            setStateText(getTranslatedText('arrivingAt'));
            setStationText(nextStation.name);
            adjustFontSize(nextStation.name);
            fadeIn();
          }, HEADER_CONTENT_TRANSITION_DELAY);
        }
        break;
      case 'ARRIVING_KANA':
        if (nextStation) {
          fadeOut();
          setTimeout(() => {
            setStateText(getTranslatedText('arrivingAt'));
            setStationText(katakanaToHiragana(nextStation.nameK));
            adjustFontSize(katakanaToHiragana(nextStation.nameK));
            fadeIn();
          }, HEADER_CONTENT_TRANSITION_DELAY);
        }
        break;
      case 'ARRIVING_EN':
        if (nextStation) {
          fadeOut();
          setTimeout(() => {
            setStateText(getTranslatedText('arrivingAtEn'));
            setStationText(nextStation.nameR);
            adjustFontSize(nextStation.nameR);
            fadeIn();
          }, HEADER_CONTENT_TRANSITION_DELAY);
        }
        break;
      case 'CURRENT':
        if (prevState !== 'CURRENT') {
          fadeOut();
        }
        setTimeout(() => {
          setStateText(getTranslatedText('nowStoppingAt'));
          setStationText(station.name);
          adjustFontSize(station.name);
          fadeIn();
        }, HEADER_CONTENT_TRANSITION_DELAY);
        break;
      case 'CURRENT_KANA':
        if (prevState !== 'CURRENT_KANA') {
          fadeOut();
        }
        setTimeout(() => {
          setStateText(getTranslatedText('nowStoppingAt'));
          setStationText(katakanaToHiragana(station.nameK));
          adjustFontSize(katakanaToHiragana(station.nameK));
          fadeIn();
        }, HEADER_CONTENT_TRANSITION_DELAY);
        break;
      case 'CURRENT_EN':
        if (prevState !== 'CURRENT_EN') {
          fadeOut();
        }
        setTimeout(() => {
          setStateText(getTranslatedText('nowStoppingAtEn'));
          setStationText(station.nameR);
          adjustFontSize(station.nameR);
          fadeIn();
        }, HEADER_CONTENT_TRANSITION_DELAY);
        break;
      case 'NEXT':
        if (nextStation) {
          fadeOut();
          setTimeout(() => {
            setStateText(getTranslatedText('next'));
            setStationText(nextStation.name);
            adjustFontSize(nextStation.name);
            fadeIn();
          }, HEADER_CONTENT_TRANSITION_DELAY);
        }
        break;
      case 'NEXT_KANA':
        if (nextStation) {
          fadeOut();
          setTimeout(() => {
            setStateText(getTranslatedText('nextKana'));
            setStationText(katakanaToHiragana(nextStation.nameK));
            adjustFontSize(katakanaToHiragana(nextStation.nameK));
            fadeIn();
          }, HEADER_CONTENT_TRANSITION_DELAY);
        }
        break;
      case 'NEXT_EN':
        if (nextStation) {
          fadeOut();
          setTimeout(() => {
            setStateText(getTranslatedText('nextEn'));
            setStationText(nextStation.nameR);
            adjustFontSize(nextStation.nameR);
            fadeIn();
          }, HEADER_CONTENT_TRANSITION_DELAY);
        }
        break;
      default:
        break;
    }
    setPrevState(state);
  }, [
    state,
    line,
    nextStation,
    boundStation,
    station,
    yamanoteLine,
    osakaLoopLine,
    adjustBoundFontSize,
    stations,
    lineDirection,
    bottomFadeAnim,
    rotateAnim,
    prevState,
    adjustFontSize,
  ]);

  const styles = StyleSheet.create({
    gradientRoot: {
      paddingRight: 21,
      paddingLeft: 21,
      overflow: 'hidden',
      height: isPad ? 210 : 150,
      flexDirection: 'row',
    },
    bound: {
      color: '#fff',
      marginTop: i18n.locale === 'ja' ? 32 : undefined,
      fontWeight: 'bold',
      fontSize: boundStationNameFontSize,
      lineHeight: isPad ? undefined : boundStationNameLineHeight,
      textAlign: i18n.locale === 'ja' ? 'right' : 'left',
    },
    boundFor: {
      fontSize: isPad ? 32 : 18,
      color: '#aaa',
      textAlign: i18n.locale === 'ja' ? 'right' : 'left',
      fontWeight: 'bold',
      marginTop: i18n.locale === 'ja' ? undefined : 16,
    },
    boundForEn: {
      fontSize: isPad ? 32 : 24,
      color: '#aaa',
      textAlign: i18n.locale === 'ja' ? 'right' : 'left',
      fontWeight: 'bold',
      marginTop: i18n.locale === 'ja' ? undefined : 44,
    },
    stationName: {
      textAlign: 'center',
      fontSize: stationNameFontSize,
      fontWeight: 'bold',
      color: '#fff',
      marginTop: 64,
    },
    top: {
      position: 'absolute',
      flex: 0.3,
      top: 32,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: 16,
    },
    left: {
      flex: 0.3,
      justifyContent: 'center',
      height: isPad ? 200 : 120,
      marginTop: 24,
      marginRight: 32,
    },
    right: {
      flex: 1,
      justifyContent: 'center',
      alignContent: 'flex-end',
      height: isPad ? 200 : 150,
    },
    state: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: isPad ? 32 : 24,
      position: 'absolute',
      top: 32,
    },
    localLogo: {
      width: isPad ? 120 : 80,
      height: isPad ? 54 : 36,
    },
  });

  const mark = line && getLineMark(line);

  const fetchJRWLocalLogo = (): unknown =>
    i18n.locale === 'ja'
      ? require('../../assets/images/jrw_local.png')
      : require('../../assets/images/jrw_local_en.png');

  const fetchJRWRapidLogo = (): unknown =>
    i18n.locale === 'ja'
      ? require('../../assets/images/jrw_rapid.png')
      : require('../../assets/images/jrw_rapid_en.png');

  return (
    <View>
      <LinearGradient
        colors={['#222222', '#212121']}
        style={styles.gradientRoot}
      >
        <View style={styles.top}>
          {mark && mark.sign ? (
            <TransferLineMark line={line} mark={mark} />
          ) : null}
          {line && line.lineType !== LineType.BulletTrain && (
            <Image
              style={styles.localLogo}
              source={
                line.name.indexOf('快速') !== -1
                  ? fetchJRWRapidLogo()
                  : fetchJRWLocalLogo()
              }
            />
          )}
        </View>
        <View style={styles.left}>
          {i18n.locale !== 'ja' && boundStation && (
            <Text style={styles.boundForEn}>for</Text>
          )}
          <Text style={styles.bound}>{boundText}</Text>
          {i18n.locale === 'ja' && boundStation && (
            <Text style={styles.boundFor}>方面</Text>
          )}
        </View>

        {stationNameFontSize && (
          <View style={styles.right}>
            <Text style={styles.state}>{stateText}</Text>
            <Text style={styles.stationName}>{stationText}</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

export default memo(HeaderJRWest);