import React from 'react';
import { requestWidgetUpdate } from 'react-native-android-widget';
import { InboxCountWidget } from './InboxCountWidget';

export async function triggerInboxWidgetUpdate(count: number) {
  try {
    await requestWidgetUpdate({
      widgetName: 'InboxCount',
      renderWidget: (props) => props.renderWidget(<InboxCountWidget count={count} />),
      widgetNotFound: () => {
        // Widget not active
      },
    });
  } catch (error) {
    console.warn('Failed to update inbox widget', error);
  }
}
