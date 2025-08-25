import { root, useState } from '@lynx-js/react';
import { AppLayout } from '@/App';

import { HueSlider } from '@/components/btc-slider/Slider';

export function App() {
  const [value, setValue] = useState(120);

  return (
    <AppLayout title="BTC Slider" h={value} s={100} l={50}>
      <view className="w-60 h-12 flex-row justify-center items-center">
        <text className="text-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-12">
        <HueSlider
          value={value}
          onChange={(value) => {
            setValue(value);
            console.log('updating');
          }}
          onCommit={(value) => {
            console.log('commit', value);
          }}
        />
      </view>
    </AppLayout>
  );
}

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
