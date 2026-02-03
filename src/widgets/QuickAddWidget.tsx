import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function QuickAddWidget() {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#2563eb', // Blue 600
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      clickAction="OPEN_URI"
      clickActionData={{ uri: 'gtdmaster://inbox?action=capture' }}
    >
      <TextWidget
        text="+"
        style={{
          fontSize: 36,
          color: '#ffffff',
          fontWeight: 'bold',
        }}
      />
      <TextWidget
        text="Capture"
        style={{
          fontSize: 12,
          color: '#ffffff',
          marginTop: -4,
        }}
      />
    </FlexWidget>
  );
}
