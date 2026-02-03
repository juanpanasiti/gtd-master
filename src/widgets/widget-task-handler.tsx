import React from 'react';
import { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { InboxCountWidget } from './InboxCountWidget';
import { QuickAddWidget } from './QuickAddWidget';

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const widgetInfo = props.widgetInfo;
  
  switch (widgetInfo.widgetName) {
    case 'InboxCount':
      // Default to 0 if we can't get data in background effortlessly yet
      // Ideally we would read from SharedPrefs or DB here
      props.renderWidget(<InboxCountWidget count={0} />);
      break;
      
    case 'QuickAdd':
      props.renderWidget(<QuickAddWidget />);
      break;
      
    default:
      break;
  }
}
