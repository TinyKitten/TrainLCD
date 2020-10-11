import React, { useCallback, useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  Text,
  View,
  Platform,
  PlatformIOSStatic,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { HEADER_CONTENT_TRANSITION_DELAY } from '../../constants';
import { HeaderTransitionState } from '../../models/HeaderTransitionState';
import { CommonHeaderProps } from '../Header/common';
import getCurrentStationIndex from '../../utils/currentStationIndex';
import katakanaToHiragana from '../../utils/kanaToHiragana';
import {
  inboundStationForLoopLine,
  isYamanoteLine,
  outboundStationForLoopLine,
  isOsakaLoopLine,
} from '../../utils/loopLine';
import useValueRef from '../../hooks/useValueRef';
import { isJapanese, translate } from '../../translation';
import TrainTypeBox from '../TrainTypeBox';
import getTrainType from '../../utils/getTrainType';

const { isPad } = Platform as PlatformIOSStatic;

const styles = StyleSheet.create({
  gradientRoot: {
    paddingTop: 14,
    paddingRight: 21,
    paddingLeft: 21,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 1,
    shadowRadius: 1,
  },
  bottom: {
    height: isPad ? 128 : 84,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 12,
  },
  bound: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: isPad ? 32 : 21,
    marginLeft: 8,
  },
  state: {
    fontSize: isPad ? 35 : 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  stationName: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#fff',
  },
  divider: {
    width: '100%',
    alignSelf: 'stretch',
    height: isPad ? 4 : 2,
    backgroundColor: 'crimson',
    marginTop: 2,
    shadowColor: '#ccc',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 0,
    shadowOpacity: 1,
    elevation: 2,
  },
  headerTexts: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const { width: windowWidth } = Dimensions.get('window');

const HeaderDT: React.FC<CommonHeaderProps> = ({
  station,
  nextStation,
  boundStation,
  line,
  state,
  lineDirection,
  stations,
}: CommonHeaderProps) => {
  const [prevState, setPrevState] = useState<HeaderTransitionState>(
    isJapanese ? 'CURRENT' : 'CURRENT_EN'
  );
  const [stateText, setStateText] = useState(translate('nowStoppingAt'));
  const [stationText, setStationText] = useState(station.name);
  const [boundText, setBoundText] = useState('TrainLCD');
  const [stationNameFontSize, setStationNameFontSize] = useState<number>();
  const prevStateRef = useValueRef(prevState);

  const [bottomFadeAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));

  const yamanoteLine = line ? isYamanoteLine(line.id) : undefined;
  const osakaLoopLine = line ? isOsakaLoopLine(line.id) : undefined;

  const { top: safeAreaTop } = useSafeAreaInsets();

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
      setStationNameFontSize(28);
    } else if (stationName.length >= 7) {
      setStationNameFontSize(32);
    } else {
      setStationNameFontSize(48);
    }
  }, []);

  const fadeIn = useCallback((): void => {
    Animated.timing(bottomFadeAnim, {
      toValue: 1,
      duration: HEADER_CONTENT_TRANSITION_DELAY,
      useNativeDriver: true,
    }).start();
    Animated.timing(rotateAnim, {
      toValue: 0,
      duration: HEADER_CONTENT_TRANSITION_DELAY,
      useNativeDriver: true,
    }).start();
  }, [bottomFadeAnim, rotateAnim]);

  const fadeOut = useCallback((): void => {
    Animated.timing(bottomFadeAnim, {
      toValue: 0,
      duration: HEADER_CONTENT_TRANSITION_DELAY,
      useNativeDriver: true,
    }).start();
    Animated.timing(rotateAnim, {
      toValue: 1,
      duration: HEADER_CONTENT_TRANSITION_DELAY,
      useNativeDriver: true,
    }).start();
  }, [bottomFadeAnim, rotateAnim]);

  useEffect(() => {
    if (!line || !boundStation) {
      setBoundText('TrainLCD');
    } else if (yamanoteLine || osakaLoopLine) {
      const currentIndex = getCurrentStationIndex(stations, station);
      setBoundText(
        `${isJapanese ? '' : `for `} ${
          lineDirection === 'INBOUND'
            ? `${
                inboundStationForLoopLine(stations, currentIndex, line)
                  ?.boundFor
              }`
            : outboundStationForLoopLine(stations, currentIndex, line)?.boundFor
        }${isJapanese ? '方面' : ''}`
      );
    } else if (isJapanese) {
      setBoundText(`${boundStation.name}方面`);
    } else {
      setBoundText(`for ${boundStation.nameR}`);
    }

    switch (state) {
      case 'ARRIVING':
        if (nextStation) {
          fadeOut();
          setTimeout(() => {
            setStateText(translate('arrivingAt'));
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
            setStateText(translate('arrivingAt'));
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
            setStateText(translate('soon'));
            setStationText(nextStation.nameR);
            adjustFontSize(nextStation.nameR);
            fadeIn();
          }, HEADER_CONTENT_TRANSITION_DELAY);
        }
        break;
      case 'CURRENT':
        if (prevStateRef.current !== 'CURRENT') {
          fadeOut();
        }
        setTimeout(() => {
          setStateText(translate('nowStoppingAt'));
          setStationText(station.name);
          adjustFontSize(station.name);
          fadeIn();
        }, HEADER_CONTENT_TRANSITION_DELAY);
        break;
      case 'CURRENT_KANA':
        if (prevStateRef.current !== 'CURRENT_KANA') {
          fadeOut();
        }
        setTimeout(() => {
          setStateText(translate('nowStoppingAt'));
          setStationText(katakanaToHiragana(station.nameK));
          adjustFontSize(katakanaToHiragana(station.nameK));
          fadeIn();
        }, HEADER_CONTENT_TRANSITION_DELAY);
        break;
      case 'CURRENT_EN':
        if (prevStateRef.current !== 'CURRENT_EN') {
          fadeOut();
        }
        setTimeout(() => {
          setStateText(translate('nowStoppingAtEn'));
          setStationText(station.nameR);
          adjustFontSize(station.nameR);
          fadeIn();
        }, HEADER_CONTENT_TRANSITION_DELAY);
        break;
      case 'NEXT':
        if (nextStation) {
          fadeOut();
          setTimeout(() => {
            setStateText(translate(isJapanese ? 'next' : 'nextEnDT'));
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
            setStateText(translate('nextKanaDT'));
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
            setStateText(translate('nextEnDT'));
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
    adjustFontSize,
    boundStation,
    fadeIn,
    fadeOut,
    line,
    lineDirection,
    nextStation,
    osakaLoopLine,
    prevStateRef,
    state,
    station,
    stations,
    yamanoteLine,
  ]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View>
      <LinearGradient
        colors={['#333', '#212121', '#000']}
        locations={[0, 0.5, 0.5]}
        style={styles.gradientRoot}
      >
        <View
          style={{
            ...styles.headerTexts,
            marginTop: Platform.OS === 'ios' ? safeAreaTop : 0,
          }}
        >
          <TrainTypeBox trainType={getTrainType(line)} />
          <Text style={styles.bound}>{boundText}</Text>
        </View>
        <Animated.View
          style={[
            { opacity: bottomFadeAnim, transform: [{ rotateX: spin }] },
            styles.bottom,
          ]}
        >
          {stationNameFontSize && (
            <>
              <Text style={{ ...styles.state, width: windowWidth / 4 }}>
                {stateText}
              </Text>
              <Text
                style={{
                  ...styles.stationName,
                  fontSize: stationNameFontSize,
                  marginRight: windowWidth / 6,
                }}
              >
                {stationText}
              </Text>
            </>
          )}
        </Animated.View>
      </LinearGradient>
      <View style={styles.divider} />
    </View>
  );
};

export default React.memo(HeaderDT);