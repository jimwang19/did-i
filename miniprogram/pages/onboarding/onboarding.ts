import { get, set } from '../../utils/storage';
import { STORAGE_KEYS } from '../../utils/constants';

Page({
  data: {},

  onStart() {
    const settings = get(STORAGE_KEYS.SETTINGS, { hasSeenOnboarding: false, lastOpenDate: '' });
    settings.hasSeenOnboarding = true;
    set(STORAGE_KEYS.SETTINGS, settings);
    wx.navigateBack();
  },
});
