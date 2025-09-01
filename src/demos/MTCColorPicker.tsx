import { root, useState } from '@lynx-js/react';
import { AppLayout } from '@/App';
import { ColorPicker } from '@/components/mtc/MTCColorPickerSignal';
import { DummyStyle } from '@/components/ui/DummyStyle';
import { sleep } from '@/utils/sleep';

if (__BACKGROUND__) {
  setInterval(() => {
    sleep(250);
  }, 100);
}

type Color = readonly [number, number, number];

export function App() {
  const [value, setValue] = useState<Color>(() => [199, 99, 72]);

  const handleChange = (v: Color) => {
    'use background';
    setValue(v);
  };

  return (
    <AppLayout
      title="MTC-Signal ColorPicker"
      subtitle="Coordinate on MTS"
      h={value[0]}
      s={value[1]}
      l={value[2]}
    >
      <DummyStyle />
      <view className="w-60 h-12 flex-row justify-center items-center">
        <text className="text-content">{`${value}`}</text>
      </view>
      <view className="w-60 h-48">
        <ColorPicker initialValue={value} onChange={handleChange} />
      </view>
    </AppLayout>
  );
}

root.render(<App />);
