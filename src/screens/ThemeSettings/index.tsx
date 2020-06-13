import i18n from 'i18n-js';
import React, { memo, useCallback, Dispatch } from 'react';
import { View, StyleSheet, Picker, ScrollView } from 'react-native';
import { connect } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Heading from '../../components/Heading';
import settingsThemes from './themes';
import { AppTheme, UpdateThemeActionAction } from '../../store/types/theme';

import updateAppThemeAction from '../../store/actions/theme';
import { TrainLCDAppState } from '../../store';
import Button from '../../components/Button';

interface Props {
  theme: AppTheme;
  updateAppTheme: (theme: AppTheme) => void;
}

const styles = StyleSheet.create({
  rootPadding: {
    padding: 24,
  },
  settingItem: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const ThemeSettingsScreen: React.FC<Props> = ({
  theme,
  updateAppTheme,
}: Props) => {
  const onThemeValueChange = useCallback(
    (t: AppTheme) => {
      updateAppTheme(t);
    },
    [updateAppTheme]
  );

  const navigation = useNavigation();

  const onPressBack = useCallback(() => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.rootPadding}>
      <Heading>{i18n.t('selectThemeTitle')}</Heading>
      <View style={styles.settingItem}>
        <Picker
          selectedValue={theme}
          style={{
            width: '50%',
          }}
          onValueChange={onThemeValueChange}
        >
          {settingsThemes.map((t) => (
            <Picker.Item key={t.value} label={t.label} value={t.value} />
          ))}
        </Picker>
      </View>
      <View style={styles.settingItem}>
        <Button onPress={onPressBack}>戻る</Button>
      </View>
    </ScrollView>
  );
};

const mapStateToProps = (
  state: TrainLCDAppState
): {
  theme: AppTheme;
} => ({
  theme: state.theme.theme,
});

const mapDispatchToProps = (
  dispatch: Dispatch<UpdateThemeActionAction>
): {
  updateAppTheme: (theme: AppTheme) => void;
} => ({
  updateAppTheme: (theme: AppTheme): void =>
    dispatch(updateAppThemeAction(theme)),
});

const connected = connect(
  mapStateToProps,
  mapDispatchToProps as unknown
)(ThemeSettingsScreen);

export default memo(connected);
