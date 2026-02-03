import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

interface InboxCountWidgetProps {
  count: number;
}

export function InboxCountWidget({ count }: InboxCountWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1e293b', // Slate 800
        borderRadius: 16,
        padding: 12,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      clickAction="OPEN_APP"
    >
      <TextWidget
        text="Inbox"
        style={{
          fontSize: 14,
          color: '#94a3b8', // Slate 400
          fontWeight: 'bold',
          marginBottom: 4,
        }}
      />
      <TextWidget
        text={`${count}`}
        style={{
          fontSize: 32,
          color: '#3b82f6', // Blue 500
          fontWeight: 'bold',
        }}
      />
    </FlexWidget>
  );
}
