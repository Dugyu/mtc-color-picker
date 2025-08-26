import { root, useState } from '@lynx-js/react';
import { AppLayout } from '@/App';

import { MTSSlider } from '@/components/btc-mts-slider/MTSSlider';

export function App() {
  const [value, _setValue] = useState(200);

  return (
    <AppLayout title="BTC-MTS Slider" h={value} s={100} l={50}>
      <view className="w-60 h-12 flex-row justify-center items-center">
        <text className="text-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-12">
        <MTSSlider initialValue={48} />
      </view>
    </AppLayout>
  );
}

root.render(<App />);

if (import.meta.webpackHot) {
  import.meta.webpackHot.accept();
}
